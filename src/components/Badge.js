import { Text, View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';

/** Etiqueta de estado no interactiva. tone: 'success' | 'info' | 'warning' | 'neutral' */
export function Badge({ label, tone = 'neutral', icon, style }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const palette = {
    success: { bg: colors.successSoft, fg: colors.success },
    info: { bg: colors.secondarySoft, fg: colors.secondaryText },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    neutral: { bg: colors.muted, fg: colors.mutedForeground },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      {icon ? <Icon name={icon} size={14} color={palette.fg} /> : null}
      <Text style={[styles.text, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.spacing.xxs,
    borderRadius: t.radii.full,
    paddingHorizontal: t.spacing.xs,
    paddingVertical: t.spacing.xxs,
  },
  text: {
    ...t.typography.captionStrong,
  },
}));
