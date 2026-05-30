/**
 * Kinetic type -- per-glyph, pointer-reactive variable-font axes.
 *
 * The engine writes a single proximity value per glyph (`--p`, 0..1); every axis
 * mapping and all the easing live in CSS. `.glyph` reads `--p` through a
 * registered `@property` number, so the `transition` interpolates it frame-perfect
 * on the compositor's own schedule. That split is the whole trick: JS stays cheap
 * (one custom-property write per glyph, only when it changes) while CSS does the
 * continuous interpolation. `font-variation-settings` can't be transitioned, so we
 * never try -- we transition `--p` and re-derive the axes with calc() in CSS.
 *
 * Pure progressive enhancement: nothing here runs without a fine hover pointer and
 * no reduced-motion request. When it doesn't run, the marked elements keep their
 * authored styles untouched (the `.glyph` spans are never created).
 */

interface Glyph {
  readonly el: HTMLElement;
  cx: number; // viewport-space center x (NaN until measured)
  cy: number; // viewport-space center y
  visible: boolean;
  last: number; // last written --p, so we can skip redundant writes
}

// Visual tuning surface -- the values the browser-iteration pass touches.
const CONFIG = {
  radius: 190, // px: pointer influence radius around a glyph center
  falloff: 2.2, // proximity = (1 - d / radius) ** falloff; higher = tighter spotlight
  epsilon: 0.008, // skip writes smaller than this to avoid style churn
} as const;

const READY_ATTR = 'data-kinetic-ready';
const LISTENER_FLAG = '__kineticBound';

const tracked = new Map<Element, Glyph>();
let io: IntersectionObserver | null = null;
let pointer: { x: number; y: number } | null = null;
let frameScheduled = false;
let measureScheduled = false;

function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function supportsFinePointer(): boolean {
  return matchMedia('(hover: hover)').matches && matchMedia('(pointer: fine)').matches;
}

/** Split an element's text into per-glyph spans once, preserving its a11y text. */
function split(el: HTMLElement): void {
  if (el.hasAttribute(READY_ATTR)) return;
  const text = el.textContent ?? '';
  if (!text) return;
  // The full string stays available to assistive tech + find-in-page; the spans
  // are decorative and hidden from the accessibility tree.
  if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', text);
  const frag = document.createDocumentFragment();
  for (const char of text) {
    // Spaces stay plain text nodes: wrapping each letter in a span removes the
    // soft-wrap opportunities a space normally provides, so a span-wrapped space
    // stops titles from breaking across lines. Only visible glyphs get a span
    // (and the proximity axes); spaces keep word gaps + line breaks intact.
    if (char === ' ') {
      frag.appendChild(document.createTextNode(' '));
      continue;
    }
    const span = document.createElement('span');
    span.className = 'glyph';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = char;
    frag.appendChild(span);
  }
  el.textContent = '';
  el.appendChild(frag);
  el.setAttribute(READY_ATTR, '');
}

/** Read pass: recompute cached glyph centers. Never interleaved with writes. */
function measure(): void {
  measureScheduled = false;
  for (const g of tracked.values()) {
    if (!g.visible) continue;
    const r = g.el.getBoundingClientRect();
    g.cx = r.left + r.width / 2;
    g.cy = r.top + r.height / 2;
  }
}

function scheduleMeasure(): void {
  if (measureScheduled) return;
  measureScheduled = true;
  requestAnimationFrame(measure);
}

/** Write pass: map pointer distance -> proximity -> `--p` for each visible glyph. */
function frame(): void {
  frameScheduled = false;
  const { radius, falloff, epsilon } = CONFIG;
  for (const g of tracked.values()) {
    if (!g.visible || Number.isNaN(g.cx)) continue;
    let p = 0;
    if (pointer) {
      const d = Math.hypot(pointer.x - g.cx, pointer.y - g.cy);
      if (d < radius) p = (1 - d / radius) ** falloff;
    }
    if (Math.abs(p - g.last) < epsilon) continue;
    g.last = p;
    g.el.style.setProperty('--p', p.toFixed(3));
  }
}

function scheduleFrame(): void {
  if (frameScheduled) return;
  frameScheduled = true;
  requestAnimationFrame(frame);
}

function onPointerMove(e: PointerEvent): void {
  pointer = { x: e.clientX, y: e.clientY };
  scheduleFrame();
}

function onPointerLeave(): void {
  pointer = null;
  scheduleFrame(); // relaxes every glyph back to --p: 0; CSS eases the return
}

/** Bind global listeners exactly once so same-document swaps never double-bind. */
function bindOnce(): void {
  const w = window as Window & { [LISTENER_FLAG]?: boolean };
  if (w[LISTENER_FLAG]) return;
  w[LISTENER_FLAG] = true;
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('blur', onPointerLeave);
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  window.addEventListener('scroll', scheduleMeasure, { passive: true });
}

/**
 * Wire up the current document. Idempotent and safe to call on every
 * `astro:after-swap`: it disconnects the previous observer, splits any new
 * `[data-kinetic]` elements, and rebuilds the tracked glyph set.
 */
export function init(): void {
  if (prefersReducedMotion() || !supportsFinePointer()) return;

  const targets = document.querySelectorAll<HTMLElement>('[data-kinetic]');
  if (targets.length === 0) return;
  for (const el of targets) split(el);

  io?.disconnect();
  tracked.clear();
  for (const el of document.querySelectorAll<HTMLElement>('[data-kinetic] .glyph')) {
    tracked.set(el, { el, cx: Number.NaN, cy: Number.NaN, visible: false, last: -1 });
  }

  // Only track on-screen glyphs (the writing index can hold many titles); a
  // newly-visible glyph re-measures its center before the next write pass.
  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const g = tracked.get(entry.target);
      if (g) g.visible = entry.isIntersecting;
    }
    scheduleMeasure();
  });
  for (const g of tracked.values()) io.observe(g.el);

  bindOnce();
  scheduleMeasure();
}
