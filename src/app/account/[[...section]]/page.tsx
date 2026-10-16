import { InspectionTracking } from '@/features/account/inspection-tracking';
import { notFound } from 'next/navigation';
import {
  AccountOverview,
  MyListings,
  Favorites,
  Inspections,
  Booking,
  Profile,
  Security,
  Sessions,
  Notifications,
  Acknowledgement,
} from '@/features/account/account-pages';
const pages = {
  overview: AccountOverview,
  listings: MyListings,
  favorites: Favorites,
  inspections: Inspections,
  'inspections/book': Booking,
  profile: Profile,
  security: Security,
  sessions: Sessions,
  notifications: Notifications,
  'inspections/acknowledge': Acknowledgement,
};
export default async function Page({ params }: { params: Promise<{ section?: string[] }> }) {
  const segments = (await params).section || [];
  const key = segments.join('/') || 'overview';
  if (
    segments.length === 2 &&
    segments[0] === 'inspections' &&
    !['book', 'acknowledge'].includes(segments[1])
  )
    return <InspectionTracking id={segments[1]} />;
  const Component = pages[key as keyof typeof pages];
  if (!Component) notFound();
  return <Component />;
}
