import Swal from 'sweetalert2';

import { palettes } from '../theme/colors';
import { fonts } from '../theme/typography';

// Versión web: SweetAlert2 (requiere DOM). En iOS/Android se usa notify.js con Alert nativo.

let scheme = 'light';

// Tipografía de la app (cargada con expo-font) y esquinas redondeadas, una sola vez.
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById('notify-swal-styles')) return;
  const style = document.createElement('style');
  style.id = 'notify-swal-styles';
  style.textContent = `
    .swal2-popup { font-family: ${fonts.body}, sans-serif; border-radius: 16px; }
    .swal2-title { font-family: ${fonts.heading}, sans-serif; font-size: 22px; }
    .swal2-html-container { font-size: 15px; line-height: 1.5; }
    .swal2-styled { font-family: ${fonts.bodySemibold}, sans-serif; border-radius: 10px !important; }
  `;
  document.head.appendChild(style);
}

/** Lo llama ThemeProvider para que las alertas sigan el modo claro/oscuro de la app. */
export function setNotifyScheme(next) {
  scheme = next;
}

const ICON_COLORS = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'secondary',
};

function themed() {
  const c = palettes[scheme];
  injectStyles();
  return {
    // Sin esto SweetAlert2 pone height:auto en html/body y la app (que usa 100% de alto)
    // se colapsa mientras el cuadro está abierto.
    heightAuto: false,
    scrollbarPadding: false,
    background: c.card,
    color: c.foreground,
    confirmButtonColor: c.primary,
    cancelButtonColor: c.mutedForeground,
  };
}

function iconColor(icon) {
  const c = palettes[scheme];
  return c[ICON_COLORS[icon]] ?? c.secondary;
}

/** Aviso simple. `icon`: 'success' | 'error' | 'warning' | 'info'. */
export function notify(title, message, icon = 'info') {
  return Swal.fire({
    ...themed(),
    iconColor: iconColor(icon),
    icon,
    title,
    text: message,
    confirmButtonText: 'Entendido',
  });
}

/** Pregunta de confirmación. Devuelve una promesa con true si el usuario acepta. */
export async function confirmAction(
  title,
  message,
  { confirmText = 'Confirmar', cancelText = 'Cancelar', icon = 'warning' } = {},
) {
  const result = await Swal.fire({
    ...themed(),
    iconColor: iconColor(icon),
    icon,
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function comingSoon(feature) {
  return notify(feature, 'Esta función estará disponible próximamente.', 'info');
}
