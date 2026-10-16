'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDemo } from '@/components/demo-provider';
import { Button, ButtonLink } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, Notice } from '@/components/ui/empty-state';
import { Input, Select, Textarea } from '@/components/ui/field';
import { formatShopDate } from '@/lib/format';
import { approvalBlocks, sampleFindings } from '@/lib/inspection-workflow';

export function AppointmentDetail({ id }: { id: string }) {
  const { ready, appointments } = useDemo();
  const [feedback, setFeedback] = useState('');
  if (!ready) return <p>Loading local schedule…</p>;
  const appointment = appointments.find((item) => item.id === id);
  if (!appointment)
    return (
      <EmptyState
        title="Appointment not found"
        description="No local booking matches this reference."
      />
    );
  return (
    <>
      <h1>Appointment detail</h1>
      <Notice>
        Presentation only. Staff assignment and attendance require backend authorization.
      </Notice>
      <section className="panel">
        <h2>{appointment.listingName}</h2>
        <p>
          {formatShopDate(appointment.startsAt)} · Asia/Karachi · {appointment.status}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFeedback(
              'Details validated locally. Assignment and attendance recording unavailable; no appointment changed.',
            );
          }}
        >
          <Select label="Inspector assignment">
            <option>Unassigned</option>
            <option>Illustrative inspector A (not a real staff identity)</option>
          </Select>
          <Select label="Proposed attendance" required>
            <option value="">Choose status</option>
            <option>Check in</option>
            <option>No show</option>
            <option>Cancelled</option>
          </Select>
          <Textarea label="Attendance or cancellation reason" required minLength={5} />
          <Button>Validate attendance preview</Button>
        </form>
        <p role="status">{feedback}</p>
        <p>
          Slot conflicts: real capacity and concurrent bookings unavailable. Refresh from the future
          booking service before assigning.
        </p>
        <ButtonLink href="/staff/inspections/demo">Open sample bench</ButtonLink>
      </section>
    </>
  );
}
export function AbuseDetail() {
  const [feedback, setFeedback] = useState('');
  return (
    <section className="panel">
      <h2>Illustrative abuse report · demo-1</h2>
      <Notice>
        No real complaint, seller or reporter is represented. Resolution is unavailable without
        authorized services.
      </Notice>
      <p>
        Concern: sample listing description may conflict with photographs. Evidence: public listing
        content only. Private reporter details restricted.
      </p>
      <ButtonLink href="/mobiles/iphone-15-pro" variant="secondary">
        Inspect sample listing
      </ButtonLink>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFeedback('Resolution preview validated. Nothing resolved or sent.');
        }}
      >
        <Select label="Resolution" required>
          <option value="">Choose resolution</option>
          <option>No action</option>
          <option>Request listing changes</option>
          <option>Escalate for suspension review</option>
        </Select>
        <Textarea label="Required resolution reason" required minLength={10} />
        <Button>Validate resolution preview</Button>
      </form>
      <p role="status">{feedback}</p>
    </section>
  );
}
export function StaffDetail() {
  const [confirm, setConfirm] = useState(false),
    [feedback, setFeedback] = useState('');
  return (
    <section className="panel">
      <h2>Illustrative staff member A</h2>
      <Notice>
        Insufficient permission: no authenticated staff identity. Controls edit a presentation
        proposal only and never grant access.
      </Notice>
      <p>Status: sample active · MFA: backend verification required.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFeedback('Permission proposal checked. Saving requires authorized backend access.');
        }}
      >
        <fieldset>
          <legend>Proposed permission editor</legend>
          {['Moderate listings', 'Inspect assigned devices', 'Approve reports', 'Manage staff'].map(
            (permission) => (
              <label className="checkbox-label" key={permission}>
                <input type="checkbox" />
                {permission}
              </label>
            ),
          )}
        </fieldset>
        <Button>Check permission proposal</Button>
      </form>
      <Button variant="secondary" onClick={() => setConfirm(true)}>
        Preview suspension
      </Button>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Staff suspension preview">
        <p>
          Production suspension revokes access and sessions. Last active owner protection and
          current manager permission must be checked by Identity.
        </p>
        <Button
          onClick={() => {
            setConfirm(false);
            setFeedback('Suspension unavailable. No staff access changed.');
          }}
        >
          Confirm unavailable action preview
        </Button>
      </Dialog>
      <p role="status">{feedback}</p>
    </section>
  );
}
export function CatalogEditor() {
  const [feedback, setFeedback] = useState(''),
    [dirty, setDirty] = useState(false);
  return (
    <section className="panel">
      <h2>Catalog entry proposal</h2>
      <p role="status">{dirty ? 'Unsaved proposal in this page only' : 'No proposal changes'}</p>
      <form
        onChange={() => setDirty(true)}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const storage = String(data.get('storage'))
            .split(',')
            .map((value) => Number(value.trim()));
          setFeedback(
            storage.length > 0 &&
              storage.every((value) => Number.isInteger(value) && value > 0 && value <= 4096) &&
              new Set(storage).size === storage.length
              ? 'Proposal valid. Catalog saving unavailable; no entry changed.'
              : 'Use distinct positive storage sizes up to 4096 GB, separated by commas.',
          );
        }}
      >
        <Input name="brand" label="Brand name" required maxLength={80} />
        <Input name="model" label="Model name for this brand" required maxLength={100} />
        <Input
          name="storage"
          label="Storage sizes (GB, comma separated)"
          required
          placeholder="128, 256"
        />
        <Button>Validate catalog proposal</Button>
      </form>
      <p role="status">{feedback}</p>
      <p>
        Brand/model uniqueness and existing listing compatibility require authoritative catalog
        validation.
      </p>
    </section>
  );
}
export function ApprovalGates() {
  const blocks = approvalBlocks({
    acknowledged: false,
    feeSettled: false,
    deviceMatches: false,
    distinctApprover: false,
  });
  return (
    <section className="panel">
      <h2>Exact findings revision {sampleFindings.revision}</h2>
      <p>{sampleFindings.observations}</p>
      <p>Defects: {sampleFindings.defects}</p>
      <p>Limitations: {sampleFindings.limitations}</p>
      <h3>Approval blocked</h3>
      <ul>
        {blocks.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <p>
        Private evidence is restricted and unavailable. Authoritative approval also requires
        completed identity checks and current permissions.
      </p>
      <ButtonLink href="/account/inspections/acknowledge" variant="secondary">
        Review exact acknowledgement demonstration
      </ButtonLink>
      <p>
        Correction lineage:{' '}
        <Link href="/inspections/demo-iphone-15-pro">
          sample original and replacement presentation
        </Link>
        . Clerical changes retain the observation date and validity.
      </p>
    </section>
  );
}
