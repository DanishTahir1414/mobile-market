'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { catalog, cities } from '@/lib/catalog';
import { demoListings } from '@/lib/demo-data';
import { activeFilters, filterListings, type Filters } from '@/lib/marketplace';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { PageHeading } from '@/components/ui/page-heading';
export function Browse() {
  const params = useSearchParams(),
    router = useRouter(),
    [mobileOpen, setMobileOpen] = useState(false);
  const filters = Object.fromEntries(params) as Filters;
  const results = filterListings(demoListings, filters);
  const page = Math.max(1, Number(params.get('page')) || 1),
    pageSize = 6;
  const chips = activeFilters(filters);
  // Typing in a number box would otherwise add a history entry per digit.
  const update = (key: string, value: string, typing = false) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    (typing ? router.replace : router.push)(`/mobiles?${next}`);
  };
  // The phone filter sheet covers the page: Escape closes it and the page behind stays still.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);
  return (
    <div className="container page-space">
      <PageHeading
        eyebrow="THE MARKETPLACE"
        title="Good phones. Ready for their next chapter."
        description="Browse the details, find your fit and connect with the seller."
      />
      <div className="browse-toolbar">
        <form
          className="browse-search"
          onSubmit={(e) => {
            e.preventDefault();
            update('query', String(new FormData(e.currentTarget).get('query') || ''));
          }}
        >
          <Search size={19} />
          <input
            name="query"
            aria-label="Search by brand or model"
            placeholder="Search by brand or model"
            defaultValue={params.get('query') || ''}
          />
          <Button variant="secondary">Search</Button>
        </form>
        <Button variant="secondary" className="filter-toggle" onClick={() => setMobileOpen(true)}>
          <SlidersHorizontal size={17} /> Filters{chips.length > 0 && ` (${chips.length})`}
        </Button>
        <select
          aria-label="Sort phones"
          value={filters.sort || 'newest'}
          onChange={(e) => update('sort', e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </div>
      <div className="browse-layout">
        <aside
          className={`filter-panel ${mobileOpen ? 'filter-panel--open' : ''}`}
          aria-label="Filter phones"
        >
          <div className="filter-heading">
            <h2>Filters</h2>
            <button className="text-link" onClick={() => router.push('/mobiles')}>
              Clear all
            </button>
            <button
              className="filter-close"
              aria-label="Close filters"
              onClick={() => setMobileOpen(false)}
            >
              <X />
            </button>
          </div>
          <Select
            label="Brand"
            value={filters.brand || ''}
            onChange={(e) => update('brand', e.target.value)}
          >
            <option value="">All brands</option>
            {Object.keys(catalog).map((b) => (
              <option key={b}>{b}</option>
            ))}
          </Select>
          <Select
            label="City"
            value={filters.city || ''}
            onChange={(e) => update('city', e.target.value)}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <div className="price-range">
            <Input
              label="Min price (PKR)"
              type="number"
              min="0"
              value={filters.min || ''}
              onChange={(e) => update('min', e.target.value, true)}
            />
            <Input
              label="Max price (PKR)"
              type="number"
              min="0"
              value={filters.max || ''}
              onChange={(e) => update('max', e.target.value, true)}
            />
          </div>
          <Select
            label="Storage"
            value={filters.storage || ''}
            onChange={(e) => update('storage', e.target.value)}
          >
            <option value="">Any storage</option>
            {[64, 128, 256, 512].map((n) => (
              <option key={n} value={n}>
                {n} GB
              </option>
            ))}
          </Select>
          <Select
            label="Condition"
            value={filters.condition || ''}
            onChange={(e) => update('condition', e.target.value)}
          >
            <option value="">Any condition</option>
            {['Excellent', 'Good', 'Fair'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select
            label="Seller-declared PTA"
            value={filters.pta || ''}
            onChange={(e) => update('pta', e.target.value)}
          >
            <option value="">Any PTA status</option>
            {['Approved', 'Not approved', 'Unknown'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.inspected === 'true'}
              onChange={(e) => update('inspected', e.target.checked ? 'true' : '')}
            />
            Shop inspected only
          </label>
          <p className="field__hint">A dated observation, never a warranty.</p>
          <Button className="filter-apply" onClick={() => setMobileOpen(false)}>
            Show {results.length} phones
          </Button>
        </aside>
        <section>
          <div className="results-heading">
            <span>
              <strong>{results.length}</strong> phones
            </span>
          </div>
          {chips.length > 0 && (
            <ul className="filter-chips" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.key}>
                  <button type="button" onClick={() => update(c.key, '')}>
                    {c.label}
                    <X size={13} aria-label="Remove filter" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ListingGrid listings={results.slice((page - 1) * pageSize, page * pageSize)} />
          {results.length > pageSize && (
            <div className="pagination">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() =>
                  router.push(
                    `/mobiles?${new URLSearchParams({ ...Object.fromEntries(params), page: String(page - 1) })}`,
                  )
                }
              >
                <ArrowLeft size={16} />
                Previous
              </Button>
              <span>
                Page {page} of {Math.ceil(results.length / pageSize)}
              </span>
              <Button
                variant="secondary"
                disabled={page * pageSize >= results.length}
                onClick={() =>
                  router.push(
                    `/mobiles?${new URLSearchParams({ ...Object.fromEntries(params), page: String(page + 1) })}`,
                  )
                }
              >
                Next
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
