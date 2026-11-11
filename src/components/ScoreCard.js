import { Text, View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';

/** Tarjeta de métrica con porcentaje y barra de progreso accesible. */
export function ScoreCard({ title, score, detail, icon, stacked }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${title}: ${score} por ciento. ${detail}`}
      style={[styles.card, stacked && styles.cardStacked]}
    >
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Icon name={icon} size="md" color={colors.onPrimarySoft} />
        </View>
        <Text style={styles.value}>{score}%</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: score }}
      >
        <View style={[styles.fill, { width: `${score}%` }]} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    flexBasis: '44%',
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radii.md,
    padding: t.spacing.md,
    ...t.shadows.sm,
  },
  cardStacked: {
    width: '100%',
    flexBasis: 'auto',
    flexGrow: 0,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: t.spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: t.radii.sm,
    backgroundColor: t.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...t.typography.h2,
    color: t.colors.foreground,
  },
  title: {
    ...t.typography.subtitle,
    color: t.colors.foreground,
    marginBottom: t.spacing.xxs,
  },
  detail: {
    ...t.typography.bodySm,
    color: t.colors.mutedForeground,
    flexGrow: 1,
  },
  track: {
    height: 6,
    backgroundColor: t.colors.muted,
    borderRadius: t.radii.full,
    overflow: 'hidden',
    marginTop: t.spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: t.colors.secondary,
    borderRadius: t.radii.full,
  },
}));
