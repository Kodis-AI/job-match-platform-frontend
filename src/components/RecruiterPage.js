import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';

import { Icon } from './index';
import { useAuth } from '../context/AuthContext';
import { usePortal } from '../context/PortalContext';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';
import { getInitials } from '../utils/format';

export function RecruiterPage({ eyebrow, title, description, action, children }) {
  const styles = useStyles();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isCompact, isWide } = useWorkspaceLayout();
  const isSettingsRoute = usePathname().endsWith('/settings');

  return (
    <View style={styles.screen}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <View style={[styles.topBarInner, isCompact && styles.topBarCompact]}>
            {/* En compacto marca y sesión comparten la primera fila y el selector baja a la segunda. */}
            <View style={[styles.brandRow, isCompact && styles.brandRowCompact]}>
              <View style={styles.brandGroup}>
                <View style={styles.brandMark}>
                  <Text style={styles.brandMarkText}>M</Text>
                </View>
                <View style={styles.brandCopy}>
                  <Text style={styles.brandName} numberOfLines={1}>
                    TalentMatch AI
                  </Text>
                  <Text style={styles.brandCaption} numberOfLines={1}>
                    ENTERPRISE TALENT INTELLIGENCE
                  </Text>
                </View>
              </View>
              {isCompact ? <SessionControls compact /> : null}
            </View>
            {!isSettingsRoute ? <WorkspaceModeSwitcher compact={isCompact} /> : null}
            {!isCompact ? (
              <View style={styles.profileGroup}>
                <SessionControls />
              </View>
            ) : null}
          </View>
        </View>

        <View style={[styles.content, isCompact && styles.contentCompact]}>
          <View style={[styles.headingRow, !isWide && styles.headingStacked]}>
            <View style={styles.headingCopy}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            {action ? <View style={styles.headingAction}>{action}</View> : null}
          </View>
          {children}
          <View style={styles.footer}>
            <View style={styles.footerBrand}>
              <Icon name="shield-check" size="sm" color={colors.success} />
              <Text style={styles.footerText}>Espacio de trabajo seguro</Text>
            </View>
            <Text style={styles.footerText}>TalentMatch AI · Portal de reclutamiento</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** Usuario con sesión + botón de cerrar sesión, o acceso para reclutadores sin sesión. */
function SessionControls({ compact }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { user, isAuthenticated, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (!isAuthenticated) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión como reclutador"
        onPress={() => router.push('/sign-in')}
        style={({ pressed }) => [styles.sessionButton, pressed && styles.pressed]}
      >
        <Icon name="log-in" size="sm" color={colors.secondaryText} />
        {!compact ? <Text style={styles.sessionButtonText}>Acceso reclutador</Text> : null}
      </Pressable>
    );
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.replace('/sign-in');
  };

  return (
    <View style={styles.session}>
      <View style={styles.avatar} accessibilityLabel={`Sesión iniciada como ${user.name}`} accessible>
        <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
      </View>
      {!compact ? (
        <View style={styles.sessionCopy}>
          <Text style={styles.sessionName} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.sessionEmail} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        accessibilityState={{ busy: signingOut, disabled: signingOut }}
        disabled={signingOut}
        onPress={handleSignOut}
        hitSlop={4}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        {signingOut ? (
          <ActivityIndicator size="small" color={colors.mutedForeground} />
        ) : (
          <Icon name="log-out" size="md" color={colors.mutedForeground} />
        )}
      </Pressable>
    </View>
  );
}

const MODE_OPTIONS = [
  { value: 'reclutador', label: 'Portal Reclutador' },
  { value: 'candidato', label: 'Portal Candidato' },
];

// Cada pantalla monta su propio selector, así que la pastilla recuerda dónde estaba en la
// pantalla anterior y se desliza desde ahí hacia la opción nueva.
let lastPortal = null;

export function WorkspaceModeSwitcher({ compact = false }) {
  const styles = useStyles();
  const { colors, motion } = useTheme();
  const { portal, setPortal } = usePortal();
  const { isAuthenticated } = useAuth();

  const targetIndex = portal === 'candidato' ? 1 : 0;
  // 0 = reclutador, 1 = candidato
  // Si se monta tras un cambio de portal, la pastilla arranca en la opción anterior.
  const [startsElsewhere] = useState(() => lastPortal !== null && lastPortal !== portal);
  const [progress] = useState(
    () => new Animated.Value(lastPortal ? (lastPortal === 'candidato' ? 1 : 0) : targetIndex),
  );
  const [layouts, setLayouts] = useState({});
  const measured = MODE_OPTIONS.every((o) => layouts[o.value]);

  useEffect(() => {
    lastPortal = portal;
    Animated.timing(progress, {
      toValue: targetIndex,
      duration: motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // anima ancho y color, que no admiten driver nativo
    }).start();
  }, [portal, targetIndex, progress, motion.slow]);

  const onOptionLayout = (value) => (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setLayouts((prev) => {
      const old = prev[value];
      if (old && old.x === x && old.y === y && old.width === width && old.height === height) {
        return prev;
      }
      return { ...prev, [value]: { x, y, width, height } };
    });
  };

  const pillStyle = measured
    ? {
        position: 'absolute',
        top: layouts.reclutador.y,
        height: layouts.reclutador.height,
        left: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.reclutador.x, layouts.candidato.x],
        }),
        width: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.reclutador.width, layouts.candidato.width],
        }),
      }
    : null;

  const selectView = (view) => {
    if (view === 'reclutador' && !isAuthenticated) {
      router.push({ pathname: '/sign-in', params: { redirect: '/portal' } });
      return;
    }
    if (view !== portal) {
      setPortal(view);
      router.replace(view === 'candidato' ? '/match' : '/portal');
    }
  };

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Cambiar espacio de trabajo"
      style={[styles.modeSwitcher, compact && styles.modeSwitcherCompact]}
    >
      {pillStyle ? (
        <Animated.View pointerEvents="none" style={[styles.modePill, pillStyle]} />
      ) : null}
      {MODE_OPTIONS.map((option, index) => {
        const selected = portal === option.value;
        // El texto se tiñe al mismo ritmo que se mueve la pastilla.
        const textColor = progress.interpolate({
          inputRange: [0, 1],
          outputRange:
            index === 0
              ? [colors.onPrimary, colors.mutedForeground]
              : [colors.mutedForeground, colors.onPrimary],
        });
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => selectView(option.value)}
            onLayout={onOptionLayout(option.value)}
            style={({ pressed }) => [
              styles.modeOption,
              // Hasta medir las opciones se pinta el fondo estático para no parpadear.
              !measured && !startsElsewhere && selected && styles.modeOptionSelected,
              compact && styles.modeOptionCompact,
              pressed && styles.pressed,
            ]}
          >
            <Animated.Text
              style={[
                styles.modeOptionText,
                selected && styles.modeOptionTextSelected,
                { color: textColor },
              ]}
            >
              {option.label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const { colors, radii, spacing, typography } = t;
  return {
    screen: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1 },
    topBar: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    topBarInner: {
      width: '100%',
      maxWidth: 1360,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    topBarCompact: { alignItems: 'center', flexWrap: 'wrap' },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
    brandRowCompact: { width: '100%', justifyContent: 'space-between' },
    brandGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexShrink: 1,
      minWidth: 0,
    },
    brandCopy: { flexShrink: 1, minWidth: 0 },
    modeSwitcher: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      padding: 4,
      borderRadius: radii.full,
      backgroundColor: colors.muted,
      flexShrink: 0,
    },
    modeSwitcherCompact: { width: '100%' },
    modeOption: {
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radii.full,
    },
    modeOptionCompact: { flex: 1, paddingHorizontal: spacing.xs },
    modeOptionSelected: { backgroundColor: colors.primary },
    modePill: { borderRadius: radii.full, backgroundColor: colors.primary },
    modeOptionText: { ...typography.caption, color: colors.mutedForeground },
    modeOptionTextSelected: { ...typography.captionStrong, color: colors.onPrimary },
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
    profileGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    session: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: radii.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...typography.captionStrong, color: colors.onPrimarySoft },
    sessionCopy: { maxWidth: 180, minWidth: 0 },
    sessionName: { ...typography.bodyStrong, color: colors.foreground },
    sessionEmail: { ...typography.caption, color: colors.mutedForeground },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    sessionButton: {
      minHeight: 44,
      minWidth: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.secondaryBorder,
      cursor: 'pointer',
    },
    sessionButtonText: { ...typography.buttonSm, color: colors.secondaryText },
    content: {
      width: '100%',
      maxWidth: 1360,
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      flexGrow: 1,
    },
    contentCompact: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
    headingRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    headingStacked: { alignItems: 'stretch', flexDirection: 'column' },
    headingCopy: { flex: 1, minWidth: 0 },
    eyebrow: {
      ...typography.label,
      color: colors.secondaryText,
      marginBottom: spacing.xs,
    },
    title: { ...typography.h1, color: colors.foreground, marginBottom: spacing.xs },
    description: { ...typography.bodySm, color: colors.mutedForeground, maxWidth: 700 },
    headingAction: { minWidth: 0 },
    footer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.xl,
      paddingTop: spacing.md,
    },
    footerBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    footerText: { ...typography.caption, color: colors.mutedForeground },
    pressed: { opacity: 0.78 },
  };
});
