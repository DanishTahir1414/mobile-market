import type { Listing } from './types';
// Fictional inventory is isolated here so the future API adapter can replace it.
// Photos illustrate the model family, not the condition of an actual device.
const base = {
  city: 'Karachi',
  condition: 'Excellent' as const,
  pta: 'Approved' as const,
  battery: null,
  listedAt: '2026-10-16T10:00:00Z',
  repairs: 'No repairs declared by the demo seller.',
  defects: 'No defects declared. Always inspect a device before buying.',
  accessories: ['Box', 'Charging cable'],
  status: 'published' as const,
  description:
    'Illustrative listing for the Mobile Market frontend. Meet the seller, check the phone carefully and agree on payment directly. This is not a real device offered for sale.',
};
export const demoListings: Listing[] = [
  {
    ...base,
    id: 'iphone-15-pro',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    storage: 256,
    price: 289000,
    area: 'Gulshan-e-Iqbal',
    color: 'Natural titanium',
    battery: 94,
    inspection: 'current',
    image: '/images/iphone-titanium.jpg',
  },
  {
    ...base,
    id: 'galaxy-s24-ultra',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storage: 256,
    price: 265000,
    area: 'DHA Phase 6',
    color: 'Titanium grey',
    inspection: 'not_inspected',
    image: '/images/samsung.jpg',
  },
  {
    ...base,
    id: 'iphone-14-pro',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storage: 128,
    price: 215000,
    area: 'North Nazimabad',
    color: 'Deep purple',
    battery: 89,
    inspection: 'current',
    image: '/images/iphone-purple.jpg',
  },
  {
    ...base,
    id: 'pixel-8-pro',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    storage: 128,
    price: 154000,
    area: 'PECHS',
    color: 'Bay',
    condition: 'Good',
    inspection: 'not_inspected',
    image: '/images/pixel.jpg',
  },
  {
    ...base,
    id: 'iphone-13',
    brand: 'Apple',
    model: 'iPhone 13',
    storage: 128,
    price: 138000,
    area: 'Clifton',
    color: 'Midnight',
    battery: 87,
    inspection: 'expired',
    image: '/images/iphone-dark.jpg',
  },
  {
    ...base,
    id: 'galaxy-s23',
    brand: 'Samsung',
    model: 'Galaxy S23',
    storage: 256,
    price: 142000,
    area: 'Bahadurabad',
    color: 'Cream',
    condition: 'Good',
    inspection: 'current',
    image: '/images/samsung-cream.jpg',
  },
];
for (const status of ['sold', 'withdrawn', 'expired', 'suspended'] as const) {
  demoListings.push({
    ...demoListings[0],
    id: `sample-${status}`,
    status,
    inspection: 'unavailable',
  });
}
for (const listing of demoListings) {
  listing.photos = [
    {
      src: listing.image,
      alt: `Illustrative ${listing.model} device photograph; not the advertised specimen`,
    },
    {
      src: listing.brand === 'Apple' ? '/images/iphone-dark.jpg' : '/images/samsung-cream.jpg',
      alt: 'Additional illustrative phone photograph; model and color may differ',
    },
  ];
}
export const inspectionChecks = [
  ['Device identity', 'pass', 'Device matched to the listing at the time of inspection.'],
  ['Body & frame', 'pass', 'Minor signs of everyday use.'],
  ['Display & touch', 'pass', 'Touch response and display tested.'],
  ['Battery & charging', 'pass', 'Charging and reported battery health observed.'],
  ['Cameras & audio', 'pass', 'Front and rear cameras, speaker and microphone tested.'],
  ['Buttons & ports', 'pass', 'Physical controls and charging port tested.'],
  ['Network, Wi-Fi & Bluetooth', 'pass', 'Basic connectivity tests completed.'],
  ['Biometrics', 'pass', 'Applicable biometric unlock tested.'],
  ['Activation lock', 'pass', 'No activation lock observed during inspection.'],
  ['Repair indicators', 'not_tested', 'Internal components were not opened.'],
  [
    'PTA observation',
    'pass',
    'Illustrative check only. No real PTA verification has been performed.',
  ],
] as const;
