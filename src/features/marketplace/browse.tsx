'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { catalog, cities } from '@/lib/catalog';
import { demoListings } from '@/lib/demo-data';
import { filterListings, paginate, type Filters } from '@/lib/marketplace';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { Dialog } from '@/components/ui/dialog';
import { PageHeading } from '@/components/ui/page-heading';
export function Browse() {
  const params = useSearchParams(),
    router = useRouter(),
    [mobileOpen, setMobileOpen] = useState(false),
    [pending, setPending] = useState<Filters>({});
  const filters = Object.fromEntries(params) as Filters;
  const results = filterListings(demoListings, filters);
  const { page, pageCount, items } = paginate(results, params.get('page'), 4);
  const shown = mobileOpen ? pending : filters;
  const update = (key: string, value: string) => {
    if (mobileOpen) {
      setPending((current) => ({ ...current, [key]: value }));
      return;
    }
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`/mobiles?${next}`);
  };
  const filterControls = (
    <>
      <Select
        label="Brand"
        value={shown.brand || ''}
        onChange={(e) => update('brand', e.target.value)}
      >
        <option value="">All brands</option>
        {Object.keys(catalog).map((b) => (
          <option key={b}>{b}</option>
        ))}
      </Select>
      <Select
        label="City"
        value={shown.city || ''}
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
          value={shown.min || ''}
          onChange={(e) => update('min', e.target.value)}
        />
        <Input
          label="Max price (PKR)"
          type="number"
          min="0"
          value={shown.max || ''}
          onChange={(e) => update('max', e.target.value)}
        />
      </div>
      <Select
        label="Storage"
        value={shown.storage || ''}
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
        value={shown.condition || ''}
        onChange={(e) => update('condition', e.target.value)}
      >
        <option value="">Any condition</option>
        {['Excellent', 'Good', 'Fair'].map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select
        label="Seller-declared PTA"
        value={shown.pta || ''}
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
          checked={shown.inspected === 'true'}
          onChange={(e) => update('inspected', e.target.checked ? 'true' : '')}
        />
        Shop inspected only
      </label>
      <p className="field__hint">A dated observation, never a warranty.</p>
      {mobileOpen && (
        <Button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params);
            for (const key of [
              'brand',
              'city',
              'min',
              'max',
              'storage',
              'condition',
              'pta',
              'inspected',
            ]) {
              const value = pending[key as keyof Filters];
              if (value) next.set(key, value);
              else next.delete(key);
            }
            next.delete('page');
            router.push(`/mobiles?${next}`);
            setMobileOpen(false);
          }}
        >
          Apply filters
        </Button>
      )}
    </>
  );
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
            key={params.toString()}
            defaultValue={params.get('query') || ''}
          />
          <Button variant="secondary">Search</Button>
        </form>
        <Button
          variant="secondary"
          className="filter-toggle"
          onClick={() => {
            setPending(filters);
            setMobileOpen(true);
          }}
        >
          <SlidersHorizontal size={17} /> Filters
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
      <p aria-live="polite">
        {Object.entries(filters)
          .filter(([key, value]) => value && key !== 'page' && key !== 'sort')
          .map(([key, value]) => `${key}: ${value}`)
          .join('  ·  ') || 'No active filters'}
      </p>
      <Dialog
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Filter phones"
        className="filter-dialog"
      >
        <Button variant="ghost" onClick={() => setPending({})}>
          Clear pending filters
        </Button>
        {filterControls}
      </Dialog>
      <div className="browse-layout">
        <aside className="filter-panel" aria-label="Filter phones">
          <div className="filter-heading">
            <h2>Filters</h2>
            <button className="text-link" onClick={() => router.push('/mobiles')}>
              Clear all
            </button>
          </div>
          {filterControls}
        </aside>
        <section>
          <div className="results-heading">
            <span>
              <strong>{results.length}</strong> sample phones
            </span>
            <span>Fictional inventory · No real sellers</span>
          </div>
          <ListingGrid listings={items} />
          {pageCount > 1 && (
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
                Page {page} of {pageCount}
              </span>
              <Button
                variant="secondary"
                disabled={page >= pageCount}
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
