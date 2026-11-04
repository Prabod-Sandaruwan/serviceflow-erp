import { describe, it, expect } from 'vitest';
import {
  computeTaskProgress,
  computeMilestoneProgress,
  progressPercent,
  milestoneProgress,
} from '../../src/modules/projects/progress';

describe('Project Progress Calculation (PROJ-005)', () => {
  describe('computeTaskProgress', () => {
    it('SRS example: 1 DONE, 1 CANCELLED, 2 TODO yields 33%', () => {
      const tasks = [
        { status: 'DONE' },
        { status: 'CANCELLED' },
        { status: 'TODO' },
        { status: 'TODO' },
      ];
      expect(computeTaskProgress(tasks)).toBe(33);
      expect(progressPercent(tasks)).toBe(33);
    });

    it('returns 0 for empty array, null, or undefined', () => {
      expect(computeTaskProgress([])).toBe(0);
      expect(computeTaskProgress(null)).toBe(0);
      expect(computeTaskProgress(undefined)).toBe(0);
    });

    it('returns 0 when all tasks are CANCELLED', () => {
      const tasks = [{ status: 'CANCELLED' }, { status: 'CANCELLED' }];
      expect(computeTaskProgress(tasks)).toBe(0);
    });

    it('returns 100 when all non-cancelled tasks are DONE', () => {
      const tasks = [
        { status: 'DONE' },
        { status: 'DONE' },
        { status: 'CANCELLED' },
      ];
      expect(computeTaskProgress(tasks)).toBe(100);
    });

    it('rounds half-up correctly to nearest integer', () => {
      // 1 / 8 = 12.5% -> 13%
      const tasks = [
        { status: 'DONE' },
        ...Array(7).fill({ status: 'TODO' }),
      ];
      expect(computeTaskProgress(tasks)).toBe(13);

      // 2 / 3 = 66.66% -> 67%
      expect(
        computeTaskProgress([
          { status: 'DONE' },
          { status: 'DONE' },
          { status: 'TODO' },
        ])
      ).toBe(67);
    });
  });

  describe('computeMilestoneProgress', () => {
    it('SRS example: 1 APPROVED, 1 CANCELLED, 2 PENDING yields 33%', () => {
      const milestones = [
        { status: 'APPROVED' },
        { status: 'CANCELLED' },
        { status: 'PENDING' },
        { status: 'IN_PROGRESS' },
      ];
      expect(computeMilestoneProgress(milestones)).toBe(33);
      expect(milestoneProgress(milestones)).toBe(33);
    });

    it('returns 0 for empty array, null, or undefined', () => {
      expect(computeMilestoneProgress([])).toBe(0);
      expect(computeMilestoneProgress(null)).toBe(0);
      expect(computeMilestoneProgress(undefined)).toBe(0);
    });

    it('returns 0 when all milestones are CANCELLED', () => {
      const milestones = [{ status: 'CANCELLED' }, { status: 'CANCELLED' }];
      expect(computeMilestoneProgress(milestones)).toBe(0);
    });

    it('returns 100 when all non-cancelled milestones are APPROVED', () => {
      const milestones = [
        { status: 'APPROVED' },
        { status: 'APPROVED' },
        { status: 'CANCELLED' },
      ];
      expect(computeMilestoneProgress(milestones)).toBe(100);
    });
  });
});
