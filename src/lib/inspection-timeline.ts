export type InspectionStage =
  'booked' | 'arrived' | 'in_progress' | 'report_review' | 'badge_awarded';

/** Order matters: it is the order a seller sees. Only staff move an inspection forward. */
export const inspectionStages: { key: InspectionStage; label: string; help: string }[] = [
  { key: 'booked', label: 'Booked', help: 'Your visit is on the shop calendar.' },
  { key: 'arrived', label: 'Arrived', help: 'The shop has checked you and your phone in.' },
  { key: 'in_progress', label: 'Being inspected', help: 'The team is testing the phone.' },
  {
    key: 'report_review',
    label: 'Report under review',
    help: 'Findings are written and waiting for shop approval.',
  },
  {
    key: 'badge_awarded',
    label: 'Badge awarded',
    help: 'The report is approved and the Shop inspected badge can show on your ad.',
  },
];

export type StepState = 'done' | 'current' | 'upcoming';

export function timelineSteps(stage: InspectionStage) {
  const at = inspectionStages.findIndex((s) => s.key === stage);
  return inspectionStages.map((s, i) => ({
    ...s,
    state: (i < at || stage === 'badge_awarded'
      ? 'done'
      : i === at
        ? 'current'
        : 'upcoming') as StepState,
  }));
}
