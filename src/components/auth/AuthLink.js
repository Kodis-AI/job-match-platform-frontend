import { Pressable, Text } from 'react-native';

import { makeStyles } from '../../theme';

/** Enlace de texto con área táctil ≥ 44px. */
export function AuthLink({ label, onPress, accessibilityHint, style }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.link, pressed && styles.pressed, style]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  link: {
    minHeight: t.touch.min,
    justifyContent: 'center',
    paddingHorizontal: t.spacing.xxs,
    borderRadius: t.radii.sm,
    cursor: 'pointer',
  },
  text: {
    ...t.typography.bodyStrong,
    color: t.colors.secondaryText,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.82 },
}));
