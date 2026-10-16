import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { InspectionBadge } from './inspection-badge';
import { FavoriteButton } from './favorite-button';
export function ListingCard({
  listing,
  priority = false,
}: {
  listing: Listing;
  priority?: boolean;
}) {
  return (
    <article className="listing-card">
      <div className="listing-card__visual">
        <Link href={`/mobiles/${listing.id}`} aria-label={`View ${listing.model}`}>
          <Image
            src={listing.image}
            alt={`Illustrative ${listing.brand} phone photograph`}
            fill
            sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 28vw"
            priority={priority}
            className="listing-card__image"
          />
        </Link>
        <FavoriteButton id={listing.id} />
        {listing.inspection === 'current' && (
          <div className="listing-card__badge">
            <InspectionBadge state="current" compact />
          </div>
        )}
      </div>
      <div className="listing-card__body">
        <div className="listing-card__meta">
          <span>{listing.brand}</span>
          <span>{listing.condition}</span>
        </div>
        <h3>
          <Link href={`/mobiles/${listing.id}`}>
            {listing.model} <ArrowUpRight size={17} />
          </Link>
        </h3>
        <p className="listing-card__specs">
          {listing.storage} GB <span>·</span> {listing.color}
        </p>
        <p className="listing-card__price">{formatPrice(listing.price)}</p>
        <div className="listing-card__bottom">
          <span>
            <MapPin size={13} />
            {listing.area}, {listing.city}
          </span>
          <span>
            {listing.pta === 'Approved' ? 'PTA approved' : 'PTA ' + listing.pta.toLowerCase()}
          </span>
        </div>
      </div>
    </article>
  );
}
