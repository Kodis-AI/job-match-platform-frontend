import { useState } from 'react';
import { Tabs, usePathname } from 'expo-router';

import { Icon } from '../../components';
import { PortalContext } from '../../context/PortalContext';
import { useTheme } from '../../theme';
import { useWorkspaceLayout } from '../../theme/useWorkspaceLayout';

export default function TabLayout() {
  const { colors, fonts } = useTheme();
  const { isDesktop } = useWorkspaceLayout();
  const pathname = usePathname();
  const [portal, setPortal] = useState(() =>
    pathname.endsWith('/match') ? 'candidato' : 'reclutador',
  );
  const value = { portal, setPortal };

  return (
    <PortalContext.Provider value={value}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
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
                }),
          },
          tabBarLabelStyle: { fontFamily: fonts.bodySemibold, fontSize: 12 },
          tabBarIcon: ({ color, size }) => {
            const names = {
              portal: 'layout-dashboard',
              pipeline: 'users-round',
              review: 'scan-search',
              settings: 'settings-2',
              match: 'sparkles',
            };
            return <Icon name={names[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen
          name="match"
          listeners={{ tabPress: () => setPortal('candidato') }}
          options={{
            title: 'Panel candidato',
            href: portal === 'candidato' ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="portal"
          listeners={{ tabPress: () => setPortal('reclutador') }}
          options={{
            title: 'Panel Reclutador',
            href: portal === 'reclutador' ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="pipeline"
          listeners={{ tabPress: () => setPortal('reclutador') }}
          options={{
            title: 'Ranking & Pipeline',
            href: portal === 'reclutador' ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="review"
          listeners={{ tabPress: () => setPortal('reclutador') }}
          options={{
            title: 'Análisis profundo Match',
            href: portal === 'reclutador' ? undefined : null,
          }}
        />
        <Tabs.Screen name="settings" options={{ title: 'Ajustes y preferencias' }} />
      </Tabs>
    </PortalContext.Provider>
  );
}
