import { ActivityIndicator, Platform, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import { Badge, Button, FormAlert, Icon } from '../components';
import { RecruiterPage } from '../components/RecruiterPage';
import { apiFetchBlob } from '../lib/api/client';
import { useApplication, useUpdateStage } from '../lib/api/queries';
import { getApplicationStatus } from '../lib/applicationStatus';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { formatRelativeTime, getCandidateLabel, getInitials } from '../utils/format';
import { comingSoon, notify } from '../utils/notify';

const DIMENSIONS = {
  technical: { label: 'Ajuste técnico', icon: 'cpu' },
  experience: { label: 'Experiencia', icon: 'trending-up' },
  impact: { label: 'Impacto y métricas', icon: 'chart-column' },
  education: { label: 'Educación', icon: 'graduation-cap' },
};

const REQUIREMENT_STATUS = {
  met: { label: 'Cumple', tone: 'success' },
  partial: { label: 'Parcial', tone: 'warning' },
  missing: { label: 'No acredita', tone: 'neutral' },
};

const UNANALYZED_STATES = {
  pending: {
    icon: 'file-clock',
    title: 'Este CV aún no se ha analizado',
    text: 'Procésalo desde el pipeline para generar su evaluación.',
  },
  processing: {
    icon: 'hourglass',
    title: 'Análisis en curso',
    text: 'La IA está evaluando este CV. El resultado aparecerá aquí en cuanto termine.',
  },
};

async function copyToClipboard(text, confirmation) {
  // On web the promise resolves to false when the browser refuses the copy.
  const copied = await Clipboard.setStringAsync(text);
  if (copied) notify(confirmation, 'El texto ya está en tu portapapeles.');
  else notify('No se pudo copiar', 'El navegador no permitió el acceso al portapapeles.');
}

export default function RecruiterCandidateMatchScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();

  if (!id) {
    return (
      <PlaceholderPage description="Revisa la evaluación detallada de un candidato frente a los requisitos de su vacante.">
        <View style={styles.statePanel}>
          <Icon name="mouse-pointer-click" size="lg" color={colors.mutedForeground} />
          <Text style={styles.stateTitle}>Elige un candidato</Text>
          <Text style={styles.stateText}>
            Abre un candidato desde el ranking del pipeline para ver aquí su análisis completo.
          </Text>
          <Button
            label="Ir al pipeline"
            iconRight="arrow-right"
            onPress={() => router.push('/pipeline')}
            style={styles.stateAction}
          />
        </View>
      </PlaceholderPage>
    );
  }

  // Keyed so the mutation state of one candidate never leaks into the next one.
  return <ApplicationReview key={id} applicationId={id} />;
}

function PlaceholderPage({ description, children }) {
  return (
    <RecruiterPage
      eyebrow="ANÁLISIS PROFUNDO"
      title="Análisis de candidato"
      description={description}
    >
      {children}
    </RecruiterPage>
  );
}

function ApplicationReview({ applicationId }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { data: application, isPending, error } = useApplication(applicationId);

  if (isPending) {
    return (
      <PlaceholderPage description="Estamos recuperando la candidatura.">
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Cargando la candidatura"
          style={styles.loader}
        />
      </PlaceholderPage>
    );
  }

  if (error) {
    return (
      <PlaceholderPage description="No pudimos abrir esta candidatura.">
        <FormAlert
          tone="error"
          title="No pudimos cargar la candidatura"
          message={error.message}
        />
      </PlaceholderPage>
    );
  }

  const eyebrow = `${application.job_title}  /  Candidatura #${application.id.slice(0, 4).toUpperCase()}`;

  if (application.analysis_status === 'completed') {
    return <EvaluationReport application={application} eyebrow={eyebrow} />;
  }

  const state = UNANALYZED_STATES[application.analysis_status];

  return (
    <RecruiterPage
      eyebrow={eyebrow}
      title={application.cv_filename}
      description="Todavía no hay una evaluación disponible para este CV."
      action={
        <Button
          label="Ir al pipeline"
          iconRight="arrow-right"
          onPress={() => router.push('/pipeline')}
        />
      }
    >
      {application.analysis_status === 'failed' ? (
        <FormAlert
          tone="error"
          title="El análisis de este CV falló. Vuelve a procesarlo desde el pipeline."
          message={application.analysis_error}
        />
      ) : (
        <View style={styles.statePanel}>
          <Icon name={state.icon} size="lg" color={colors.mutedForeground} />
          <Text style={styles.stateTitle}>{state.title}</Text>
          <Text style={styles.stateText}>{state.text}</Text>
        </View>
      )}
    </RecruiterPage>
  );
}

function EvaluationReport({ application, eyebrow }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isWide } = useWorkspaceLayout();
  const updateStage = useUpdateStage(application.id);
  const cvDownload = useMutation({
    mutationFn: async () => {
      const blob = await apiFetchBlob(`/api/v1/applications/${application.id}/cv`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = application.cv_filename;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });

  const { evaluation } = application;
  const candidateLabel = getCandidateLabel(application);
  const status = getApplicationStatus({ ...application, shortlisted: evaluation.shortlisted });
  const fileType = application.cv_filename.split('.').pop().toUpperCase();
  const experience =
    application.years_experience === 1
      ? '1 año de experiencia'
      : `${application.years_experience} años de experiencia`;
  const metCount = evaluation.requirements.filter((item) => item.status === 'met').length;

  const downloadCv = () => {
    if (Platform.OS === 'web') {
      cvDownload.mutate();
      return;
    }
    notify(
      'Descarga disponible en la web',
      'La app móvil todavía no puede descargar el archivo original. Descárgalo desde la versión web.',
    );
  };

  return (
    <RecruiterPage
      eyebrow={eyebrow}
      title={candidateLabel}
      description={`${application.headline} · ${experience}${
        application.location ? ` · ${application.location}` : ''
      }`}
      action={
        <View style={[styles.profileActions, !isWide && styles.profileActionsStacked]}>
          <Button
            label="Descartar"
            variant="outline"
            iconLeft="x"
            disabled={application.stage === 'rejected' || updateStage.isPending}
            loading={updateStage.isPending && updateStage.variables === 'rejected'}
            onPress={() => updateStage.mutate('rejected')}
          />
          <Button
            label={`CV ${fileType}`}
            accessibilityLabel={`Descargar el CV original en ${fileType}`}
            variant="outline"
            iconLeft="file-down"
            loading={cvDownload.isPending}
            onPress={downloadCv}
          />
          <Button
            label="Aprobar para entrevista"
            iconLeft="circle-check"
            disabled={application.stage === 'interview' || updateStage.isPending}
            loading={updateStage.isPending && updateStage.variables === 'interview'}
            onPress={() => updateStage.mutate('interview')}
          />
        </View>
      }
    >
      {updateStage.error ? (
        <FormAlert
          tone="error"
          title="No pudimos actualizar la etapa del candidato"
          message={updateStage.error.message}
          style={styles.alert}
        />
      ) : null}
      {cvDownload.error ? (
        <FormAlert
          tone="error"
          title="No pudimos descargar el CV"
          message={cvDownload.error.message}
          style={styles.alert}
        />
      ) : null}

      <View style={styles.modelBar}>
        <View style={styles.modelMeta}>
          <Icon name="sparkles" size="sm" color={colors.secondaryText} />
          <Text style={styles.modelText}>
            Análisis IA · {formatRelativeTime(application.analyzed_at)}
          </Text>
        </View>
        <View style={styles.modelBadges}>
          <Badge
            label={application.cv_filename}
            tone="neutral"
            icon="file-text"
            style={styles.fileBadge}
          />
          <Badge label={status.label} tone={status.tone} />
        </View>
      </View>

      <View style={styles.matchBanner}>
        <View style={styles.candidateAvatar}>
          <Text style={styles.candidateInitials}>
            {application.candidate_name ? getInitials(application.candidate_name) : 'CV'}
          </Text>
          <View style={styles.rankBadge}>
            <Text
              accessibilityLabel={`Puesto ${evaluation.rank} del ranking`}
              style={styles.rankText}
            >
              #{evaluation.rank}
            </Text>
          </View>
        </View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerName}>{candidateLabel}</Text>
          <Text style={styles.bannerInsight}>{evaluation.insight}</Text>
        </View>
        <View style={styles.bannerScore}>
          {evaluation.shortlisted ? (
            <Badge label="RECOMENDADO" tone="success" icon="circle-check" />
          ) : (
            <Badge
              label={`BAJO EL CORTE DEL ${evaluation.cutoff}%`}
              tone="warning"
              icon="triangle-alert"
            />
          )}
          <Text style={[styles.scoreValue, !evaluation.shortlisted && styles.scoreValueWarning]}>
            {evaluation.score}%
          </Text>
        </View>
      </View>

      <View style={[styles.scoreGrid, isWide && styles.scoreGridWide]}>
        {evaluation.dimensions.map((dimension) => (
          <ScoreBreakdown key={dimension.key} dimension={dimension} wide={isWide} />
        ))}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeading}>
          <View style={styles.headingTitleGroup}>
            <Icon name="table-properties" size="md" color={colors.secondaryText} />
            <Text style={styles.panelTitle}>Comparativa de requisitos vs evidencia</Text>
          </View>
          <Badge
            label={`${metCount} de ${evaluation.requirements.length} cumplidos`}
            tone={metCount === evaluation.requirements.length ? 'success' : 'info'}
          />
        </View>
        {evaluation.requirements.map((item, index) => {
          const { label, tone } = REQUIREMENT_STATUS[item.status];
          return (
            <View
              key={index}
              style={[
                styles.requirementRow,
                index < evaluation.requirements.length - 1 && styles.divider,
              ]}
            >
              <View style={styles.requirementHeading}>
                <Text style={styles.requirementName}>{item.name}</Text>
                <Text style={styles.requirementDetail}>{item.detail}</Text>
              </View>
              <Text style={styles.evidenceText}>{item.evidence}</Text>
              <Badge label={`${item.match_percent}% ${label}`} tone={tone} />
            </View>
          );
        })}
      </View>

      <View style={[styles.insightGrid, isWide && styles.insightGridWide]}>
        <View style={[styles.panel, styles.insightPanel]}>
          <View style={styles.panelHeading}>
            <View style={styles.headingTitleGroup}>
              <Icon name="brain" size="md" color={colors.secondaryText} />
              <Text style={styles.panelTitle}>Resumen ejecutivo IA</Text>
            </View>
          </View>
          <Insight
            icon="thumbs-up"
            tone="success"
            title="Por qué sí · Fortalezas críticas"
            detail={evaluation.strengths}
          />
          <Insight
            icon="circle-help"
            tone="warning"
            title="Qué validar · Punto clave en entrevista"
            detail={evaluation.to_validate}
          />
          <View style={styles.auditLine}>
            <Icon
              name={evaluation.anonymized ? 'shield-check' : 'eye'}
              size="sm"
              color={evaluation.anonymized ? colors.success : colors.mutedForeground}
            />
            <Text style={[styles.auditText, !evaluation.anonymized && styles.auditTextMuted]}>
              {evaluation.anonymized
                ? 'Evaluación anonimizada: la puntuación se calculó sin el nombre ni la ubicación del candidato.'
                : 'Evaluación sin anonimizar: la IA vio el nombre y la ubicación del candidato.'}
            </Text>
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
              onPress={() =>
                copyToClipboard(
                  evaluation.questions
                    .map((item, index) => `${index + 1}. ${item.question}`)
                    .join('\n'),
                  'Preguntas copiadas',
                )
              }
            />
          </View>
          {evaluation.questions.map((item, index) => (
            <View key={index} style={styles.questionCard}>
              <View style={styles.questionHeading}>
                <Badge label={`Q${index + 1} · ${item.topic}`} tone="info" />
                <Button
                  label="Copiar"
                  accessibilityLabel={`Copiar la pregunta ${index + 1}`}
                  variant="ghost"
                  iconLeft="copy"
                  onPress={() => copyToClipboard(item.question, 'Pregunta copiada')}
                />
              </View>
              <Text style={styles.questionText}>{item.question}</Text>
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

function ScoreBreakdown({ dimension, wide }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { label, icon } = DIMENSIONS[dimension.key];

  return (
    <View style={[styles.scoreCard, wide && styles.scoreCardWide]}>
      <View style={styles.scoreCardTop}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scorePercent}>{dimension.score}%</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${dimension.score}%` }]} />
      </View>
      <View style={styles.scoreNoteRow}>
        <Icon name={icon} size="sm" color={colors.secondaryText} />
        <Text style={styles.scoreNote}>{dimension.note}</Text>
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
    loader: { paddingVertical: spacing.xxl },
    alert: { marginBottom: spacing.md },
    statePanel: {
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.xl,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
    },
    stateTitle: { ...typography.title, color: colors.foreground, textAlign: 'center' },
    stateText: {
      ...typography.bodySm,
      color: colors.mutedForeground,
      textAlign: 'center',
      maxWidth: 480,
    },
    stateAction: { marginTop: spacing.sm },
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
    modelBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.xs,
      flexShrink: 1,
    },
    fileBadge: { flexShrink: 1 },
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
    rankBadge: {
      position: 'absolute',
      bottom: -7,
      right: -9,
      paddingHorizontal: spacing.xs,
      borderRadius: radii.full,
      backgroundColor: colors.primary,
    },
    rankText: { ...typography.captionStrong, color: colors.onPrimary },
    bannerCopy: { flex: 1, minWidth: 200 },
    bannerName: { ...typography.h3, color: colors.foreground },
    bannerInsight: { ...typography.bodySm, color: colors.mutedForeground },
    bannerScore: { alignItems: 'flex-end', gap: spacing.xxs },
    scoreValue: { ...typography.h2, color: colors.success },
    scoreValueWarning: { color: colors.warning },
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
    scoreNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xxs },
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
    auditText: { ...typography.caption, color: colors.success, flex: 1 },
    auditTextMuted: { color: colors.mutedForeground },
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
