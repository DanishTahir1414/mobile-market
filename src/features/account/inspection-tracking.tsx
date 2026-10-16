'use client';
import { useState } from 'react';
import { useDemo } from '@/components/demo-provider';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState, Notice } from '@/components/ui/empty-state';
import { Select } from '@/components/ui/field';
import { StatusTimeline } from '@/components/ui/status-timeline';
import {
  inspectionStages,
  sampleFindings,
  acknowledgementMatches,
  type InspectionStage,
} from '@/lib/inspection-workflow';
import { formatShopDate } from '@/lib/format';

export function FindingsAcknowledgement() {
  const [findings, setFindings] = useState(sampleFindings),
    [acknowledged, setAcknowledged] = useState<number | null>(null),
    [checkedRevision, setCheckedRevision] = useState<number | null>(null);
  return (
    <section className="panel">
      <h2>Exact findings revision {findings.revision}</h2>
      <p>
        Device revision {findings.deviceRevision} · illustrative observation:{' '}
        {formatShopDate(findings.observedAt)}
      </p>
      <h3>Shop observations</h3>
      <p>{findings.observations}</p>
      <h3>Defects</h3>
      <p>{findings.defects}</p>
      <h3>Testing limitations</h3>
      <p>{findings.limitations}</p>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={checkedRevision === findings.revision}
          onChange={(e) => setCheckedRevision(e.target.checked ? findings.revision : null)}
        />
        I reviewed revision {findings.revision}, defects and limitations.
      </label>
      <Button
        disabled={checkedRevision !== findings.revision}
        onClick={() => setAcknowledged(findings.revision)}
      >
        Acknowledge locally
      </Button>
      <p role="status">
        {acknowledgementMatches(findings, acknowledged)
          ? `Demo acknowledgement applies to revision ${acknowledged} only. Nothing submitted.`
          : 'Current revision has no local acknowledgement.'}
      </p>
      <Button
        variant="secondary"
        onClick={() =>
          setFindings((current) => ({
            ...current,
            revision: current.revision + 1,
            defects: 'Updated sample findings: frame wear and a scratch on the display.',
          }))
        }
      >
        Demonstrate changed findings revision
      </Button>
      <p>
        Changing findings clears effective acknowledgement. A clerical replacement keeps the
        original observation date and validity period.
      </p>
    </section>
  );
}
export function InspectionTracking({ id }: { id: string }) {
  const { ready, appointments, cancelBooking } = useDemo();
  const [stage, setStage] = useState<InspectionStage>('booked');
  if (!ready) return <p>Loading local booking…</p>;
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment)
    return (
      <EmptyState
        title="Booking not found"
        description="This booking is not saved in this browser."
        action={<ButtonLink href="/account/inspections">Return to inspections</ButtonLink>}
      />
    );
  return (
    <>
      <h1>{appointment.listingName}</h1>
      <Notice>
        Local presentation demo. No assignment, attendance or report state is authoritative.
      </Notice>
      <p>
        {formatShopDate(appointment.startsAt)} · Asia/Karachi · {appointment.status}
      </p>
      <p>Inspector: unassigned. Shop location and fee: owner configuration unavailable.</p>
      {appointment.status === 'booked' ? (
        <>
          <Select
            label="Presentation scenario (does not update booking)"
            value={stage}
            onChange={(e) => {
              const next = inspectionStages.find((value) => value === e.target.value);
              if (next) setStage(next);
            }}
          >
            {inspectionStages.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll('_', ' ')}
              </option>
            ))}
          </Select>
          <StatusTimeline stages={inspectionStages} current={stage} />
          {stage === 'awaiting_acknowledgement' && <FindingsAcknowledgement />}
          {['published', 'expired', 'revoked'].includes(stage) && (
            <>
              <p>Report scenario: {stage}. Present eligibility: unavailable in this demo.</p>
              <ButtonLink href="/inspections/demo-iphone-15-pro">
                Read illustrative report and history
              </ButtonLink>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm('Cancel only this local demo booking?')) cancelBooking(id);
            }}
          >
            Cancel demo booking
          </Button>
        </>
      ) : (
        <p>This local booking is cancelled. No real appointment was affected.</p>
      )}
    </>
  );
}
