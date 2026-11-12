import { Text, View } from 'react-native';

import { makeStyles } from '../theme';

/** Sobretítulo en mayúsculas para secciones. */
export function Overline({ children, style }) {
  const styles = useStyles();
  return <Text style={[styles.overline, style]}>{children}</Text>;
}

/** Encabezado de sección con sobretítulo opcional y descripción. */
export function SectionHeading({ overline, title, description, children, stacked = false }) {
  const styles = useStyles();
  return (
    <View style={[styles.heading, stacked && styles.headingStacked]}>
      <View style={[styles.headingCopy, stacked && styles.headingCopyStacked]}>
        {overline ? <Overline>{overline}</Overline> : null}
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {children ? (
        <View style={[styles.headingActions, stacked && styles.headingActionsStacked]}>
          {children}
        </View>
      ) : null}
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
  headingStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headingCopy: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 280,
    minWidth: 0,
  },
  headingCopyStacked: {
    flexBasis: 'auto',
    alignSelf: 'stretch',
  },
  headingActions: {
    flexShrink: 0,
  },
  headingActionsStacked: {
    width: '100%',
    alignSelf: 'stretch',
  },
  title: {
    ...t.typography.h3,
    color: t.colors.foreground,
    flexShrink: 1,
  },
  description: {
    ...t.typography.bodySm,
    color: t.colors.mutedForeground,
    marginTop: t.spacing.xxs,
  },
}));
