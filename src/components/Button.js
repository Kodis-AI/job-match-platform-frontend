import { Pressable, Text, View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';

/**
 * Botón con variantes del sistema de diseño.
 * variant: 'accent' (CTA principal) | 'primary' | 'outline' | 'soft' | 'ghost'
 * size: 'md' (44px) | 'lg' (52px)
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  fullWidth = false,
  style,
}) {
  const styles = useStyles();
  const { colors } = useTheme();

  const tone = {
    accent: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    outline: { bg: colors.card, fg: colors.secondaryText, border: colors.secondaryBorder },
    soft: { bg: colors.secondarySoft, fg: colors.secondaryText, border: colors.secondarySoft },
    ghost: { bg: 'transparent', fg: colors.mutedForeground, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.large : styles.medium,
        { backgroundColor: tone.bg, borderColor: tone.border },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {iconLeft ? <Icon name={iconLeft} size={size === 'lg' ? 'md' : 'sm'} color={tone.fg} /> : null}
        <Text
          style={[size === 'lg' ? styles.labelLarge : styles.label, { color: tone.fg }]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {iconRight ? (
          <Icon name={iconRight} size={size === 'lg' ? 'md' : 'sm'} color={tone.fg} />
        ) : null}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    borderWidth: 1,
    borderRadius: t.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  medium: {
    minHeight: t.touch.min,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.xs,
  },
  large: {
    minHeight: t.touch.large,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.xs,
  },
  label: {
    ...t.typography.buttonSm,
    textAlign: 'center',
  },
  labelLarge: {
    ...t.typography.button,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.5,
  },
}));
