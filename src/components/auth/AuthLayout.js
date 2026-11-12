import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, useTheme } from '../../theme';
import { Icon } from '../Icon';

const BENEFITS = [
  {
    icon: 'scan-search',
    title: 'Análisis semántico de CVs',
    description: 'El modelo NLP compara cada perfil con los requisitos reales de la vacante.',
  },
  {
    icon: 'sparkles',
    title: 'Ranking explicable',
    description: 'Cada puntuación muestra por qué un candidato encaja y qué le falta.',
  },
  {
    icon: 'shield-check',
    title: 'Evaluación sin sesgos',
    description: 'Anonimiza datos sensibles y calibra los pesos de tu proceso.',
  },
];

/**
 * Plantilla de las pantallas de autenticación.
 * ≥ 900 px: panel de marca + formulario en dos columnas. Menor: una columna centrada.
 */
export function AuthLayout({ overline, title, description, children, footer }) {
  const styles = useStyles();
  const { colors, isDark, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSplit = width >= layout.breakpoints.wide;
  const isCompact = width < layout.breakpoints.compact;

  return (
    <View style={styles.screen}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scroll, isSplit && styles.scrollSplit]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isSplit ? (
            <View
              style={[
                styles.brandPanel,
                { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 48 },
              ]}
            >
              <Brand />
              <View style={styles.brandBody}>
                <Text style={styles.brandHeadline}>
                  Encuentra el talento ideal con IA explicable
                </Text>
                <Text style={styles.brandLead}>
                  Centraliza vacantes, analiza CVs y prioriza candidatos con criterios
                  transparentes.
                </Text>
                <View style={styles.benefits}>
                  {BENEFITS.map((benefit) => (
                    <View key={benefit.icon} style={styles.benefit}>
                      <View style={styles.benefitIcon}>
                        <Icon name={benefit.icon} size="md" color={colors.primary} />
                      </View>
                      <View style={styles.benefitCopy}>
                        <Text style={styles.benefitTitle}>{benefit.title}</Text>
                        <Text style={styles.benefitText}>{benefit.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              <SecureNote />
            </View>
          ) : null}

          <View
            style={[
              styles.formColumn,
              isCompact && styles.formColumnCompact,
              {
                paddingTop: insets.top + (isCompact ? 24 : 48),
                paddingBottom: insets.bottom + (isCompact ? 24 : 48),
              },
            ]}
          >
            <View style={styles.formInner}>
              {!isSplit ? <Brand style={styles.brandCompact} /> : null}
              <View style={[styles.card, isCompact && styles.cardCompact]}>
                <View style={styles.header}>
                  {overline ? <Text style={styles.overline}>{overline}</Text> : null}
                  <Text accessibilityRole="header" style={styles.title}>
                    {title}
                  </Text>
                  {description ? <Text style={styles.description}>{description}</Text> : null}
                </View>
                {children}
              </View>
              {footer ? <View style={styles.footer}>{footer}</View> : null}
              {!isSplit ? <SecureNote style={styles.secureCompact} /> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Brand({ style }) {
  const styles = useStyles();
  return (
    <View style={[styles.brand, style]}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>M</Text>
      </View>
      <View>
        <Text style={styles.brandName}>TalentMatch AI</Text>
        <Text style={styles.brandCaption}>ENTERPRISE TALENT INTELLIGENCE</Text>
      </View>
    </View>
  );
}

function SecureNote({ style }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.secure, style]}>
      <Icon name="shield-check" size="sm" color={colors.success} />
      <Text style={styles.secureText}>Conexión cifrada · Espacio de trabajo seguro</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, radii, spacing, typography } = t;
  return {
    screen: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { flexGrow: 1 },
    scrollSplit: { flexDirection: 'row' },

    brandPanel: {
      flex: 1,
      maxWidth: 640,
      backgroundColor: colors.primarySoft,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingHorizontal: spacing.xxl,
      justifyContent: 'space-between',
      gap: spacing.xl,
    },
    brandBody: { gap: spacing.md, maxWidth: 480 },
    brandHeadline: { ...typography.h1, color: colors.foreground },
    brandLead: { ...typography.body, color: colors.mutedForeground },
    benefits: { gap: spacing.lg, marginTop: spacing.md },
    benefit: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
    benefitIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    benefitCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
    benefitTitle: { ...typography.subtitle, color: colors.foreground },
    benefitText: { ...typography.bodySm, color: colors.mutedForeground },

    brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    brandCompact: { alignSelf: 'center', marginBottom: spacing.lg },
    brandMark: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandMarkText: { ...typography.title, color: colors.onPrimary },
    brandName: { ...typography.subtitle, color: colors.foreground },
    brandCaption: {
      ...typography.label,
      color: colors.mutedForeground,
      fontSize: 9,
      letterSpacing: 0.6,
    },

    formColumn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    formColumnCompact: { paddingHorizontal: spacing.md, justifyContent: 'flex-start' },
    formInner: { width: '100%', maxWidth: 460 },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      padding: spacing.xl,
      gap: spacing.lg,
      ...t.shadows.md,
    },
    cardCompact: { padding: spacing.lg },
    header: { gap: spacing.xs },
    overline: { ...typography.label, color: colors.secondaryText },
    title: { ...typography.h1Compact, color: colors.foreground },
    description: { ...typography.bodySm, color: colors.mutedForeground },
    footer: { marginTop: spacing.lg, alignItems: 'center' },

    secure: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    secureCompact: { justifyContent: 'center', marginTop: spacing.lg },
    secureText: { ...typography.caption, color: colors.mutedForeground },
  };
});
