'use client';
import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { ListingDraft, Appointment, ToastMessage } from '@/lib/types';
import { nextStatus, type SellerAction } from '@/lib/listing-lifecycle';
import {
  getDemoSnapshot,
  getServerDemoSnapshot,
  subscribeToDemo,
  updateDemo,
  type DemoState,
} from '@/lib/demo-store';
interface DemoContext extends DemoState {
  ready: boolean;
  toggleFavorite: (id: string) => void;
  saveDraft: (draft: ListingDraft) => void;
  removeDraft: (id: string) => void;
  /** Applies a seller action on this device only; returns false if the action is not allowed. */
  changeListingStatus: (id: string, action: SellerAction) => boolean;
  book: (appointment: Appointment) => boolean;
  cancelBooking: (id: string) => void;
  notify: (message: string) => void;
}
const Context = createContext<DemoContext | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribeToDemo, getDemoSnapshot, getServerDemoSnapshot);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const notify = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  };
  const value: DemoContext = {
    ...(state || { favorites: [], drafts: [], appointments: [] }),
    ready: state !== null,
    notify,
    toggleFavorite: (id) =>
      updateDemo((s) => ({
        ...s,
        favorites: s.favorites.includes(id)
          ? s.favorites.filter((x) => x !== id)
          : [...s.favorites, id],
      })),
    saveDraft: (draft) =>
      updateDemo((s) => ({
        ...s,
        drafts: [draft, ...s.drafts.filter((x) => x.id !== draft.id)],
      })),
    removeDraft: (id) =>
      updateDemo((s) => ({
        ...s,
        drafts: s.drafts.filter((d) => d.id !== id),
      })),
    changeListingStatus: (id, action) => {
      let changed = false;
      updateDemo((s) => ({
        ...s,
        drafts: s.drafts.map((d) => {
          const status = d.id === id ? nextStatus(d.status, action) : null;
          if (!status) return d;
          changed = true;
          return { ...d, status, updatedAt: new Date().toISOString() };
        }),
      }));
      return changed;
    },
    book: (appointment) => {
      let booked = false;
      updateDemo((s) => {
        if (
          s.appointments.some((a) => a.startsAt === appointment.startsAt && a.status === 'booked')
        )
          return s;
        booked = true;
        return { ...s, appointments: [appointment, ...s.appointments] };
      });
      return booked;
    },
    cancelBooking: (id) =>
      updateDemo((s) => ({
        ...s,
        appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)),
      })),
  };
  return (
    <Context.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.text}
          </div>
        ))}
      </div>
    </Context.Provider>
  );
}
export function useDemo() {
  const context = useContext(Context);
  if (!context) throw new Error('DemoProvider is required');
  return context;
}
