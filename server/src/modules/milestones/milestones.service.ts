export { createMilestone } from './milestones.create';
export { updateMilestone } from './milestones.update';
export { approveMilestone } from './milestones.approve';
export { isInvoiceEligible, getMilestones, getMilestoneById } from './milestones.eligibility';
export type { MilestoneContext } from './milestones.create';

import { createMilestone } from './milestones.create';
import { updateMilestone } from './milestones.update';
import { approveMilestone } from './milestones.approve';
import { isInvoiceEligible, getMilestones, getMilestoneById } from './milestones.eligibility';

export const MilestonesService = {
  createMilestone,
  updateMilestone,
  approveMilestone,
  isInvoiceEligible,
  getMilestones,
  getMilestoneById,
};
export default MilestonesService;
