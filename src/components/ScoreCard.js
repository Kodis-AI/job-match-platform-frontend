import { Text, View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';

/** Tarjeta de métrica con porcentaje y barra de progreso accesible. */
export function ScoreCard({ title, score, detail, icon, tone = 'primary' }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const toneColor = {
    primary: colors.primary,
    success: colors.success,
    accent: colors.accent,
    warning: colors.warning,
  }[tone];

  return (
    <View
      accessible
      accessibilityLabel={`${title}: ${score} por ciento. ${detail}`}
      style={styles.card}
    >
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Icon name={icon} size="sm" color={toneColor} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.value, { color: toneColor }]}>{score}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${score}%`, backgroundColor: toneColor }]} />
      </View>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    justifyContent: 'center',
    minWidth: 0,
    paddingVertical: t.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSubtle,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
  },
  iconBox: {
    width: 18,
    alignItems: 'center',
  },
  value: {
    ...t.typography.captionStrong,
    marginLeft: 'auto',
  },
  title: {
    ...t.typography.captionStrong,
    color: t.colors.foreground,
    flex: 1,
    minWidth: 0,
  },
  detail: {
    ...t.typography.caption,
    color: t.colors.mutedForeground,
    marginTop: t.spacing.xxs,
  },
  progressTrack: {
    height: 5,
    backgroundColor: t.colors.muted,
    borderRadius: t.radii.full,
    overflow: 'hidden',
    marginTop: t.spacing.xxs,
  },
  progressFill: {
    height: '100%',
    borderRadius: t.radii.full,
  },
}));
