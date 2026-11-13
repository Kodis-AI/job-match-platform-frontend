import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Badge, Button, FormAlert, Icon, SectionHeading } from '../components';
import { RecruiterPage } from '../components/RecruiterPage';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../lib/api/queries';
import { getApplicationStatus } from '../lib/applicationStatus';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { countLabel, formatRelativeTime, getInitials } from '../utils/format';

const ACTIVITY_TYPES = {
  cv_received: { title: 'Nuevo CV recibido', icon: 'file-plus-2' },
  analysis_completed: { title: 'Análisis completado', icon: 'sparkles' },
  interview_approved: { title: 'Aprobado para entrevista', icon: 'calendar-check' },
  candidate_rejected: { title: 'Candidato descartado', icon: 'user-x' },
};

const openReview = (id) => router.push({ pathname: '/review', params: { id } });

export default function RecruiterPortalScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: dashboard, isPending, error } = useDashboard();

  const firstName = user.name.trim().split(/\s+/)[0];
  const today = new Date().toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <RecruiterPage
      eyebrow="PANEL DEL RECLUTADOR"
      title={`Hola, ${firstName}`}
      description="Aquí tienes un resumen de tu equipo y los últimos movimientos de talento."
      action={
        <Button
          label="Crear vacante"
          iconLeft="plus"
          onPress={() => router.push({ pathname: '/pipeline', params: { create: '1' } })}
        />
      }
    >
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeCopy}>
          <Badge
            label={today[0].toUpperCase() + today.slice(1)}
            tone="info"
            icon="calendar-days"
          />
          <Text style={styles.welcomeTitle}>Tu próximo gran talento está más cerca.</Text>
          <Text style={styles.welcomeDescription}>
            Revisa el avance de tus procesos y mantén cada candidatura en movimiento.
          </Text>
        </View>
        <View style={styles.welcomeIcon}>
          <Icon name="sparkles" size="lg" color={colors.onPrimary} />
        </View>
      </View>

      {isPending ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Cargando el panel"
          style={styles.loader}
        />
      ) : null}
      {error ? (
        <FormAlert
          tone="error"
          title="No pudimos cargar tu panel"
          message={error.message}
          style={styles.alert}
        />
      ) : null}
      {dashboard ? <DashboardSections dashboard={dashboard} /> : null}
    </RecruiterPage>
  );
}

function DashboardSections({ dashboard }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isWide, isCompact } = useWorkspaceLayout();
  const { activity, recent_applications: recentApplications } = dashboard;

  const metrics = [
    {
      label: 'Vacantes activas',
      value: dashboard.jobs_total,
      delta: `+${dashboard.jobs_this_month} este mes`,
      icon: 'briefcase-business',
    },
    {
      label: 'Candidatos',
      value: dashboard.candidates_total,
      delta: `${countLabel(dashboard.candidates_this_week, 'nuevo', 'nuevos')} esta semana`,
      icon: 'users-round',
    },
    {
      label: 'Entrevistas',
      value: dashboard.interviews_total,
      delta: `${dashboard.interviews_this_week} esta semana`,
      icon: 'calendar-days',
    },
    {
      label: 'Preseleccionados',
      value: dashboard.shortlisted_total,
      delta: 'Superan el corte',
      icon: 'list-checks',
    },
  ];

  return (
    <>
      <View style={[styles.metricsGrid, isWide && styles.metricsGridWide]}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={[
              styles.metricCard,
              isCompact && styles.metricCardCompact,
              isWide && styles.metricCardWide,
            ]}
          >
            <View style={styles.metricIcon}>
              <Icon name={metric.icon} size="md" color={colors.secondaryText} />
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricDelta}>{metric.delta}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.sectionGrid, isWide && styles.sectionGridWide]}>
        <View style={styles.sectionColumn}>
          <SectionHeading
            overline="ACTIVIDAD"
            title="Movimientos recientes"
            description="Lo último que pasa en tus procesos."
          />
          <View style={styles.panel}>
            {activity.map((item, index) => {
              const { title, icon } = ACTIVITY_TYPES[item.type];
              const detail = `${item.candidate_name ?? item.cv_filename} · ${item.job_title}`;
              return (
                <Pressable
                  key={`${item.type}-${item.application_id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${title}: ${detail}`}
                  onPress={() => openReview(item.application_id)}
                  style={({ pressed }) => [
                    styles.activityRow,
                    index < activity.length - 1 && styles.divider,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.activityIcon}>
                    <Icon name={icon} size="md" color={colors.secondaryText} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{title}</Text>
                    <Text style={styles.rowDetail}>{detail}</Text>
                  </View>
                  <Text style={styles.rowTime}>{formatRelativeTime(item.at)}</Text>
                </Pressable>
              );
            })}
            {activity.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="activity" size="lg" color={colors.mutedForeground} />
                <Text style={styles.emptyTitle}>Aún no hay movimientos</Text>
                <Text style={styles.emptyText}>
                  Aquí verás los CVs recibidos, los análisis y tus decisiones sobre cada candidato.
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.sectionColumn}>
          <SectionHeading
            overline="BIBLIOTECA DE TALENTO"
            title="Historial de CVs"
            description="Perfiles recibidos recientemente en tus vacantes."
          >
            <Button
              label="Ver todos"
              variant="ghost"
              iconRight="arrow-right"
              onPress={() => router.push('/pipeline')}
            />
          </SectionHeading>
          <View style={styles.panel}>
            {recentApplications.map((application, index) => {
              const name = application.candidate_name ?? application.cv_filename;
              const status = getApplicationStatus(application);
              return (
                <View
                  key={application.id}
                  style={[
                    styles.candidateRow,
                    index < recentApplications.length - 1 && styles.divider,
                  ]}
                >
                  <View style={styles.candidateAvatar}>
                    <Text style={styles.candidateInitials}>
                      {application.candidate_name ? getInitials(application.candidate_name) : 'CV'}
                    </Text>
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{name}</Text>
                    <Text style={styles.rowDetail}>
                      {application.job_title} · {formatRelativeTime(application.created_at)}
                    </Text>
                  </View>
                  {!isCompact && <Badge label={status.label} tone={status.tone} />}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir CV de ${name}`}
                    onPress={() => openReview(application.id)}
                    hitSlop={8}
                    style={styles.chevron}
                  >
                    <Icon name="chevron-right" size="sm" color={colors.mutedForeground} />
                  </Pressable>
                </View>
              );
            })}
            {recentApplications.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="inbox" size="lg" color={colors.mutedForeground} />
                <Text style={styles.emptyTitle}>Aún no has recibido CVs</Text>
                <Text style={styles.emptyText}>
                  Sube currículums a una vacante desde el pipeline para empezar a evaluarlos.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.pipelineCard}>
        <View style={styles.pipelineCopy}>
          <Text style={styles.pipelineOverline}>TUS PROCESOS</Text>
          <Text style={styles.pipelineTitle}>
            {countLabel(dashboard.jobs_total, 'vacante activa', 'vacantes activas')}
          </Text>
          <Text style={styles.pipelineText}>
            {countLabel(dashboard.interviews_this_week, 'candidato avanzó', 'candidatos avanzaron')}{' '}
            a entrevista esta semana.
          </Text>
        </View>
        <Button
          label="Ir al pipeline"
          variant="outline"
          iconRight="arrow-right"
          onPress={() => router.push('/pipeline')}
        />
      </View>
    </>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, radii, spacing, typography } = t;
  return {
    welcomeCard: {
      backgroundColor: colors.primary,
      borderRadius: radii.lg,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    welcomeCopy: { flex: 1, gap: spacing.xs },
    welcomeTitle: { ...typography.h2, color: colors.onPrimary, maxWidth: 600 },
    welcomeDescription: { ...typography.bodySm, color: colors.onPrimaryMuted, maxWidth: 640 },
    welcomeIcon: {
      width: 52,
      height: 52,
      borderRadius: radii.full,
      backgroundColor: colors.onPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loader: { paddingVertical: spacing.xxl },
    alert: { marginBottom: spacing.lg },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
    metricsGridWide: { flexWrap: 'wrap' },
    metricCard: {
      flexBasis: '48%',
      flexGrow: 1,
      minWidth: 145,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      padding: spacing.md,
    },
    metricCardCompact: { flexBasis: '46%' },
    metricCardWide: { flexBasis: '23%' },
    metricIcon: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      backgroundColor: colors.secondarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricValue: { ...typography.h2, color: colors.foreground, marginTop: spacing.sm },
    metricLabel: { ...typography.bodyStrong, color: colors.foreground },
    metricDelta: { ...typography.caption, color: colors.success, marginTop: spacing.xxs },
    sectionGrid: { gap: spacing.xl },
    sectionGridWide: { flexDirection: 'row', alignItems: 'flex-start' },
    sectionColumn: { flex: 1, minWidth: 0 },
    panel: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    candidateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    divider: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.sm,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    candidateAvatar: {
      width: 40,
      height: 40,
      borderRadius: radii.full,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    candidateInitials: { ...typography.captionStrong, color: colors.foreground },
    rowCopy: { flex: 1, minWidth: 0 },
    rowTitle: { ...typography.bodyStrong, color: colors.foreground },
    rowDetail: { ...typography.caption, color: colors.mutedForeground },
    rowTime: { ...typography.caption, color: colors.mutedForeground },
    chevron: { minWidth: 24, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.75 },
    emptyState: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
    emptyTitle: { ...typography.bodyStrong, color: colors.foreground, textAlign: 'center' },
    emptyText: { ...typography.caption, color: colors.mutedForeground, textAlign: 'center' },
    pipelineCard: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      backgroundColor: colors.secondarySoft,
      borderWidth: 1,
      borderColor: colors.secondaryBorder,
      borderRadius: radii.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    pipelineCopy: { flex: 1, minWidth: 220 },
    pipelineOverline: { ...typography.label, color: colors.secondaryText },
    pipelineTitle: { ...typography.title, color: colors.foreground, marginTop: spacing.xxs },
    pipelineText: { ...typography.bodySm, color: colors.mutedForeground },
  };
});
