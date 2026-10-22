import type { Listing } from './types';

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Prompts for the human reviewer, never a decision. Each flag says what to look at and why.
 * Price is compared with same-model, same-storage ads and only when at least three exist.
 */
export function reviewFlags(listing: Listing, all: Listing[]): string[] {
  const flags: string[] = [];
  const peers = all.filter(
    (l) => l.id !== listing.id && l.model === listing.model && l.storage === listing.storage,
  );
  if (peers.length >= 3) {
    const typical = median(peers.map((l) => l.price));
    if (listing.price < typical * 0.6)
      flags.push('Price is far below similar ads. Check for a scam.');
    if (listing.price > typical * 1.5) flags.push('Price is far above similar ads.');
  }
  if (listing.pta === 'Unknown') flags.push('Seller did not state PTA status.');
  if (listing.battery === null && listing.brand === 'Apple')
    flags.push('No battery health given for an iPhone.');
  if (listing.condition === 'Fair' && listing.defects.startsWith('No defects'))
    flags.push('Condition is Fair but no defects are declared.');
  return flags;
}
