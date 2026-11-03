export { createMilestone } from './milestones.create';
export { updateMilestone } from './milestones.update';
export type { MilestoneContext } from './milestones.create';

import { createMilestone } from './milestones.create';
import { updateMilestone } from './milestones.update';

export const MilestonesService = { createMilestone, updateMilestone };
export default MilestonesService;
