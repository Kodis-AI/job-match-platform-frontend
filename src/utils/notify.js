import { Alert } from 'react-native';

// iOS/Android: Alert nativo. En web Metro usa notify.web.js (SweetAlert2).

export function setNotifyScheme() {}

/** Aviso simple. El tercer parámetro (icono) solo lo usa la versión web. */
export function notify(title, message) {
  Alert.alert(title, message);
}

/** Pregunta de confirmación. Devuelve una promesa con true si el usuario acepta. */
export function confirmAction(
  title,
  message,
  { confirmText = 'Confirmar', cancelText = 'Cancelar' } = {},
) {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export function comingSoon(feature) {
  notify(feature, 'Esta función estará disponible próximamente.');
}
