import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterListings } from '../src/lib/marketplace';
import { demoListings } from '../src/lib/demo-data';
import { draftSchema } from '../src/lib/validation';
import { formatShopDate, formatPrice } from '../src/lib/format';

test('browse combines brand, PTA and budget filters', () => {
  const results = filterListings(demoListings, {
    brand: 'Apple',
    pta: 'Approved',
    max: '220000',
  });
  assert.deepEqual(results.map((l) => l.id).sort(), ['iphone-13', 'iphone-14-pro']);
});
test('expired inspection never appears in inspected-only results', () => {
  const results = filterListings(demoListings, { inspected: 'true' });
  assert.equal(results.length, 3);
  assert.ok(results.every((l) => l.inspection === 'current'));
});
test('search ignores casing and leading whitespace', () => {
  assert.equal(filterListings(demoListings, { query: '  IPHONE 15  ' })[0]?.id, 'iphone-15-pro');
});
test('price ordering is numeric and does not mutate original inventory', () => {
  const order = demoListings.map((l) => l.id);
  const results = filterListings(demoListings, { sort: 'price-low' });
  assert.equal(results[0].id, 'iphone-13');
  assert.deepEqual(
    demoListings.map((l) => l.id),
    order,
  );
});
test('sold and withdrawn listings stay out of public results', () => {
  assert.equal(
    filterListings(
      [
        { ...demoListings[0], status: 'sold' },
        { ...demoListings[1], status: 'withdrawn' },
      ],
      {},
    ).length,
    0,
  );
});
test('no-result queries produce an empty collection', () => {
  assert.equal(filterListings(demoListings, { query: 'does-not-exist' }).length, 0);
});
const valid = {
  brand: 'Apple',
  model: 'iPhone 13',
  storage: '128',
  price: '150000',
  city: 'Karachi',
  color: 'Midnight',
  condition: 'Good',
  pta: 'Unknown',
  description: 'An honest description of this demonstration phone.',
  battery: '',
  consent: true,
};
test('review requires consent and a valid positive price', () => {
  assert.equal(draftSchema.safeParse(valid).success, true);
  assert.equal(draftSchema.safeParse({ ...valid, consent: false }).success, false);
  assert.equal(draftSchema.safeParse({ ...valid, price: '-1' }).success, false);
  assert.equal(draftSchema.safeParse({ ...valid, price: 'not money' }).success, false);
});
test('battery claims cannot exceed a percentage', () => {
  assert.equal(draftSchema.safeParse({ ...valid, battery: '101' }).success, false);
  assert.equal(draftSchema.safeParse({ ...valid, battery: '95' }).success, true);
});
test('formatting uses PKR and Karachi shop time', () => {
  assert.equal(formatPrice(150000), 'PKR 150,000');
  assert.match(formatShopDate('2026-10-16T09:00:00Z'), /2:00/);
});

import {
  checkSiteImage,
  getSiteMedia,
  resolveSiteMedia,
  siteMediaAssetSchema,
  siteMediaSlots,
} from '../src/lib/site-media';
import { listingPhotos } from '../src/lib/marketplace';

const heroSlot = siteMediaSlots.find((s) => s.key === 'home-hero')!;

test('site pictures accept a correctly sized, correctly shaped image', () => {
  assert.deepEqual(
    checkSiteImage({ type: 'image/webp', size: 800_000, width: 1200, height: 1500 }, heroSlot),
    [],
  );
});

test('site pictures reject wrong type, oversize, small and badly shaped files together', () => {
  const problems = checkSiteImage(
    { type: 'image/gif', size: 6 * 1024 * 1024, width: 600, height: 300 },
    heroSlot,
  );
  assert.equal(problems.length, 4);
});

test('site picture sources must be local paths or https and have a description', () => {
  const ok = { src: '/images/a.jpg', alt: 'Shop front', updatedAt: '2026-10-22T00:00:00Z' };
  assert.equal(siteMediaAssetSchema.safeParse(ok).success, true);
  for (const src of [
    'javascript:alert(1)',
    '//evil.test/a.jpg',
    'http://x.test/a.jpg',
    'data:image/png;base64,AA',
  ])
    assert.equal(siteMediaAssetSchema.safeParse({ ...ok, src }).success, false, src);
  assert.equal(siteMediaAssetSchema.safeParse({ ...ok, alt: '' }).success, false);
});

test('an unconfigured optional slot resolves to nothing instead of an invented photo', () => {
  assert.equal(resolveSiteMedia('shop-front', getSiteMedia()), null);
  assert.ok(resolveSiteMedia('home-hero', getSiteMedia()));
});

test('listing photos put the cover first, drop duplicates and cap at eight', () => {
  const base = demoListings[0];
  assert.deepEqual(listingPhotos({ ...base, image: 'a', gallery: ['b', 'a', 'c'] }), [
    'a',
    'b',
    'c',
  ]);
  const many = Array.from({ length: 12 }, (_, i) => `p${i}`);
  assert.equal(listingPhotos({ ...base, image: 'cover', gallery: many }).length, 8);
});

import { isEditable, nextStatus, sellerActions, statusLabels } from '../src/lib/listing-lifecycle';
import type { ListingStatus } from '../src/lib/types';

test('sellers follow the listing lifecycle one step at a time', () => {
  assert.equal(nextStatus('draft', 'submit'), 'pending_review');
  assert.equal(nextStatus('pending_review', 'withdraw'), 'draft');
  assert.equal(nextStatus('published', 'mark_sold'), 'sold');
  assert.equal(nextStatus('published', 'withdraw'), 'withdrawn');
  assert.equal(nextStatus('rejected', 'resubmit'), 'pending_review');
  assert.equal(nextStatus('withdrawn', 'reopen'), 'draft');
});

test('sellers cannot publish, approve or revive a sold ad themselves', () => {
  assert.equal(nextStatus('draft', 'mark_sold'), null);
  assert.equal(nextStatus('pending_review', 'mark_sold'), null);
  assert.deepEqual(sellerActions('sold'), []);
  for (const status of Object.keys(statusLabels) as ListingStatus[])
    for (const action of sellerActions(status))
      assert.notEqual(nextStatus(status, action), 'published');
});

test('only draft and needs-changes ads can be edited', () => {
  const editable = (Object.keys(statusLabels) as ListingStatus[]).filter(isEditable);
  assert.deepEqual(editable.sort(), ['draft', 'rejected']);
});
