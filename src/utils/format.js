const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Laura Méndez" → "LM". */
export function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/** countLabel(1, 'vacante', 'vacantes') → "1 vacante". */
export function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Display name of an application. A résumé may carry no name, and "zero bias" mode hides
 * it on purpose: both cases show a stable code instead.
 */
export function getCandidateLabel({ id, candidate_name }, { anonymous = false } = {}) {
  if (anonymous || !candidate_name) return `Candidato #${id.slice(0, 4).toUpperCase()}`;
  return candidate_name;
}

/** ISO date → "Hace 5 min", "Hace 3 h", "Ayer", "Hace 4 días" or the short date. */
export function formatRelativeTime(isoDate) {
  const elapsed = Date.now() - new Date(isoDate).getTime();
  if (elapsed < MINUTE) return 'Ahora';
  if (elapsed < HOUR) return `Hace ${Math.floor(elapsed / MINUTE)} min`;
  if (elapsed < DAY) return `Hace ${Math.floor(elapsed / HOUR)} h`;
  if (elapsed < 2 * DAY) return 'Ayer';
  if (elapsed < 7 * DAY) return `Hace ${Math.floor(elapsed / DAY)} días`;
  return new Date(isoDate).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

/** 254000 → "248 KB". */
export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
