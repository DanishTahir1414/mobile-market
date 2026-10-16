import { notFound } from 'next/navigation';
import { demoListings } from '@/lib/demo-data';
import { ListingDetail } from '@/features/marketplace/listing-detail';
export function generateStaticParams() {
  return demoListings.map((l) => ({ id: l.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: demoListings.find((l) => l.id === id)?.model || 'Phone not found',
  };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = demoListings.find((l) => l.id === id);
  if (!listing) notFound();
  return <ListingDetail listing={listing} />;
}
