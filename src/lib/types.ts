/** Seller claims and shop observations deliberately use separate models. */
export type InspectionState = 'current' | 'not_inspected' | 'expired' | 'revoked' | 'unavailable';
export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'sold'
  | 'withdrawn'
  | 'expired'
  | 'suspended';
export interface Listing {
  id: string;
  brand: string;
  model: string;
  storage: number;
  price: number;
  city: string;
  area: string;
  color: string;
  condition: 'Excellent' | 'Good' | 'Fair';
  pta: 'Approved' | 'Not approved' | 'Unknown';
  battery: number | null;
  image: string;
  photos?: { src: string; alt: string }[];
  inspection: InspectionState;
  listedAt: string;
  description: string;
  repairs: string;
  defects: string;
  accessories: string[];
  status: ListingStatus;
}
export interface ListingDraft {
  id: string;
  brand: string;
  model: string;
  storage: string;
  price: string;
  city: string;
  area: string;
  color: string;
  condition: string;
  pta: string;
  battery: string;
  repairs: string;
  defects: string;
  accessories: string;
  description: string;
  call: boolean;
  whatsapp: boolean;
  consent: boolean;
  status: ListingStatus;
  updatedAt: string;
}
export interface Appointment {
  id: string;
  listingName: string;
  startsAt: string;
  status: 'booked' | 'cancelled';
}
export type ToastMessage = { id: number; text: string };
