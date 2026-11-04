export interface HasStatus {
  status: string;
}

export function computeTaskProgress(tasks?: HasStatus[] | null): number {
  if (!tasks || tasks.length === 0) return 0;
  const valid = tasks.filter((t) => t.status !== 'CANCELLED');
  if (valid.length === 0) return 0;
  const doneCount = valid.filter((t) => t.status === 'DONE').length;
  return Math.round((doneCount / valid.length) * 100);
}

export function computeMilestoneProgress(milestones?: HasStatus[] | null): number {
  if (!milestones || milestones.length === 0) return 0;
  const valid = milestones.filter((m) => m.status !== 'CANCELLED');
  if (valid.length === 0) return 0;
  const approvedCount = valid.filter((m) => m.status === 'APPROVED').length;
  return Math.round((approvedCount / valid.length) * 100);
}

export const progressPercent = computeTaskProgress;
export const milestoneProgress = computeMilestoneProgress;
