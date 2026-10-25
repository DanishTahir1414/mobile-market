import { z } from 'zod';

/**
 * Site-level pictures (hero, shop photo, ...) belong to the shop/vendor and may be changed
 * only by authorized staff. Listing photos are a different kind of media: sellers upload
 * those for their own ads and staff moderate them. The two never share a code path.
 *
 * This module is pure so it can be tested and later fed by the Media service instead of the
 * checked-in defaults below. The browser can never be trusted to decide who may change a
 * slot; the future Media service must enforce that on the server.
 */
export type SiteMediaSlotKey = 'brand-logo' | 'home-hero' | 'shop-front';

export interface SiteMediaSlot {
  key: SiteMediaSlotKey;
  label: string;
  where: string;
  /** Width / height the layout is designed for. Other ratios are cropped with object-fit. */
  aspect: number;
  minWidth: number;
  minHeight: number;
  /** When false and nothing is configured, the page shows its built-in placeholder. */
  required: boolean;
}

export interface SiteMediaAsset {
  src: string;
  alt: string;
  updatedAt: string;
}

export type SiteMediaMap = Partial<Record<SiteMediaSlotKey, SiteMediaAsset>>;

export const siteMediaSlots: SiteMediaSlot[] = [
  {
    key: 'brand-logo',
    label: 'Shop logo',
    where: 'Header, loading screen and browser tab',
    aspect: 1,
    minWidth: 400,
    minHeight: 400,
    required: true,
  },
  {
    key: 'home-hero',
    label: 'Homepage hero photo',
    where: 'Large photo beside the homepage headline',
    aspect: 4 / 5,
    minWidth: 1000,
    minHeight: 1250,
    required: true,
  },
  {
    key: 'shop-front',
    label: 'Shop photo',
    where: 'Shop page, next to the address and hours',
    aspect: 4 / 3,
    minWidth: 1200,
    minHeight: 900,
    required: false,
  },
];

export const siteImageRules = {
  types: ['image/jpeg', 'image/png', 'image/webp'],
  maxBytes: 5 * 1024 * 1024,
} as const;

/** Defaults shipped with the frontend. A Media-service adapter replaces this later. */
export const defaultSiteMedia: SiteMediaMap = {
  'brand-logo': {
    src: '/images/logo-jugnu.webp',
    alt: 'Jugnu GSM logo',
    updatedAt: '2026-10-23T00:00:00Z',
  },
  'home-hero': {
    src: '/images/iphone-titanium.jpg',
    alt: 'phone with a titanium finish',
    updatedAt: '2026-10-16T00:00:00Z',
  },
};

// Only same-origin paths or https URLs are rendered; this blocks javascript:/data: sources
// from a corrupted or malicious manifest.
const safeSource = z
  .string()
  .refine((v) => (v.startsWith('/') && !v.startsWith('//')) || v.startsWith('https://'), {
    message: 'Image source must be a local path or an https URL.',
  });

export const siteMediaAssetSchema = z.object({
  src: safeSource,
  alt: z.string().trim().min(3, 'Describe the picture for screen readers.').max(200),
  updatedAt: z.string().datetime({ offset: true }),
});

export function getSiteMedia(): SiteMediaMap {
  const result: SiteMediaMap = {};
  for (const slot of siteMediaSlots) {
    const parsed = siteMediaAssetSchema.safeParse(defaultSiteMedia[slot.key]);
    if (parsed.success) result[slot.key] = parsed.data;
  }
  return result;
}

export function resolveSiteMedia(slot: SiteMediaSlotKey, media = getSiteMedia()) {
  return media[slot] ?? null;
}

export interface CandidateImage {
  type: string;
  size: number;
  width: number;
  height: number;
}

/** Returns human-readable problems; an empty list means the file suits the slot. */
export function checkSiteImage(file: CandidateImage, slot: SiteMediaSlot): string[] {
  const problems: string[] = [];
  if (!(siteImageRules.types as readonly string[]).includes(file.type))
    problems.push('Use a JPEG, PNG or WebP file.');
  if (file.size > siteImageRules.maxBytes) problems.push('The file must be under 5 MB.');
  if (file.width < slot.minWidth || file.height < slot.minHeight)
    problems.push(`The picture must be at least ${slot.minWidth} × ${slot.minHeight} pixels.`);
  const ratio = file.width / file.height;
  if (Math.abs(ratio - slot.aspect) / slot.aspect > 0.25)
    problems.push('The shape is far from the layout; important parts may be cropped.');
  return problems;
}
