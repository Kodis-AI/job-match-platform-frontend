// Importa cada peso por su ruta para no empaquetar toda la familia.
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans/400Regular';
import { OpenSans_600SemiBold } from '@expo-google-fonts/open-sans/600SemiBold';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans/700Bold';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';

// Fuentes que se cargan en App.js con useFonts().
export const fontAssets = {
  Poppins_600SemiBold,
  Poppins_700Bold,
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
};

// En React Native cada peso es una familia distinta: no combines fontFamily con fontWeight.
export const fonts = {
  heading: 'Poppins_600SemiBold',
  headingBold: 'Poppins_700Bold',
  body: 'OpenSans_400Regular',
  bodySemibold: 'OpenSans_600SemiBold',
  bodyBold: 'OpenSans_700Bold',
};

// Escala tipográfica. Mínimo absoluto: 12px (caption). Cuerpo: 14–16px.
export const typography = {
  display: { fontFamily: fonts.headingBold, fontSize: 48, lineHeight: 56, letterSpacing: -1.5 },
  h1: { fontFamily: fonts.headingBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.5 },
  h1Compact: { fontFamily: fonts.headingBold, fontSize: 26, lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 28 },
  title: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 26 },
  subtitle: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.bodySemibold, fontSize: 14, lineHeight: 21 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  captionStrong: { fontFamily: fonts.bodySemibold, fontSize: 12, lineHeight: 18 },
  button: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22 },
  buttonSm: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 20 },
};
