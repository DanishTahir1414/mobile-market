'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const PhoneScene = dynamic(() => import('./phone-scene'), { ssr: false });

/** Capable devices only: the static photo stays for low-power, data-saving and reduced-motion cases. */
function canRun3d() {
  // ?hero=3d or ?hero=off lets testers force either mode on any device.
  const forced = new URLSearchParams(location.search).get('hero');
  if (forced === 'off') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (forced === '3d') return true;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) < 3 || (navigator.hardwareConcurrency ?? 8) < 4) return false;
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * The server renders the copy and the static photo, so the first paint is fast and works
 * without JavaScript. On capable devices the 3D phone loads afterwards, and scrolling through
 * this tall section turns it once around. If anything fails, the photo stays.
 */
export function HeroStage({ copy, fallback }: { copy: ReactNode; fallback: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<'static' | 'loading' | 'ready'>('static');

  useEffect(() => {
    // Decided after first paint, so the static photo is what loads first.
    const id = requestAnimationFrame(() => canRun3d() && setMode('loading'));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section ref={section} className="hero3d" data-3d={mode === 'static' ? 'off' : 'on'}>
      <div className="hero3d__sticky hero container">
        <div className="hero-copy">{copy}</div>
        <div className="hero3d__stage" data-ready={mode === 'ready'}>
          <div className="hero3d__static">{fallback}</div>
          {mode !== 'static' && (
            <PhoneScene
              section={section}
              onReady={() => setMode('ready')}
              onFail={() => setMode('static')}
            />
          )}
        </div>
      </div>
    </section>
  );
}
