import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { Badge, Button, Chip, Icon, SectionHeading } from '../components';
import { RecruiterPage } from '../components/RecruiterPage';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { comingSoon } from '../utils/notify';

const JOB_PROFILES = ['Senior Full Stack', 'DevOps Lead', 'Data Architect'];

const CANDIDATES = [
  {
    name: 'Alejandro Valenzuela',
    role: 'Senior Full Stack Engineer',
    experience: '6.5 años exp',
    location: 'Santiago, CL',
    skills: ['React', 'Node.js', 'GraphQL', 'AWS'],
    score: 96,
    insight: 'Fuerte en arquitectura distribuida y CQRS',
    initials: 'AV',
    rank: '01',
  },
  {
    name: 'Valeria Martínez',
    role: 'Senior Full Stack Engineer',
    experience: '5.2 años exp',
    location: 'Remoto (ARG)',
    skills: ['Next.js', 'NestJS', 'Kubernetes', 'Kafka'],
    score: 93,
    insight: 'Optimización comprobada en latencias backend',
    initials: 'VM',
    rank: '02',
  },
  {
    name: 'Martín Salcedo',
    role: 'Full Stack Engineer',
    experience: '7.0 años exp',
    location: 'Bogotá, CO',
    skills: ['React Native', 'TypeScript', 'Docker'],
    score: 89,
    insight: 'Sólida trayectoria liderando squads ágiles',
    initials: 'MS',
    rank: '03',
  },
];

export default function RecruitmentPipelineScreen() {
  const styles = useStyles();
  const { colors, layout } = useTheme();
  const { contentWidth, isCompact, isWide } = useWorkspaceLayout();
  const isIntakeWide = contentWidth >= layout.breakpoints.xwide;
  const [selectedJob, setSelectedJob] = useState(JOB_PROFILES[0]);
  const [skillQuery, setSkillQuery] = useState('');
  const [threshold, setThreshold] = useState(75);
  const [zeroBias, setZeroBias] = useState(false);

  const candidates = useMemo(
    () =>
      CANDIDATES.filter(
        (candidate) =>
          candidate.score >= threshold &&
          (skillQuery.length === 0 ||
            candidate.skills.some((skill) =>
              skill.toLowerCase().includes(skillQuery.trim().toLowerCase()),
            )),
      ),
    [skillQuery, threshold],
  );

  return (
    <RecruiterPage
      eyebrow="PROCESAMIENTO MASIVO IA & INGESTA ATS"
      title="Pipeline y triaje con IA"
      description="Normaliza postulantes, calibra el perfil objetivo y encuentra el mejor ajuste técnico al instante."
      action={
        <Button
          label="Procesar candidatos"
          iconLeft="list-filter"
          iconRight="arrow-right"
          onPress={() => comingSoon('Procesar y clasificar candidatos con IA')}
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
            <Badge label="184 CVs" tone="info" />
          </View>

          <View style={styles.fileCard}>
            <View style={styles.fileIcon}>
              <Icon name="folder-archive" size="md" color={colors.secondaryText} />
            </View>
            <View style={styles.fileCopy}>
              <Text style={styles.fileName} numberOfLines={1}>
                Lote_SeniorFullStack_184CV.zip
              </Text>
              <Text style={styles.fileMeta}>42.8 MB · 184 perfiles</Text>
            </View>
            <Button
              label={isCompact ? 'Cambiar' : 'Cambiar lote'}
              variant="outline"
              size="md"
              onPress={() => comingSoon('Cambiar lote de currículums')}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Subir o arrastrar más currículums"
            onPress={() => comingSoon('Subir currículums')}
            style={({ pressed }) => [styles.uploadArea, pressed && styles.pressed]}
          >
            <Icon name="file-up" size="md" color={colors.secondaryText} />
            <Text style={styles.uploadText}>Subir o arrastrar más CVs</Text>
          </Pressable>

          <View style={styles.normalizedBar}>
            <View style={styles.normalizedCopy}>
              <Icon name="circle-check" size="sm" color={colors.success} />
              <Text style={styles.normalizedText}>Normalizados en pgvector</Text>
            </View>
            <Text style={styles.normalizedResult}>100% OK</Text>
          </View>
        </View>

        <View style={[styles.panel, isIntakeWide && styles.panelWide]}>
          <View style={styles.panelHeading}>
            <View style={styles.headingTitleGroup}>
              <View style={[styles.stepDot, styles.stepDotGreen]} />
              <Text style={styles.panelTitle}>2. Oferta & perfil objetivo</Text>
            </View>
            <Text style={styles.reference}>#TECH-892</Text>
          </View>

          <View style={styles.jobChips}>
            {JOB_PROFILES.map((job) => (
              <Chip
                key={job}
                label={job}
                selected={selectedJob === job}
                onPress={() => setSelectedJob(job)}
              />
            ))}
          </View>

          <View style={styles.jobDescription}>
            <View style={styles.jobTitleRow}>
              <Text style={styles.jobTitle}>{selectedJob} Engineer</Text>
              <Badge label="Remoto" tone="info" />
            </View>
            <Text style={styles.jobText}>
              React, Node.js/TypeScript, microservicios, PostgreSQL masivo, observabilidad y CI/CD.
            </Text>
          </View>

          <View style={styles.atsRow}>
            <Icon name="link-2" size="sm" color={colors.mutedForeground} />
            <TextInput
              accessibilityLabel="Enlace de vacante ATS"
              placeholder="Enlace ATS (Greenhouse, Lever...)"
              placeholderTextColor={colors.placeholder}
              style={styles.atsInput}
            />
            <Button
              label="Cargar"
              size="md"
              onPress={() => comingSoon('Cargar vacante ATS')}
            />
          </View>
        </View>
      </View>

      <Button
        label={isCompact ? 'Procesar y clasificar con IA' : 'Procesar y clasificar candidatos con IA'}
        variant="accent"
        size="lg"
        iconLeft="list-filter"
        iconRight="arrow-right"
        onPress={() => comingSoon('Procesar y clasificar candidatos con IA')}
        style={styles.processButton}
      />
      <Text style={styles.processCaption}>
        Comparación semántica · 184 perfiles analizados contra el perfil técnico
      </Text>

      <View style={[styles.metricsGrid, isWide && styles.metricsGridWide]}>
        <MetricCard wide={isWide} value="184" label="Normalizados" detail="Parser sin fallos" icon="file-check-2" />
        <MetricCard wide={isWide} value="14" label="Top match" detail="+35% coincidencia" icon="trophy" />
        <MetricCard wide={isWide} value="1.4s" label="Triaje / CV" detail="Procesamiento demo" icon="zap" />
        <MetricCard wide={isWide} value="99.4%" label="Sesgo cero" detail="Datos protegidos" icon="shield-check" />
      </View>

      <View style={styles.filterPanel}>
        <View style={styles.searchBox}>
          <Icon name="search" size="sm" color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Buscar por habilidad"
            value={skillQuery}
            onChangeText={setSkillQuery}
            placeholder="Buscar skill (Docker, TypeScript...)"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.filterChips}>
          {[75, 85, 90].map((score) => (
            <Pressable
              key={score}
              accessibilityRole="button"
              accessibilityState={{ selected: threshold === score }}
              onPress={() => setThreshold(score)}
              style={({ pressed }) => [
                styles.filterChip,
                threshold === score && styles.filterChipSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterText, threshold === score && styles.filterTextSelected]}>
                Match ≥ {score}%
              </Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Modo de sesgo cero"
            accessibilityState={{ checked: zeroBias }}
            onPress={() => setZeroBias((current) => !current)}
            style={({ pressed }) => [
              styles.filterChip,
              zeroBias && styles.filterChipSelected,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              name="eye-off"
              size="sm"
              color={zeroBias ? colors.onPrimary : colors.mutedForeground}
            />
            <Text style={[styles.filterText, zeroBias && styles.filterTextSelected]}>
              Sesgo cero
            </Text>
          </Pressable>
        </View>
      </View>

      <SectionHeading
        overline="TALENT INTELLIGENCE"
        title="Ranking de postulantes"
        description={`Perfiles que cumplen con los criterios del puesto ${selectedJob}.`}
      >
        <Badge label={`${candidates.length} de 184`} tone="info" />
      </SectionHeading>

      <View style={[styles.candidateGrid, isWide && styles.candidateGridWide]}>
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.name}
            candidate={candidate}
            onOpen={() => router.push('/review')}
            onInterview={() => comingSoon('Agendar entrevista')}
          />
        ))}
        {!candidates.length && (
          <View style={styles.emptyState}>
            <Icon name="search-x" size="lg" color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>No hay candidatos con estos filtros</Text>
            <Text style={styles.emptyText}>Prueba otra habilidad o reduce el match mínimo.</Text>
          </View>
        )}
      </View>

      <View style={styles.pagination}>
        <Text style={styles.paginationText}>1 - {candidates.length} de 184</Text>
        <Button label="Ant" variant="outline" disabled onPress={() => {}} />
        <Button label="Sig" onPress={() => comingSoon('Siguiente página')} />
      </View>
    </RecruiterPage>
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

function CandidateCard({ candidate, onOpen, onInterview }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isCompact, isWide } = useWorkspaceLayout();

  return (
    <View style={[styles.candidateCard, isWide && styles.candidateCardWide]}>
      <View style={styles.candidateTop}>
        <View style={styles.candidateIdentity}>
          <View style={styles.candidateAvatar}>
            <Text style={styles.candidateInitials}>{candidate.initials}</Text>
          </View>
          <View style={styles.candidateCopy}>
            <Text style={styles.candidateName}>{candidate.name}</Text>
            <Text style={styles.candidateMeta}>
              {candidate.experience} · {candidate.location}
            </Text>
          </View>
        </View>
        <View style={styles.scoreBlock}>
          <Badge label={`#${candidate.rank} RANK`} tone="info" />
          <Text style={styles.candidateScore}>{candidate.score}%</Text>
        </View>
      </View>

      <Text style={styles.roleLabel}>{candidate.role}</Text>
      <View style={styles.skillList}>
        {candidate.skills.map((skill) => (
          <Badge key={skill} label={skill} tone="neutral" />
        ))}
      </View>

      <View style={styles.insightBox}>
        <Icon name="sparkles" size="sm" color={colors.secondaryText} />
        <Text style={styles.insightText}>{candidate.insight}</Text>
      </View>

      <View style={[styles.candidateActions, isCompact && styles.candidateActionsCompact]}>
        <Button
          label="Ver ficha"
          variant="outline"
          fullWidth={isCompact}
          onPress={onOpen}
        />
        <Button
          label="Entrevista"
          iconLeft="calendar-plus"
          fullWidth={isCompact}
          onPress={onInterview}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, radii, spacing, typography } = t;
  return {
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
    fileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.secondaryBorder,
      borderRadius: radii.md,
      backgroundColor: colors.secondarySoft,
    },
    fileIcon: {
      width: 34,
      height: 34,
      borderRadius: radii.sm,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileCopy: { flex: 1, minWidth: 0 },
    fileName: { ...typography.captionStrong, color: colors.foreground },
    fileMeta: { ...typography.caption, color: colors.mutedForeground },
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
    },
    uploadText: { ...typography.captionStrong, color: colors.secondaryText },
    normalizedBar: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radii.sm,
      marginTop: spacing.sm,
    },
    normalizedCopy: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    normalizedText: { ...typography.caption, color: colors.foreground },
    normalizedResult: { ...typography.captionStrong, color: colors.success },
    jobChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
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
    atsRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing.sm,
      marginTop: spacing.sm,
    },
    atsInput: { flex: 1, minWidth: 0, ...typography.caption, color: colors.foreground },
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
    metricsGridWide: { flexWrap: 'wrap' },
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
    },
    filterChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { ...typography.captionStrong, color: colors.mutedForeground },
    filterTextSelected: { color: colors.onPrimary },
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
    roleLabel: { ...typography.caption, color: colors.mutedForeground, marginTop: spacing.xs },
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
    candidateActions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
    candidateActionsCompact: { flexDirection: 'column' },
    emptyState: {
      width: '100%',
      minHeight: 144,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      backgroundColor: colors.card,
    },
    emptyTitle: { ...typography.bodyStrong, color: colors.foreground },
    emptyText: { ...typography.caption, color: colors.mutedForeground },
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
