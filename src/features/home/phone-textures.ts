import * as THREE from 'three';

// Small seeded random so every visit draws the same splats.
function random(seed: number) {
  let a = seed * 2654435761;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext('2d')! };
}

function finish(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** The phone's front: black glass, a warm abstract wallpaper, the island and a clock. */
export function wallpaperTexture() {
  const w = 744;
  const h = 1504;
  const { c, ctx } = canvas(w, h);
  rounded(ctx, 0, 0, w, h, 112);
  ctx.fillStyle = '#0b0a09';
  ctx.fill();
  const inset = 14;
  rounded(ctx, inset, inset, w - inset * 2, h - inset * 2, 98);
  ctx.clip();
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#ffd27a');
  base.addColorStop(0.5, '#ff9a4d');
  base.addColorStop(1, '#ff6b4a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const blobs: [number, number, number, string][] = [
    [0.15, 0.2, 0.7, 'rgba(255,240,190,0.9)'],
    [0.9, 0.45, 0.6, 'rgba(255,120,80,0.8)'],
    [0.2, 0.8, 0.75, 'rgba(255,196,110,0.85)'],
    [0.85, 0.95, 0.55, 'rgba(255,90,70,0.7)'],
    [0.55, 0.55, 0.4, 'rgba(255,226,160,0.55)'],
  ];
  for (const [x, y, r, col] of blobs) {
    const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * w);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.fillStyle = '#050505';
  rounded(ctx, w / 2 - 112, 44, 224, 64, 32);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.textAlign = 'center';
  ctx.font = '600 188px system-ui, sans-serif';
  ctx.fillText('9:41', w / 2, 400);
  return finish(c);
}

/** An ink splat in a soft colour with the brand mark on it. */
export function splatTexture(
  brand: { name: string; icon?: string; text?: string; tone: string; wide?: boolean },
  seed: number,
) {
  const size = 512;
  const { c, ctx } = canvas(size, size);
  const rand = random(seed);
  ctx.translate(size / 2, size / 2);
  const points = 24;
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const r = 150 + rand() * 34 + (i % 3 === 0 ? 40 + rand() * 18 : 0);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  ctx.beginPath();
  pts.forEach((p, i) => {
    const n = pts[(i + 1) % points];
    const mx = (p[0] + n[0]) / 2;
    const my = (p[1] + n[1]) / 2;
    if (i === 0) ctx.moveTo(mx, my);
    else ctx.quadraticCurveTo(p[0], p[1], mx, my);
  });
  const first = pts[0];
  const second = pts[1];
  ctx.quadraticCurveTo(first[0], first[1], (first[0] + second[0]) / 2, (first[1] + second[1]) / 2);
  ctx.closePath();
  ctx.fillStyle = brand.tone;
  ctx.shadowColor = 'rgba(110,72,10,0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(160,100,10,0.35)';
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const d = 205 + rand() * 40;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 7 + rand() * 17, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const x of [-70, 20, 90]) {
    ctx.beginPath();
    ctx.roundRect(x - 9, 130, 18, 55 + rand() * 40, 9);
    ctx.fill();
  }
  ctx.fillStyle = '#1c1710';
  if (brand.icon) {
    const s = (brand.wide ? 225 : 150) / 24;
    ctx.save();
    ctx.scale(s, s);
    ctx.translate(-12, -12);
    ctx.fill(new Path2D(brand.icon));
    ctx.restore();
  } else {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 150px system-ui, sans-serif';
    ctx.fillText(brand.text ?? brand.name, 0, 8);
  }
  return finish(c);
}
