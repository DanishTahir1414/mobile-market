'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Full-screen photo viewer. It shows only the photo: the image fits the screen without
 * cropping, the page behind stays still, and focus returns to the photo that opened it.
 */
export function Lightbox({
  photos,
  index,
  alt,
  onIndex,
  onClose,
}: {
  photos: string[];
  index: number;
  alt: string;
  onIndex: (next: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const last = photos.length - 1;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1));
      if (e.key === 'ArrowRight') onIndex(Math.min(last, index + 1));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, last, onClose, onIndex]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt}, photo ${index + 1} of ${photos.length}`}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 50) onIndex(Math.min(last, Math.max(0, index + (dx < 0 ? 1 : -1))));
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="lightbox__btn lightbox__close"
        aria-label="Close photo"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <div className="lightbox__stage">
        <Image
          key={photos[index]}
          src={photos[index]}
          alt={`${alt} photo ${index + 1}`}
          fill
          sizes="100vw"
          quality={90}
          onClick={stop}
        />
      </div>
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox__btn lightbox__nav lightbox__nav--prev"
            aria-label="Previous photo"
            disabled={index === 0}
            onClick={(e) => (stop(e), onIndex(index - 1))}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="lightbox__btn lightbox__nav lightbox__nav--next"
            aria-label="Next photo"
            disabled={index === last}
            onClick={(e) => (stop(e), onIndex(index + 1))}
          >
            <ChevronRight size={22} />
          </button>
          <span className="lightbox__count" aria-live="polite">
            {index + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}
