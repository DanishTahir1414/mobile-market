'use client';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';

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

const GOLD = '#e8ac2c';

/** A phone built from basic shapes: no model file to download. */
function Phone({ section }: { section: RefObject<HTMLElement | null> }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef(0);
  const current = useRef(0);
  const { invalidate, viewport } = useThree();
  const loaded = useLoader(THREE.TextureLoader, '/images/logo-jugnu.webp');
  const logo = useMemo(() => {
    const t = loaded.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [loaded]);

  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(1.5, 3.1, 0.26), {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.045,
      bevelSegments: 4,
      curveSegments: 20,
    });
    g.center();
    return g;
  }, []);
  const screen = useMemo(() => new THREE.ShapeGeometry(roundedRect(1.38, 2.98, 0.2), 20), []);

  // Scroll position becomes a 0..1 value in a ref, never React state, so scrolling stays smooth.
  useEffect(() => {
    const read = () => {
      const el = section.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      target.current = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0;
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
    const g = group.current;
    if (!g) return;
    current.current += (target.current - current.current) * 0.14;
    const p = current.current;
    g.rotation.y = 0.45 + p * Math.PI * 2;
    g.rotation.x = -0.1 + Math.sin(p * Math.PI) * 0.18;
    g.rotation.z = 0.06 - Math.sin(p * Math.PI * 2) * 0.05;
    g.position.y = Math.sin(p * Math.PI) * 0.14;
    // Keep drawing until the easing settles, then stop and use no power.
    if (Math.abs(target.current - p) > 0.0008) invalidate();
  });

  // Sized so the whole phone, including its tilt, stays inside the stage.
  const scale = Math.min(viewport.width / 2.2, (viewport.height / 3.3) * 0.74);
  return (
    <group ref={group} scale={scale}>
      <mesh geometry={body}>
        <meshStandardMaterial color={GOLD} metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh geometry={screen} position={[0, 0, 0.126]}>
        <meshStandardMaterial color="#0d0b08" roughness={0.18} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.1, 0.128]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial map={logo} toneMapped={false} />
      </mesh>
      {/* Camera module on the back */}
      <mesh position={[-0.38, 1.05, -0.15]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.62, 0.62, 0.05]} />
        <meshStandardMaterial color="#1c1710" roughness={0.4} metalness={0.3} />
      </mesh>
      {[
        [-0.5, 1.17],
        [-0.26, 1.17],
        [-0.38, 0.93],
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x, y, -0.19]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 28]} />
          <meshStandardMaterial color="#3a3226" roughness={0.15} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export default function PhoneScene({
  section,
  onReady,
  onFail,
}: {
  section: RefObject<HTMLElement | null>;
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
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 4, 5]} intensity={2.6} color="#fff4dc" />
      <directionalLight position={[-4, 1, -4]} intensity={1.6} color="#ffd28a" />
      <directionalLight position={[0, -3, 3]} intensity={0.6} />
      <Suspense fallback={null}>
        <Phone section={section} />
      </Suspense>
    </Canvas>
  );
}
