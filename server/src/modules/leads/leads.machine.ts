import { defineMachine, assertTransition, type Role } from '../../shared/state';
import { ConflictError } from '../../shared/errors';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'CONVERTED' | 'LOST';

export const leadMachine = defineMachine<LeadStatus>('Lead', {
  NEW: [{ to: 'CONTACTED' }, { to: 'LOST' }],
  CONTACTED: [{ to: 'QUALIFIED' }, { to: 'LOST' }],
  QUALIFIED: [{ to: 'PROPOSAL_SENT' }, { to: 'LOST' }],
  PROPOSAL_SENT: [{ to: 'LOST' }],
  CONVERTED: [],
  LOST: [],
});

export function assertLeadTransition(from: LeadStatus, to: string, actorRole?: Role): void {
  if (to === 'WON' || to === 'CONVERTED') {
    throw new ConflictError(
      'Cannot transition Lead to WON/CONVERTED via PATCH. Use conversion endpoint.',
      'INVALID_STATE_TRANSITION'
    );
  }
  if (from === to) return;
  assertTransition(leadMachine, from, to as LeadStatus, actorRole);
}

export default assertLeadTransition;
