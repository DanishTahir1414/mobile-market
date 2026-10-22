import type { Appointment } from './types';

/** Shop days are Karachi days, whatever time zone the viewer's device uses. */
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' });
const dayLabel = new Intl.DateTimeFormat('en-PK', {
  timeZone: 'Asia/Karachi',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function groupByShopDay(items: Appointment[]) {
  const groups = new Map<string, { key: string; label: string; items: Appointment[] }>();
  for (const a of [...items].sort((x, y) => x.startsAt.localeCompare(y.startsAt))) {
    const date = new Date(a.startsAt);
    const key = dayKey.format(date);
    const group = groups.get(key) ?? { key, label: dayLabel.format(date), items: [] };
    group.items.push(a);
    groups.set(key, group);
  }
  return [...groups.values()];
}
