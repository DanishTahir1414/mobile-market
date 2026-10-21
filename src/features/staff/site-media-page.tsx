'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Notice } from '@/components/ui/empty-state';
import { PageHeading } from '@/components/ui/page-heading';
import { useDemo } from '@/components/demo-provider';
import {
  checkSiteImage,
  siteMediaSlots,
  type SiteMediaAsset,
  type SiteMediaMap,
  type SiteMediaSlot,
} from '@/lib/site-media';

interface Preview {
  url: string;
  name: string;
  alt: string;
  problems: string[];
}

function readDimensions(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('This file could not be read as a picture.'));
    img.src = url;
  });
}

function SlotEditor({ slot, current }: { slot: SiteMediaSlot; current?: SiteMediaAsset }) {
  const { notify } = useDemo();
  const [preview, setPreview] = useState<Preview | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef<string | null>(null);
  // Object URLs hold the file in memory until released.
  useEffect(
    () => () => {
      if (latest.current) URL.revokeObjectURL(latest.current);
    },
    [],
  );
  const discard = () => {
    if (latest.current) URL.revokeObjectURL(latest.current);
    latest.current = null;
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };
  const choose = async (file: File | undefined) => {
    if (!file) return;
    if (latest.current) URL.revokeObjectURL(latest.current);
    const url = URL.createObjectURL(file);
    latest.current = url;
    try {
      const { width, height } = await readDimensions(url);
      setPreview({
        url,
        name: file.name,
        alt: current?.alt ?? '',
        problems: checkSiteImage({ type: file.type, size: file.size, width, height }, slot),
      });
    } catch (error) {
      setPreview({ url, name: file.name, alt: '', problems: [(error as Error).message] });
    }
  };
  const shown = preview?.url ?? current?.src;
  return (
    <section className="form-card media-slot" aria-labelledby={`slot-${slot.key}`}>
      <h2 id={`slot-${slot.key}`}>{slot.label}</h2>
      <p className="muted">
        {slot.where}. At least {slot.minWidth} × {slot.minHeight} px, JPEG, PNG or WebP, under 5 MB.
        {slot.required ? '' : ' Optional: nothing is shown until a picture is chosen.'}
      </p>
      <div className="media-slot__frame" style={{ aspectRatio: slot.aspect }}>
        {shown ? (
          // Blob previews are local files, so the image optimizer is bypassed for them.
          <Image
            src={shown}
            alt={preview ? 'Preview of the chosen picture' : (current?.alt ?? '')}
            fill
            sizes="320px"
            unoptimized={Boolean(preview)}
          />
        ) : (
          <span className="media-slot__empty">
            <ImageIcon size={28} /> No picture set
          </span>
        )}
      </div>
      <label className="media-slot__pick">
        <span className="sr-only">Choose a replacement for {slot.label}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => choose(e.target.files?.[0])}
        />
      </label>
      {preview && (
        <>
          <Input
            label="Picture description (for screen readers)"
            value={preview.alt}
            onChange={(e) => setPreview({ ...preview, alt: e.target.value })}
          />
          {preview.problems.length > 0 && (
            <ul className="media-slot__problems" role="alert">
              {preview.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          <div className="form-actions">
            <Button
              disabled={preview.problems.length > 0 || preview.alt.trim().length < 3}
              onClick={() => notify('Checked locally. Nothing was uploaded or published.')}
            >
              Check this picture
            </Button>
            <Button variant="ghost" onClick={discard}>
              Discard preview
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

export function SiteMediaManager({ media }: { media: SiteMediaMap }) {
  return (
    <>
      <PageHeading
        title="Site pictures"
        description="The shop-owned pictures shown across the public website."
      />
      <Notice>
        Only staff can change these pictures; customers and sellers can only add photos to their own
        listings. This preview checks size and shape in your browser and uploads nothing. Publishing
        needs the Media service with server-side staff permission checks.
      </Notice>
      <div className="media-grid">
        {siteMediaSlots.map((slot) => (
          <SlotEditor key={slot.key} slot={slot} current={media[slot.key]} />
        ))}
      </div>
    </>
  );
}
