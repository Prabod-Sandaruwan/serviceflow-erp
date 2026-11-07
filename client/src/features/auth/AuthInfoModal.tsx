import { Modal } from '../../components/ui/Modal';
import { HelpCircle, ShieldCheck, FileText, Lock } from 'lucide-react';

export type AuthInfoModalType = 'help' | 'security' | 'privacy' | 'terms' | null;

interface AuthInfoModalProps {
  type: AuthInfoModalType;
  onClose: () => void;
}

export function AuthInfoModal({ type, onClose }: AuthInfoModalProps) {
  if (!type) return null;

  const config = {
    help: {
      title: 'Help & Support',
      icon: <HelpCircle className="w-5 h-5 text-indigo-600" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>For assistance accessing your account or resetting credentials, contact your organization's IT administrator.</p>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1">
            <p className="font-semibold text-slate-800">Support Desk:</p>
            <p>Email: <a href="mailto:support@serviceflow.lk" className="text-indigo-600 hover:underline">support@serviceflow.lk</a></p>
            <p>Hotline: <span className="font-mono text-slate-700">+94 11 234 5670</span> (Mon–Fri, 8:30 AM – 5:30 PM)</p>
          </div>
          <p className="text-xs text-slate-500">ServiceFlow ERP v1.0 • Enterprise Cloud Edition</p>
        </div>
      ),
    },
    security: {
      title: 'Security & Trust Architecture',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      content: (
        <div className="space-y-2.5 text-sm text-slate-600">
          <p>Enterprise data is secured with multi-layered defenses and strict access protocols:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
            <li><strong>256-bit TLS/SSL:</strong> End-to-end encryption in transit.</li>
            <li><strong>Argon2id Hashing:</strong> State-of-the-art password cryptography.</li>
            <li><strong>Role-Based Access (RBAC):</strong> Least-privilege access enforcement.</li>
            <li><strong>Immutable Audit Trails:</strong> Every critical transaction is logged.</li>
          </ul>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      icon: <Lock className="w-5 h-5 text-indigo-600" />,
      content: (
        <div className="space-y-2.5 text-sm text-slate-600">
          <p>We respect employee and corporate confidentiality in accordance with strict enterprise data standards:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
            <li><strong>Data Usage:</strong> Credentials and actions are processed solely for business workflow management.</li>
            <li><strong>Zero Commercial Sharing:</strong> Customer and corporate data is never sold or shared with external parties.</li>
            <li><strong>Retention:</strong> Historical records are retained under company-mandated compliance schedules.</li>
          </ul>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      content: (
        <div className="space-y-2.5 text-sm text-slate-600">
          <p>By signing in to ServiceFlow ERP, you agree to comply with organizational policies:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
            <li><strong>Authorized Personnel Only:</strong> Access is restricted to designated staff.</li>
            <li><strong>Credential Confidentiality:</strong> Account sharing is strictly forbidden.</li>
            <li><strong>Activity Monitoring:</strong> All system actions are subject to enterprise security auditing.</li>
          </ul>
        </div>
      ),
    },
  }[type];

  return (
    <Modal isOpen={Boolean(type)} onClose={onClose} title={config.title}>
      <div className="pt-1 space-y-4">
        {config.content}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors">
            Dismiss
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AuthInfoModal;
