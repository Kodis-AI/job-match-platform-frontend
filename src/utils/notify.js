import { Alert, Platform } from 'react-native';

/** Aviso simple multiplataforma (Alert no está implementado en react-native-web). */
export function notify(title, message) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function comingSoon(feature) {
  notify(feature, 'Esta función estará disponible próximamente.');
}
