/**
 * Display status of an application: { label, tone } for <Badge />.
 * The recruiter decision (`stage`) wins over the analysis status, which wins over the
 * result against the cutoff (`shortlisted`).
 */
export function getApplicationStatus({ stage, analysis_status, shortlisted }) {
  if (stage === 'interview') return { label: 'Entrevista', tone: 'success' };
  if (stage === 'rejected') return { label: 'Descartado', tone: 'neutral' };
  if (analysis_status === 'pending') return { label: 'Nuevo', tone: 'info' };
  if (analysis_status === 'processing') return { label: 'Analizando', tone: 'info' };
  if (analysis_status === 'failed') return { label: 'Error de análisis', tone: 'warning' };
  return shortlisted
    ? { label: 'Preselección', tone: 'success' }
    : { label: 'Revisión manual', tone: 'warning' };
}
