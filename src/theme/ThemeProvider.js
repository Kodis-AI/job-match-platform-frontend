import { createContext, useContext, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { setNotifyScheme } from '../utils/notify';
import { palettes } from './colors';
import { iconSize, layout, motion, radii, spacing, touch } from './spacing';
import { fonts, typography } from './typography';

function buildTheme(scheme) {
  const colors = palettes[scheme];
  return {
    scheme,
    isDark: scheme === 'dark',
    colors,
    fonts,
    typography,
    spacing,
    radii,
    iconSize,
    touch,
    layout,
    motion,
    shadows: {
      none: {},
      sm:
        scheme === 'dark'
          ? {}
          : { boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.06)' },
      md:
        scheme === 'dark'
          ? {}
          : { boxShadow: '0px 4px 12px rgba(30, 58, 95, 0.12)' },
    },
  };
}

const ThemeContext = createContext(buildTheme('light'));

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [appearance, setAppearance] = useState('system');
  const scheme = appearance === 'system' ? systemScheme : appearance;
  // Las alertas (SweetAlert2 en web) viven fuera del árbol de React: se les avisa del modo.
  setNotifyScheme(scheme);
  const theme = useMemo(
    () => ({ ...buildTheme(scheme), appearance, setAppearance }),
    [scheme, appearance],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Crea un hook de estilos dependiente del tema.
 * const useStyles = makeStyles((t) => ({ box: { backgroundColor: t.colors.card } }));
 */
export function makeStyles(factory) {
  return function useStyles() {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
