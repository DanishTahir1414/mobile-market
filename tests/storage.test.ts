import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDemoSnapshot, subscribeToDemo, updateDemo } from '../src/lib/demo-store';

test('malformed storage recovers and failed writes keep explicit current-tab state', () => {
  let raw = '{invalid json';
  let blocked = true;
  let listener: ((event: { key: string | null }) => void) | undefined;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => raw,
        setItem: (_key: string, value: string) => {
          if (blocked) throw new Error('Storage full');
          raw = value;
        },
      },
      addEventListener: (_type: string, callback: (event: { key: string | null }) => void) => {
        listener = callback;
      },
      removeEventListener: () => {
        listener = undefined;
      },
    },
  });
  const unsubscribe = subscribeToDemo(() => {});
  assert.deepEqual(getDemoSnapshot(), { favorites: [], drafts: [], appointments: [] });
  assert.equal(
    updateDemo((state) => ({ ...state, favorites: ['iphone-13'] })),
    false,
  );
  assert.deepEqual(getDemoSnapshot().favorites, ['iphone-13']);
  blocked = false;
  assert.equal(
    updateDemo((state) => ({ ...state, favorites: ['pixel-8-pro'] })),
    true,
  );
  listener?.({ key: 'mobile-market-demo-v1' });
  assert.deepEqual(getDemoSnapshot().favorites, ['pixel-8-pro']);
  raw = JSON.stringify({
    favorites: [],
    drafts: [],
    appointments: [{ id: 'bad', startsAt: 'not-a-date' }],
  });
  listener?.({ key: 'mobile-market-demo-v1' });
  assert.deepEqual(getDemoSnapshot().appointments, []);
  unsubscribe();
  Reflect.deleteProperty(globalThis, 'window');
});
