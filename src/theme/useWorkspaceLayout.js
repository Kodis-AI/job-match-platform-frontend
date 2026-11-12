import { useWindowDimensions } from 'react-native';

import { useTheme } from './ThemeProvider';

const SIDEBAR_WIDTH = 360;
const DESKTOP_BREAKPOINT = 1200;

export function useWorkspaceLayout() {
  const { width } = useWindowDimensions();
  const { layout } = useTheme();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentWidth = Math.max(0, width - (isDesktop ? SIDEBAR_WIDTH : 0));

  return {
    contentWidth,
    isCompact: contentWidth < layout.breakpoints.compact,
    isWide: contentWidth >= layout.breakpoints.wide,
    isDesktop,
  };
}
