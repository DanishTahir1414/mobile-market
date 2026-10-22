'use client';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lightbox } from './lightbox';

/**
 * Native scroll-snap gives swipe on phones with no animation library, and only the first
 * slide loads eagerly so the page stays light. Clicking or tapping a photo opens it full
 * screen; a mouse also gets a hover zoom. Position is read once per frame while scrolling.
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
  const [open, setOpen] = useState<number | null>(null);
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
          role="group"
          aria-roledescription="carousel"
          aria-label={`${alt} photos`}
        >
          {photos.map((src, i) => (
            <button
              type="button"
              className="gallery__slide"
              key={src}
              aria-label={`View photo ${i + 1} of ${photos.length} full screen`}
              onClick={() => setOpen(i)}
              onPointerMove={(e) => {
                if (e.pointerType !== 'mouse') return;
                const box = e.currentTarget.getBoundingClientRect();
                const img = e.currentTarget.querySelector('img');
                if (img)
                  img.style.transformOrigin = `${((e.clientX - box.left) / box.width) * 100}% ${((e.clientY - box.top) / box.height) * 100}%`;
              }}
            >
              <Image
                src={src}
                alt={`Illustrative ${alt} photograph ${i + 1}`}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : 'lazy'}
                sizes="(max-width: 850px) 90vw, 55vw"
              />
            </button>
          ))}
        </div>
        {children}
        <span className="gallery__zoom" aria-hidden="true">
          <Expand size={14} /> Tap to enlarge
        </span>
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
      {open !== null && (
        <Lightbox
          photos={photos}
          index={open}
          alt={alt}
          onIndex={(n) => {
            setOpen(n);
            goTo(n);
          }}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
