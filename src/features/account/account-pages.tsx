'use client';
import Link from 'next/link';
import { FindingsAcknowledgement } from './inspection-tracking';
import { ListingActions } from './listing-actions';
import { listingStatuses } from '@/lib/listing-lifecycle';
import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Heart, Smartphone, ShieldCheck, Trash2 } from 'lucide-react';
import { useDemo } from '@/components/demo-provider';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState, Notice } from '@/components/ui/empty-state';
import { Input, Select } from '@/components/ui/field';
import { PageHeading } from '@/components/ui/page-heading';
import { ListingGrid } from '@/components/listings/listing-grid';
import { demoListings } from '@/lib/demo-data';
import { formatPrice, formatShopDate } from '@/lib/format';
export function AccountOverview() {
  const { drafts, favorites, appointments } = useDemo();
  return (
    <>
      <PageHeading
        eyebrow="GOOD TO SEE YOU"
        title="Your phone stories, in one place."
        description="Pick up a draft, check an appointment or revisit a favorite."
        action={
          <ButtonLink href="/sell">
            Create listing <ArrowUpRight size={16} />
          </ButtonLink>
        }
      />
      <div className="stats-grid">
        {[
          { label: 'Your drafts', value: drafts.length, Icon: Smartphone },
          { label: 'Saved phones', value: favorites.length, Icon: Heart },
          {
            label: 'Appointments',
            value: appointments.filter((a) => a.status === 'booked').length,
            Icon: CalendarDays,
          },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <s.Icon size={21} />
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <Notice>
        This is a local demo workspace. No account is signed in. Your saved phones and drafts stay
        in this browser.
      </Notice>
      <div className="panel">
        <div className="section-heading">
          <h2>Your latest listings</h2>
          <Link href="/account/listings" className="text-link">
            View all <ArrowUpRight size={15} />
          </Link>
        </div>
        {drafts.length ? (
          drafts.slice(0, 3).map((d) => (
            <div className="list-row" key={d.id}>
              <div>
                <strong>{d.model || 'Untitled phone'}</strong>
                <p>
                  {d.status.replace('_', ' ')} · {formatPrice(Number(d.price) || 0)}
                </p>
              </div>
              <Link className="text-link" href={`/account/listings/${d.id}/edit`}>
                Continue editing <ArrowUpRight size={15} />
              </Link>
            </div>
          ))
        ) : (
          <EmptyState
            title="Your next listing starts here"
            description="A few honest details and clear photos are all it takes."
            action={
              <ButtonLink href="/sell" variant="secondary">
                Create your first listing
              </ButtonLink>
            }
          />
        )}
      </div>
      <div className="mini-feature">
        <ShieldCheck size={28} />
        <div>
          <h3>Want a closer look at your phone?</h3>
          <p>Explore an optional in-shop inspection before selling.</p>
        </div>
        <ButtonLink href="/account/inspections/book" variant="secondary">
          Book a demo slot
        </ButtonLink>
      </div>
    </>
  );
}
export function MyListings() {
  const { drafts, removeDraft, notify } = useDemo();
  const [tab, setTab] = useState('all');
  const visible = drafts.filter((d) => tab === 'all' || d.status === tab);
  return (
    <>
      <PageHeading
        title="My listings"
        description="Your drafts, their details and what comes next."
        action={<ButtonLink href="/sell">New listing</ButtonLink>}
      />
      <Notice>
        Local lifecycle simulations only. No real listing is submitted or moderated.{' '}
        <Link href="/mobiles/sample-sold">View sold example</Link>,{' '}
        <Link href="/mobiles/sample-withdrawn">withdrawn</Link>,{' '}
        <Link href="/mobiles/sample-expired">expired</Link>,{' '}
        <Link href="/mobiles/sample-suspended">suspended</Link>.
      </Notice>
      <div className="tabs" aria-label="Listing status filters">
        {['all', ...listingStatuses].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t.replace('_', ' ')}
            {t === 'all' && ` (${drafts.length})`}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="panel">
          {visible.map((d) => (
            <div className="list-row" key={d.id}>
              <div>
                <span className="status-label">{d.status}</span>
                <h3>{d.model || 'Untitled phone'}</h3>
                <p>
                  {formatPrice(Number(d.price) || 0)} · {d.city}
                </p>
              </div>
              <div className="row-actions">
                <ListingActions draft={d} />
                <Button
                  variant="ghost"
                  aria-label={`Delete ${d.model || 'draft'}`}
                  onClick={() => {
                    if (window.confirm('Delete this local draft?')) {
                      removeDraft(d.id);
                      notify('Local draft removed.');
                    }
                  }}
                >
                  <Trash2 size={17} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing here yet"
          description="Create a local draft to start putting your listing together."
          action={<ButtonLink href="/sell">Create listing</ButtonLink>}
        />
      )}
    </>
  );
}
export function Favorites() {
  const { favorites } = useDemo();
  return (
    <>
      <PageHeading title="A few favorites." description="The phones you’d like to come back to." />
      {favorites.length ? (
        <ListingGrid listings={demoListings.filter((l) => favorites.includes(l.id))} />
      ) : (
        <EmptyState
          title="Keep a good phone in mind"
          description="Tap the heart on any listing to save it here."
          action={<ButtonLink href="/mobiles">Explore phones</ButtonLink>}
        />
      )}
    </>
  );
}
export function Inspections() {
  const { appointments, cancelBooking } = useDemo();
  return (
    <>
      <PageHeading
        title="My inspections"
        description="A clearer view of your device, one visit at a time."
        action={<ButtonLink href="/account/inspections/book">Choose a demo slot</ButtonLink>}
      />
      <Notice>Demo bookings are stored locally and do not reserve a real shop appointment.</Notice>
      {appointments.length ? (
        <div className="panel">
          {appointments.map((a) => (
            <div className="list-row" key={a.id}>
              <div>
                <span className="status-label">{a.status} · local demo</span>
                <h3>
                  <Link href={`/account/inspections/${a.id}`}>{a.listingName}</Link>
                </h3>
                <p>{formatShopDate(a.startsAt)}</p>
              </div>
              {a.status === 'booked' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (window.confirm('Cancel this demo booking?')) cancelBooking(a.id);
                  }}
                >
                  Cancel demo booking
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No visits on your calendar"
          description="Explore inspection first, or try the booking interface."
          action={
            <ButtonLink href="/how-inspection-works" variant="secondary">
              About inspection
            </ButtonLink>
          }
        />
      )}
    </>
  );
}
export function Booking() {
  const { drafts, book, notify } = useDemo();
  const [date, setDate] = useState(''),
    [slot, setSlot] = useState(''),
    [listing, setListing] = useState(''),
    [accepted, setAccepted] = useState(false),
    [error, setError] = useState('');
  return (
    <>
      <PageHeading
        title="A closer look, in person."
        description="Choose a demo time to explore the inspection booking flow."
      />
      <Notice>
        No real slot is reserved. Shop hours, address and fees need owner configuration.
      </Notice>
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          if (!date || !slot || !listing || !accepted) {
            setError('Choose a listing, date and time, then accept the draft policy.');
            return;
          }
          const startsAt = `${date}T${slot}:00+05:00`;
          if (new Date(startsAt).getTime() <= Date.now()) {
            setError('Choose a future date and time.');
            return;
          }
          if (
            !book({
              id: crypto.randomUUID(),
              listingName: listing,
              startsAt,
              status: 'booked',
            })
          ) {
            setError('That slot already has a local demo booking.');
            return;
          }
          notify('Demo appointment saved locally. No real booking was made.');
          setSlot('');
        }}
      >
        <Select label="Phone" value={listing} onChange={(e) => setListing(e.target.value)} required>
          <option value="">Choose a phone</option>
          {drafts.map((d) => (
            <option key={d.id}>{d.model || 'Untitled draft'}</option>
          ))}
          <option>Sample iPhone 15 Pro</option>
        </Select>
        <Input
          label="Preferred date"
          type="date"
          min={new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Karachi',
          }).format(new Date())}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <fieldset className="slot-fieldset">
          <legend>Time · Asia/Karachi</legend>
          <div className="slot-grid">
            {['11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((s) => (
              <button
                key={s}
                type="button"
                className={slot === s ? 'selected' : ''}
                onClick={() => setSlot(s)}
                aria-pressed={slot === s}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I have read the <Link href="/inspection-policy">draft inspection policy</Link>.
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <Button>Save demo appointment</Button>
      </form>
    </>
  );
}
export function Profile() {
  const { notify } = useDemo();
  return (
    <>
      <PageHeading title="Your profile" description="The details that make it yours." />
      <Notice>
        Profile updates require a connected backend. This form validates locally and does not save
        personal information.
      </Notice>
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          notify('Form validated. Profile saving is unavailable until the backend is connected.');
        }}
      >
        <Input label="Display name" required maxLength={100} placeholder="Your name" />
        <Input label="Email address" type="email" required placeholder="you@example.com" />
        <Input label="Phone number" type="tel" placeholder="+92" />
        <Button>Check profile details</Button>
        <p className="field__hint">
          Phone ownership verification is available from the security screen once connected.
        </p>
      </form>
    </>
  );
}
export function Security() {
  return (
    <>
      <PageHeading
        title="Keep your account yours."
        description="Passwords, verification and sign-in protection."
      />
      <Notice>
        There is no authenticated session in this frontend demo. Passwords and verification codes
        are never saved locally.
      </Notice>
      <div className="panel">
        <div className="list-row">
          <div>
            <h3>Password</h3>
            <p>Use a unique passphrase of at least 15 characters.</p>
          </div>
          <ButtonLink href="/forgot-password" variant="secondary">
            Password recovery
          </ButtonLink>
        </div>
        <div className="list-row">
          <div>
            <h3>Phone verification</h3>
            <p>Required before posting a real ad.</p>
          </div>
          <ButtonLink href="/verify-phone" variant="secondary">
            Verify phone
          </ButtonLink>
        </div>
        <div className="list-row">
          <div>
            <h3>Active sessions</h3>
            <p>Review and revoke connected devices.</p>
          </div>
          <ButtonLink href="/account/sessions" variant="secondary">
            Review sessions
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
export function Sessions() {
  return (
    <>
      <PageHeading
        title="Active sessions"
        description="See where you’re signed in and stay in control."
      />
      <EmptyState
        title="No connected sessions"
        description="Session details and revocation become available after backend authentication is connected."
        action={
          <ButtonLink href="/login" variant="secondary">
            Go to sign in
          </ButtonLink>
        }
      />
    </>
  );
}
export function Notifications() {
  return (
    <>
      <PageHeading
        title="Your updates"
        description="Listing activity, inspection reminders and account notices."
      />
      <EmptyState
        title="You’re all caught up"
        description="There are no real notifications in this frontend preview."
      />
    </>
  );
}
export function Acknowledgement() {
  return (
    <>
      <PageHeading
        title="Review inspection findings"
        description="Local exact-revision acknowledgement demonstration."
      />
      <Notice>No real acknowledgement is submitted or persisted.</Notice>
      <FindingsAcknowledgement />
    </>
  );
}
