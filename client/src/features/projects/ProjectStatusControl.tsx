import { useState } from 'react';
import { Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { CancelProjectDialog } from './CancelProjectDialog';
import { useUpdateProject } from './hooks';
import type { Project } from './types';

export interface ProjectStatusControlProps {
  project: Project;
  updateProject?: ReturnType<typeof useUpdateProject>;
}

export function ProjectStatusControl({ project, updateProject }: ProjectStatusControlProps) {
  const [showCancel, setShowCancel] = useState(false);
  const defaultMutation = useUpdateProject();
  const mutation = updateProject || defaultMutation;
  const { addToast } = useToast();

  const handleStatusChange = async (nextStatus: string) => {
    try {
      await mutation.mutateAsync({ id: project.id, data: { status: nextStatus } });
      addToast(`Project status changed to ${nextStatus}`, 'success');
    } catch (err: any) {
      if (err?.status === 409 || err?.code === 'PROJECT_HAS_OPEN_WORK' || err?.message?.includes('open')) {
        addToast(err?.message || 'Cannot complete project with open milestones or tasks', 'warning');
      } else {
        addToast(err?.message || 'Failed to update project status', 'error');
      }
    }
  };

  const handleCancel = async (reason: string) => {
    try {
      await mutation.mutateAsync({ id: project.id, data: { status: 'CANCELLED', reason } });
      addToast('Project cancelled', 'success');
      setShowCancel(false);
    } catch (err: any) {
      addToast(err?.message || 'Failed to cancel project', 'error');
    }
  };

  if (project.status === 'COMPLETED' || project.status === 'CANCELLED') return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {project.status === 'PLANNED' && (
        <Button type="button" disabled={mutation.isPending} onClick={() => handleStatusChange('ACTIVE')} style={{ background: '#16a34a' }}>
          Activate Project
        </Button>
      )}
      {project.status === 'ACTIVE' && (
        <>
          <Button type="button" disabled={mutation.isPending} onClick={() => handleStatusChange('ON_HOLD')} variant="secondary">
            Put on Hold
          </Button>
          <Button type="button" disabled={mutation.isPending} onClick={() => handleStatusChange('COMPLETED')} style={{ background: '#16a34a' }}>
            Complete Project
          </Button>
        </>
      )}
      {project.status === 'ON_HOLD' && (
        <Button type="button" disabled={mutation.isPending} onClick={() => handleStatusChange('ACTIVE')} style={{ background: '#4f46e5' }}>
          Resume Project
        </Button>
      )}
      <Button type="button" disabled={mutation.isPending} variant="danger" onClick={() => setShowCancel(true)}>
        Cancel
      </Button>

      <CancelProjectDialog isOpen={showCancel} onClose={() => setShowCancel(false)} onConfirm={handleCancel} isLoading={mutation.isPending} />
    </div>
  );
}

export default ProjectStatusControl;
