'use client';
import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';

const PhoneScene = dynamic(() => import('./phone-scene'), { ssr: false });

type Verdict = { ok: true; gentle: boolean } | { ok: false; reason: string };

/**
 * Decides whether this device gets the 3D phone. Reduced-motion users still get it, with plain
 * scroll-linked turning and no easing or bounce. Only a missing capability or a data-saver
 * setting turns it off, and the reason is recorded so it can be read in the console.
 */
function check(): Verdict {
  const forced = new URLSearchParams(location.search).get('hero');
  if (forced === 'off') return { ok: false, reason: 'switched off with ?hero=off' };
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return { ok: false, reason: 'data saver is on' };
  if (forced !== '3d' && ((nav.deviceMemory ?? 8) < 2 || (navigator.hardwareConcurrency ?? 8) < 2))
    return { ok: false, reason: 'device looks too low-powered (add ?hero=3d to force)' };
  try {
    if (!document.createElement('canvas').getContext('webgl2'))
      return { ok: false, reason: 'WebGL 2 is not available' };
  } catch {
    return { ok: false, reason: 'WebGL 2 is not available' };
  }
  return { ok: true, gentle: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
}

/** If the 3D scene throws (for example a missing picture), keep the page and show the still. */
class SceneBoundary extends Component<
  { onFail: (reason: string) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onFail(`3D scene error: ${error.message}`);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The server renders the copy and the still picture, so the first paint is fast and works
 * without JavaScript. On capable devices the 3D phone loads afterwards, and scrolling through
 * this tall section turns it once around. If anything fails, the picture stays.
 */
export function HeroStage({
  copy,
  fallback,
  backSrc,
}: {
  copy: ReactNode;
  fallback: ReactNode;
  backSrc: string;
}) {
  const section = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<'static' | 'loading' | 'ready'>('static');
  const [gentle, setGentle] = useState(false);
  const [reason, setReason] = useState('not checked yet');

  const fail = (why: string) => {
    console.info(`[hero] 3D is off: ${why}`);
    setReason(why);
    setMode('static');
  };

  useEffect(() => {
    // Decided after first paint, so the still picture is what loads first.
    const id = requestAnimationFrame(() => {
      const verdict = check();
      if (verdict.ok) {
        setGentle(verdict.gentle);
        setReason('on');
        setMode('loading');
      } else {
        console.info(`[hero] 3D is off: ${verdict.reason}`);
        setReason(verdict.reason);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      ref={section}
      className="hero3d"
      data-3d={mode === 'static' ? 'off' : 'on'}
      data-3d-reason={reason}
    >
      <div className="hero3d__sticky hero container">
        <div className="hero-copy">{copy}</div>
        <div className="hero3d__stage" data-ready={mode === 'ready'}>
          <div className="hero3d__static">{fallback}</div>
          {mode !== 'static' && (
            <SceneBoundary onFail={fail}>
              <PhoneScene
                section={section}
                backSrc={backSrc}
                gentle={gentle}
                onReady={() => setMode('ready')}
                onFail={() => fail('WebGL context was lost')}
              />
            </SceneBoundary>
          )}
        </div>
      </div>
    </section>
  );
}
