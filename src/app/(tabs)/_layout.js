import { useState } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { PortalContext } from '../../context/PortalContext';
import { useTheme } from '../../theme';
import { useWorkspaceLayout } from '../../theme/useWorkspaceLayout';

const RECRUITER_ROUTES = ['/portal', '/pipeline', '/review'];

// La barra inferior de react-navigation mide 49px fijos y su botón ya trae 5px de padding.
// Icono (28px) + etiqueta Open Sans 12/16 no caben y la etiqueta se encoge y se recorta,
// por eso se fija una altura propia (sin añadir padding extra al item).
const BOTTOM_TAB_BAR_HEIGHT = 60;
const BOTTOM_TAB_ICON_SIZE = 22;

// Títulos completos para la barra lateral de escritorio y cortos para la barra inferior.
const TAB_META = {
  match: { icon: 'sparkles', title: 'Panel candidato', short: 'Candidato' },
  portal: { icon: 'layout-dashboard', title: 'Panel Reclutador', short: 'Panel' },
  pipeline: { icon: 'users-round', title: 'Ranking & Pipeline', short: 'Pipeline' },
  review: { icon: 'scan-search', title: 'Análisis profundo Match', short: 'Análisis' },
  settings: { icon: 'settings-2', title: 'Ajustes y preferencias', short: 'Ajustes' },
};

export default function TabLayout() {
  const { colors, fonts } = useTheme();
  const { isDesktop } = useWorkspaceLayout();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [portal, setPortal] = useState(() =>
    pathname.endsWith('/match') || !isAuthenticated ? 'candidato' : 'reclutador',
  );

  const [syncedPath, setSyncedPath] = useState(pathname);

  // Mantiene el portal activo sincronizado con la ruta (p. ej. al volver del login).
  if (syncedPath !== pathname) {
    setSyncedPath(pathname);
    if (pathname.endsWith('/match')) setPortal('candidato');
    else if (RECRUITER_ROUTES.some((route) => pathname.endsWith(route))) setPortal('reclutador');
  }
  const value = { portal, setPortal };

  return (
    <PortalContext.Provider value={value}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          // Transición suave al cambiar de pestaña / portal (por defecto es 'none' = corte brusco).
          animation: 'fade',
          // Fondo propio: el predeterminado de react-navigation es blanco y se ve como un
          // destello mientras la pantalla nueva monta.
          sceneStyle: { backgroundColor: colors.background },
          transitionSpec: { animation: 'timing', config: { duration: 220 } },
          tabBarPosition: isDesktop ? 'left' : 'bottom',
          tabBarVariant: 'uikit',
          tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.foreground,
          tabBarActiveBackgroundColor: colors.primarySoft,
          tabBarInactiveBackgroundColor: 'transparent',
          tabBarStyle: {
            backgroundColor: colors.card,
            borderColor: colors.border,
            ...(isDesktop
              ? {
                  width: 360,
                  borderRightWidth: 1,
                }
              : {
                  borderTopColor: colors.border,
                  // La altura personalizada sustituye a la por defecto, así que incluye el área segura.
                  height: BOTTOM_TAB_BAR_HEIGHT + insets.bottom,
                  paddingBottom: insets.bottom,
                }),
          },
          tabBarLabelStyle: {
            fontFamily: fonts.bodySemibold,
            fontSize: 12,
            ...(isDesktop ? null : { lineHeight: 16, marginTop: 2, flexShrink: 0 }),
          },
          tabBarLabel: isDesktop ? TAB_META[route.name].title : TAB_META[route.name].short,
          tabBarAccessibilityLabel: TAB_META[route.name].title,
          tabBarIcon: ({ color, size }) => (
            <Icon
              name={TAB_META[route.name].icon}
              size={isDesktop ? size : BOTTOM_TAB_ICON_SIZE}
              color={color}
            />
          ),
        })}
      >
        <Tabs.Screen
          name="match"
          listeners={{ tabPress: () => setPortal('candidato') }}
          options={{
            title: TAB_META.match.title,
            href: portal === 'candidato' ? undefined : null,
          }}
        />
        <Tabs.Protected guard={isAuthenticated} redirectTo="/sign-in">
          <Tabs.Screen
            name="portal"
            listeners={{ tabPress: () => setPortal('reclutador') }}
            options={{
              title: TAB_META.portal.title,
              href: portal === 'reclutador' ? undefined : null,
            }}
          />
          <Tabs.Screen
            name="pipeline"
            listeners={{ tabPress: () => setPortal('reclutador') }}
            options={{
              title: TAB_META.pipeline.title,
              href: portal === 'reclutador' ? undefined : null,
            }}
          />
          <Tabs.Screen
            name="review"
            listeners={{ tabPress: () => setPortal('reclutador') }}
            options={{
              title: TAB_META.review.title,
              href: portal === 'reclutador' ? undefined : null,
            }}
          />
        </Tabs.Protected>
        <Tabs.Screen name="settings" options={{ title: TAB_META.settings.title }} />
      </Tabs>
    </PortalContext.Provider>
  );
}
