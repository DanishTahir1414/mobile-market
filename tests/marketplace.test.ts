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
