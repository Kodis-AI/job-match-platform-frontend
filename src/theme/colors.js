// Tokens de color semánticos de MatchAI.
// Fuente: design-system/matchai/MASTER.md.
// Nunca uses hex directos en componentes: usa siempre estos tokens vía useTheme().

export const palettes = {
  light: {
    background: '#F8F7FF',
    foreground: '#17172A',
    card: '#FFFFFF',
    cardForeground: '#17172A',
    muted: '#EEF0FF',
    mutedForeground: '#5B6078',
    border: '#D9DDF0',
    borderSubtle: '#E7E9F7',
    inputBorder: '#9AA2BD',

    primary: '#4F46E5',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: '#DCD9FF',
    primarySoft: '#EEEDFF',
    onPrimarySoft: '#4338CA',

    secondary: '#0284C7',
    onSecondary: '#FFFFFF',
    secondarySoft: '#EAF6FC',
    secondaryBorder: '#B9E3F5',
    secondaryText: '#0369A1',

    accent: '#4F46E5',
    onAccent: '#FFFFFF',

    success: '#059669',
    successSoft: '#ECFDF5',
    successBorder: '#A7F3D0',

    warning: '#B45309',
    warningSoft: '#FFFBEB',

    destructive: '#DC2626',
    onDestructive: '#FFFFFF',
    destructiveSoft: '#FEF2F2',
    destructiveBorder: '#FECACA',
    destructiveText: '#B91C1C',

    ring: '#4F46E5',
    placeholder: '#7C849F',
  },
  dark: {
    background: '#11111F',
    foreground: '#F4F3FF',
    card: '#1B1B2E',
    cardForeground: '#F4F3FF',
    muted: '#292940',
    mutedForeground: '#A7A8C2',
    border: '#41415D',
    borderSubtle: '#303047',
    inputBorder: '#777894',

    primary: '#A5A0FF',
    onPrimary: '#17152F',
    onPrimaryMuted: '#39365E',
    primarySoft: '#302D52',
    onPrimarySoft: '#C7C4FF',

    secondary: '#38BDF8',
    onSecondary: '#082F49',
    secondarySoft: '#123047',
    secondaryBorder: '#075985',
    secondaryText: '#7DD3FC',

    accent: '#A5A0FF',
    onAccent: '#17152F',

    success: '#34D399',
    successSoft: '#12372F',
    successBorder: '#16634F',

    warning: '#FBBF24',
    warningSoft: '#453018',

    destructive: '#F87171',
    onDestructive: '#2A0909',
    destructiveSoft: '#3A1518',
    destructiveBorder: '#7F1D1D',
    destructiveText: '#FCA5A5',

    ring: '#A5A0FF',
    placeholder: '#A7A8C2',
  },
};
