import { ApiError } from '../../shared/errors';
import { ListProjectsQuery } from './projects.schemas';
import { formatProject } from './projects.formatter';
import { findMany, findById } from './projects.repository';
import { createProject } from './projects.create';

export { createProject };
export type { ProjectServiceContext } from './projects.create';

const computeProgressStub = (_tasks: any[]) => 0;

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };

export async function getProjects(query: ListProjectsQuery, actor?: Actor) {
  let actorEmployeeId: bigint | undefined;
  if (actor?.role === 'STAFF') {
    actorEmployeeId = actor.employeeId != null ? BigInt(actor.employeeId) : -1n;
  }
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  const [items, total] = await findMany(
    { status: query.status, clientId: query.clientId, search: query.search },
    { skip: (page - 1) * pageSize, take: pageSize },
    actorEmployeeId
  );

  const data = items.map((p) => {
    const formatted = formatProject(p);
    delete formatted.tasks;
    delete formatted.milestones;
    return {
      ...formatted,
      progressPercent: computeProgressStub(p.tasks || []),
    };
  });

  return { data, meta: { page, pageSize, total } };
}

export async function getProjectById(id: string, actor?: Actor) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  }

  let actorEmployeeId: bigint | undefined;
  if (actor?.role === 'STAFF') {
    actorEmployeeId = actor.employeeId != null ? BigInt(actor.employeeId) : -1n;
  }

  const project = await findById(rawId, actorEmployeeId);
  if (!project) {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  }

  const formatted = formatProject(project);
  const result: Record<string, any> = {
    ...formatted,
    progressPercent: computeProgressStub(project.tasks || []),
  };

  if (actor?.role !== 'STAFF') {
    result.invoices = [];
    result.expenses = [];
  }

  return result;
}

export const ProjectsService = { createProject, getProjects, getProjectById };
export default ProjectsService;
