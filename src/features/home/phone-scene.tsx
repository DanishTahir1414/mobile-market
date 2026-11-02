'use client';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { siApple, siGoogle, siOppo, siSamsung, siXiaomi } from 'simple-icons';
import { splatTexture, wallpaperTexture } from './phone-textures';

const W = 1.5; // phone width; height follows the picture's shape
const H = W / 0.4944;
const BODY = { depth: 0.12, bevel: 0.03 };
const FACE_Z = BODY.depth / 2 + BODY.bevel + 0.002;
const DEFAULT_BACK = '/images/phone-back.webp';

function roundedRect(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// Camera lenses as measured from the supplied photo: [across, down] as fractions of the phone.
const LENSES: [number, number][] = [
  [0.2047, 0.0998],
  [0.457, 0.1631],
  [0.2043, 0.2262],
];

const BRANDS = [
  { name: 'Apple', icon: siApple.path, tone: '#fff1c9' },
  { name: 'Samsung', icon: siSamsung.path, tone: '#ffc93c', wide: true },
  { name: 'Google', icon: siGoogle.path, tone: '#ffd8bd' },
  { name: 'OnePlus', text: '1+', tone: '#d9f3e4' },
  { name: 'Xiaomi', icon: siXiaomi.path, tone: '#ffe2a8' },
  { name: 'Oppo', icon: siOppo.path, tone: '#ffcfb0', wide: true },
];
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Soft studio reflections without downloading anything: gives the metal edge its shine. */
function StudioLight() {
  const gl = useThree((state) => state.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

function Scene({ section, backSrc }: { section: RefObject<HTMLElement | null>; backSrc: string }) {
  const phone = useRef<THREE.Group>(null);
  const orbit = useRef<(THREE.Mesh | null)[]>([]);
  const target = useRef(0);
  const current = useRef(0);
  const { invalidate, viewport } = useThree();
  const loaded = useLoader(THREE.TextureLoader, backSrc);

  const back = useMemo(() => {
    const t = loaded.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }, [loaded]);
  const front = useMemo(() => wallpaperTexture(), []);
  const splats = useMemo(() => BRANDS.map((b, i) => splatTexture(b, i + 3)), []);
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(W - BODY.bevel * 2, H - BODY.bevel * 2, 0.25), {
      depth: BODY.depth,
      bevelEnabled: true,
      bevelThickness: BODY.bevel,
      bevelSize: BODY.bevel,
      bevelSegments: 5,
      curveSegments: 24,
    });
    g.center();
    return g;
  }, []);
  useEffect(
    () => () => {
      back.dispose();
      front.dispose();
      splats.forEach((t) => t.dispose());
      body.dispose();
    },
    [back, front, splats, body],
  );

  // Scroll position becomes a 0..1 value in a ref, never React state, so scrolling stays smooth.
  useEffect(() => {
    const read = () => {
      const el = section.current;
      if (!el) return;
      const travel = el.offsetHeight - window.innerHeight;
      target.current = travel > 0 ? clamp01(-el.getBoundingClientRect().top / travel) : 0;
      invalidate();
    };
    read();
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    return () => {
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
    };
  }, [section, invalidate]);

  useFrame(() => {
    const g = phone.current;
    if (!g) return;
    current.current += (target.current - current.current) * 0.14;
    const p = current.current;
    // Starts showing the back, exactly like the still picture, then turns once around.
    g.rotation.y = Math.PI + p * Math.PI * 2;
    g.rotation.x = -0.06 + Math.sin(p * Math.PI) * 0.1;
    g.position.y = Math.sin(p * Math.PI) * 0.08;
    BRANDS.forEach((_, i) => {
      const m = orbit.current[i];
      if (!m) return;
      const t = clamp01((p - (0.05 + i * 0.12)) / 0.1);
      const angle = (i / BRANDS.length) * Math.PI * 2 + p * Math.PI * 2;
      const e = t > 0 ? easeOutBack(t) : 0;
      // Behind the phone the whole way round, so each one pops out from behind it.
      m.position.set(
        Math.cos(angle) * 1.05,
        [0.95, -0.7, 0.35, -1.15, 1.2, -0.2][i],
        -0.95 + Math.sin(angle) * 0.8,
      );
      m.scale.set(e * 0.95, e * (0.95 + 0.25 * Math.sin(t * Math.PI)), 1);
      m.rotation.z = (1 - t) * 0.9 * (i % 2 ? 1 : -1);
      m.visible = t > 0;
    });
    if (Math.abs(target.current - p) > 0.0008) invalidate();
  });

  // Fit the phone and its orbiting logos inside the stage.
  const scale = Math.min(viewport.width / 3, (viewport.height / 3.3) * 0.74);
  const withLenses = backSrc === DEFAULT_BACK;
  return (
    <group scale={scale}>
      <group ref={phone}>
        <mesh geometry={body}>
          <meshStandardMaterial color="#cfcfcb" metalness={1} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0, FACE_Z]}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={front} alphaTest={0.4} toneMapped={false} />
        </mesh>
        <group position={[0, 0, -FACE_Z]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <planeGeometry args={[W, H]} />
            <meshStandardMaterial
              map={back}
              transparent
              alphaTest={0.4}
              roughness={0.42}
              metalness={0.3}
            />
          </mesh>
          {withLenses &&
            LENSES.map(([u, v]) => (
              <mesh key={`${u}${v}`} position={[(u - 0.5) * W, (0.5 - v) * H, 0.012]}>
                <torusGeometry args={[0.172, 0.016, 20, 56]} />
                <meshStandardMaterial color="#d6d6d2" metalness={1} roughness={0.2} />
              </mesh>
            ))}
        </group>
      </group>
      {BRANDS.map((b, i) => (
        <mesh key={b.name} ref={(m) => void (orbit.current[i] = m)} visible={false}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={splats[i]}
            transparent
            depthWrite={false}
            alphaTest={0.02}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function PhoneScene({
  section,
  backSrc,
  onReady,
  onFail,
}: {
  section: RefObject<HTMLElement | null>;
  backSrc: string;
  onReady: () => void;
  onFail: () => void;
}) {
  return (
    <Canvas
      className="hero3d__canvas"
      aria-hidden="true"
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.4], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', onFail);
        onReady();
      }}
    >
      <StudioLight />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#fff4dc" />
      <Suspense fallback={null}>
        <Scene section={section} backSrc={backSrc} />
      </Suspense>
    </Canvas>
  );
}
