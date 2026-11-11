// Tokens de color semánticos de MatchAI.
// Fuente: design-system/matchai/MASTER.md (paleta recomendada por ui-ux-pro-max).
// Nunca uses hex directos en componentes: usa siempre estos tokens vía useTheme().

export const palettes = {
  light: {
    background: '#F8FAFC',
    foreground: '#0F172A',
    card: '#FFFFFF',
    cardForeground: '#0F172A',
    muted: '#E9EEF5',
    mutedForeground: '#475569',
    border: '#CBD5E1',
    borderSubtle: '#E2E8F0',
    inputBorder: '#64748B',

    primary: '#1E3A5F',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: '#C7D6E8',
    primarySoft: '#E8EEF6',
    onPrimarySoft: '#1E3A5F',

    secondary: '#2563EB',
    onSecondary: '#FFFFFF',
    secondarySoft: '#EFF6FF',
    secondaryBorder: '#BFDBFE',
    secondaryText: '#1D4ED8',

    accent: '#16A34A',
    onAccent: '#000000',

    success: '#15803D',
    successSoft: '#F0FDF4',
    successBorder: '#BBF7D0',

    warning: '#B45309',
    warningSoft: '#FFFBEB',

    destructive: '#DC2626',
    onDestructive: '#FFFFFF',

    ring: '#1E3A5F',
    placeholder: '#64748B',
  },
  dark: {
    background: '#0B1220',
    foreground: '#F1F5F9',
    card: '#111A2E',
    cardForeground: '#F1F5F9',
    muted: '#1E293B',
    mutedForeground: '#94A3B8',
    border: '#334155',
    borderSubtle: '#1E293B',
    inputBorder: '#64748B',

    // En oscuro el azul marino no contrasta: se aclara y el texto encima pasa a oscuro.
    primary: '#60A5FA',
    onPrimary: '#0B1220',
    onPrimaryMuted: '#1E293B',
    primarySoft: '#172554',
    onPrimarySoft: '#BFDBFE',

    secondary: '#93C5FD',
    onSecondary: '#0B1220',
    secondarySoft: '#172554',
    secondaryBorder: '#1E40AF',
    secondaryText: '#93C5FD',

    accent: '#22C55E',
    onAccent: '#000000',

    success: '#4ADE80',
    successSoft: '#052E16',
    successBorder: '#14532D',

    warning: '#FBBF24',
    warningSoft: '#451A03',

    destructive: '#F87171',
    onDestructive: '#000000',

    ring: '#60A5FA',
    placeholder: '#94A3B8',
  },
};
