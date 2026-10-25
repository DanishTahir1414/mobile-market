// Browser smoke test. Run `npm run build` first, then `npm run test:e2e`.
// Uses puppeteer-core with a bundled headless Chromium (works without a GPU or a system browser);
// set CHROME_PATH to use your own Chrome instead.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const PORT = 3199;
const base = `http://localhost:${PORT}`;
const axeSource = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const failures = [];
// The loading screen blocks clicks while it plays, so interact only after it has faded.
const introGone = (page) =>
  page.waitForFunction(
    () => {
      const el = document.querySelector('.preloader');
      return !el || getComputedStyle(el).visibility === 'hidden';
    },
    { timeout: 15000, polling: 100 },
  );
const warnings = [];
const check = (ok, message) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`);
  if (!ok) failures.push(message);
};

// A leftover server on this port would serve an old build and fail the checks misleadingly.
if (
  await fetch(base).then(
    () => true,
    () => false,
  )
) {
  console.error(`Port ${PORT} is already in use. Stop that server and run again.`);
  process.exit(2);
}
const server = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)],
  {
    stdio: 'ignore',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  },
);
const stop = () => server.kill('SIGTERM');
process.on('exit', stop);

for (let i = 0; i < 40; i++) {
  try {
    if ((await fetch(base)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: process.env.CHROME_PATH || (await chromium.executablePath()),
  headless: 'shell',
});

try {
  const routes = [
    '/',
    '/mobiles',
    '/mobiles/iphone-15-pro',
    '/sell',
    '/shop',
    '/login',
    '/staff',
    '/staff/media',
    '/account/listings',
  ];
  let page = await browser.newPage();
  for (const [name, width, height] of process.env.E2E_QUICK
    ? []
    : [
        ['phone', 390, 800],
        ['desktop', 1280, 800],
      ]) {
    await page.setViewport({ width, height, isMobile: width < 600, hasTouch: width < 600 });
    for (const route of routes) {
      const res = await page.goto(base + route, { waitUntil: 'networkidle0' });
      check(res.ok() || res.status() === 304, `${name} ${route} responds 200`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      check(overflow <= 1, `${name} ${route} has no sideways scrolling`);
    }
  }

  // A fresh tab: switching a tab between phone and desktop emulation can stall its animations.
  await page.close();
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(base + '/', { waitUntil: 'networkidle0' });
  const gone = await introGone(page).then(
    () => true,
    () => false,
  );
  check(gone, 'loading screen disappears on its own');

  await page.goto(base + '/?hero=3d', { waitUntil: 'networkidle0' });
  await introGone(page).catch(() => {});
  await page
    .waitForSelector('.hero3d__stage[data-ready="true"]', { timeout: 15000 })
    .catch(() => {});
  const ready = await page.evaluate(() => document.querySelector('.hero3d__stage')?.dataset.ready);
  check(ready === 'true', '3D phone loads when forced on');
  const shots = [];
  for (const f of [0.1, 0.6]) {
    await page.evaluate((f) => {
      const s = document.querySelector('.hero3d');
      scrollTo(0, f * (s.offsetHeight - innerHeight));
    }, f);
    await new Promise((r) => setTimeout(r, 1200));
    shots.push(
      (await page.screenshot({ clip: { x: 640, y: 100, width: 640, height: 600 } })).toString(
        'base64',
      ),
    );
  }
  check(shots[0] !== shots[1], 'scrolling turns the 3D phone');
  await page.goto(base + '/?hero=off', { waitUntil: 'networkidle0' });
  check((await page.$('.hero3d__canvas')) === null, 'static photo is used when 3D is off');

  await page.goto(base + '/mobiles/iphone-15-pro', { waitUntil: 'networkidle0' });
  await introGone(page).catch(() => {});
  await page.click('.gallery__slide');
  await new Promise((r) => setTimeout(r, 400));
  const box = await page.evaluate(() => {
    const r = document.querySelector('.lightbox__stage')?.getBoundingClientRect();
    return r && { w: r.width, h: r.height, fits: r.right <= innerWidth && r.bottom <= innerHeight };
  });
  check(Boolean(box?.fits), 'full-screen photo fits the screen');
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 200));
  check((await page.$('.lightbox')) === null, 'Escape closes the photo viewer');

  // Accessibility: critical problems fail the run; serious ones are listed for review.
  await page.close();
  page = await browser.newPage();
  await page.setViewport({ width: 390, height: 800, isMobile: true, hasTouch: true });
  for (const route of ['/', '/mobiles', '/mobiles/iphone-15-pro', '/login']) {
    await page.goto(base + route + (route === '/' ? '?hero=off' : ''), {
      waitUntil: 'networkidle0',
    });
    await new Promise((r) => setTimeout(r, 1800));
    await page.evaluate(axeSource);
    const result = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }));
    const critical = result.violations.filter((v) => v.impact === 'critical');
    check(critical.length === 0, `accessibility ${route}: no critical problems`);
    for (const v of result.violations.filter((v) => v.impact !== 'critical'))
      warnings.push(`${route}: ${v.impact} ${v.id} (${v.nodes.length})`);
  }
} finally {
  await browser.close();
  stop();
}
if (warnings.length) console.log('\nTo review:\n' + warnings.map((w) => '  ' + w).join('\n'));
console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);
