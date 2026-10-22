import type { Listing } from './types';
export interface Filters {
  query?: string;
  brand?: string;
  city?: string;
  condition?: string;
  pta?: string;
  storage?: string;
  min?: string;
  max?: string;
  inspected?: string;
  sort?: string;
}
const filterLabels: [keyof Filters, (v: string) => string][] = [
  ['query', (v) => `“${v}”`],
  ['brand', (v) => v],
  ['city', (v) => v],
  ['condition', (v) => v],
  ['pta', (v) => `PTA ${v.toLowerCase()}`],
  ['storage', (v) => `${v} GB`],
  ['min', (v) => `From PKR ${Number(v).toLocaleString('en-PK')}`],
  ['max', (v) => `Up to PKR ${Number(v).toLocaleString('en-PK')}`],
  ['inspected', () => 'Shop inspected only'],
];
/** One removable chip per filter that is actually set. */
export function activeFilters(filters: Filters) {
  return filterLabels.flatMap(([key, label]) => {
    const value = filters[key];
    return value && !(key === 'inspected' && value !== 'true')
      ? [{ key: key as string, label: label(value) }]
      : [];
  });
}

/** Cover first, then extra photos, without duplicates; capped to match the seller form. */
export function listingPhotos(listing: Listing) {
  return [...new Set([listing.image, ...(listing.gallery ?? [])])].slice(0, 8);
}

/** Pure filtering keeps URL-driven browse behavior testable without a browser. */
export function filterListings(listings: Listing[], filters: Filters) {
  const query = (filters.query || '').trim().toLowerCase();
  return listings
    .filter(
      (item) =>
        item.status === 'published' &&
        (!query || `${item.brand} ${item.model}`.toLowerCase().includes(query)) &&
        (!filters.brand || item.brand === filters.brand) &&
        (!filters.city || item.city === filters.city) &&
        (!filters.condition || item.condition === filters.condition) &&
        (!filters.pta || item.pta === filters.pta) &&
        (!filters.storage || item.storage === Number(filters.storage)) &&
        (!filters.min || item.price >= Number(filters.min)) &&
        (!filters.max || item.price <= Number(filters.max)) &&
        (filters.inspected !== 'true' || item.inspection === 'current'),
    )
    .sort((a, b) =>
      filters.sort === 'price-low'
        ? a.price - b.price
        : filters.sort === 'price-high'
          ? b.price - a.price
          : b.listedAt.localeCompare(a.listedAt),
    );
}
