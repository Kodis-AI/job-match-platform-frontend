import { Text, View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';

/**
 * Aviso de formulario anunciado a lectores de pantalla.
 * tone: 'error' (fallo de envío) | 'info' (contexto, p. ej. modo demo)
 */
export function FormAlert({ tone = 'error', title, message, children, style }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isError = tone === 'error';
  const palette = isError
    ? { bg: colors.destructiveSoft, border: colors.destructiveBorder, fg: colors.destructiveText }
    : { bg: colors.secondarySoft, border: colors.secondaryBorder, fg: colors.secondaryText };

  return (
    <View
      accessibilityRole={isError ? 'alert' : 'summary'}
      accessibilityLiveRegion={isError ? 'assertive' : 'polite'}
      style={[styles.box, { backgroundColor: palette.bg, borderColor: palette.border }, style]}
    >
      <Icon name={isError ? 'circle-alert' : 'info'} size="md" color={palette.fg} />
      <View style={styles.copy}>
        {title ? <Text style={[styles.title, { color: palette.fg }]}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
    borderWidth: 1,
    borderRadius: t.radii.md,
    padding: t.spacing.md,
  },
  copy: { flex: 1, minWidth: 0, gap: t.spacing.xxs },
  title: { ...t.typography.bodyStrong },
  message: { ...t.typography.bodySm, color: t.colors.foreground },
}));
