import { BadgeCheck, Clock3, CircleMinus, ShieldQuestion } from 'lucide-react';
import type { InspectionState } from '@/lib/types';
const states = {
  current: { label: 'Shop inspected', Icon: BadgeCheck },
  not_inspected: { label: 'Not inspected', Icon: CircleMinus },
  expired: { label: 'Inspection expired', Icon: Clock3 },
  revoked: { label: 'Report revoked', Icon: CircleMinus },
  unavailable: { label: 'Inspection unavailable', Icon: ShieldQuestion },
};
export function InspectionBadge({
  state,
  compact = false,
}: {
  state: InspectionState;
  compact?: boolean;
}) {
  const { label, Icon } = states[state];
  return (
    <span
      className={`inspection-badge ${state === 'current' ? 'inspection-badge--current' : ''} ${compact ? 'inspection-badge--compact' : ''}`}
    >
      <Icon size={14} />
      {label}
    </span>
  );
}
