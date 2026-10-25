'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CalendarDays, ClipboardCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { demoListings, inspectionChecks } from '@/lib/demo-data';
import { catalog } from '@/lib/catalog';
import { Button, ButtonLink } from '@/components/ui/button';
import { PageHeading } from '@/components/ui/page-heading';
import { Notice, EmptyState } from '@/components/ui/empty-state';
import { Input, Select, Textarea } from '@/components/ui/field';
import { useDemo } from '@/components/demo-provider';
import { formatPrice } from '@/lib/format';
import { groupByShopDay } from '@/lib/appointments';
import { inspectionStages } from '@/lib/inspection-timeline';
import { reviewFlags } from '@/lib/moderation';
export function StaffOverview() {
  return (
    <>
      <PageHeading
        eyebrow="THE SHOP WORKSPACE"
        title="A clear view of the day."
        description="Moderation, appointments and inspection work in one place."
      />
      <div className="stats-grid">
        {[
          { label: 'Review queue', value: '3', Icon: ClipboardCheck },
          { label: 'Appointments', value: '2', Icon: CalendarDays },
          { label: 'Reports', value: '1', Icon: ShieldCheck },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <s.Icon size={21} />
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Start with what matters</h2>
        {[
          ['/staff/moderation', 'Review listing details', 'Check claims, photos and disclosures.'],
          [
            '/staff/appointments',
            'Prepare for a shop visit',
            'Review appointment and assignment screens.',
          ],
          [
            '/staff/inspections/demo',
            'Open the inspection bench',
            'Explore the grouped device checklist.',
          ],
          ['/staff/reports', 'Review findings', 'Check acknowledgement, fee and revision gates.'],
        ].map(([href, title, text]) => (
          <Link className="list-row linked-row" href={href} key={href}>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <ArrowRight size={18} />
          </Link>
        ))}
      </div>
    </>
  );
}
export function Moderation() {
  const [query, setQuery] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  // Oldest first, so nothing waits forever.
  const queue = [...demoListings]
    .sort((a, b) => a.listedAt.localeCompare(b.listedAt))
    .map((l) => ({ listing: l, flags: reviewFlags(l, demoListings) }))
    .filter(
      ({ listing, flags }) =>
        `${listing.brand} ${listing.model} ${listing.city}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (!flaggedOnly || flags.length > 0),
    );
  return (
    <>
      <PageHeading
        title="Listing moderation"
        description="A careful review before a listing reaches the marketplace."
      />
      <div className="browse-toolbar">
        <Input
          label="Search the queue"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Model, brand or city"
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => setFlaggedOnly(e.target.checked)}
          />
          Only ads with flags
        </label>
      </div>
      <p className="muted">
        {queue.length} of {demoListings.length} ads, oldest first
      </p>
      <div className="panel">
        {queue.slice(0, 12).map(({ listing: l, flags }) => (
          <div className="list-row" key={l.id}>
            <div>
              <span className="status-label">Awaiting review</span>
              <h3>{l.model}</h3>
              <p>
                {formatPrice(l.price)} · {l.city} · {l.storage} GB
              </p>
              {flags.length > 0 && (
                <p className="tiny-text">
                  {flags.length} {flags.length === 1 ? 'flag' : 'flags'}: {flags[0]}
                </p>
              )}
            </div>
            <ButtonLink variant="secondary" href={`/staff/moderation/${l.id}`}>
              Review details
            </ButtonLink>
          </div>
        ))}
        {queue.length === 0 && <p>No ads match.</p>}
      </div>
    </>
  );
}
export function ModerationDetail({ id }: { id: string }) {
  const l = demoListings.find((x) => x.id === id);
  const { notify } = useDemo();
  const [checked, setChecked] = useState<string[]>([]);
  const [decision, setDecision] = useState('');
  if (!l)
    return <EmptyState title="Listing not found" description="Go back to the review queue." />;
  const flags = reviewFlags(l, demoListings);
  const checks = [
    'Photos are clear and show the real phone',
    'Price and details look believable',
    'No phone number or link is hidden in the text',
  ];
  const allChecked = checked.length === checks.length;
  return (
    <>
      <PageHeading
        title={`Review ${l.model}`}
        description="Keep seller declarations separate from shop inspection observations."
      />
      {flags.length > 0 && (
        <div className="panel" role="note" aria-label="Review flags">
          <h2>Look closely at</h2>
          <ul>
            {flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="panel">
        <dl className="spec-grid">
          {[
            ['Model', l.model],
            ['Price', formatPrice(l.price)],
            ['PTA claim', l.pta],
            ['Repair disclosure', l.repairs],
            ['Defects', l.defects],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p>{l.description}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            notify('Decision checked.');
          }}
        >
          <fieldset className="check-group">
            <legend>Before approving, confirm</legend>
            {checks.map((c) => (
              <label className="checkbox-label" key={c}>
                <input
                  type="checkbox"
                  checked={checked.includes(c)}
                  onChange={(e) =>
                    setChecked((cur) =>
                      e.target.checked ? [...cur, c] : cur.filter((x) => x !== c),
                    )
                  }
                />
                {c}
              </label>
            ))}
          </fieldset>
          <Select
            label="Decision"
            required
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            hint={
              decision === 'Approve' && !allChecked ? 'Tick every check to approve.' : undefined
            }
          >
            <option value="">Choose decision</option>
            <option>Approve</option>
            <option>Reject</option>
            <option>Request changes</option>
          </Select>
          <Textarea label="Review reason (shown to the seller)" required minLength={5} />
          <Button disabled={decision === 'Approve' && !allChecked}>Preview decision</Button>
        </form>
      </div>
    </>
  );
}
export function AppointmentCalendar() {
  const { appointments } = useDemo();
  const [filter, setFilter] = useState<'all' | 'booked' | 'cancelled'>('all');
  const shown = appointments.filter((a) => filter === 'all' || a.status === filter);
  const days = groupByShopDay(shown);
  return (
    <>
      <PageHeading
        title="Shop appointments"
        description="Physical visits by day, in shop time (Asia/Karachi)."
      />
      <div className="tabs" role="tablist" aria-label="Appointment status">
        {(['all', 'booked', 'cancelled'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={filter === t} onClick={() => setFilter(t)}>
            {t === 'all' ? 'All' : t[0].toUpperCase() + t.slice(1)} (
            {t === 'all' ? appointments.length : appointments.filter((a) => a.status === t).length})
          </button>
        ))}
      </div>
      {days.length ? (
        days.map((day) => (
          <section className="panel" key={day.key} aria-label={day.label}>
            <h2 className="day-heading">{day.label}</h2>
            {day.items.map((a) => (
              <div className="list-row" key={a.id}>
                <div>
                  <span className="status-label">{a.status}</span>
                  <h3>{a.listingName}</h3>
                  <p>
                    {new Intl.DateTimeFormat('en-PK', {
                      timeZone: 'Asia/Karachi',
                      timeStyle: 'short',
                    }).format(new Date(a.startsAt))}
                    {a.status === 'booked' &&
                      ` · ${inspectionStages.find((s) => s.key === (a.stage ?? 'booked'))?.label}`}
                  </p>
                </div>
                {a.status === 'booked' && (
                  <ButtonLink href="/staff/inspections/demo" variant="secondary">
                    Open checklist
                  </ButtonLink>
                )}
              </div>
            ))}
          </section>
        ))
      ) : (
        <EmptyState
          title="No appointments here"
          description="Use the local booking flow to explore the calendar."
          action={
            <ButtonLink href="/account/inspections/book" variant="secondary">
              Create booking
            </ButtonLink>
          }
        />
      )}
    </>
  );
}
export function InspectionBench() {
  const { notify } = useDemo();
  const [results, setResults] = useState<Record<string, string>>({});
  return (
    <>
      <PageHeading
        title="Inspection bench"
        description="Record what you observe. Be clear about what you could not test."
      />
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          notify('Checklist checked.');
        }}
      >
        <Input label="Listing reference" defaultValue="iPhone 15 Pro" readOnly />
        <Select label="Device identity matches listing" required>
          <option value="">Choose an observation</option>
          <option>Match observed</option>
          <option>Mismatch observed</option>
        </Select>
        {inspectionChecks.map(([key]) => (
          <div className="checklist-item" key={key}>
            <div className="checklist-item__heading">
              <h3>{key}</h3>
              <select
                aria-label={`${key} result`}
                required
                value={results[key] || ''}
                onChange={(e) => setResults((r) => ({ ...r, [key]: e.target.value }))}
              >
                <option value="">Select result</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="not_tested">Not tested</option>
                <option value="not_applicable">Not applicable</option>
              </select>
            </div>
            <Textarea
              label={`${key} notes`}
              required={results[key] === 'not_tested' || results[key] === 'fail'}
              placeholder={
                results[key] === 'not_tested'
                  ? 'Explain the testing limitation.'
                  : 'Record clear observations.'
              }
            />
            {key === 'PTA observation' && (
              <div className="form-grid">
                <Input label="PTA checking method" required />
                <Input label="PTA observation time" type="datetime-local" required />
              </div>
            )}
          </div>
        ))}
        <Textarea label="Summary and testing limitations" required />
        <div className="evidence-placeholder">
          <ShieldCheck size={22} />
          <div>
            <h3>Private evidence</h3>
            <p>
              Upload and restricted evidence viewing are unavailable without authorized backend
              storage.
            </p>
          </div>
        </div>
        <Button>Validate checklist</Button>
      </form>
    </>
  );
}
export function ReportReview() {
  const { notify } = useDemo();
  return (
    <>
      <PageHeading
        title="Report review & approval"
        description="A second person. An exact revision. A considered decision."
      />
      <div className="panel">
        <h2>iPhone 15 Pro · findings</h2>
        <dl className="spec-grid">
          {[
            ['Findings revision', '1'],
            ['Seller acknowledgement', 'Not received'],
            ['Inspection fee', 'Not recorded'],
            ['Distinct approver', 'Backend check required'],
            ['Device revision match', 'Backend check required'],
            ['Observation date', '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          Published findings must be immutable. Corrections create a linked replacement and retain
          the original observation date.
        </p>
        <Button disabled title="Backend and all approval gates are required">
          Approval unavailable
        </Button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            notify('Revocation preview only. No report was changed.');
          }}
        >
          <Textarea label="Revocation or correction reason" required minLength={10} />
          <Button variant="secondary">Preview correction request</Button>
        </form>
      </div>
    </>
  );
}
export function Fees() {
  const { notify } = useDemo();
  return (
    <>
      <PageHeading
        title="Inspection fees"
        description="Record offline settlement without an online checkout."
      />
      <Notice>Preview only. This form does not record a payment or change an inspection.</Notice>
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          notify('Fee form validated. No financial record was created.');
        }}
      >
        <Input label="Inspection reference" required />
        <Select label="Fee state" required>
          <option value="">Choose state</option>
          <option>Paid manually</option>
          <option>Waived</option>
          <option>Unpaid</option>
        </Select>
        <Input label="Amount received (PKR)" type="number" min={0} required />
        <Textarea label="Recording note" required />
        <Button>Validate fee entry</Button>
      </form>
    </>
  );
}
export function Team() {
  return (
    <>
      <PageHeading
        title="Staff & permissions"
        description="Explicit grants, invitation-only access and staff MFA."
      />
      <Notice>
        Invitations, permission changes and suspension require a recently authenticated manager.
        This preview never sends invitations.
      </Notice>
      <form className="form-card" onSubmit={(e) => e.preventDefault()}>
        <Input label="Invitation email" type="email" placeholder="staff@example.com" />
        <fieldset>
          <legend>Proposed permissions</legend>
          {[
            'Listing moderation',
            'Assigned inspections',
            'Report approval',
            'Fee recording',
            'Shop configuration',
            'Staff management',
          ].map((p) => (
            <label className="checkbox-label" key={p}>
              <input type="checkbox" />
              {p}
            </label>
          ))}
        </fieldset>
        <Button disabled>Sending invitations unavailable</Button>
      </form>
    </>
  );
}
export function Catalog() {
  const [brand, setBrand] = useState('Apple');
  return (
    <>
      <PageHeading title="Phone catalog" description="Valid brands, models and storage choices." />
      <Select label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
        {Object.keys(catalog).map((b) => (
          <option key={b}>{b}</option>
        ))}
      </Select>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Storage options</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {catalog[brand].map((m) => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td>{m.storage.map((s) => `${s} GB`).join(', ')}</td>
                <td>
                  <span className="status-label">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function ShopSettings() {
  const { notify } = useDemo();
  return (
    <>
      <PageHeading
        title="Shop settings"
        description="Branding, location and the policies customers see."
      />
      <Notice>Settings below are editable form previews. Nothing is saved or published.</Notice>
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          notify('Settings validated. Nothing was saved or published.');
        }}
      >
        <Input label="Shop name" defaultValue="Mobile Market" required />
        <Input label="Shop city" defaultValue="Karachi" required />
        <Textarea label="Shop address" placeholder="Owner to configure" required />
        <Input label="Shop contact number" type="tel" />
        <Input label="Inspection fee (PKR)" type="number" min={0} defaultValue={0} />
        <Input label="Display timezone" value="Asia/Karachi" readOnly />
        <Textarea
          label="Inspection policy · owner-review draft"
          defaultValue="Inspection is a dated condition observation, not a warranty. Validity, cancellations and refunds need owner review."
        />
        <Textarea
          label="Terms · owner-review draft"
          defaultValue="Buyers and sellers negotiate, meet and pay independently. No online device purchase or delivery is offered."
        />
        <Textarea
          label="Privacy · owner-review draft"
          defaultValue="Contact details are disclosed with seller consent. Final retention and privacy terms require owner review."
        />
        <Button>Validate settings preview</Button>
      </form>
    </>
  );
}
export function AbuseQueue() {
  return (
    <>
      <PageHeading
        title="Abuse reports"
        description="Review concerns and record clear resolutions."
      />
      <EmptyState
        title="No connected reports"
        description="Reports and resolution actions will appear when the backend is integrated."
      />
    </>
  );
}
export function AuditHistory() {
  return (
    <>
      <PageHeading title="Audit history" description="A redacted record of privileged actions." />
      <EmptyState
        title="No audit source connected"
        description="Local UI interactions do not represent authoritative security audit records."
      />
    </>
  );
}
