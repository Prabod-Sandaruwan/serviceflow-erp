import { ConflictError } from './errors';

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface Transition<S extends string> {
  to: S;
  roles?: Role[];
}

export type TransitionTable<S extends string> = Partial<
  Record<S, readonly Transition<S>[]>
>;

export interface StateMachine<S extends string> {
  name: string;
  transitions: TransitionTable<S>;
}

export const defineMachine = <S extends string = string>(
  name: string,
  transitions: Record<string, readonly Transition<any>[]>
): StateMachine<S> => ({ name, transitions: transitions as TransitionTable<S> });

export const assertTransition = <S extends string>(
  machine: StateMachine<S>,
  from: S,
  to: S,
  actorRole?: Role
): void => {
  const allowed = machine.transitions[from];
  const target = allowed?.find((t) => t.to === to);
  if (!target) {
    throw new ConflictError(
      `Cannot transition ${machine.name} from '${from}' to '${to}'`,
      'INVALID_STATE_TRANSITION'
    );
  }
  if (target.roles && target.roles.length > 0) {
    if (!actorRole || !target.roles.includes(actorRole)) {
      throw new ConflictError(
        `Role '${actorRole}' is not authorized to transition ${machine.name} from '${from}' to '${to}'`,
        'INVALID_STATE_TRANSITION'
      );
    }
  }
};

const APPROVER_ROLES: Role[] = ['MANAGER', 'ADMIN'];

export const quotationMachine = defineMachine('Quotation', {
  DRAFT: [{ to: 'PENDING_APPROVAL' }],
  PENDING_APPROVAL: [{ to: 'APPROVED', roles: APPROVER_ROLES }, { to: 'REJECTED', roles: APPROVER_ROLES }],
  REJECTED: [{ to: 'DRAFT' }],
  APPROVED: [{ to: 'SENT' }],
  SENT: [{ to: 'ACCEPTED' }, { to: 'DECLINED' }],
});

export const projectMachine = defineMachine('Project', {
  PLANNED: [{ to: 'ACTIVE' }, { to: 'CANCELLED' }],
  ACTIVE: [{ to: 'ON_HOLD' }, { to: 'COMPLETED' }, { to: 'CANCELLED' }],
  ON_HOLD: [{ to: 'ACTIVE' }],
});

export const milestoneMachine = defineMachine('Milestone', {
  PENDING: [{ to: 'IN_PROGRESS' }, { to: 'CANCELLED' }],
  IN_PROGRESS: [{ to: 'COMPLETED' }, { to: 'CANCELLED' }],
  COMPLETED: [{ to: 'IN_PROGRESS' }, { to: 'APPROVED' }],
});

export const taskMachine = defineMachine('Task', {
  TODO: [{ to: 'IN_PROGRESS' }, { to: 'CANCELLED' }],
  IN_PROGRESS: [{ to: 'DONE' }, { to: 'CANCELLED' }],
  DONE: [{ to: 'IN_PROGRESS' }],
});

export const invoiceMachine = defineMachine('Invoice', {
  DRAFT: [{ to: 'ISSUED' }, { to: 'CANCELLED' }],
  ISSUED: [{ to: 'CANCELLED' }, { to: 'PARTIALLY_PAID' }, { to: 'PAID' }],
  PARTIALLY_PAID: [{ to: 'PAID' }, { to: 'ISSUED' }],
  PAID: [{ to: 'PARTIALLY_PAID' }, { to: 'ISSUED' }],
});

export const paymentMachine = defineMachine('Payment', {
  ACTIVE: [{ to: 'VOIDED' }],
});

export const expenseMachine = defineMachine('Expense', {
  ACTIVE: [{ to: 'VOIDED' }],
});

export const derivedStates = {};
