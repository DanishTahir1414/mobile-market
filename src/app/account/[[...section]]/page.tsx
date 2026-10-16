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
  const key = (await params).section?.join('/') || 'overview';
  const Component = pages[key as keyof typeof pages];
  if (!Component) notFound();
  return <Component />;
}
