import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Badge, Button, Icon, SectionHeading } from '../components';
import { RecruiterPage } from '../components/RecruiterPage';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { comingSoon } from '../utils/notify';

const METRICS = [
  { label: 'Vacantes activas', value: '12', delta: '+2 este mes', icon: 'briefcase-business' },
  { label: 'Candidatos activos', value: '84', delta: '18 nuevos', icon: 'users-round' },
  { label: 'Entrevistas', value: '09', delta: '4 esta semana', icon: 'calendar-days' },
  { label: 'Tiempo de cobertura', value: '18 d', delta: '−3 días', icon: 'clock-3' },
];

const RECENT_CVS = [
  { name: 'Sofía Ramírez', role: 'Product Designer', date: 'Hoy, 10:42', status: 'Nuevo', initials: 'SR' },
  { name: 'Diego Torres', role: 'Frontend Engineer', date: 'Hoy, 09:18', status: 'En revisión', initials: 'DT' },
  { name: 'Lucía Herrera', role: 'Data Analyst', date: 'Ayer, 16:05', status: 'Preselección', initials: 'LH' },
];

const ACTIVITY = [
  { title: 'Entrevista agendada', detail: 'Mateo Silva · Backend Engineer', time: 'Hace 24 min', icon: 'calendar-check' },
  { title: 'Nuevo CV recibido', detail: 'Valentina Ríos · Product Designer', time: 'Hace 1 h', icon: 'file-plus-2' },
  { title: 'Candidata preseleccionada', detail: 'Lucía Herrera · Data Analyst', time: 'Ayer', icon: 'circle-check' },
];

export default function RecruiterPortalScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { isWide, isCompact } = useWorkspaceLayout();

  return (
    <RecruiterPage
      eyebrow="PANEL DEL RECLUTADOR"
      title="Hola, Elena"
      description="Aquí tienes un resumen de tu equipo y los últimos movimientos de talento."
      action={
        <Button
          label="Crear vacante"
          iconLeft="plus"
          onPress={() => comingSoon('Crear vacante')}
        />
      }
    >
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeCopy}>
          <Badge label="Martes, 11 de noviembre" tone="info" icon="calendar-days" />
          <Text style={styles.welcomeTitle}>Tu próximo gran talento está más cerca.</Text>
          <Text style={styles.welcomeDescription}>
            Revisa el avance de tus procesos y mantén cada candidatura en movimiento.
          </Text>
        </View>
        <View style={styles.welcomeIcon}>
          <Icon name="sparkles" size="lg" color={colors.onPrimary} />
        </View>
      </View>

      <View style={[styles.metricsGrid, isWide && styles.metricsGridWide]}>
        {METRICS.map((metric) => (
          <View
            key={metric.label}
            style={[
              styles.metricCard,
              isCompact && styles.metricCardCompact,
              isWide && styles.metricCardWide,
            ]}
          >
            <View style={styles.metricTop}>
              <View style={styles.metricIcon}>
                <Icon name={metric.icon} size="md" color={colors.secondaryText} />
              </View>
              <Icon name="arrow-up-right" size="sm" color={colors.success} />
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
            {ACTIVITY.map((item, index) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}: ${item.detail}`}
                onPress={() => comingSoon('Ver actividad')}
                style={({ pressed }) => [
                  styles.activityRow,
                  index < ACTIVITY.length - 1 && styles.divider,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.activityIcon}>
                  <Icon name={item.icon} size="md" color={colors.secondaryText} />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowDetail}>{item.detail}</Text>
                </View>
                <Text style={styles.rowTime}>{item.time}</Text>
              </Pressable>
            ))}
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
              onPress={() => comingSoon('Historial de CVs')}
            />
          </SectionHeading>
          <View style={styles.panel}>
            {RECENT_CVS.map((candidate, index) => (
              <View
                key={candidate.name}
                style={[styles.candidateRow, index < RECENT_CVS.length - 1 && styles.divider]}
              >
                <View style={styles.candidateAvatar}>
                  <Text style={styles.candidateInitials}>{candidate.initials}</Text>
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{candidate.name}</Text>
                  <Text style={styles.rowDetail}>{candidate.role} · {candidate.date}</Text>
                </View>
                {!isCompact && (
                  <Badge
                    label={candidate.status}
                    tone={candidate.status === 'Nuevo' ? 'info' : 'success'}
                  />
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir CV de ${candidate.name}`}
                  onPress={() => router.push('/review')}
                  hitSlop={8}
                  style={styles.chevron}
                >
                  <Icon name="chevron-right" size="sm" color={colors.mutedForeground} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.pipelineCard}>
        <View style={styles.pipelineCopy}>
          <Text style={styles.pipelineOverline}>TUS PROCESOS</Text>
          <Text style={styles.pipelineTitle}>12 vacantes activas</Text>
          <Text style={styles.pipelineText}>24 candidatos avanzaron a la siguiente etapa esta semana.</Text>
        </View>
        <Button
          label="Ir al pipeline"
          variant="outline"
          iconRight="arrow-right"
          onPress={() => router.push('/pipeline')}
        />
      </View>
    </RecruiterPage>
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
    metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
