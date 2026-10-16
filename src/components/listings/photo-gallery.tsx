'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

interface ListingPhoto {
  src: string;
  alt: string;
}
function Photo({ photo, priority = false }: { photo?: ListingPhoto; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="gallery-photo">
      {!photo || failed ? (
        <p role="status">Photo unavailable. Other listing details remain available.</p>
      ) : (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 850px) 90vw, 60vw"
          priority={priority}
          unoptimized={photo.src.startsWith('blob:')}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
export function PhotoGallery({ photos, label }: { photos: ListingPhoto[]; label: string }) {
  const [index, setIndex] = useState(0),
    [open, setOpen] = useState(false);
  const touch = useRef({ x: 0, y: 0, swiped: false });
  const current = Math.min(index, Math.max(0, photos.length - 1));
  const move = (offset: number) => setIndex((current + offset + photos.length) % photos.length);
  const controls = (
    <div className="gallery-controls">
      <Button
        type="button"
        variant="secondary"
        disabled={photos.length < 2}
        aria-label="Previous photo"
        onClick={() => move(-1)}
      >
        <ChevronLeft size={22} />
      </Button>
      <span aria-live="polite">
        {photos.length ? current + 1 : 0} / {photos.length}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={photos.length < 2}
        aria-label="Next photo"
        onClick={() => move(1)}
      >
        <ChevronRight size={22} />
      </Button>
    </div>
  );
  const imageView = (fullscreen: boolean) => (
    <div
      className="gallery-stage"
      onTouchStart={(event) => {
        const point = event.touches[0];
        touch.current = { x: point.clientX, y: point.clientY, swiped: false };
      }}
      onTouchEnd={(event) => {
        const point = event.changedTouches[0];
        const distance = point.clientX - touch.current.x;
        if (
          photos.length > 1 &&
          Math.abs(distance) > 40 &&
          Math.abs(distance) > Math.abs(point.clientY - touch.current.y)
        ) {
          touch.current.swiped = true;
          move(distance < 0 ? 1 : -1);
        }
      }}
    >
      <Photo
        key={photos[current]?.src || 'missing'}
        photo={photos[current]}
        priority={!fullscreen}
      />
      {!fullscreen && (
        <button
          type="button"
          className="gallery-open"
          aria-label="Open full-screen photos"
          disabled={!photos.length}
          onClick={() => {
            if (!touch.current.swiped) setOpen(true);
            touch.current.swiped = false;
          }}
        />
      )}
      {controls}
    </div>
  );
  return (
    <section
      className="photo-gallery"
      aria-label={`${label} photos`}
      onKeyDown={(e) => {
        if (photos.length > 1 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault();
          move(e.key === 'ArrowLeft' ? -1 : 1);
        }
      }}
    >
      {imageView(false)}
      <div className="gallery-thumbnails">
        {photos.map((photo, i) => (
          <button
            type="button"
            key={`${photo.src}-${i}`}
            aria-label={`Show photo ${i + 1}: ${photo.alt}`}
            aria-pressed={i === current}
            onClick={() => setIndex(i)}
          >
            <Photo photo={photo} />
          </button>
        ))}
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`${label} · photos`}
        className="gallery-dialog"
      >
        {imageView(true)}
        <p>Use the left and right arrow keys to change photos. Escape closes this view.</p>
      </Dialog>
    </section>
  );
}
