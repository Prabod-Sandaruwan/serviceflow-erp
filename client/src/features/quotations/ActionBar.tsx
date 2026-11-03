import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Forms';
import { ReasonDialog } from './ReasonDialog';
import { RespondDialog } from './RespondDialog';
import { downloadQuotationPdf, useSubmitQuotation, useApproveQuotation, useRejectQuotation, useSendQuotation, useRespondQuotation, useReviseQuotation } from './workflowHooks';
import { useCreateProject } from '../projects/hooks';
import type { Quotation } from './types';

export function ActionBar({ quotation, refetch }: { quotation: Quotation; refetch: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showReject, setShowReject] = useState(false);
  const [showRespond, setShowRespond] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const submitM = useSubmitQuotation(), approveM = useApproveQuotation(), rejectM = useRejectQuotation();
  const sendM = useSendQuotation(), respondM = useRespondQuotation(), reviseM = useReviseQuotation();
  const createProjectM = useCreateProject();

  const isCreator = user?.id ? String(user.id) === String(quotation.createdBy) : false;
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isExpired = quotation.isExpired || quotation.status === 'EXPIRED';

  const run = async (fn: () => Promise<any>, msg: string) => {
    try {
      const res = await fn();
      addToast(msg, 'success');
      if (res?.data?.id && res.data.id !== quotation.id) navigate(`/quotations/${res.data.id}`);
      else refetch();
    } catch (e: any) {
      if (e?.status === 409 || e?.message?.includes('INVALID_STATE_TRANSITION')) {
        addToast('Quotation status has changed. Refreshing data...', 'warning');
        refetch();
      } else addToast(e?.message || 'Action failed', 'error');
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadQuotationPdf(quotation.id, `${quotation.quotationNumber}.pdf`);
    } catch (e: any) { addToast(e?.message || 'Download failed', 'error'); }
    finally { setDownloading(false); }
  };

  const handleCreateProject = async () => {
    try {
      const res = await createProjectM.mutateAsync({ quotationId: quotation.id });
      addToast('Project created successfully', 'success');
      navigate(`/projects/${res.data.id}`);
    } catch (e: any) {
      if (e?.status === 409 || e?.code === 'PROJECT_ALREADY_EXISTS' || e?.message?.includes('already exists')) {
        addToast('Project already exists for this quotation', 'warning');
        navigate('/projects');
      } else addToast(e?.message || 'Failed to create project', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button type="button" onClick={handleDownload} disabled={downloading} style={{ background: '#0284c7' }}>
        {downloading ? 'Downloading...' : 'Download PDF'}
      </Button>
      {quotation.status === 'DRAFT' && (
        <>
          <Link to={`/quotations/${quotation.id}/edit`} style={{ textDecoration: 'none' }}><Button type="button" variant="secondary">Edit</Button></Link>
          <Button type="button" onClick={() => run(() => submitM.mutateAsync(quotation.id), 'Quotation submitted')}>Submit</Button>
        </>
      )}
      {quotation.status === 'PENDING_APPROVAL' && isManagerOrAdmin && !isCreator && (
        <>
          <Button type="button" style={{ background: '#16a34a' }} onClick={() => run(() => approveM.mutateAsync(quotation.id), 'Quotation approved')}>Approve</Button>
          <Button type="button" variant="danger" onClick={() => setShowReject(true)}>Reject</Button>
        </>
      )}
      {quotation.status === 'APPROVED' && (
        <Button type="button" style={{ background: '#0d9488' }} onClick={() => run(() => sendM.mutateAsync(quotation.id), 'Quotation sent to client')}>Send to Client</Button>
      )}
      {quotation.status === 'SENT' && <Button type="button" style={{ background: '#7c3aed' }} onClick={() => setShowRespond(true)}>Respond</Button>}
      {(quotation.status === 'REJECTED' || quotation.status === 'DECLINED' || isExpired) && (
        <Button type="button" style={{ background: '#ea580c' }} onClick={() => run(() => reviseM.mutateAsync(quotation.id), 'Quotation revised')}>Revise</Button>
      )}
      {quotation.status === 'ACCEPTED' && (
        <Button type="button" style={{ background: '#15803d' }} disabled={createProjectM.isPending} onClick={handleCreateProject}>
          {createProjectM.isPending ? 'Creating...' : 'Create Project'}
        </Button>
      )}
      <ReasonDialog isOpen={showReject} onClose={() => setShowReject(false)} onConfirm={(r) => run(() => rejectM.mutateAsync({ id: quotation.id, reason: r }), 'Quotation rejected')} isLoading={rejectM.isPending} />
      <RespondDialog isOpen={showRespond} onClose={() => setShowRespond(false)} onConfirm={(d) => run(() => respondM.mutateAsync({ id: quotation.id, ...d }), 'Response recorded')} isLoading={respondM.isPending} />
    </div>
  );
}

export default ActionBar;
