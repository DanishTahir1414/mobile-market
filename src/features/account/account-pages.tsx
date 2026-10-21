'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Heart, Smartphone, ShieldCheck, Trash2 } from 'lucide-react';
import { useDemo } from '@/components/demo-provider';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState, Notice } from '@/components/ui/empty-state';
import { Input, Select } from '@/components/ui/field';
import { PageHeading } from '@/components/ui/page-heading';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Dialog } from '@/components/ui/dialog';
import { demoListings } from '@/lib/demo-data';
import {
  actionLabels,
  isEditable,
  needsConfirmation,
  sellerActions,
  statusHelp,
  statusLabels,
  type SellerAction,
} from '@/lib/listing-lifecycle';
import type { ListingStatus } from '@/lib/types';
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
                  {statusLabels[d.status]} · {formatPrice(Number(d.price) || 0)}
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
const listingTabs: (ListingStatus | 'all')[] = [
  'all',
  'draft',
  'pending_review',
  'published',
  'rejected',
  'sold',
  'withdrawn',
];

export function MyListings() {
  const { drafts, removeDraft, changeListingStatus, notify } = useDemo();
  const [tab, setTab] = useState<ListingStatus | 'all'>('all');
  const [confirming, setConfirming] = useState<{ id: string; action: SellerAction } | null>(null);
  const visible = drafts.filter((d) => tab === 'all' || d.status === tab);
  const target = drafts.find((d) => d.id === confirming?.id);

  const run = (id: string, action: SellerAction) => {
    if (!changeListingStatus(id, action)) return;
    // These statuses live only in this browser; say so rather than imply the shop was told.
    notify(
      action === 'submit' || action === 'resubmit'
        ? 'Marked as submitted on this device only. Nothing was sent to the shop yet.'
        : `${actionLabels[action]} applied on this device only.`,
    );
  };

  return (
    <>
      <PageHeading
        title="My listings"
        description="Your ads, where each one stands and what you can do next."
        action={<ButtonLink href="/sell">New listing</ButtonLink>}
      />
      <Notice>
        Statuses here are saved in this browser only. Going live needs shop review, which is not
        connected yet.
      </Notice>
      <div className="tabs" role="tablist" aria-label="Listing status">
        {listingTabs.map((t) => {
          const count = t === 'all' ? drafts.length : drafts.filter((d) => d.status === t).length;
          return (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : statusLabels[t]} ({count})
            </button>
          );
        })}
      </div>
      {visible.length ? (
        <div className="panel">
          {visible.map((d) => {
            const actions = sellerActions(d.status);
            return (
              <div className="list-row" key={d.id}>
                <div>
                  <span className={`status-label status-label--${d.status}`}>
                    {statusLabels[d.status]}
                  </span>
                  <h3>{d.model || 'Untitled phone'}</h3>
                  <p>
                    {formatPrice(Number(d.price) || 0)} · {d.city}
                  </p>
                  <p className="tiny-text">{statusHelp[d.status]}</p>
                  {d.status !== 'sold' && d.status !== 'withdrawn' && (
                    <p className="tiny-text">
                      Shop verification is optional.{' '}
                      <Link href="/account/inspections/book">Get a Shop inspected badge</Link> to
                      help buyers trust your ad.
                    </p>
                  )}
                </div>
                <div className="row-actions">
                  {isEditable(d.status) && (
                    <ButtonLink href={`/account/listings/${d.id}/edit`} variant="secondary">
                      Edit
                    </ButtonLink>
                  )}
                  {actions.map((action) => (
                    <Button
                      key={action}
                      variant={
                        action === 'submit' || action === 'resubmit' ? 'primary' : 'secondary'
                      }
                      onClick={() =>
                        needsConfirmation.includes(action)
                          ? setConfirming({ id: d.id, action })
                          : run(d.id, action)
                      }
                    >
                      {action === 'withdraw' && d.status === 'pending_review'
                        ? 'Withdraw to edit'
                        : actionLabels[action]}
                    </Button>
                  ))}
                  {d.status === 'draft' && (
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
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Nothing here yet"
          description="Create a listing to start putting your ad together."
          action={<ButtonLink href="/sell">Create listing</ButtonLink>}
        />
      )}
      <Dialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        title={confirming ? `${actionLabels[confirming.action]}?` : ''}
      >
        <p>
          {confirming?.action === 'mark_sold'
            ? `“${target?.model}” will stop appearing to buyers. Sold ads cannot be reopened.`
            : `“${target?.model}” will be hidden from buyers. You can reopen it later as a draft.`}
        </p>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setConfirming(null)}>
            Keep it
          </Button>
          <span />
          <Button
            onClick={() => {
              if (confirming) run(confirming.id, confirming.action);
              setConfirming(null);
            }}
          >
            {confirming ? actionLabels[confirming.action] : ''}
          </Button>
        </div>
      </Dialog>
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
                <h3>{a.listingName}</h3>
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
  const { notify } = useDemo();
  const [checked, setChecked] = useState(false);
  return (
    <>
      <PageHeading
        title="Review inspection findings"
        description="Seller acknowledgement applies to one exact findings revision."
      />
      <Notice>
        Sample findings only. A real acknowledgement requires a verified seller and current backend
        revision.
      </Notice>
      <div className="panel">
        <h2>Sample findings · revision 1</h2>
        <p>
          Display and basic functions tested. Device was not opened, so internal repairs could not
          be assessed. This is an illustrative report.
        </p>
        <label className="checkbox-label">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          I have reviewed these sample findings.
        </label>
        <Button
          disabled={!checked}
          onClick={() => notify('Demo review noted. No inspection acknowledgement was submitted.')}
        >
          Preview acknowledgement
        </Button>
      </div>
    </>
  );
}
