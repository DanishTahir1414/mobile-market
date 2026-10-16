import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from '../src/lib/marketplace';
import { nextListingStatuses, editKind } from '../src/lib/listing-lifecycle';
import {
  acknowledgementMatches,
  approvalBlocks,
  sampleFindings,
} from '../src/lib/inspection-workflow';
import { draftSchema } from '../src/lib/validation';
import type { ListingDraft } from '../src/lib/types';

const draft: ListingDraft = {
  id: 'test',
  brand: 'Apple',
  model: 'iPhone 13',
  storage: '128',
  price: '100000',
  city: 'Karachi',
  area: '',
  color: 'Black',
  condition: 'Good',
  pta: 'Unknown',
  battery: '',
  repairs: '',
  defects: '',
  accessories: '',
  description: 'An illustrative phone with clearly declared condition.',
  call: true,
  whatsapp: false,
  consent: true,
  status: 'published',
  updatedAt: '',
};

test('pagination clamps excessive pages and rejects non-integer or non-finite pages', () => {
  for (const value of ['-1', '0', '1.5', 'Infinity', 'NaN', null])
    assert.equal(paginate([1, 2, 3], value, 2).page, 1);
  assert.deepEqual(paginate([1, 2, 3], '9999', 2), { page: 2, pageCount: 2, items: [3] });
  assert.deepEqual(paginate([], '5', 2), { page: 1, pageCount: 1, items: [] });
});
test('terminal listings cannot be renewed and expiry returns through moderation', () => {
  assert.deepEqual(nextListingStatuses('sold'), []);
  assert.deepEqual(nextListingStatuses('withdrawn'), []);
  assert.deepEqual(nextListingStatuses('expired'), ['pending_review']);
  assert.deepEqual(nextListingStatuses('rejected'), ['pending_review']);
  assert.ok(!nextListingStatuses('suspended').includes('published'));
});
test('price-only edits differ from material disclosures and unchanged drafts', () => {
  assert.equal(editKind(draft, { ...draft }), 'none');
  assert.equal(editKind(draft, { ...draft, price: '110000' }), 'price');
  assert.equal(
    editKind(draft, { ...draft, defects: 'Cracked display', price: '110000' }),
    'material',
  );
});
test('catalog validation rejects cross-brand models and unsupported storage', () => {
  assert.ok(draftSchema.safeParse(draft).success);
  assert.ok(!draftSchema.safeParse({ ...draft, brand: 'Samsung' }).success);
  assert.ok(!draftSchema.safeParse({ ...draft, storage: '512' }).success);
  for (const price of ['Infinity', '1e6', '1.5', '-100'])
    assert.ok(!draftSchema.safeParse({ ...draft, price }).success);
  for (const battery of ['1.5', 'Infinity', '-1', '101'])
    assert.ok(!draftSchema.safeParse({ ...draft, battery }).success);
});
test('changed findings invalidate old acknowledgement without changing observation time', () => {
  assert.ok(acknowledgementMatches(sampleFindings, 1));
  const corrected = { ...sampleFindings, revision: 2 };
  assert.ok(!acknowledgementMatches(corrected, 1));
  assert.equal(corrected.observedAt, sampleFindings.observedAt);
});
test('approval lists each unmet prerequisite and permits only all matching gates', () => {
  assert.equal(
    approvalBlocks({
      acknowledged: false,
      feeSettled: false,
      deviceMatches: false,
      distinctApprover: false,
    }).length,
    4,
  );
  assert.deepEqual(
    approvalBlocks({
      acknowledged: true,
      feeSettled: true,
      deviceMatches: true,
      distinctApprover: true,
    }),
    [],
  );
  assert.equal(
    approvalBlocks({
      acknowledged: true,
      feeSettled: true,
      deviceMatches: true,
      distinctApprover: false,
    }).length,
    1,
  );
});
