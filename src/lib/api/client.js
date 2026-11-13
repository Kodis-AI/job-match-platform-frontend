import { authClient } from '../auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env.');
}

// Keeps a token from expiring while the request is in flight.
const TOKEN_EXPIRY_MARGIN_MS = 30_000;

/** API failure. `message` is already user-facing Spanish copy, safe to render. */
export class ApiError extends Error {
  constructor(status, message, options) {
    super(message, options);
    this.name = 'ApiError';
    this.status = status;
  }
}

let cachedToken = null;

/** Drop the token when the user changes: the JWT carries the previous identity. */
export function clearApiToken() {
  cachedToken = null;
}

// The API verifies a short-lived JWT that Better Auth signs from the session.
async function getApiToken() {
  if (cachedToken && cachedToken.expiresAt - Date.now() > TOKEN_EXPIRY_MARGIN_MS) {
    return cachedToken.value;
  }
  const { data, error } = await authClient.token();
  if (error) {
    throw new ApiError(error.status, 'Tu sesión ha caducado. Inicia sesión de nuevo.');
  }
  const payload = data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  cachedToken = { value: data.token, expiresAt: JSON.parse(atob(payload)).exp * 1000 };
  return cachedToken.value;
}

async function request(path, { method, json, formData, authenticated }) {
  const headers = {};
  if (authenticated) headers.Authorization = `Bearer ${await getApiToken()}`;
  if (json !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData ?? (json === undefined ? undefined : JSON.stringify(json)),
    });
  } catch (cause) {
    throw new ApiError(
      0,
      'No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
      { cause },
    );
  }

  if (!response.ok) {
    const { detail } = await response.json();
    // FastAPI validation errors carry a list of issues instead of a message.
    throw new ApiError(
      response.status,
      typeof detail === 'string' ? detail : 'Los datos enviados no son válidos.',
    );
  }
  return response;
}

/**
 * Calls the API and returns the response JSON.
 * `json` sends a JSON body and `formData` a multipart one; `authenticated: false` is only
 * for the candidate portal, which is public.
 */
export async function apiFetch(path, { method = 'GET', json, formData, authenticated = true } = {}) {
  const response = await request(path, { method, json, formData, authenticated });
  return response.json();
}

/** Downloads a protected file and returns its content as a Blob. */
export async function apiFetchBlob(path) {
  const response = await request(path, { method: 'GET', authenticated: true });
  return response.blob();
}
