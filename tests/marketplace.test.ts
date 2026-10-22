import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterListings } from '../src/lib/marketplace';
import { demoListings } from '../src/lib/demo-data';
import { draftSchema } from '../src/lib/validation';
import { formatShopDate, formatPrice } from '../src/lib/format';

// The first six are the original hand-built phones; these tests keep their exact expectations.
const original = demoListings.slice(0, 6);
test('browse combines brand, PTA and budget filters', () => {
  const results = filterListings(original, {
    brand: 'Apple',
    pta: 'Approved',
    max: '220000',
  });
  assert.deepEqual(results.map((l) => l.id).sort(), ['iphone-13', 'iphone-14-pro']);
});
test('expired inspection never appears in inspected-only results', () => {
  const results = filterListings(original, { inspected: 'true' });
  assert.equal(results.length, 3);
  assert.ok(
    filterListings(demoListings, { inspected: 'true' }).every((l) => l.inspection === 'current'),
  );
  assert.ok(results.every((l) => l.inspection === 'current'));
});
test('search ignores casing and leading whitespace', () => {
  assert.equal(filterListings(demoListings, { query: '  IPHONE 15  ' })[0]?.id, 'iphone-15-pro');
});
test('price ordering is numeric and does not mutate original inventory', () => {
  const order = demoListings.map((l) => l.id);
  const results = filterListings(original, { sort: 'price-low' });
  assert.equal(results[0].id, 'iphone-13');
  const all = filterListings(demoListings, { sort: 'price-low' }).map((l) => l.price);
  assert.deepEqual(
    all,
    [...all].sort((a, b) => a - b),
  );
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

import { timelineSteps } from '../src/lib/inspection-timeline';
import { groupByShopDay } from '../src/lib/appointments';
import { reviewFlags } from '../src/lib/moderation';
import { activeFilters } from '../src/lib/marketplace';

test('timeline marks earlier stages done, one current, the rest upcoming', () => {
  assert.deepEqual(
    timelineSteps('in_progress').map((s) => s.state),
    ['done', 'done', 'current', 'upcoming', 'upcoming'],
  );
  assert.ok(timelineSteps('badge_awarded').every((s) => s.state === 'done'));
});

test('appointments group by Karachi day, not UTC day', () => {
  // 20:00 UTC on the 24th is 01:00 on the 25th in Karachi (UTC+5).
  const groups = groupByShopDay([
    { id: 'a', listingName: 'A', startsAt: '2026-10-24T20:00:00Z', status: 'booked' },
    { id: 'b', listingName: 'B', startsAt: '2026-10-25T05:00:00Z', status: 'booked' },
    { id: 'c', listingName: 'C', startsAt: '2026-10-24T05:00:00Z', status: 'cancelled' },
  ]);
  assert.deepEqual(
    groups.map((g) => [g.key, g.items.map((i) => i.id)]),
    [
      ['2026-10-24', ['c']],
      ['2026-10-25', ['a', 'b']],
    ],
  );
});

test('review flags prompt on suspicious price and missing declarations, with few peers ignored', () => {
  const base = demoListings.find((l) => l.id === 'iphone-14-pro')!;
  const peers = [200000, 210000, 220000].map((price, i) => ({ ...base, id: `p${i}`, price }));
  const cheap = { ...base, id: 'cheap', price: 90000, pta: 'Unknown' as const };
  const flags = reviewFlags(cheap, [cheap, ...peers]);
  assert.ok(flags.some((f) => f.includes('far below')));
  assert.ok(flags.some((f) => f.includes('PTA')));
  assert.ok(!reviewFlags(cheap, [cheap, peers[0]]).some((f) => f.includes('far below')));
});

test('active filters list only set filters and ignore inspected=false', () => {
  assert.deepEqual(
    activeFilters({ brand: 'Apple', storage: '256', inspected: 'false' }).map((c) => c.label),
    ['Apple', '256 GB'],
  );
});

test('the larger sample catalog has unique ids and valid photos', () => {
  const ids = demoListings.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(demoListings.length >= 24);
  assert.ok(demoListings.every((l) => l.image.startsWith('/images/')));
});

test('the shop logo is a required, staff-managed slot with a safe default', () => {
  const slot = siteMediaSlots.find((s) => s.key === 'brand-logo');
  assert.ok(slot?.required);
  assert.equal(resolveSiteMedia('brand-logo')?.src, '/images/logo-jugnu.webp');
});
