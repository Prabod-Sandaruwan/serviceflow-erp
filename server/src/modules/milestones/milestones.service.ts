export { createMilestone } from './milestones.create';
export { updateMilestone } from './milestones.update';
export { approveMilestone } from './milestones.approve';
export type { MilestoneContext } from './milestones.create';

import { createMilestone } from './milestones.create';
import { updateMilestone } from './milestones.update';
import { approveMilestone } from './milestones.approve';

export const MilestonesService = { createMilestone, updateMilestone, approveMilestone };
export default MilestonesService;
