import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useClient } from './hooks';
import { useLeads } from '../leads/hooks';
import { useQuotations } from '../quotations/hooks';
import { useProjects } from '../projects/hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { ClientDetailHeader } from './ClientDetailHeader';
import { ClientContactCard } from './ClientContactCard';
import { ClientLeadsTable } from './ClientLeadsTable';
import { ClientQuotationsTable } from './ClientQuotationsTable';
import { ClientProjectsTable } from './ClientProjectsTable';
import { ClientEditModal } from './ClientEditModal';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialEdit = searchParams.get('edit') === 'true' || location.pathname.endsWith('/edit');
  const [isEditOpen, setIsEditOpen] = useState(initialEdit);

  const clientQuery = useClient(id);
  const leadsQuery = useLeads({ clientId: id });
  const quotationsQuery = useQuotations({ clientId: id });
  const projectsQuery = useProjects({ clientId: id });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <QueryBoundary query={clientQuery}>
        {clientQuery.data?.data && (() => {
          const client = clientQuery.data.data;
          const leads = leadsQuery.data?.data || [];
          const quotations = quotationsQuery.data?.data || [];
          const projects = projectsQuery.data?.data || [];

          return (
            <div className="space-y-6">
              <ClientDetailHeader client={client} />
              <ClientContactCard client={client} onEdit={() => setIsEditOpen(true)} />
              <ClientLeadsTable leads={leads} clientId={client.id} />
              <ClientQuotationsTable quotations={quotations} clientId={client.id} />
              <ClientProjectsTable projects={projects} clientId={client.id} />
              <ClientEditModal client={client} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
            </div>
          );
        })()}
      </QueryBoundary>
    </div>
  );
}
