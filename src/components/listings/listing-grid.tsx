import type { Listing } from '@/lib/types';
import { ListingCard } from './listing-card';
import { EmptyState } from '@/components/ui/empty-state';
export function ListingGrid({ listings }: { listings: Listing[] }) {
  return listings.length ? (
    <div className="listing-grid">
      {listings.map((listing, i) => (
        <ListingCard key={listing.id} listing={listing} priority={i < 3} />
      ))}
    </div>
  ) : (
    <EmptyState title="No phones found" description="Try a different model, city or price range." />
  );
}
