import type { ListingDraft, ListingStatus } from './types';

export const listingStatuses: ListingStatus[] = [
  'draft',
  'pending_review',
  'published',
  'rejected',
  'sold',
  'withdrawn',
  'expired',
  'suspended',
];
export function nextListingStatuses(status: ListingStatus): ListingStatus[] {
  switch (status) {
    case 'draft':
    case 'rejected':
    case 'expired':
    case 'suspended':
      return ['pending_review'];
    case 'pending_review':
      return ['published', 'rejected', 'withdrawn'];
    case 'published':
      return ['sold', 'withdrawn', 'expired', 'suspended'];
    default:
      return [];
  }
}
export function editKind(before: ListingDraft, after: ListingDraft): 'none' | 'price' | 'material' {
  const keys: (keyof ListingDraft)[] = [
    'brand',
    'model',
    'storage',
    'city',
    'area',
    'color',
    'condition',
    'pta',
    'battery',
    'repairs',
    'defects',
    'accessories',
    'description',
    'call',
    'whatsapp',
    'consent',
  ];
  if (keys.some((key) => before[key] !== after[key])) return 'material';
  return before.price !== after.price ? 'price' : 'none';
}
export const lifecycleExplanation: Record<ListingStatus, string> = {
  draft: 'Local draft. Submission requires verified contact and processed photos in production.',
  pending_review: 'Awaiting moderation of this revision. Not publicly available.',
  published: 'Local published scenario only. No real listing was published.',
  rejected:
    'Sample rejection reason: photographs do not clearly show condition. Edit disclosures and add suitable photos before resubmitting.',
  sold: 'Terminal state. Seller contact is disabled. Create a new listing for another sale.',
  withdrawn: 'Terminal state. Seller contact is disabled.',
  expired:
    'Seller contact is disabled. Renewal returns through moderation and does not renew an inspection.',
  suspended: 'Seller contact is disabled. Resolve the moderation concern before review.',
};
