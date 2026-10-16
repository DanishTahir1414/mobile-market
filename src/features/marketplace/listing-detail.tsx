'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, MessageCircle, Flag, Share2, ShieldCheck } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { Button, ButtonLink } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select, Textarea } from '@/components/ui/field';
import { Notice } from '@/components/ui/empty-state';
import { InspectionBadge } from '@/components/listings/inspection-badge';
import { FavoriteButton } from '@/components/listings/favorite-button';
import { useDemo } from '@/components/demo-provider';
export function ListingDetail({ listing }: { listing: Listing }) {
  const [dialog, setDialog] = useState<'contact' | 'report' | null>(null);
  const { notify } = useDemo();
  const specs = [
    ['Storage', `${listing.storage} GB`],
    ['Color', listing.color],
    ['Condition', listing.condition],
    ['PTA status', listing.pta],
    ['Battery claim', listing.battery ? `${listing.battery}%` : 'Not supplied'],
    ['Accessories', listing.accessories.join(', ')],
  ];
  return (
    <div className="container page-space">
      <div className="breadcrumb">
        <Link href="/mobiles">
          <ArrowLeft size={15} />
          Back to phones
        </Link>
        <span>
          {listing.brand} / {listing.model}
        </span>
      </div>
      <div className="detail-layout">
        <section>
          <div className="detail-image">
            <Image
              src={listing.image}
              alt={`Illustrative ${listing.model} photograph`}
              fill
              priority
              sizes="(max-width: 850px) 90vw, 55vw"
            />
            <span className="photo-label">Illustrative photo · not an actual sale</span>
            <FavoriteButton id={listing.id} />
          </div>
          <div className="detail-section">
            <p className="eyebrow">FROM THE SELLER</p>
            <h2>A little about this phone</h2>
            <p>{listing.description}</p>
            <h3>Seller-declared details</h3>
            <dl className="spec-grid">
              {specs.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <h3>Repairs & defects</h3>
            <p>{listing.repairs}</p>
            <p>{listing.defects}</p>
          </div>
          <div className="detail-section">
            <ShieldCheck size={27} />
            <h2>Shop observations</h2>
            <InspectionBadge state={listing.inspection} />
            <p>
              {listing.inspection === 'current'
                ? 'A sample inspection report is available for this demo device. Real reports will show dated shop observations separately from seller claims.'
                : 'No current shop inspection is available for this sample phone. You can still meet the seller and check the device yourself.'}
            </p>
            {listing.inspection === 'current' && (
              <ButtonLink href={`/inspections/demo-${listing.id}`} variant="secondary">
                Read sample report
              </ButtonLink>
            )}
          </div>
        </section>
        <aside className="detail-summary">
          <div className="sticky-card">
            <p className="eyebrow">
              {listing.brand} · {listing.storage} GB
            </p>
            <h1>{listing.model}</h1>
            <p className="detail-price">{formatPrice(listing.price)}</p>
            <p className="muted">Sample asking price · negotiable</p>
            <p className="location">
              <MapPin size={16} />
              {listing.area}, {listing.city}
            </p>
            <hr />
            <p className="seller-caption">SAMPLE PRIVATE SELLER</p>
            <h3>Demo seller</h3>
            <p className="muted">Connect directly. Meet and check before paying.</p>
            <Button className="full-width" onClick={() => setDialog('contact')}>
              <Phone size={17} />
              Call seller
            </Button>
            <Button variant="secondary" className="full-width" onClick={() => setDialog('contact')}>
              <MessageCircle size={17} />
              WhatsApp seller
            </Button>
            <p className="tiny-text">Contact is unavailable for fictional inventory.</p>
            <hr />
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  notify('Listing link copied.');
                } catch {
                  notify('Copy the link from your browser address bar.');
                }
              }}
            >
              <Share2 size={16} />
              Share listing
            </Button>
            <Button variant="ghost" onClick={() => setDialog('report')}>
              <Flag size={16} />
              Report this ad
            </Button>
            <div className="safety-note">
              <ShieldCheck size={20} />
              <p>Meet in a safe public place. Check the device. Never pay in advance.</p>
            </div>
          </div>
        </aside>
      </div>
      <Dialog
        open={dialog === 'contact'}
        onClose={() => setDialog(null)}
        title="This is a sample listing"
      >
        <p>
          There is no real seller behind this device. Phone numbers and WhatsApp links will become
          available only when the backend validates a published listing and seller consent.
        </p>
        <Button onClick={() => setDialog(null)}>Got it</Button>
      </Dialog>
      <Dialog open={dialog === 'report'} onClose={() => setDialog(null)} title="Report a listing">
        <Notice>This frontend cannot send abuse reports yet.</Notice>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            notify('Demo report reviewed locally. Nothing was sent.');
            setDialog(null);
          }}
        >
          <Select label="Reason" required>
            <option value="">Choose a reason</option>
            <option>Misleading information</option>
            <option>Suspected scam</option>
            <option>Inappropriate content</option>
            <option>Other</option>
          </Select>
          <Textarea label="Additional details" maxLength={1000} />
          <Button>Preview report action</Button>
        </form>
      </Dialog>
    </div>
  );
}
