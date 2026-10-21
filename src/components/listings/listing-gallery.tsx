'use client';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

/**
 * Native scroll-snap gives swipe on phones with no animation library, and only the first
 * slide loads eagerly so the page stays light. Position is read on scroll (one frame at a
 * time) rather than stored per pixel.
 */
export function ListingGallery({
  photos,
  alt,
  children,
}: {
  photos: string[];
  alt: string;
  children?: React.ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const many = photos.length > 1;

  const goTo = useCallback((next: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }, []);
  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = track.current;
      if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
    });
  };

  return (
    <div className="gallery">
      <div className="detail-image">
        <div
          ref={track}
          className="gallery__track"
          onScroll={onScroll}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${alt} photos`}
        >
          {photos.map((src, i) => (
            <div
              className="gallery__slide"
              key={src}
              aria-label={`Photo ${i + 1} of ${photos.length}`}
            >
              <Image
                src={src}
                alt={`Illustrative ${alt} photograph ${i + 1}`}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : 'lazy'}
                sizes="(max-width: 850px) 90vw, 55vw"
              />
            </div>
          ))}
        </div>
        {children}
        <Button
          variant="ghost"
          className="gallery__zoom"
          aria-label="View photo larger"
          onClick={() => setZoom(true)}
        >
          <Maximize2 size={16} />
        </Button>
        {many && (
          <>
            <Button
              variant="ghost"
              className="gallery__nav gallery__nav--prev"
              aria-label="Previous photo"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="ghost"
              className="gallery__nav gallery__nav--next"
              aria-label="Next photo"
              disabled={index === photos.length - 1}
              onClick={() => goTo(index + 1)}
            >
              <ChevronRight size={20} />
            </Button>
            <span className="gallery__count" aria-live="polite">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {many && (
        <ul className="gallery__thumbs">
          {photos.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
              >
                <Image src={src} alt="" fill sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={zoom} onClose={() => setZoom(false)} title={`${alt} · photo ${index + 1}`}>
        {zoom && (
          <div className="gallery__large">
            <Image
              src={photos[index]}
              alt={`Illustrative ${alt} photograph ${index + 1}`}
              fill
              sizes="90vw"
            />
          </div>
        )}
      </Dialog>
    </div>
  );
}
