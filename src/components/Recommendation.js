import { Text, View } from 'react-native';

import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';

/** Tarjeta de recomendación con icono, título y contenido adicional. */
export function Recommendation({ icon, title, description, children }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.iconBox}>
          <Icon name={icon} size="md" color={colors.onPrimarySoft} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      </View>
      <Text style={styles.body}>{description}</Text>
      {children}
    </View>
  );
}

/** Consejo destacado dentro de una recomendación. */
export function Suggestion({ children }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.suggestion}>
      <Icon name="lightbulb" size="sm" color={colors.secondaryText} style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{children}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radii.lg,
    padding: t.spacing.lg,
    ...t.shadows.sm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: t.spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: t.radii.sm,
    backgroundColor: t.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.spacing.sm,
  },
  title: {
    ...t.typography.title,
    color: t.colors.foreground,
    flex: 1,
  },
  body: {
    ...t.typography.bodySm,
    color: t.colors.mutedForeground,
    marginBottom: t.spacing.md,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: t.colors.secondarySoft,
    borderRadius: t.radii.sm,
    padding: t.spacing.sm,
  },
  suggestionIcon: {
    marginRight: t.spacing.xs,
    marginTop: 2,
  },
  suggestionText: {
    ...t.typography.bodyStrong,
    color: t.colors.secondaryText,
    flex: 1,
  },
}));
