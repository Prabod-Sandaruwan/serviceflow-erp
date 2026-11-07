import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type {
  DashboardSummaryResponse,
  FinanceReportResponse,
  ProjectReportResponse,
} from './types';

export function useDashboardSummary(from?: string, to?: string) {
  const clean: Record<string, string> = {};
  if (from && from.trim() !== '') clean.from = from.trim();
  if (to && to.trim() !== '') clean.to = to.trim();
  const q = new URLSearchParams(clean).toString();
  return useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboard-summary', clean],
    queryFn: () => api.get<DashboardSummaryResponse>(q ? `/dashboard/summary?${q}` : '/dashboard/summary'),
  });
}

export function useFinanceReport(from?: string, to?: string) {
  const clean: Record<string, string> = {};
  if (from && from.trim() !== '') clean.from = from.trim();
  if (to && to.trim() !== '') clean.to = to.trim();
  const q = new URLSearchParams(clean).toString();
  return useQuery<FinanceReportResponse>({
    queryKey: ['finance-report', clean],
    queryFn: () => api.get<FinanceReportResponse>(q ? `/reports/finance?${q}` : '/reports/finance'),
  });
}

export function useProjectReport(from?: string, to?: string) {
  const clean: Record<string, string> = {};
  if (from && from.trim() !== '') clean.from = from.trim();
  if (to && to.trim() !== '') clean.to = to.trim();
  const q = new URLSearchParams(clean).toString();
  return useQuery<ProjectReportResponse>({
    queryKey: ['project-report', clean],
    queryFn: () => api.get<ProjectReportResponse>(q ? `/reports/projects?${q}` : '/reports/projects'),
  });
}

export function useDownloadCsv(type: 'finance' | 'projects') {
  return useMutation({
    mutationFn: async ({ from, to }: { from?: string; to?: string } = {}) => {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      const clean: Record<string, string> = { type };
      if (from && from.trim() !== '') clean.from = from.trim();
      if (to && to.trim() !== '') clean.to = to.trim();
      const q = new URLSearchParams(clean).toString();

      const res = await fetch(`${BASE_URL}/reports/export.csv?${q}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to download CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });
}

export * from './types';
