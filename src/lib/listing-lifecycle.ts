import type { ListingStatus } from './types';

/**
 * What a SELLER may do to their own listing, by status. Approving or rejecting a listing is
 * a staff decision and is deliberately absent: it must be decided and enforced by the
 * server. Shop verification is also absent because it is separate and optional: a listing
 * can be published and sold without it, and a badge never changes the listing's status.
 */
export type SellerAction = 'submit' | 'resubmit' | 'withdraw' | 'mark_sold' | 'reopen';

const transitions: Record<ListingStatus, Partial<Record<SellerAction, ListingStatus>>> = {
  draft: { submit: 'pending_review' },
  // Pulling a pending ad back to a draft is how a seller edits it again.
  pending_review: { withdraw: 'draft' },
  published: { mark_sold: 'sold', withdraw: 'withdrawn' },
  rejected: { resubmit: 'pending_review' },
  // A withdrawn ad returns to a draft and goes through review again.
  withdrawn: { reopen: 'draft' },
  sold: {},
};

export function sellerActions(status: ListingStatus): SellerAction[] {
  return Object.keys(transitions[status]) as SellerAction[];
}

export function nextStatus(status: ListingStatus, action: SellerAction): ListingStatus | null {
  return transitions[status][action] ?? null;
}

/** Only unpublished ads can be edited; changing a live ad needs a fresh review. */
export function isEditable(status: ListingStatus) {
  return status === 'draft' || status === 'rejected';
}

export const statusLabels: Record<ListingStatus, string> = {
  draft: 'Draft',
  pending_review: 'Waiting for review',
  published: 'Live',
  rejected: 'Needs changes',
  sold: 'Sold',
  withdrawn: 'Withdrawn',
};

export const statusHelp: Record<ListingStatus, string> = {
  draft: 'Only you can see this. Finish the details and submit it for review.',
  pending_review: 'The shop team checks every ad before it goes live.',
  published: 'Buyers can find this ad and contact you.',
  rejected: 'The shop asked for changes. Edit the ad and send it again.',
  sold: 'Marked as sold. This ad is no longer shown to buyers.',
  withdrawn: 'Hidden from buyers. You can reopen it as a draft.',
};

export const actionLabels: Record<SellerAction, string> = {
  submit: 'Submit for review',
  resubmit: 'Resubmit for review',
  withdraw: 'Withdraw',
  mark_sold: 'Mark as sold',
  reopen: 'Reopen as draft',
};

/** Actions that hide or end the ad ask for confirmation first. */
export const needsConfirmation: SellerAction[] = ['withdraw', 'mark_sold'];
