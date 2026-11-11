import { Lucide } from '@react-native-vector-icons/lucide';

import { iconSize, useTheme } from '../theme';

/**
 * Icono vectorial (Lucide) con semántica accesible.
 * - Sin `label`: decorativo, oculto para lectores de pantalla.
 * - Con `label`: icono significativo con texto alternativo.
 */
export function Icon({ name, size = 'md', color, label, style }) {
  const { colors } = useTheme();
  const decorative = !label;
  return (
    <Lucide
      name={name}
      size={typeof size === 'number' ? size : iconSize[size]}
      color={color ?? colors.foreground}
      style={style}
      accessible={!decorative}
      accessibilityLabel={label}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      aria-hidden={decorative}
    />
  );
}
