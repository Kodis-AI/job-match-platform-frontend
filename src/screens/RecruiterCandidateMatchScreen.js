import { Text, View } from 'react-native';

import { Badge, Button, Icon } from '../components';
import { RecruiterPage } from '../components/RecruiterPage';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { comingSoon } from '../utils/notify';

const SCORES = [
  { label: 'Ajuste técnico', value: 98, note: '9 de 10 tecnologías requeridas', icon: 'cpu' },
  { label: 'Experiencia', value: 94, note: 'FinTech de alta concurrencia', icon: 'trending-up' },
  { label: 'Metodología', value: 91, note: 'Agile y mentoría demostrada', icon: 'users-round' },
  { label: 'Educación', value: 95, note: 'Grado + AWS Certified Arch', icon: 'graduation-cap' },
];

const REQUIREMENTS = [
  {
    name: 'React 18+ & TypeScript',
    detail: 'Arquitectura moderna y SSR',
    evidence: '5.2 años de producción en FinTech. Lideró migración a React 18 y redujo LCP un 40%.',
    match: '100% Cumple',
    status: 'success',
  },
  {
    name: 'PostgreSQL avanzado',
    detail: 'Consultas complejas e índices',
    evidence: 'Particionado transaccional con 12M de filas al día. Latencia p99 de 420ms a <15ms.',
    match: '98% Cumple',
    status: 'success',
  },
  {
    name: 'AWS & Docker',
    detail: 'ECS Fargate, IaC Terraform',
    evidence: 'Certificación AWS Solutions Architect activa y despliegues zero-downtime en 8 microservicios.',
    match: '95% Cumple',
    status: 'success',
  },
  {
    name: 'Kafka / Event Brokers',
    detail: 'Deseable · Nice-to-have',
    evidence: 'Consumo y producción de eventos; no acredita administración de clústeres.',
    match: '85% Parcial',
    status: 'warning',
  },
];

const QUESTIONS = [
  {
    tag: 'Q1 · Kafka & resiliencia',
    text: '¿Cómo resolviste la acumulación de consumer lag y el rebalanceo de particiones ante caídas de workers?',
  },
  {
    tag: 'Q2 · PostgreSQL & concurrencia',
    text: '¿Cómo gestionaron los deadlocks durante las migraciones con 12 millones de filas diarias?',
  },
];

export default function RecruiterCandidateMatchScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isWide } = useWorkspaceLayout();

  return (
    <RecruiterPage
      eyebrow="PIPELINE ACTIVO  /  SENIOR FULL STACK ENGINEER  /  AUDITORÍA #4892"
      title="Alejandro Valenzuela"
      description="Senior Full Stack Engineer · 6.5 años de experiencia · Disponibilidad inmediata · $80K USD"
      action={
        <View style={[styles.profileActions, !isWide && styles.profileActionsStacked]}>
          <Button
            label="Descartar"
            variant="outline"
            iconLeft="x"
            onPress={() => comingSoon('Descartar candidato')}
          />
          <Button
            label="CV PDF"
            variant="outline"
            iconLeft="file-down"
            onPress={() => comingSoon('Descargar CV PDF')}
          />
          <Button
            label="Aprobar para entrevista"
            iconLeft="circle-check"
            onPress={() => comingSoon('Aprobar para entrevista')}
          />
        </View>
      }
    >
      <View style={styles.modelBar}>
        <View style={styles.modelMeta}>
          <Icon name="sparkles" size="sm" color={colors.secondaryText} />
          <Text style={styles.modelText}>TalentMatch NLP v4.2 · Confianza 99.4%</Text>
        </View>
        <Badge label="CV v2.1 · leído hace 2 h" tone="neutral" icon="history" />
      </View>

      <View style={styles.matchBanner}>
        <View style={styles.candidateAvatar}>
          <Text style={styles.candidateInitials}>AV</Text>
          <View style={styles.candidateId}>
            <Text style={styles.candidateIdText}>#4892</Text>
          </View>
        </View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerName}>Alejandro Valenzuela</Text>
          <Text style={styles.bannerRole}>Senior Full Stack Engineer · Match recomendado</Text>
        </View>
        <View style={styles.bannerScore}>
          <Badge label="RECOMENDADO" tone="success" icon="circle-check" />
          <Text style={styles.scoreValue}>96%</Text>
        </View>
      </View>

      <View style={[styles.scoreGrid, isWide && styles.scoreGridWide]}>
        {SCORES.map((score) => (
          <ScoreBreakdown key={score.label} score={score} wide={isWide} />
        ))}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeading}>
          <View style={styles.headingTitleGroup}>
            <Icon name="table-properties" size="md" color={colors.secondaryText} />
            <Text style={styles.panelTitle}>Comparativa de requisitos vs evidencia</Text>
          </View>
          <Badge label="4 de 4 validados" tone="success" />
        </View>
        {REQUIREMENTS.map((item, index) => (
          <View
            key={item.name}
            style={[styles.requirementRow, index < REQUIREMENTS.length - 1 && styles.divider]}
          >
            <View style={styles.requirementHeading}>
              <Text style={styles.requirementName}>{item.name}</Text>
              <Text style={styles.requirementDetail}>{item.detail}</Text>
            </View>
            <Text style={styles.evidenceText}>{item.evidence}</Text>
            <Badge label={item.match} tone={item.status} />
          </View>
        ))}
      </View>

      <View style={[styles.insightGrid, isWide && styles.insightGridWide]}>
        <View style={[styles.panel, styles.insightPanel]}>
          <View style={styles.panelHeading}>
            <View style={styles.headingTitleGroup}>
              <Icon name="brain" size="md" color={colors.secondaryText} />
              <Text style={styles.panelTitle}>Resumen ejecutivo IA</Text>
            </View>
            <Badge label="Recomendado para fase final" tone="success" />
          </View>
          <Insight
            icon="thumbs-up"
            tone="success"
            title="Por qué sí · Fortalezas críticas"
            detail="Historial excepcional de optimización FinTech: redujo la latencia en PostgreSQL un 96% y lideró equipos técnicos durante 2.5 años."
          />
          <Insight
            icon="circle-help"
            tone="warning"
            title="Qué validar · Punto clave en entrevista"
            detail="Profundidad en gestión de clústeres Kafka y mitigación de fallos bajo alta concurrencia."
          />
          <View style={styles.auditLine}>
            <Icon name="shield-check" size="sm" color={colors.success} />
            <Text style={styles.auditText}>Auditoría de sesgo · GDPR / EEOC</Text>
          </View>
        </View>

        <View style={[styles.panel, styles.insightPanel]}>
          <View style={styles.panelHeading}>
            <View style={styles.headingTitleGroup}>
              <Icon name="messages-square" size="md" color={colors.secondaryText} />
              <Text style={styles.panelTitle}>Preguntas sugeridas</Text>
            </View>
            <Button
              label="Copiar todas"
              variant="ghost"
              iconLeft="copy"
              onPress={() => comingSoon('Copiar preguntas')}
            />
          </View>
          {QUESTIONS.map((question) => (
            <View key={question.tag} style={styles.questionCard}>
              <View style={styles.questionHeading}>
                <Badge label={question.tag} tone="info" />
                <Button
                  label="Copiar"
                  variant="ghost"
                  iconLeft="copy"
                  onPress={() => comingSoon('Copiar pregunta')}
                />
              </View>
              <Text style={styles.questionText}>{question.text}</Text>
            </View>
          ))}
          <Button
            label="Agendar entrevista técnica"
            iconLeft="calendar-plus"
            onPress={() => comingSoon('Agendar entrevista técnica')}
            style={styles.scheduleButton}
          />
        </View>
      </View>
    </RecruiterPage>
  );
}

function ScoreBreakdown({ score, wide }) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={[styles.scoreCard, wide && styles.scoreCardWide]}>
      <View style={styles.scoreCardTop}>
        <Text style={styles.scoreLabel}>{score.label}</Text>
        <Text style={styles.scorePercent}>{score.value}%</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${score.value}%` }]} />
      </View>
      <View style={styles.scoreNoteRow}>
        <Icon name={score.icon} size="sm" color={colors.success} />
        <Text style={styles.scoreNote}>{score.note}</Text>
      </View>
    </View>
  );
}

function Insight({ icon, tone, title, detail }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const iconColor = tone === 'success' ? colors.success : colors.warning;

  return (
    <View style={[styles.insightCard, tone === 'warning' && styles.insightWarning]}>
      <Icon name={icon} size="md" color={iconColor} />
      <View style={styles.insightCopy}>
        <Text style={[styles.insightTitle, tone === 'warning' && styles.insightTitleWarning]}>
          {title}
        </Text>
        <Text style={styles.insightDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, radii, spacing, typography } = t;
  return {
    profileActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    profileActionsStacked: { flexDirection: 'column', alignItems: 'stretch' },
    modelBar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    modelMeta: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.full,
      backgroundColor: colors.card,
    },
    modelText: { ...typography.captionStrong, color: colors.mutedForeground },
    matchBanner: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
    },
    candidateAvatar: {
      width: 60,
      height: 60,
      position: 'relative',
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.secondaryBorder,
    },
    candidateInitials: { ...typography.title, color: colors.onPrimarySoft },
    candidateId: {
      position: 'absolute',
      bottom: -7,
      right: -9,
      paddingHorizontal: spacing.xs,
      borderRadius: radii.full,
      backgroundColor: colors.success,
    },
    candidateIdText: { ...typography.captionStrong, color: colors.onAccent, fontSize: 10 },
    bannerCopy: { flex: 1, minWidth: 200 },
    bannerName: { ...typography.h3, color: colors.foreground },
    bannerRole: { ...typography.bodySm, color: colors.mutedForeground },
    bannerScore: { alignItems: 'flex-end', gap: spacing.xxs },
    scoreValue: { ...typography.h2, color: colors.success },
    scoreGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginVertical: spacing.md,
    },
    scoreGridWide: { flexWrap: 'wrap' },
    scoreCard: {
      flexBasis: '46%',
      flexGrow: 1,
      minWidth: 145,
      padding: spacing.md,
      gap: spacing.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
    },
    scoreCardWide: { flexBasis: '23%' },
    scoreCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    scoreLabel: { ...typography.captionStrong, color: colors.mutedForeground },
    scorePercent: { ...typography.bodyStrong, color: colors.secondaryText },
    scoreTrack: {
      height: 6,
      borderRadius: radii.full,
      overflow: 'hidden',
      backgroundColor: colors.muted,
    },
    scoreFill: { height: '100%', borderRadius: radii.full, backgroundColor: colors.secondary },
    scoreNoteRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
    scoreNote: { ...typography.caption, color: colors.mutedForeground, flex: 1 },
    panel: {
      minWidth: 0,
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      gap: spacing.sm,
    },
    panelHeading: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
      marginBottom: spacing.xs,
    },
    headingTitleGroup: { flexDirection: 'row', flex: 1, alignItems: 'center', gap: spacing.xs },
    panelTitle: { ...typography.bodyStrong, color: colors.foreground },
    requirementRow: { gap: spacing.xs, paddingVertical: spacing.sm },
    divider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
    requirementHeading: { gap: spacing.xxs },
    requirementName: { ...typography.bodyStrong, color: colors.foreground },
    requirementDetail: { ...typography.caption, color: colors.mutedForeground },
    evidenceText: { ...typography.bodySm, color: colors.mutedForeground, lineHeight: 21 },
    insightGrid: { gap: spacing.md, marginTop: spacing.md },
    insightGridWide: { flexDirection: 'row', alignItems: 'stretch' },
    insightPanel: { flex: 1, minWidth: 0 },
    insightCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      padding: spacing.sm,
      backgroundColor: colors.successSoft,
      borderWidth: 1,
      borderColor: colors.successBorder,
      borderRadius: radii.md,
    },
    insightWarning: {
      backgroundColor: colors.warningSoft,
      borderColor: colors.border,
    },
    insightCopy: { flex: 1, gap: spacing.xxs },
    insightTitle: { ...typography.captionStrong, color: colors.success },
    insightTitleWarning: { color: colors.warning },
    insightDetail: { ...typography.bodySm, color: colors.foreground },
    auditLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      marginTop: spacing.xs,
    },
    auditText: { ...typography.caption, color: colors.success },
    questionCard: {
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
    },
    questionHeading: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    questionText: { ...typography.bodySm, color: colors.foreground, lineHeight: 21 },
    scheduleButton: { alignSelf: 'flex-end', marginTop: spacing.xs },
  };
});
