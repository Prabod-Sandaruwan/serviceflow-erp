import { useState, ChangeEvent } from 'react';
import { Select } from '../../components/ui/Forms';
import { useProjects } from '../projects/hooks';
import { useMilestones } from '../milestones/hooks';

interface MilestonePickerProps {
  selectedMilestoneId?: string;
  onSelect: (milestone: any) => void;
  disabled?: boolean;
}

export function InvoiceMilestonePicker({ selectedMilestoneId, onSelect, disabled }: MilestonePickerProps) {
  const [projectId, setProjectId] = useState<string>('');
  const { data: projectsData, isLoading: loadingProjects } = useProjects({ pageSize: 100 });
  const { data: milestonesData, isLoading: loadingMilestones } = useMilestones(projectId);

  const projects = projectsData?.data || [];
  const milestones = milestonesData?.data || [];
  const approvedMilestones = milestones.filter((m) => m.status === 'APPROVED');

  const projectOptions = [
    { value: '', label: loadingProjects ? 'Loading projects...' : 'Select a project...' },
    ...projects.map((p) => ({ value: p.id, label: `${p.projectCode} - ${p.name}` })),
  ];

  const milestoneOptions = [
    {
      value: '',
      label: !projectId
        ? 'First select a project'
        : loadingMilestones
        ? 'Loading milestones...'
        : 'Select an approved milestone...',
    },
    ...milestones.map((m) => ({
      value: m.id,
      label: `${m.title} ($${Number(m.billingAmount || 0).toLocaleString()}) [${m.status}]`,
      disabled: m.status !== 'APPROVED',
    })),
  ];

  const handleMilestoneChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const mId = e.target.value;
    const found = milestones.find((m) => String(m.id) === String(mId));
    if (found) onSelect(found);
  };

  return (
    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
        Select Project & Approved Milestone
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        <Select
          id="projectSelect"
          label="Project"
          options={projectOptions}
          value={projectId}
          disabled={disabled}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <Select
          id="milestoneSelect"
          label="Milestone"
          options={milestoneOptions}
          value={selectedMilestoneId || ''}
          disabled={disabled || !projectId || milestones.length === 0}
          onChange={handleMilestoneChange}
        />
      </div>
      {projectId && !loadingMilestones && approvedMilestones.length === 0 && (
        <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.35rem', fontWeight: 500 }}>
          Notice: This project has no approved milestones. Milestones must be approved before invoicing.
        </div>
      )}
    </div>
  );
}

export default InvoiceMilestonePicker;
