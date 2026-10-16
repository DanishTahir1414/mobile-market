export const inspectionStages = [
  'booked',
  'assigned',
  'checked_in',
  'in_progress',
  'awaiting_acknowledgement',
  'pending_approval',
  'published',
  'expired',
  'revoked',
] as const;
export type InspectionStage = (typeof inspectionStages)[number];
export interface FindingsRevision {
  revision: number;
  deviceRevision: number;
  observations: string;
  defects: string;
  limitations: string;
  observedAt: string;
}
export const sampleFindings: FindingsRevision = {
  revision: 1,
  deviceRevision: 1,
  observations: 'Display, touch, cameras and charging responded during sample tests.',
  defects: 'Sample cosmetic wear on frame.',
  limitations:
    'Device not opened. Internal repairs, water resistance, ownership and future reliability are not established.',
  observedAt: '2026-10-16T09:00:00Z',
};
export function acknowledgementMatches(
  findings: FindingsRevision,
  acknowledgedRevision: number | null,
) {
  return findings.revision === acknowledgedRevision;
}
export function approvalBlocks({
  acknowledged,
  feeSettled,
  deviceMatches,
  distinctApprover,
}: {
  acknowledged: boolean;
  feeSettled: boolean;
  deviceMatches: boolean;
  distinctApprover: boolean;
}) {
  return [
    !acknowledged && 'Seller must acknowledge the exact findings revision.',
    !feeSettled && 'Fee must be settled or waived when charged.',
    !deviceMatches && 'Device revision must match.',
    !distinctApprover && 'Approver must be authorized and distinct from the inspector.',
  ].filter((reason): reason is string => Boolean(reason));
}
