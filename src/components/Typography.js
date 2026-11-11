import { Text, View } from 'react-native';

import { makeStyles } from '../theme';

/** Sobretítulo en mayúsculas para secciones. */
export function Overline({ children, style }) {
  const styles = useStyles();
  return <Text style={[styles.overline, style]}>{children}</Text>;
}

/** Encabezado de sección con sobretítulo opcional y descripción. */
export function SectionHeading({ overline, title, description, children }) {
  const styles = useStyles();
  return (
    <View style={styles.heading}>
      <View style={styles.headingCopy}>
        {overline ? <Overline>{overline}</Overline> : null}
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  overline: {
    ...t.typography.label,
    color: t.colors.secondaryText,
    marginBottom: t.spacing.xxs,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
  },
  headingCopy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 280,
  },
  title: {
    ...t.typography.h3,
    color: t.colors.foreground,
  },
  description: {
    ...t.typography.bodySm,
    color: t.colors.mutedForeground,
    marginTop: t.spacing.xxs,
  },
}));
