import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Almacenamiento clave-valor del modo simulado: SecureStore en nativo, localStorage en web.
export async function readItem(key) {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function writeItem(key, value) {
  try {
    if (Platform.OS === 'web') {
      if (value == null) globalThis.localStorage?.removeItem(key);
      else globalThis.localStorage?.setItem(key, value);
      return;
    }
    if (value == null) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    // Si falla, la sesión simulada sigue funcionando en memoria.
  }
}
