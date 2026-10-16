import { z } from 'zod';
import type { Appointment, ListingDraft } from './types';

export interface DemoState {
  favorites: string[];
  drafts: ListingDraft[];
  appointments: Appointment[];
}

const storageKey = 'mobile-market-demo-v1';
const initialState: DemoState = { favorites: [], drafts: [], appointments: [] };
const listeners = new Set<() => void>();
let snapshot: DemoState | null = null;

// Local storage is untrusted input: validate every field before rendering it.
const storedDraft = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  storage: z.string(),
  price: z.string(),
  city: z.string(),
  area: z.string(),
  color: z.string(),
  condition: z.string(),
  pta: z.string(),
  battery: z.string(),
  repairs: z.string(),
  defects: z.string(),
  accessories: z.string(),
  description: z.string(),
  call: z.boolean(),
  whatsapp: z.boolean(),
  consent: z.boolean(),
  status: z.enum([
    'draft',
    'pending_review',
    'published',
    'rejected',
    'sold',
    'withdrawn',
    'expired',
    'suspended',
  ]),
  updatedAt: z.string(),
});
const storedState = z.object({
  favorites: z.array(z.string()).max(1000),
  drafts: z.array(storedDraft).max(100),
  appointments: z
    .array(
      z.object({
        id: z.string(),
        listingName: z.string(),
        startsAt: z.string().datetime({ offset: true }),
        status: z.enum(['booked', 'cancelled']),
      }),
    )
    .max(100),
});

export function getDemoSnapshot(): DemoState {
  if (snapshot) return snapshot;
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? storedState.safeParse(JSON.parse(raw)) : null;
    snapshot = parsed?.success ? parsed.data : initialState;
  } catch {
    snapshot = initialState;
  }
  return snapshot;
}

// A null server snapshot makes the hydration boundary explicit. Components that
// need local drafts render a small loading state before reading browser storage.
export function getServerDemoSnapshot(): null {
  return null;
}

export function subscribeToDemo(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    snapshot = null;
    getDemoSnapshot();
    listeners.forEach((notify) => notify());
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function updateDemo(updater: (current: DemoState) => DemoState) {
  snapshot = updater(getDemoSnapshot());
  let persisted = true;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    persisted = false;
  }
  listeners.forEach((notify) => notify());
  return persisted;
}
