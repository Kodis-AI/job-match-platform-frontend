import { Text, View } from 'react-native';

import { makeStyles } from '../theme';

/** Título numerado de paso (1, 2…) para el formulario. */
export function StepTitle({ step, title, detail }) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <View style={styles.badge} aria-hidden accessibilityElementsHidden>
        <Text style={styles.number}>{step}</Text>
      </View>
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>
          {`Paso ${step}: ${title}`}
        </Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: t.spacing.sm,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: t.radii.full,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.spacing.sm,
  },
  number: {
    ...t.typography.buttonSm,
    color: t.colors.onPrimary,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...t.typography.subtitle,
    color: t.colors.foreground,
  },
  detail: {
    ...t.typography.caption,
    color: t.colors.mutedForeground,
  },
}));
