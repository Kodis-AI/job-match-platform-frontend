import { useId, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import {
  Badge,
  Button,
  Chip,
  FormAlert,
  Icon,
  SectionHeading,
  TextField,
} from '../components';
import { RecruiterPage } from '../components/RecruiterPage';
import { pickCvFiles } from '../lib/api/files';
import {
  useCreateJob,
  useJob,
  useJobs,
  useRankedApplications,
  useStartAnalysis,
  useUpdateStage,
  useUploadApplications,
} from '../lib/api/queries';
import { getApplicationStatus } from '../lib/applicationStatus';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { countLabel, getCandidateLabel, getInitials } from '../utils/format';

const PAGE_HEADER = {
  eyebrow: 'PROCESAMIENTO MASIVO CON IA',
  title: 'Pipeline y triaje con IA',
  description:
    'Elige una vacante, sube sus currículums y deja que la IA los analice y ordene por compatibilidad.',
};

const WORK_MODE_LABELS = { remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial' };

// Same limits as the API: the job payload and the `skill` filter of the ranking.
const TITLE_LENGTH = { min: 3, max: 200 };
const DESCRIPTION_LENGTH = { min: 50, max: 20_000 };
const SKILL_MAX_LENGTH = 50;

const MIN_SCORES = [0, 75, 85, 90];
const PAGE_SIZE = 10;

function getLengthError(field, value, { min, max }) {
  return value.length < min || value.length > max
    ? `${field} debe tener entre ${min} y ${max} caracteres.`
    : null;
}

function getAnalysisCaption({ total, pending, processing, completed, failed }) {
  if (total === 0) return 'Sube currículums a esta vacante para poder analizarlos.';
  if (processing > 0) {
    return `Analizando ${countLabel(processing, 'currículum', 'currículums')} · ${completed} de ${total} listos`;
  }
  if (pending + failed === 0) {
    return `Análisis al día · ${completed} de ${total} currículums analizados`;
  }
  return `${countLabel(pending + failed, 'currículum', 'currículums')} por analizar contra el perfil de la vacante`;
}

export default function RecruitmentPipelineScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { create } = useLocalSearchParams();
  const { data: jobs, isPending, error } = useJobs();
  // Lives here and not in the form: the form unmounts when the first job arrives, and a
  // mutation whose component is gone never runs the callbacks passed to `mutate`.
  const createJob = useCreateJob();
  const [chosenJobId, setChosenJobId] = useState(null);
  const [formRequested, setFormRequested] = useState(false);

  if (!jobs) {
    return (
      <RecruiterPage {...PAGE_HEADER}>
        {isPending ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            accessibilityLabel="Cargando tus vacantes"
            style={styles.loader}
          />
        ) : null}
        {error ? (
          <FormAlert
            tone="error"
            title="No pudimos cargar tus vacantes"
            message={error.message}
          />
        ) : null}
      </RecruiterPage>
    );
  }

  const closeForm = () => {
    setFormRequested(false);
    createJob.reset();
    // The dashboard opens the form through the route, which keeps the param until cleared.
    if (create === '1') router.setParams({ create: undefined });
  };

  const jobForm = (
    <JobForm
      saving={createJob.isPending}
      error={createJob.error}
      onSubmit={(job) =>
        createJob.mutate(job, {
          onSuccess: (created) => {
            setChosenJobId(created.id);
            closeForm();
          },
        })
      }
      onCancel={jobs.length > 0 ? closeForm : undefined}
    />
  );

  if (jobs.length === 0) {
    return (
      <RecruiterPage {...PAGE_HEADER}>
        <View style={[styles.panel, styles.firstJobPanel]}>
          <View style={styles.panelHeading}>
            <View style={styles.headingTitleGroup}>
              <View style={[styles.stepDot, styles.stepDotGreen]} />
              <Text style={styles.panelTitle}>Crea tu primera vacante</Text>
            </View>
          </View>
          <Text style={styles.firstJobText}>
            Aún no tienes vacantes. Define el puesto y su descripción; después podrás subir
            currículums y analizarlos con IA contra ese perfil.
          </Text>
          {jobForm}
        </View>
      </RecruiterPage>
    );
  }

  // The newest job by default. It also covers a job created a moment ago whose list refetch
  // failed: it is selected as soon as the list brings it.
  const selectedJob = jobs.find((job) => job.id === chosenJobId) ?? jobs[0];

  return (
    <JobWorkspace
      jobs={jobs}
      jobsError={error}
      selectedJob={selectedJob}
      onSelectJob={setChosenJobId}
      jobForm={formRequested || create === '1' ? jobForm : null}
      onOpenForm={() => setFormRequested(true)}
    />
  );
}

function JobWorkspace({ jobs, jobsError, selectedJob, onSelectJob, jobForm, onOpenForm }) {
  const styles = useStyles();
  const { colors, layout } = useTheme();
  const { contentWidth, isCompact } = useWorkspaceLayout();
  const isIntakeWide = contentWidth >= layout.breakpoints.xwide;
  const { data: job, isPending, error } = useJob(selectedJob.id);
  const startAnalysis = useStartAnalysis(selectedJob.id);
  // The mutation outlives a job switch, so its error is only shown on the job it was started for.
  const [analysisJobId, setAnalysisJobId] = useState(null);
  // Kept above the per-job ranking so the filters survive a job switch.
  const [filters, setFilters] = useState({ skill: '', minScore: 0, zeroBias: false });

  const analyzing = job !== undefined && job.stats.processing > 0;
  const analysisBusy = startAnalysis.isPending || analyzing;
  const analysisButton = {
    iconLeft: 'list-filter',
    iconRight: analysisBusy ? undefined : 'arrow-right',
    loading: analysisBusy,
    disabled: job === undefined || analyzing || job.stats.pending + job.stats.failed === 0,
    onPress: () => {
      setAnalysisJobId(selectedJob.id);
      startAnalysis.mutate();
    },
  };
  const processLabel = isCompact
    ? 'Procesar y clasificar con IA'
    : 'Procesar y clasificar candidatos con IA';

  return (
    <RecruiterPage
      {...PAGE_HEADER}
      action={
        <Button
          {...analysisButton}
          label={analysisBusy ? 'Analizando…' : 'Procesar candidatos'}
        />
      }
    >
      <View style={[styles.intakeGrid, isIntakeWide && styles.intakeGridWide]}>
        <View style={[styles.panel, isIntakeWide && styles.panelWide]}>
          <View style={styles.panelHeading}>
            <View style={styles.headingTitleGroup}>
              <View style={styles.stepDot} />
              <Text style={styles.panelTitle}>1. Lote de currículums</Text>
            </View>
            {job ? <Badge label={countLabel(job.stats.total, 'CV', 'CVs')} tone="info" /> : null}
          </View>

          {isPending ? (
            <ActivityIndicator
              color={colors.primary}
              accessibilityLabel="Cargando la vacante"
              style={styles.loader}
            />
          ) : null}
          {error ? (
            <FormAlert
              tone="error"
              title="No pudimos cargar la vacante"
              message={error.message}
              style={styles.alert}
            />
          ) : null}
          {/* Keyed so a failed upload of one job never shows under another. */}
          {job ? <ResumeBatch key={job.id} job={job} /> : null}
        </View>

        <View style={[styles.panel, isIntakeWide && styles.panelWide]}>
          <View style={styles.panelHeading}>
            <View style={styles.headingTitleGroup}>
              <View style={[styles.stepDot, styles.stepDotGreen]} />
              <Text style={styles.panelTitle}>2. Oferta & perfil objetivo</Text>
            </View>
            <Text style={styles.reference}>#{selectedJob.id.slice(0, 8).toUpperCase()}</Text>
          </View>

          {jobsError ? (
            <FormAlert
              tone="error"
              title="No pudimos actualizar tus vacantes"
              message={jobsError.message}
              style={styles.alert}
            />
          ) : null}

          <View style={styles.jobChips}>
            {jobs.map((item) => (
              <Chip
                key={item.id}
                label={item.title}
                selected={item.id === selectedJob.id}
                onPress={() => onSelectJob(item.id)}
              />
            ))}
            {jobForm ? null : (
              <Button label="Nueva vacante" variant="soft" iconLeft="plus" onPress={onOpenForm} />
            )}
          </View>

          {jobForm ?? (
            <View style={styles.jobDescription}>
              <View style={styles.jobTitleRow}>
                <Text style={styles.jobTitle}>{selectedJob.title}</Text>
                <Badge label={WORK_MODE_LABELS[selectedJob.work_mode]} tone="info" />
              </View>
              {job ? (
                <Text style={styles.jobText} numberOfLines={5}>
                  {job.description}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </View>

      {job ? (
        <>
          {startAnalysis.error && analysisJobId === job.id ? (
            <FormAlert
              tone="error"
              title="No pudimos iniciar el análisis"
              message={startAnalysis.error.message}
              style={styles.processAlert}
            />
          ) : null}
          <Button
            {...analysisButton}
            label={analysisBusy ? 'Analizando…' : processLabel}
            variant="accent"
            size="lg"
            style={styles.processButton}
          />
          <Text style={styles.processCaption}>{getAnalysisCaption(job.stats)}</Text>

          {/* Keyed so the page and the list of one job never carry over to another. */}
          <JobRanking key={job.id} job={job} filters={filters} onChangeFilters={setFilters} />
        </>
      ) : null}
    </RecruiterPage>
  );
}

function JobForm({ saving, error, onSubmit, onCancel }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const descriptionLabelId = useId();
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const [title, setTitle] = useState('');
  const [workMode, setWorkMode] = useState('remote');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ title: null, description: null });

  const submit = () => {
    const job = { title: title.trim(), description: description.trim(), work_mode: workMode };
    const nextErrors = {
      title: getLengthError('El título', job.title, TITLE_LENGTH),
      description: getLengthError('La descripción', job.description, DESCRIPTION_LENGTH),
    };
    setErrors(nextErrors);
    if (nextErrors.title) titleRef.current.focus();
    else if (nextErrors.description) descriptionRef.current.focus();
    else onSubmit(job);
  };

  return (
    <View style={styles.jobForm}>
      {error ? (
        <FormAlert tone="error" title="No pudimos guardar la vacante" message={error.message} />
      ) : null}

      <TextField
        ref={titleRef}
        label="Título de la vacante"
        placeholder="Senior Full Stack Engineer"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setErrors((current) => ({ ...current, title: null }));
        }}
        error={errors.title}
        disabled={saving}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => descriptionRef.current.focus()}
      />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Modalidad</Text>
        <View style={styles.workModeChips}>
          {Object.entries(WORK_MODE_LABELS).map(([mode, label]) => (
            <Chip
              key={mode}
              label={label}
              selected={workMode === mode}
              onPress={() => setWorkMode(mode)}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text nativeID={descriptionLabelId} style={styles.fieldLabel}>
          Descripción de la vacante
        </Text>
        <TextInput
          ref={descriptionRef}
          accessibilityLabel="Descripción de la vacante"
          accessibilityLabelledBy={descriptionLabelId}
          aria-invalid={Boolean(errors.description)}
          multiline
          editable={!saving}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setErrors((current) => ({ ...current, description: null }));
          }}
          placeholder="Responsabilidades, requisitos y stack del puesto..."
          placeholderTextColor={colors.placeholder}
          textAlignVertical="top"
          style={[styles.descriptionInput, errors.description && styles.descriptionInputInvalid]}
        />
        {errors.description ? (
          <View style={styles.fieldMessage} accessibilityLiveRegion="polite">
            <Icon name="circle-alert" size="sm" color={colors.destructive} />
            <Text style={styles.fieldError}>{errors.description}</Text>
          </View>
        ) : (
          <Text style={styles.fieldHelper}>
            {description.trim().length} caracteres · mínimo {DESCRIPTION_LENGTH.min}
          </Text>
        )}
      </View>

      <View style={styles.formActions}>
        <Button
          label={saving ? 'Guardando…' : 'Guardar vacante'}
          iconLeft="check"
          loading={saving}
          onPress={submit}
        />
        {onCancel ? (
          <Button label="Cancelar" variant="ghost" disabled={saving} onPress={onCancel} />
        ) : null}
      </View>
    </View>
  );
}

function ResumeBatch({ job }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const upload = useUploadApplications(job.id);
  const { stats, failed_applications: failedApplications } = job;
  const summary =
    stats.total === 0
      ? 'Esta vacante aún no tiene currículums.'
      : [
          countLabel(stats.completed, 'analizado', 'analizados'),
          countLabel(stats.pending, 'pendiente', 'pendientes'),
          `${stats.failed} con error`,
        ].join(' · ');

  const pickAndUpload = async () => {
    const assets = await pickCvFiles({ multiple: true });
    if (assets.length > 0) upload.mutate(assets);
  };

  return (
    <>
      <Text style={styles.batchSummary}>{summary}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Subir currículums"
        accessibilityHint="Abre el selector de archivos"
        accessibilityState={{ busy: upload.isPending, disabled: upload.isPending }}
        disabled={upload.isPending}
        onPress={pickAndUpload}
        style={({ pressed }) => [styles.uploadArea, pressed && styles.pressed]}
      >
        {upload.isPending ? (
          <ActivityIndicator size="small" color={colors.secondaryText} />
        ) : (
          <Icon name="file-up" size="md" color={colors.secondaryText} />
        )}
        <Text style={styles.uploadText}>
          {upload.isPending ? 'Subiendo currículums…' : 'Subir currículums'}
        </Text>
      </Pressable>
      <Text style={styles.uploadHint}>
        PDF, DOCX o TXT · máximo 5 MB por archivo · hasta 25 por lote
      </Text>

      {upload.error ? (
        <FormAlert
          tone="error"
          title="No pudimos subir el lote"
          message={upload.error.message}
          style={styles.batchAlert}
        />
      ) : null}

      {stats.total > 0 ? (
        <View style={styles.progressRow}>
          <View style={styles.progressCopy}>
            <Icon name="list-checks" size="sm" color={colors.secondaryText} />
            <Text style={styles.progressText}>
              Progreso del análisis: {stats.completed} de {stats.total}
            </Text>
          </View>
          {stats.processing > 0 ? (
            <View style={styles.analyzing}>
              <ActivityIndicator size="small" color={colors.secondaryText} />
              <Text style={styles.analyzingText}>Analizando {stats.processing}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {failedApplications.length > 0 ? (
        <View style={styles.failedList}>
          <Text style={styles.failedTitle}>
            Currículums con error · se reintentan al volver a procesar
          </Text>
          {failedApplications.map((application) => (
            <View key={application.id} style={styles.failedRow}>
              <Icon name="file-x" size="sm" color={colors.destructiveText} />
              <View style={styles.failedCopy}>
                <Text style={styles.failedName} numberOfLines={1}>
                  {application.cv_filename}
                </Text>
                <Text style={styles.failedError} numberOfLines={3}>
                  {application.analysis_error}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

function JobRanking({ job, filters, onChangeFilters }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isWide } = useWorkspaceLayout();
  const [offset, setOffset] = useState(0);
  const { stats } = job;
  const { data: ranking, isPending, error } = useRankedApplications(job.id, {
    minScore: filters.minScore,
    skill: filters.skill.trim(),
    limit: PAGE_SIZE,
    offset,
    analyzedCount: stats.completed,
  });

  // A narrower list may not reach the current page.
  const changeFilters = (changes) => {
    onChangeFilters({ ...filters, ...changes });
    setOffset(0);
  };

  const emptyState =
    stats.completed === 0
      ? {
          icon: 'users',
          title: 'Aún no hay candidatos analizados',
          text: 'Sube currículums y procésalos con IA para ver aquí el ranking.',
        }
      : {
          icon: 'search-x',
          title: 'No hay candidatos con estos filtros',
          text: 'Prueba otra habilidad o reduce el match mínimo.',
        };

  return (
    <>
      <View style={styles.metricsGrid}>
        <MetricCard
          wide={isWide}
          value={stats.completed}
          label="Analizados"
          detail={`de ${countLabel(stats.total, 'currículum', 'currículums')}`}
          icon="file-check-2"
        />
        <MetricCard
          wide={isWide}
          value={stats.shortlisted}
          label="Top match"
          detail={ranking ? `Sobre el corte del ${ranking.cutoff}%` : 'Sobre el corte'}
          icon="trophy"
        />
        <MetricCard
          wide={isWide}
          value={
            stats.avg_analysis_seconds === null ? '—' : `${stats.avg_analysis_seconds.toFixed(1)} s`
          }
          label="Triaje / CV"
          detail="Tiempo medio de análisis"
          icon="zap"
        />
        <MetricCard
          wide={isWide}
          value={stats.pending + stats.processing}
          label="En cola"
          detail={`${countLabel(stats.pending, 'pendiente', 'pendientes')} · ${stats.processing} en análisis`}
          icon="hourglass"
        />
      </View>

      <View style={styles.filterPanel}>
        <View style={styles.searchBox}>
          <Icon name="search" size="sm" color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Buscar por habilidad"
            value={filters.skill}
            onChangeText={(skill) => changeFilters({ skill })}
            maxLength={SKILL_MAX_LENGTH}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Buscar skill (Docker, TypeScript...)"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.filterChips}>
          {MIN_SCORES.map((score) => {
            const selected = filters.minScore === score;
            return (
              <Pressable
                key={score}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => changeFilters({ minScore: score })}
                style={({ pressed }) => [
                  styles.filterChip,
                  selected && styles.filterChipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {score === 0 ? 'Todos' : `Match ≥ ${score}%`}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Modo de sesgo cero"
            accessibilityState={{ checked: filters.zeroBias }}
            onPress={() => onChangeFilters({ ...filters, zeroBias: !filters.zeroBias })}
            style={({ pressed }) => [
              styles.filterChip,
              filters.zeroBias && styles.filterChipSelected,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              name="eye-off"
              size="sm"
              color={filters.zeroBias ? colors.onPrimary : colors.mutedForeground}
            />
            <Text style={[styles.filterText, filters.zeroBias && styles.filterTextSelected]}>
              Sesgo cero
            </Text>
          </Pressable>
        </View>
      </View>

      <SectionHeading
        overline="TALENT INTELLIGENCE"
        title="Ranking de postulantes"
        description={`Candidatos analizados para ${job.title}, del mejor al menor ajuste.`}
      >
        {ranking ? (
          <Badge label={`${ranking.items.length} de ${ranking.total}`} tone="info" />
        ) : null}
      </SectionHeading>

      {isPending ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Cargando el ranking"
          style={styles.loader}
        />
      ) : null}
      {error ? (
        <FormAlert
          tone="error"
          title="No pudimos cargar el ranking"
          message={error.message}
          style={styles.rankingAlert}
        />
      ) : null}
      {ranking ? (
        <View style={[styles.candidateGrid, isWide && styles.candidateGridWide]}>
          {ranking.items.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} anonymous={filters.zeroBias} />
          ))}
          {ranking.items.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name={emptyState.icon} size="lg" color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>{emptyState.title}</Text>
              <Text style={styles.emptyText}>{emptyState.text}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {ranking && ranking.total > 0 ? (
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            {offset + 1} - {Math.min(offset + PAGE_SIZE, ranking.total)} de {ranking.total}
          </Text>
          <Button
            label="Ant"
            accessibilityLabel="Página anterior"
            variant="outline"
            disabled={offset === 0}
            onPress={() => setOffset(offset - PAGE_SIZE)}
          />
          <Button
            label="Sig"
            accessibilityLabel="Página siguiente"
            disabled={offset + PAGE_SIZE >= ranking.total}
            onPress={() => setOffset(offset + PAGE_SIZE)}
          />
        </View>
      ) : null}
    </>
  );
}

function MetricCard({ value, label, detail, icon, wide }) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={[styles.metricCard, wide && styles.metricCardWide]}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Icon name={icon} size="sm" color={colors.secondaryText} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function CandidateCard({ candidate, anonymous }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isCompact, isWide } = useWorkspaceLayout();
  const updateStage = useUpdateStage(candidate.id);

  const label = getCandidateLabel(candidate, { anonymous });
  const name = anonymous ? null : candidate.candidate_name;
  const location = anonymous ? null : candidate.location;
  const experience =
    candidate.years_experience === 1
      ? '1 año de experiencia'
      : `${candidate.years_experience} años de experiencia`;
  const status = getApplicationStatus({
    stage: candidate.stage,
    analysis_status: 'completed',
    shortlisted: candidate.shortlisted,
  });

  return (
    <View style={[styles.candidateCard, isWide && styles.candidateCardWide]}>
      <View style={styles.candidateTop}>
        <View style={styles.candidateIdentity}>
          <View style={styles.candidateAvatar}>
            <Text style={styles.candidateInitials}>{name ? getInitials(name) : 'CV'}</Text>
          </View>
          <View style={styles.candidateCopy}>
            <Text style={styles.candidateName}>{label}</Text>
            <Text style={styles.candidateMeta}>
              {location ? `${experience} · ${location}` : experience}
            </Text>
          </View>
        </View>
        <View style={styles.scoreBlock}>
          <Badge label={`#${String(candidate.rank).padStart(2, '0')} RANK`} tone="info" />
          <Text style={styles.candidateScore}>{candidate.score}%</Text>
        </View>
      </View>

      <View style={styles.roleRow}>
        <Text style={styles.roleLabel}>{candidate.headline}</Text>
        <Badge label={status.label} tone={status.tone} />
      </View>
      <View style={styles.skillList}>
        {candidate.skills.map((skill, index) => (
          <Badge key={index} label={skill} tone="neutral" />
        ))}
      </View>

      <View style={styles.insightBox}>
        <Icon name="sparkles" size="sm" color={colors.secondaryText} />
        <Text style={styles.insightText}>{candidate.insight}</Text>
      </View>

      {updateStage.error ? (
        <FormAlert
          tone="error"
          title="No pudimos actualizar la etapa"
          message={updateStage.error.message}
          style={styles.cardAlert}
        />
      ) : null}

      <View style={[styles.candidateActions, isCompact && styles.candidateActionsCompact]}>
        <Button
          label="Ver ficha"
          accessibilityLabel={`Ver ficha de ${label}`}
          variant="outline"
          fullWidth={isCompact}
          onPress={() => router.push({ pathname: '/review', params: { id: candidate.id } })}
        />
        <Button
          label="Entrevista"
          accessibilityLabel={`Aprobar a ${label} para entrevista`}
          iconLeft="calendar-plus"
          fullWidth={isCompact}
          disabled={candidate.stage === 'interview'}
          loading={updateStage.isPending}
          onPress={() => updateStage.mutate('interview')}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, layout, radii, spacing, typography } = t;
  return {
    loader: { marginVertical: spacing.lg },
    alert: { marginBottom: spacing.sm },
    intakeGrid: { gap: spacing.md, marginBottom: spacing.md },
    intakeGridWide: { flexDirection: 'row', alignItems: 'stretch' },
    panel: {
      minWidth: 0,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    panelWide: { flex: 1 },
    panelHeading: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    headingTitleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flex: 1,
      minWidth: 0,
    },
    stepDot: { width: 9, height: 9, borderRadius: radii.full, backgroundColor: colors.secondary },
    stepDotGreen: { backgroundColor: colors.success },
    panelTitle: { ...typography.bodyStrong, color: colors.foreground, flexShrink: 1 },
    reference: { ...typography.captionStrong, color: colors.mutedForeground },
    firstJobPanel: { width: '100%', maxWidth: layout.readableWidth },
    firstJobText: {
      ...typography.bodySm,
      color: colors.mutedForeground,
      marginBottom: spacing.md,
    },
    batchSummary: { ...typography.caption, color: colors.mutedForeground },
    uploadArea: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.secondaryBorder,
      borderRadius: radii.md,
      marginTop: spacing.sm,
      cursor: 'pointer',
    },
    uploadText: { ...typography.captionStrong, color: colors.secondaryText },
    uploadHint: {
      ...typography.caption,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.xxs,
    },
    batchAlert: { marginTop: spacing.sm },
    progressRow: {
      minHeight: 42,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.sm,
      marginTop: spacing.sm,
    },
    progressCopy: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    progressText: { ...typography.caption, color: colors.foreground },
    analyzing: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    analyzingText: { ...typography.captionStrong, color: colors.secondaryText },
    failedList: { gap: spacing.xs, marginTop: spacing.sm },
    failedTitle: { ...typography.captionStrong, color: colors.foreground },
    failedRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.destructiveBorder,
      borderRadius: radii.sm,
      backgroundColor: colors.destructiveSoft,
    },
    failedCopy: { flex: 1, minWidth: 0 },
    failedName: { ...typography.captionStrong, color: colors.foreground },
    failedError: { ...typography.caption, color: colors.destructiveText },
    jobChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    jobDescription: {
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.md,
      backgroundColor: colors.background,
    },
    jobTitleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    jobTitle: { ...typography.bodyStrong, color: colors.foreground },
    jobText: { ...typography.caption, color: colors.mutedForeground, marginTop: spacing.xs },
    jobForm: { gap: spacing.md },
    field: { gap: spacing.xs },
    fieldLabel: { ...typography.bodyStrong, color: colors.foreground },
    workModeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    descriptionInput: {
      ...typography.bodySm,
      minHeight: 160,
      color: colors.foreground,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: radii.md,
      backgroundColor: colors.card,
    },
    descriptionInputInvalid: { borderColor: colors.destructive },
    fieldMessage: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxs },
    fieldError: { ...typography.caption, color: colors.destructiveText, flex: 1 },
    fieldHelper: { ...typography.caption, color: colors.mutedForeground },
    formActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    processAlert: {
      width: '100%',
      maxWidth: 520,
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    processButton: { width: '100%', maxWidth: 520, alignSelf: 'center' },
    processCaption: {
      ...typography.caption,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    metricCard: {
      flexBasis: '46%',
      flexGrow: 1,
      minWidth: 130,
      padding: spacing.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
    },
    metricCardWide: { flexBasis: '23%' },
    metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    metricLabel: { ...typography.captionStrong, color: colors.mutedForeground },
    metricValue: { ...typography.h3, color: colors.primary, marginTop: spacing.xs },
    metricDetail: { ...typography.caption, color: colors.mutedForeground },
    filterPanel: {
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      marginBottom: spacing.xl,
    },
    searchBox: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderRadius: radii.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm,
    },
    searchInput: { flex: 1, ...typography.bodySm, color: colors.foreground },
    filterChips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
    filterChip: {
      minHeight: 38,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      paddingHorizontal: spacing.sm,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      cursor: 'pointer',
    },
    filterChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { ...typography.captionStrong, color: colors.mutedForeground },
    filterTextSelected: { color: colors.onPrimary },
    rankingAlert: { marginTop: spacing.md },
    candidateGrid: { gap: spacing.md, marginTop: spacing.md },
    candidateGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
    candidateCard: {
      flex: 1,
      minWidth: 0,
      padding: spacing.md,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    candidateCardWide: { flexBasis: '48%', minWidth: 320 },
    candidateTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    candidateIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    candidateAvatar: {
      width: 42,
      height: 42,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    candidateInitials: { ...typography.captionStrong, color: colors.onPrimarySoft },
    candidateCopy: { flex: 1, minWidth: 0 },
    candidateName: { ...typography.bodyStrong, color: colors.foreground },
    candidateMeta: { ...typography.caption, color: colors.mutedForeground },
    scoreBlock: { alignItems: 'flex-end', gap: spacing.xxs },
    candidateScore: { ...typography.h3, color: colors.foreground },
    roleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    roleLabel: { ...typography.caption, color: colors.mutedForeground, flex: 1, minWidth: 0 },
    skillList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs, marginTop: spacing.sm },
    insightBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.secondarySoft,
      borderWidth: 1,
      borderColor: colors.secondaryBorder,
      borderRadius: radii.sm,
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
    insightText: { ...typography.caption, color: colors.secondaryText, flex: 1 },
    cardAlert: { marginTop: spacing.sm },
    candidateActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
    candidateActionsCompact: { flexDirection: 'column' },
    emptyState: {
      width: '100%',
      minHeight: 144,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      backgroundColor: colors.card,
    },
    emptyTitle: { ...typography.bodyStrong, color: colors.foreground, textAlign: 'center' },
    emptyText: { ...typography.caption, color: colors.mutedForeground, textAlign: 'center' },
    pagination: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.lg,
      paddingTop: spacing.md,
    },
    paginationText: { ...typography.caption, color: colors.mutedForeground, marginRight: 'auto' },
    pressed: { opacity: 0.78 },
  };
});
