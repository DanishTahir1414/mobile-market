'use client';
import Link from 'next/link';
import { PhotoGallery } from '@/components/listings/photo-gallery';
import { CatalogEditor, ApprovalGates } from './detail-workflows';
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
export function StaffOverview() {
  return (
    <>
      <PageHeading
        eyebrow="THE SHOP WORKSPACE"
        title="A clear view of the day."
        description="Moderation, appointments and inspection work in one place."
      />
      <Notice>
        Staff interface preview. No permissions are granted by this URL. Real access must be
        authorized by the backend.
      </Notice>
      <div className="stats-grid">
        {[
          { label: 'Sample review queue', value: '3', Icon: ClipboardCheck },
          { label: 'Demo appointments', value: '2', Icon: CalendarDays },
          { label: 'Sample reports', value: '1', Icon: ShieldCheck },
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
          [
            '/staff/reports',
            'Review sample findings',
            'Check acknowledgement, fee and revision gates.',
          ],
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
  const [brand, setBrand] = useState('');
  const queue = demoListings.filter((listing) => listing.status === 'published');
  return (
    <>
      <PageHeading
        title="Listing moderation"
        description="A careful review before a listing reaches the marketplace."
      />
      <Notice>
        Sample queue. Decisions are unavailable until backend authorization is connected.
      </Notice>
      <div className="panel">
        <Select label="Queue brand filter" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All brands</option>
          {Object.keys(catalog).map((value) => (
            <option key={value}>{value}</option>
          ))}
        </Select>
        {!queue.some((listing) => !brand || listing.brand === brand) && (
          <EmptyState
            title="No sample listings in this queue"
            description="Choose another brand or clear the filter."
          />
        )}
        {queue
          .filter((listing) => !brand || listing.brand === brand)
          .map((l) => (
            <div className="list-row" key={l.id}>
              <div>
                <span className="status-label">Sample · awaiting review</span>
                <h3>{l.model}</h3>
                <p>
                  {formatPrice(l.price)} · {l.city}
                </p>
              </div>
              <ButtonLink variant="secondary" href={`/staff/moderation/${l.id}`}>
                Review details
              </ButtonLink>
            </div>
          ))}
      </div>
    </>
  );
}
export function ModerationDetail({ id }: { id: string }) {
  const [stale, setStale] = useState(false);
  const l = demoListings.find((x) => x.id === id);
  const { notify } = useDemo();
  if (!l)
    return (
      <EmptyState title="Sample listing not found" description="Go back to the review queue." />
    );
  return (
    <>
      <PageHeading
        title={`Review ${l.model}`}
        description="Keep seller declarations separate from shop inspection observations."
      />
      <PhotoGallery photos={l.photos || []} label={l.model} />
      <Notice>
        Reviewing sample listing revision 1, device revision 1. Decisions do not update inventory.
      </Notice>
      <Button variant="secondary" onClick={() => setStale(true)}>
        Demonstrate newer revision conflict
      </Button>
      {stale && (
        <Notice>
          Conflict: revision 2 is now the sample current revision. Reload the review before
          deciding.
        </Notice>
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
            notify('Decision preview only. The listing was not changed.');
          }}
        >
          <Select label="Decision" required>
            <option value="">Choose decision</option>
            <option>Approve</option>
            <option>Reject</option>
            <option>Request changes</option>
          </Select>
          <Textarea label="Review reason" required minLength={5} />
          <Button disabled={stale}>Preview decision</Button>
        </form>
      </div>
    </>
  );
}
export function AppointmentCalendar() {
  const { appointments } = useDemo();
  const dateGroups = Map.groupBy(
    [...appointments].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    (appointment) =>
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(
        new Date(appointment.startsAt),
      ),
  );
  return (
    <>
      <PageHeading
        title="Shop appointments"
        description="Physical visits, assigned inspectors and attendance."
      />
      <Notice>
        Only locally created demo appointments appear here. Assignment and no-show recording need
        the backend.
      </Notice>
      {appointments.length ? (
        <div className="panel">
          {Array.from(dateGroups, ([date, bookings]) => (
            <section key={date}>
              <h2>{date} · Asia/Karachi</h2>
              {bookings.map((appointment) => (
                <div className="list-row" key={appointment.id}>
                  <div>
                    <h3>
                      <Link href={`/staff/appointments/${appointment.id}`}>
                        {appointment.listingName}
                      </Link>
                    </h3>
                    <p>
                      {new Intl.DateTimeFormat('en-PK', {
                        timeZone: 'Asia/Karachi',
                        timeStyle: 'short',
                      }).format(new Date(appointment.startsAt))}{' '}
                      · {appointment.status}
                    </p>
                  </div>
                  <ButtonLink href={`/staff/appointments/${appointment.id}`} variant="secondary">
                    Appointment detail
                  </ButtonLink>
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No demo appointments"
          description="Use the local booking flow to explore the calendar."
          action={
            <ButtonLink href="/account/inspections/book" variant="secondary">
              Create demo booking
            </ButtonLink>
          }
        />
      )}
    </>
  );
}
export function InspectionBench() {
  const [dirty, setDirty] = useState(false),
    [identity, setIdentity] = useState('');
  const { notify } = useDemo();
  const [results, setResults] = useState<Record<string, string>>({});
  return (
    <>
      <PageHeading
        title="Inspection bench"
        description="Record what you observe. Be clear about what you could not test."
      />
      <Notice>
        Sample checklist only. Do not enter real IMEI, serial numbers or private evidence. Findings
        are not transmitted or persisted.
      </Notice>
      <form
        className="form-card"
        onChange={() => setDirty(true)}
        onSubmit={(e) => {
          e.preventDefault();
          if (identity !== 'Match observed' || results['Device identity'] !== 'pass') {
            notify('Identity mismatch or missing identity pass blocks submission.');
            return;
          }
          notify('Sample checklist validated. Findings were not saved to a report.');
        }}
      >
        <p role="status">
          {dirty
            ? 'Unsaved checklist; findings remain in this page only.'
            : 'No checklist changes.'}
        </p>
        <Input
          label="Assigned device context · device revision 1 · assignment unavailable"
          defaultValue="Sample iPhone 15 Pro"
          readOnly
        />
        <Select
          label="Device identity matches listing"
          required
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
        >
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
        <Button>Validate sample checklist</Button>
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
      <ApprovalGates />
      <Notice>Sample report only. No report can be issued or revoked by this frontend.</Notice>
      <div className="panel">
        <h2>iPhone 15 Pro · sample findings</h2>
        <dl className="spec-grid">
          {[
            ['Findings revision', '1'],
            ['Seller acknowledgement', 'Not received'],
            ['Inspection fee', 'Not recorded'],
            ['Distinct approver', 'Backend check required'],
            ['Device revision match', 'Backend check required'],
            ['Observation date', 'Sample only'],
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
      <ButtonLink href="/staff/team/demo" variant="secondary">
        Open illustrative staff detail and permissions
      </ButtonLink>
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
      <Notice>
        Read-only sample catalog. Catalog edits require authorized backend validation.
      </Notice>
      <Select label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
        {Object.keys(catalog).map((b) => (
          <option key={b}>{b}</option>
        ))}
      </Select>
      <CatalogEditor />
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
                  <span className="status-label">Sample active</span>
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
  const [dirty, setDirty] = useState(false),
    [policy, setPolicy] = useState(
      'Inspection is a dated condition observation, not a warranty. Final policy requires owner review.',
    );
  const { notify } = useDemo();
  return (
    <>
      <PageHeading
        title="Shop settings"
        description="Branding, location and the policies customers see."
      />
      <Notice>Settings below are editable form previews. Nothing is saved or published.</Notice>
      <p role="status">
        {dirty ? 'Unsaved settings proposal. Backend saving unavailable.' : 'No settings changes.'}
      </p>
      <section className="panel">
        <h2>Draft inspection policy preview</h2>
        <p>{policy}</p>
      </section>
      <form
        className="form-card"
        onChange={() => setDirty(true)}
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
          value={policy}
          onChange={(e) => setPolicy(e.target.value)}
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
      <ButtonLink href="/staff/abuse/demo" variant="secondary">
        Open illustrative report and resolution form
      </ButtonLink>
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
