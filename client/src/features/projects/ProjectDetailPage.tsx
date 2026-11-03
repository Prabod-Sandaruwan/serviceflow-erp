import { useParams, Link } from 'react-router-dom';
import { useProject } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { ProjectStatusControl } from './ProjectStatusControl';
import { ProjectOverviewTab } from './ProjectOverviewTab';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useProject(id);
  const project = query.data?.data;

  return (
    <div style={{ padding: '2rem' }}>
      <QueryBoundary query={query}>
        {project && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <Link to="/projects" style={{ fontSize: '0.875rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                &larr; Back to Projects
              </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                  {project.projectCode}
                </div>
                <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                  {project.name}
                </h1>
                {project.description && (
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                    {project.description}
                  </p>
                )}
              </div>
              <ProjectStatusControl project={project} />
            </div>

            <ProjectOverviewTab project={project} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

export default ProjectDetailPage;
