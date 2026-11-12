const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_RULES = [
  { key: 'length', label: 'Al menos 8 caracteres', test: (value) => value.length >= 8 },
  { key: 'letter', label: 'Al menos una letra', test: (value) => /[A-Za-zÀ-ÿ]/.test(value) },
  { key: 'number', label: 'Al menos un número', test: (value) => /\d/.test(value) },
];

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return 'Introduce tu correo electrónico.';
  if (!EMAIL_PATTERN.test(email)) return 'Introduce un correo válido, por ejemplo nombre@empresa.com.';
  return null;
}

/** strict=false solo comprueba que no esté vacía (inicio de sesión). */
export function validatePassword(value, { strict = true } = {}) {
  if (!value) return 'Introduce tu contraseña.';
  if (!strict) return null;
  const failed = PASSWORD_RULES.find((rule) => !rule.test(value));
  return failed ? `La contraseña necesita: ${failed.label.toLowerCase()}.` : null;
}

export function validateName(value) {
  const name = value.trim();
  if (!name) return 'Introduce tu nombre.';
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  return null;
}
