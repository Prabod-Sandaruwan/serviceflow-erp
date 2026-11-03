export { createTask } from './tasks.create';
export { updateTask } from './tasks.update';
export { getTasks } from './tasks.list';

import { createTask } from './tasks.create';
import { updateTask } from './tasks.update';
import { getTasks } from './tasks.list';

export const TasksService = { createTask, updateTask, getTasks };
export default TasksService;
