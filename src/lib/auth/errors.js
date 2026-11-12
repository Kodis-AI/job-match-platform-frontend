// Traduce los códigos de error de Better Auth a mensajes accionables en español.
const MESSAGES = {
  INVALID_EMAIL_OR_PASSWORD:
    'El correo o la contraseña no son correctos. Revísalos e inténtalo de nuevo.',
  INVALID_EMAIL: 'El correo electrónico no es válido.',
  INVALID_PASSWORD: 'La contraseña no es correcta.',
  USER_NOT_FOUND: 'No encontramos una cuenta con ese correo. Puedes crear una nueva.',
  USER_ALREADY_EXISTS: 'Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
  PASSWORD_TOO_LONG: 'La contraseña es demasiado larga.',
  EMAIL_NOT_VERIFIED:
    'Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.',
  FAILED_TO_CREATE_USER: 'No pudimos crear la cuenta. Inténtalo de nuevo en unos minutos.',
};

export function getAuthErrorMessage(error) {
  if (!error) return null;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (error.status === 429) {
    return 'Demasiados intentos. Espera un momento antes de volver a intentarlo.';
  }
  if (!error.status) {
    return 'No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
  }
  return 'Algo salió mal. Inténtalo de nuevo en unos segundos.';
}
