import { Pressable, Text } from 'react-native';

import { makeStyles } from '../theme';

/** Chip seleccionable con área táctil de 44px y estado `selected` accesible. */
export function Chip({ label, selected = false, onPress }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  chip: {
    minHeight: t.touch.min,
    justifyContent: 'center',
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radii.full,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.card,
    cursor: 'pointer',
  },
  chipSelected: {
    backgroundColor: t.colors.secondarySoft,
    borderColor: t.colors.secondary,
  },
  text: {
    ...t.typography.captionStrong,
    fontSize: 13,
    color: t.colors.mutedForeground,
  },
  textSelected: {
    color: t.colors.secondaryText,
  },
  pressed: {
    opacity: 0.82,
  },
}));
