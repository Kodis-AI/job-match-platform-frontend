import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsFocused } from 'expo-router';

import { apiFetch } from './client';
import { appendFile } from './files';

const POLL_INTERVAL_MS = 3000;

// Tab screens stay mounted. Tying the subscription to focus makes a screen refetch when the
// user comes back to it (analyses finish in the background) and stops its polling meanwhile.
function useScreenQuery(options) {
  return useQuery({ ...options, subscribed: useIsFocused() });
}

export function useDashboard() {
  return useScreenQuery({ queryKey: ['dashboard'], queryFn: () => apiFetch('/api/v1/dashboard') });
}

export function useJobs() {
  return useScreenQuery({ queryKey: ['jobs'], queryFn: () => apiFetch('/api/v1/jobs') });
}

/** A job with its stats. Polls while any of its résumés is still being analyzed. */
export function useJob(jobId) {
  return useScreenQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => apiFetch(`/api/v1/jobs/${jobId}`),
    enabled: jobId != null,
    refetchInterval: (query) =>
      query.state.data?.stats.processing > 0 ? POLL_INTERVAL_MS : false,
  });
}

/**
 * Ranking of the analyzed candidates of a job.
 * `analyzedCount` (stats.completed of the job) is part of the key so the ranking reloads
 * every time an analysis finishes.
 */
export function useRankedApplications(jobId, { minScore, skill, limit, offset, analyzedCount }) {
  const params = new URLSearchParams({ min_score: minScore, limit, offset });
  if (skill) params.set('skill', skill);
  return useScreenQuery({
    queryKey: ['jobs', jobId, 'applications', { minScore, skill, limit, offset, analyzedCount }],
    queryFn: () => apiFetch(`/api/v1/jobs/${jobId}/applications?${params}`),
    enabled: jobId != null,
    placeholderData: keepPreviousData,
  });
}

/** One application with its evaluation. Polls while its analysis is running. */
export function useApplication(applicationId) {
  return useScreenQuery({
    queryKey: ['applications', applicationId],
    queryFn: () => apiFetch(`/api/v1/applications/${applicationId}`),
    enabled: applicationId != null,
    refetchInterval: (query) =>
      query.state.data?.analysis_status === 'processing' ? POLL_INTERVAL_MS : false,
  });
}

export function useRecruiterSettings() {
  return useScreenQuery({ queryKey: ['settings'], queryFn: () => apiFetch('/api/v1/settings') });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job) => apiFetch('/api/v1/jobs', { method: 'POST', json: job }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]),
  });
}

/** Uploads a batch of résumés (file picker assets) to a job. */
export function useUploadApplications(jobId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assets) => {
      const formData = new FormData();
      assets.forEach((asset) => appendFile(formData, 'files', asset));
      return apiFetch(`/api/v1/jobs/${jobId}/applications`, { method: 'POST', formData });
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]),
  });
}

/** Queues the analysis of the pending and failed résumés of the job. */
export function useStartAnalysis(jobId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/api/v1/jobs/${jobId}/analysis`, { method: 'POST' }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['jobs', jobId] }),
        queryClient.invalidateQueries({ queryKey: ['applications'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]),
  });
}

export function useUpdateStage(applicationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stage) =>
      apiFetch(`/api/v1/applications/${applicationId}`, { method: 'PATCH', json: { stage } }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['applications', applicationId] }),
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]),
  });
}

export function useSaveRecruiterSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) => apiFetch('/api/v1/settings', { method: 'PUT', json: settings }),
    // Weights and cutoff change scores and rankings everywhere.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

/** Previews the ranking of a job under weights and a cutoff that are not saved yet. */
export function useSimulateRanking(jobId) {
  return useMutation({
    mutationFn: ({ weights, cutoff }) =>
      apiFetch(`/api/v1/jobs/${jobId}/ranking-simulation`, {
        method: 'POST',
        json: { weights, cutoff },
      }),
  });
}

/** Public candidate-portal analysis: one résumé against one job posting. */
export function useCandidateAnalysis() {
  return useMutation({
    mutationFn: ({ cv, jobDescription }) => {
      const formData = new FormData();
      appendFile(formData, 'cv', cv);
      formData.append('job_description', jobDescription);
      return apiFetch('/api/v1/candidate/analyses', {
        method: 'POST',
        formData,
        authenticated: false,
      });
    },
  });
}
