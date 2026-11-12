// Rutas protegidas a las que se puede volver tras iniciar sesión (evita redirecciones abiertas).
const RECRUITER_ROUTES = ['/portal', '/pipeline', '/review', '/settings'];

export const DEFAULT_RECRUITER_ROUTE = '/portal';

export function resolveRedirect(value) {
  const path = Array.isArray(value) ? value[0] : value;
  return RECRUITER_ROUTES.includes(path) ? path : DEFAULT_RECRUITER_ROUTE;
}
