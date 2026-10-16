import { ListingForm } from '@/features/marketplace/listing-form';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ListingForm draftId={(await params).id} />;
}
