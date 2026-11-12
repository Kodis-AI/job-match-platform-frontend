import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';

import { Badge, Icon } from './index';
import { useAuth } from '../context/AuthContext';
import { usePortal } from '../context/PortalContext';
import { makeStyles, useTheme } from '../theme';
import { useWorkspaceLayout } from '../theme/useWorkspaceLayout';

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
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <View style={[styles.topBarInner, isCompact && styles.topBarCompact]}>
            <View style={styles.brandGroup}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>M</Text>
              </View>
              <View>
                <Text style={styles.brandName}>TalentMatch AI</Text>
                <Text style={styles.brandCaption}>ENTERPRISE TALENT INTELLIGENCE</Text>
              </View>
            </View>
            {/* En compacto la sesión queda junto a la marca y el selector baja a su propia fila. */}
            {!isSettingsRoute && !isCompact ? <WorkspaceModeSwitcher /> : null}
            <View style={styles.profileGroup}>
              {!isSettingsRoute && isWide && (
                <Badge label="NLP Pipeline · Demo" tone="success" icon="circle-check" />
              )}
              <SessionControls compact={isCompact} />
            </View>
            {!isSettingsRoute && isCompact ? <WorkspaceModeSwitcher compact /> : null}
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

  const initials = (user.name || user.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.replace('/sign-in');
  };

  return (
    <View style={styles.session}>
      <View style={styles.avatar} accessibilityLabel={`Sesión iniciada como ${user.name}`} accessible>
        <Text style={styles.avatarText}>{initials}</Text>
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

export function WorkspaceModeSwitcher({ compact = false }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { portal, setPortal } = usePortal();
  const { isAuthenticated } = useAuth();

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
      {[
        { value: 'reclutador', label: 'Portal Reclutador' },
        { value: 'candidato', label: 'Portal Candidato' },
      ].map((option) => {
        const selected = portal === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => selectView(option.value)}
            style={({ pressed }) => [
              styles.modeOption,
              selected && styles.modeOptionSelected,
              compact && styles.modeOptionCompact,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.modeOptionText,
                selected && styles.modeOptionTextSelected,
                { color: selected ? colors.onPrimary : colors.mutedForeground },
              ]}
            >
              {option.label}
            </Text>
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
    brandGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
