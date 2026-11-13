import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Switch, Text, View } from 'react-native';

import { Badge, Button, FormAlert, Icon, SectionHeading } from '../components';
import { RecruiterPage } from '../components/RecruiterPage';
import { useAuth } from '../context/AuthContext';
import {
  useJobs,
  useRecruiterSettings,
  useSaveRecruiterSettings,
  useSimulateRanking,
} from '../lib/api/queries';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { getCandidateLabel } from '../utils/format';
import { notify } from '../utils/notify';

const CALIBRATION_HEADING = {
  eyebrow: 'PARÁMETROS ALGORITMO IA',
  title: 'Calibración y preferencias',
  description:
    'Ajusta las ponderaciones del match, el corte de la shortlist y las políticas de sesgo de tus vacantes.',
};

const WEIGHT_OPTIONS = [
  {
    key: 'technical',
    label: 'Hard Skills & Stack Técnico',
    hint: 'Tecnologías y herramientas que exige la vacante.',
    color: 'secondary',
  },
  {
    key: 'experience',
    label: 'Trayectoria y Relevancia',
    hint: 'Años de experiencia y relevancia de los roles anteriores.',
    color: 'accent',
  },
  {
    key: 'impact',
    label: 'Métricas STAR & Redacción',
    hint: 'Logros medibles y claridad con la que el CV los expone.',
    color: 'warning',
  },
  {
    key: 'education',
    label: 'Formación & Certificaciones',
    hint: 'Títulos y certificaciones.',
    color: 'mutedForeground',
  },
];

const CUTOFFS = [85, 80, 75, 70];

const GAP_POLICIES = [
  {
    value: 'neutral',
    title: 'Tratamiento neutro · recomendado',
    detail: 'Las pausas laborales no reducen ninguna puntuación.',
  },
  {
    value: 'strict',
    title: 'Penalizar discontinuidades',
    detail: 'Las pausas de más de 12 meses reducen la puntuación de experiencia.',
  },
];

const APPEARANCES = [
  { value: 'system', label: 'Sistema', description: 'Sigue la apariencia del dispositivo.', icon: 'monitor' },
  { value: 'light', label: 'Claro', description: 'Fondo claro durante toda la sesión.', icon: 'sun' },
  { value: 'dark', label: 'Oscuro', description: 'Fondo oscuro durante toda la sesión.', icon: 'moon' },
];

export default function ProjectSettingsScreen() {
  const { isAuthenticated } = useAuth();

  // Candidates reach this tab without a session: nothing below may call the API for them.
  if (isAuthenticated) return <Calibration />;

  return (
    <RecruiterPage
      eyebrow="PREFERENCIAS"
      title="Ajustes y preferencias"
      description="Elige el tema de la aplicación."
    >
      <FormAlert
        tone="info"
        title="Calibración para reclutadores"
        message="Inicia sesión como reclutador para calibrar las ponderaciones, el corte y las políticas de sesgo de tus vacantes."
      />
      <AppearanceSection />
    </RecruiterPage>
  );
}

function Calibration() {
  const styles = useStyles();
  const { colors } = useTheme();
  const settingsQuery = useRecruiterSettings();
  const jobsQuery = useJobs();
  // The draft and the save mutation live above the editor, so unsaved edits and the callbacks
  // of a save in flight survive when it remounts (a new newest job, a failed refetch).
  const saveSettings = useSaveRecruiterSettings();
  const [draft, setDraft] = useState(null);

  const loadError = settingsQuery.error ?? jobsQuery.error;
  if (loadError || settingsQuery.isPending || jobsQuery.isPending) {
    return (
      <RecruiterPage {...CALIBRATION_HEADING}>
        {loadError ? (
          <FormAlert
            tone="error"
            title="No pudimos cargar la calibración"
            message={loadError.message}
          />
        ) : (
          <ActivityIndicator
            accessibilityLabel="Cargando la calibración"
            size="large"
            color={colors.primary}
            style={styles.loading}
          />
        )}
        <AppearanceSection />
      </RecruiterPage>
    );
  }

  const editor = { settings: settingsQuery.data, draft, onDraftChange: setDraft, saveSettings };
  // Jobs come newest first; the simulation previews the most recent one, if there is any.
  const [newestJob] = jobsQuery.data;

  // Keyed by job so a preview of the previous newest job is never shown under the new title.
  return newestJob ? (
    <CalibrationWithSimulation key={newestJob.id} job={newestJob} {...editor} />
  ) : (
    <CalibrationEditor {...editor} />
  );
}

/** Rendered only while a job exists: the simulation hook needs its id. */
function CalibrationWithSimulation({ job, ...editor }) {
  const simulation = useSimulateRanking(job.id);
  return <CalibrationEditor {...editor} job={job} simulation={simulation} />;
}

/** `job` and `simulation` are undefined while the recruiter has no jobs. */
function CalibrationEditor({ settings, draft, onDraftChange, saveSettings, job, simulation }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isWide } = useWorkspaceLayout();
  const values = draft ?? settings;
  const { weights, cutoff } = values;
  const hasDraft = draft !== null;

  // Any change to the values on screen outdates the last save error and the previewed ranking.
  // Resetting also detaches a save still in flight, so its success cannot drop a newer draft.
  const changeDraft = (nextDraft) => {
    onDraftChange(nextDraft);
    saveSettings.reset();
    simulation?.reset();
  };

  const updateWeight = (key, value) => {
    const nextValue = Math.max(5, Math.min(85, Math.round(value)));
    const otherKeys = WEIGHT_OPTIONS.map((item) => item.key).filter((item) => item !== key);
    const otherTotal = 100 - nextValue;
    const currentOtherTotal = otherKeys.reduce((total, item) => total + weights[item], 0);
    let remaining = otherTotal;
    const nextWeights = { ...weights, [key]: nextValue };

    otherKeys.forEach((otherKey, index) => {
      // Saved weights can leave the other three at 0: they then share the rest evenly.
      const share =
        currentOtherTotal === 0
          ? otherTotal / otherKeys.length
          : (otherTotal * weights[otherKey]) / currentOtherTotal;
      // The last one takes what flooring left over, so the total is exactly 100.
      const allocated = index === otherKeys.length - 1 ? remaining : Math.floor(share);
      nextWeights[otherKey] = allocated;
      remaining -= allocated;
    });

    changeDraft({ ...values, weights: nextWeights });
  };

  // A saved cutoff outside the list (indexOf -1) restarts the cycle at the first option.
  const cycleCutoff = () =>
    changeDraft({ ...values, cutoff: CUTOFFS[(CUTOFFS.indexOf(cutoff) + 1) % CUTOFFS.length] });

  const save = () => {
    saveSettings.mutate(values, {
      onSuccess: () => {
        changeDraft(null);
        notify(
          'Parámetros guardados',
          'Las ponderaciones y el corte ya se aplican a tus rankings. Las políticas de sesgo y de brechas se aplicarán a los análisis que inicies a partir de ahora.',
          'success',
        );
      },
    });
  };

  return (
    <RecruiterPage
      {...CALIBRATION_HEADING}
      action={
        <View style={[styles.headerActions, !isWide && styles.headerActionsStacked]}>
          <Button
            label="Descartar cambios"
            variant="outline"
            iconLeft="rotate-ccw"
            disabled={!hasDraft || saveSettings.isPending}
            onPress={() => changeDraft(null)}
          />
          <Button
            label="Simular ranking"
            variant="outline"
            iconLeft="flask-conical"
            disabled={!simulation}
            loading={simulation?.isPending}
            onPress={() => simulation.mutate({ weights, cutoff })}
          />
          <Button
            label="Guardar parámetros"
            iconLeft="badge-check"
            disabled={!hasDraft}
            loading={saveSettings.isPending}
            onPress={save}
          />
        </View>
      }
    >
      {saveSettings.isError ? (
        <FormAlert
          tone="error"
          title="No pudimos guardar los parámetros"
          message={saveSettings.error.message}
          style={styles.saveAlert}
        />
      ) : null}

      <View style={styles.totalCard}>
        <View style={styles.totalIcon}>
          <Icon name="sliders-horizontal" size="md" color={colors.secondaryText} />
        </View>
        <View style={styles.totalCopy}>
          <Text style={styles.totalTitle}>Calibración de tus vacantes</Text>
          <Text style={styles.totalText}>
            Las ponderaciones y el corte ordenan el ranking de todas tus vacantes.
          </Text>
        </View>
        {hasDraft ? (
          <Badge
            label="Cambios sin guardar"
            tone="warning"
            icon="circle-dot"
            style={styles.unsavedBadge}
          />
        ) : null}
        <View style={styles.totalValue}>
          <Text style={styles.totalLabel}>TOTAL PONDERADO</Text>
          <Text style={styles.totalNumber}>
            {WEIGHT_OPTIONS.reduce((total, option) => total + weights[option.key], 0)}%
          </Text>
        </View>
      </View>

      <View style={[styles.configGrid, isWide && styles.configGridWide]}>
        <View style={[styles.panel, isWide && styles.weightsPanel]}>
          <SectionHeading
            overline="RELEVANCIA DEL PERFIL"
            title="Ponderaciones del match"
          />
          <View style={styles.weightsList}>
            {WEIGHT_OPTIONS.map((option) => (
              <WeightSlider
                key={option.key}
                option={option}
                value={weights[option.key]}
                onChange={(value) => updateWeight(option.key, value)}
              />
            ))}
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Distribución de las ponderaciones</Text>
            <View style={styles.balanceTrack}>
              {WEIGHT_OPTIONS.map((option) => (
                <View
                  key={option.key}
                  style={[
                    styles.balanceSegment,
                    {
                      flex: weights[option.key],
                      backgroundColor: colors[option.color],
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.balanceText}>
              Cada tramo muestra, con el color de su control, cuánto pesa esa dimensión en la
              puntuación del match.
            </Text>
          </View>
        </View>

        <View style={[styles.panel, isWide && styles.biasPanel]}>
          <SectionHeading
            overline="CANDIDATURA JUSTA"
            title="Mitigación de sesgo"
          />
          <SwitchSetting
            icon="user-round-search"
            title="Anonimización integral"
            detail="Oculta el nombre y la ubicación del candidato durante la evaluación."
            value={values.anonymize}
            onValueChange={(value) => changeDraft({ ...values, anonymize: value })}
          />
          <SwitchSetting
            icon="school"
            title="Desindexación de prestigio"
            detail="Oculta los centros educativos para que su prestigio no influya en la evaluación."
            value={values.hide_education_prestige}
            onValueChange={(value) => changeDraft({ ...values, hide_education_prestige: value })}
          />
          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Corte para shortlist automático</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Umbral de selección ${cutoff} por ciento. Pulsa para cambiar.`}
              onPress={cycleCutoff}
              style={({ pressed }) => [styles.cutoffButton, pressed && styles.pressed]}
            >
              <Text style={styles.cutoffText}>Corte: {cutoff}% o superior</Text>
              <Icon name="chevron-down" size="sm" color={colors.mutedForeground} />
            </Pressable>
            <Text style={styles.helperText}>
              Los perfiles bajo el umbral quedan para revisión manual.
            </Text>
          </View>
          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Política de brechas temporales</Text>
            {GAP_POLICIES.map((option) => {
              const selected = values.gap_policy === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => changeDraft({ ...values, gap_policy: option.value })}
                  style={({ pressed }) => [styles.radioRow, pressed && styles.pressed]}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.radioCopy}>
                    <Text style={styles.radioTitle}>{option.title}</Text>
                    <Text style={styles.radioDetail}>{option.detail}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.panel, isWide && styles.simulationPanel]}>
          <View style={styles.panelHeading}>
            <Icon name="chart-no-axes-combined" size="md" color={colors.success} />
            <Text style={styles.panelTitle}>Impacto de simulación</Text>
          </View>
          {job ? (
            <>
              <Text style={styles.simulationCopy}>
                Vacante más reciente: <Text style={styles.highlight}>{job.title}</Text>
              </Text>
              <SimulationOutcome simulation={simulation} />
            </>
          ) : (
            <Text style={styles.simulationCopy}>
              Todavía no tienes vacantes. Para simular el ranking necesitas una vacante con CV
              analizados.
            </Text>
          )}
        </View>
      </View>

      <AppearanceSection />

      <View style={styles.auditBar}>
        <Icon name="info" size="sm" color={colors.mutedForeground} />
        <Text style={styles.auditText}>
          Las ponderaciones y el corte se aplican a los rankings en cuanto se guardan. Las políticas
          de sesgo y de brechas temporales se aplican a los análisis iniciados después de guardar.
        </Text>
      </View>
    </RecruiterPage>
  );
}

function SimulationOutcome({ simulation }) {
  const styles = useStyles();
  const { colors } = useTheme();

  if (simulation.isPending) {
    return <ActivityIndicator accessibilityLabel="Simulando el ranking" color={colors.primary} />;
  }
  if (simulation.isError) {
    return (
      <FormAlert
        tone="error"
        title="No pudimos simular el ranking"
        message={simulation.error.message}
      />
    );
  }
  if (!simulation.data) {
    return (
      <Text style={styles.simulationCopy}>
        Pulsa «Simular ranking» para ver cómo quedaría el ranking de esta vacante con los valores
        en pantalla. No se guarda nada.
      </Text>
    );
  }

  const { total, shortlisted, position_changes: positionChanges, top } = simulation.data;
  if (total === 0) {
    return (
      <Text style={styles.simulationCopy}>
        Esta vacante todavía no tiene candidatos analizados. Analiza sus CV para poder simular el
        ranking.
      </Text>
    );
  }

  return (
    <>
      <Badge label={`${total} CV ${total === 1 ? 'analizado' : 'analizados'}`} tone="neutral" />
      <View style={styles.simulationMetrics}>
        <View style={styles.simulationMetric}>
          <Text style={styles.simulationLabel}>Cambios de posición</Text>
          <Text style={styles.simulationValue}>{positionChanges}</Text>
          <Text style={styles.simulationDetail}>frente al ranking guardado</Text>
        </View>
        <View style={styles.simulationMetric}>
          <Text style={styles.simulationLabel}>Tasa de aprobación</Text>
          <Text style={styles.simulationValue}>{Math.round((shortlisted / total) * 100)}%</Text>
          <Text style={styles.simulationDetail}>
            {shortlisted} de {total} con {simulation.variables.cutoff}% o más
          </Text>
        </View>
      </View>
      {top.map((entry, index) => (
        <View key={entry.application_id} style={styles.rankingRow}>
          <View style={[styles.rankNumber, index === 0 && styles.rankNumberTop]}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.rankingCopy}>
            <Text style={styles.rankingName}>
              {getCandidateLabel({ id: entry.application_id, candidate_name: entry.candidate_name })}
            </Text>
            <Text style={styles.rankingHeadline}>{entry.headline}</Text>
          </View>
          <Text style={styles.rankingScore}>{entry.score}%</Text>
        </View>
      ))}
    </>
  );
}

function AppearanceSection() {
  const styles = useStyles();
  const { appearance, setAppearance, colors } = useTheme();
  const { isWide } = useWorkspaceLayout();

  return (
    <View style={styles.appearanceSection}>
      <SectionHeading
        overline="PREFERENCIAS DE INTERFAZ"
        title="Tema de la aplicación"
        description="Se aplica inmediatamente en la app y no necesita backend."
      />
      <View style={[styles.appearanceGrid, isWide && styles.appearanceGridWide]}>
        {APPEARANCES.map((option) => {
          const selected = appearance === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label}. ${option.description}`}
              accessibilityState={{ checked: selected }}
              onPress={() => setAppearance(option.value)}
              style={({ pressed }) => [
                styles.appearanceCard,
                selected && styles.appearanceCardSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                <Icon
                  name={option.icon}
                  size="md"
                  color={selected ? colors.onPrimary : undefined}
                />
              </View>
              <View style={styles.appearanceCopy}>
                <Text style={styles.appearanceTitle}>{option.label}</Text>
                <Text style={styles.appearanceDescription}>{option.description}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function WeightSlider({ option, value, onChange }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  // The track spans the editable 5–85 range; a weight outside it pins to the nearest end.
  const position = `${Math.max(0, Math.min(1, (value - 5) / 80)) * 100}%`;

  const updateFromPosition = (event) => {
    if (trackWidth === 0) return;
    // On web onPress carries a DOM MouseEvent, which has offsetX where native has locationX.
    const { locationX, offsetX } = event.nativeEvent;
    const pressX = Platform.OS === 'web' ? offsetX : locationX;
    const ratio = Math.max(0, Math.min(1, pressX / trackWidth));
    onChange(5 + ratio * 80);
  };

  const handleAccessibilityAction = (event) => {
    if (event.nativeEvent.actionName === 'increment') onChange(value + 5);
    if (event.nativeEvent.actionName === 'decrement') onChange(value - 5);
  };

  return (
    <View style={styles.weightCard}>
      <View style={styles.weightHeading}>
        <View style={styles.weightTitleGroup}>
          <Icon name="grip-vertical" size="sm" color={colors.mutedForeground} />
          <Text style={styles.weightTitle}>{option.label}</Text>
        </View>
        <Text style={styles.weightValue}>{value}%</Text>
      </View>
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel={option.label}
        accessibilityValue={{ min: 5, max: 85, now: value }}
        accessibilityActions={[
          { name: 'increment', label: 'Aumentar ponderación' },
          { name: 'decrement', label: 'Reducir ponderación' },
        ]}
        onAccessibilityAction={handleAccessibilityAction}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        onPress={updateFromPosition}
        style={({ pressed }) => [styles.sliderTrack, pressed && styles.pressed]}
      >
        <View
          style={[styles.sliderFill, { width: position, backgroundColor: colors[option.color] }]}
        />
        <View
          style={[styles.sliderThumb, { left: position, borderColor: colors[option.color] }]}
        />
      </Pressable>
      <Text style={styles.weightHint}>{option.hint}</Text>
    </View>
  );
}

function SwitchSetting({ icon, title, detail, value, onValueChange }) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.switchCard}>
      <View style={styles.switchHeading}>
        <View style={styles.switchIcon}>
          <Icon name={icon} size="md" color={colors.secondaryText} />
        </View>
        <Switch
          accessibilityLabel={title}
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      </View>
      <Text style={styles.switchTitle}>{title}</Text>
      <Text style={styles.switchDetail}>{detail}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, radii, spacing, typography } = t;
  return {
    headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    headerActionsStacked: { flexDirection: 'column', alignItems: 'stretch' },
    loading: { paddingVertical: spacing.xl },
    saveAlert: { marginBottom: spacing.md },
    totalCard: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      marginBottom: spacing.md,
    },
    totalIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    totalCopy: { flex: 1, minWidth: 180 },
    totalTitle: { ...typography.bodyStrong, color: colors.foreground },
    totalText: { ...typography.caption, color: colors.mutedForeground },
    unsavedBadge: { alignSelf: 'center' },
    totalValue: { alignItems: 'flex-end' },
    totalLabel: { ...typography.label, color: colors.mutedForeground, fontSize: 9 },
    totalNumber: { ...typography.title, color: colors.secondaryText },
    configGrid: { gap: spacing.md },
    configGridWide: { flexDirection: 'row', alignItems: 'flex-start' },
    panel: {
      minWidth: 0,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      gap: spacing.sm,
    },
    weightsPanel: { flex: 1.15 },
    biasPanel: { flex: 0.9 },
    simulationPanel: { flex: 0.82 },
    weightsList: { gap: spacing.sm },
    weightCard: {
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.md,
      gap: spacing.xs,
    },
    weightHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    weightTitleGroup: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xxs },
    weightTitle: { ...typography.captionStrong, color: colors.foreground, flexShrink: 1 },
    weightValue: { ...typography.captionStrong, color: colors.secondaryText },
    sliderTrack: {
      height: 10,
      position: 'relative',
      justifyContent: 'center',
      borderRadius: radii.full,
      backgroundColor: colors.muted,
    },
    // Fill and thumb let presses through, so the press position is always relative to the track.
    sliderFill: { height: '100%', borderRadius: radii.full, pointerEvents: 'none' },
    sliderThumb: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderRadius: radii.full,
      borderWidth: 2,
      backgroundColor: colors.card,
      marginLeft: -8,
      pointerEvents: 'none',
    },
    weightHint: { ...typography.caption, color: colors.mutedForeground },
    balanceCard: {
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      gap: spacing.xs,
    },
    balanceTitle: { ...typography.captionStrong, color: colors.foreground },
    balanceTrack: { height: 8, flexDirection: 'row', overflow: 'hidden', borderRadius: radii.full },
    balanceSegment: { height: '100%' },
    balanceText: { ...typography.caption, color: colors.mutedForeground },
    switchCard: {
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.md,
    },
    switchHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    switchIcon: {
      width: 32,
      height: 32,
      borderRadius: radii.sm,
      backgroundColor: colors.secondarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    switchTitle: { ...typography.captionStrong, color: colors.foreground },
    switchDetail: { ...typography.caption, color: colors.mutedForeground },
    policyCard: {
      gap: spacing.xs,
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.md,
    },
    policyTitle: { ...typography.captionStrong, color: colors.foreground },
    cutoffButton: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.sm,
      backgroundColor: colors.card,
    },
    cutoffText: { ...typography.caption, color: colors.foreground, flex: 1 },
    helperText: { ...typography.caption, color: colors.mutedForeground },
    radioRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, paddingVertical: spacing.xxs },
    radio: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: radii.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: { borderColor: colors.secondary },
    radioDot: { width: 10, height: 10, borderRadius: radii.full, backgroundColor: colors.secondary },
    radioCopy: { flex: 1, gap: spacing.xxs },
    radioTitle: { ...typography.captionStrong, color: colors.foreground },
    radioDetail: { ...typography.caption, color: colors.mutedForeground },
    panelHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    panelTitle: { ...typography.bodyStrong, color: colors.foreground, flexShrink: 1 },
    simulationCopy: { ...typography.caption, color: colors.mutedForeground },
    highlight: { ...typography.captionStrong, color: colors.secondaryText },
    simulationMetrics: { flexDirection: 'row', gap: spacing.xs },
    simulationMetric: {
      flex: 1,
      minWidth: 0,
      gap: spacing.xxs,
      padding: spacing.xs,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.sm,
    },
    simulationLabel: { ...typography.caption, color: colors.mutedForeground },
    simulationValue: { ...typography.h3, color: colors.secondaryText },
    simulationDetail: { ...typography.caption, color: colors.mutedForeground },
    rankingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.xs,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.sm,
    },
    rankNumber: {
      width: 22,
      height: 22,
      borderRadius: radii.full,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankNumberTop: { backgroundColor: colors.primarySoft },
    rankText: { ...typography.captionStrong, color: colors.foreground },
    rankingCopy: { flex: 1, minWidth: 0 },
    rankingName: { ...typography.captionStrong, color: colors.foreground },
    rankingHeadline: { ...typography.caption, color: colors.mutedForeground },
    rankingScore: { ...typography.captionStrong, color: colors.secondaryText },
    appearanceSection: { marginTop: spacing.xl },
    appearanceGrid: { gap: spacing.xs, marginTop: spacing.md },
    appearanceGridWide: { flexDirection: 'row' },
    appearanceCard: {
      flex: 1,
      minHeight: 68,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
    },
    appearanceCardSelected: { borderWidth: 2, borderColor: colors.primary },
    optionIcon: {
      width: 38,
      height: 38,
      borderRadius: radii.sm,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionIconSelected: { backgroundColor: colors.primary },
    appearanceCopy: { flex: 1, minWidth: 0 },
    appearanceTitle: { ...typography.captionStrong, color: colors.foreground },
    appearanceDescription: { ...typography.caption, color: colors.mutedForeground },
    auditBar: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.xl,
    },
    auditText: { ...typography.caption, color: colors.mutedForeground, flex: 1 },
    pressed: { opacity: 0.78 },
  };
});
