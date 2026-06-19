/**
 * Wordmark morph -- the home hero expands `alzr.us` into `adam lazarus`.
 *
 * The domain is the in-order skeleton of the name: a(dam) l-a-z-a-r-u-s, where
 * the `.us` TLD is the tail of "Lazar-us". This animation makes that legible.
 * Six of seven characters survive in place; only the dot moves (it glides from
 * the `alzr|us` slot to the `adam|lazarus` boundary, then dissolves into a
 * space). The elided letters (d, a, m, and the two interior a's) fade into the
 * gaps the survivors open.
 *
 * Technique: FLIP (First-Last-Invert-Play). Each glyph carries a stable id, so
 * shared glyphs animate position via the Web Animations API (transform only --
 * compositor-friendly, no layout thrash) while unmatched glyphs fade. The final
 * layout is committed instantly; everything reaches it through transform/opacity.
 *
 * Plays once per browser session (sessionStorage). Reduced-motion or a repeat
 * visit snaps straight to the resting name. On completion it normalizes back to
 * plain text and hands off to the kinetic-type engine for pointer bloom + breath.
 */
import { init as initKineticType } from './kinetic-type';

const SESSION_KEY = 'alzr_wordmark_shown';
// Ramp-in for the expand (slow start, smooth finish) so the morph eases in
// rather than snapping; a gentle ease-out for the dissolve.
const EASE_RAMP = 'cubic-bezier(0.45, 0, 0.25, 1)';
const EASE_SETTLE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const T0_HOLD_MS = 850; // hold a beat or two on alzr.us before it expands
const EXPAND_MS = 920; // alzr.us -> adam.lazarus
const MID_HOLD_MS = 220; // beat on the dotted name
const RESOLVE_MS = 620; // adam.lazarus -> adam lazarus
const STAGGER_MS = 38; // per filler letter

interface Spec {
  readonly id: string;
  readonly ch: string;
}

// Survivors share ids across states; fillers (d, a1, m, a2, a3) are unique.
const T0: readonly Spec[] = [
  { id: 'a0', ch: 'a' },
  { id: 'l', ch: 'l' },
  { id: 'z', ch: 'z' },
  { id: 'r', ch: 'r' },
  { id: 'dot', ch: '.' },
  { id: 'u', ch: 'u' },
  { id: 's', ch: 's' },
];

const T1: readonly Spec[] = [
  { id: 'a0', ch: 'a' },
  { id: 'd', ch: 'd' },
  { id: 'a1', ch: 'a' },
  { id: 'm', ch: 'm' },
  { id: 'dot', ch: '.' },
  { id: 'l', ch: 'l' },
  { id: 'a2', ch: 'a' },
  { id: 'z', ch: 'z' },
  { id: 'a3', ch: 'a' },
  { id: 'r', ch: 'r' },
  { id: 'u', ch: 'u' },
  { id: 's', ch: 's' },
];

function reducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function sessionShown(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markShown(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* private mode / disabled storage: just replay next load, harmless */
  }
}

function makeGlyph(spec: Spec): HTMLSpanElement {
  const el = document.createElement('span');
  el.className = 'wm-mg';
  el.dataset.gid = spec.id;
  el.setAttribute('aria-hidden', 'true');
  el.textContent = spec.ch;
  return el;
}

function waitAnimations(anims: Animation[]): Promise<void> {
  return Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(() => undefined);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Snap straight to the resting name with no animation (reduced motion / repeat visit). */
function snap(live: HTMLElement, target: string): void {
  live.textContent = target;
  live.setAttribute('aria-label', target);
  live.setAttribute('data-morph-state', 'done');
  // data-kinetic is still on the element; BaseLayout's initKineticType() (called
  // right after us) splits it for pointer bloom.
}

/** alzr.us -> adam.lazarus: survivors slide apart, the dot glides, fillers fade in. */
function expand(live: HTMLElement, glyphs: Map<string, HTMLSpanElement>): Promise<void> {
  // FIRST: record current (T0) positions of every glyph on screen.
  const first = new Map<string, DOMRect>();
  for (const [id, el] of glyphs) first.set(id, el.getBoundingClientRect());

  // Build the T1 order, creating fillers that weren't in T0.
  const entering: HTMLSpanElement[] = [];
  const ordered: HTMLSpanElement[] = [];
  for (const spec of T1) {
    let el = glyphs.get(spec.id);
    if (!el) {
      el = makeGlyph(spec);
      glyphs.set(spec.id, el);
      entering.push(el);
    }
    ordered.push(el);
  }
  // appendChild reorders existing nodes and inserts the new ones, in T1 order.
  for (const el of ordered) live.appendChild(el);

  // Force layout so LAST reads the committed T1 geometry.
  void live.offsetWidth;

  const anims: Animation[] = [];
  // Shared glyphs (incl. the dot): invert to FIRST, play to identity.
  for (const [id, el] of glyphs) {
    if (entering.includes(el)) continue;
    const f = first.get(id);
    if (!f) continue;
    const last = el.getBoundingClientRect();
    const dx = f.left - last.left;
    const dy = f.top - last.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
    anims.push(
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
        duration: EXPAND_MS,
        easing: EASE_RAMP,
      }),
    );
  }
  // Fillers fade + lift into the gaps that opened, lightly staggered.
  entering.forEach((el, i) => {
    anims.push(
      el.animate(
        [
          { opacity: 0, transform: 'translateY(0.14em) scale(0.86)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: EXPAND_MS, easing: EASE_RAMP, delay: i * STAGGER_MS, fill: 'backwards' },
      ),
    );
  });

  return waitAnimations(anims);
}

/** adam.lazarus -> adam lazarus: the dot fades in place as a real word space
 *  opens. The resting layout already matches the plain-text hand-off, so
 *  nothing shifts when we normalize at the end. */
function resolve(live: HTMLElement, glyphs: Map<string, HTMLSpanElement>): Promise<void> {
  const dot = glyphs.get('dot');
  const lEl = glyphs.get('l');
  if (!dot || !lEl) return Promise.resolve();

  // FIRST: dotted-name positions.
  const first = new Map<string, DOMRect>();
  for (const [id, el] of glyphs) first.set(id, el.getBoundingClientRect());

  // Lift the dot out of flow so it fades in place, and drop a real word space at
  // the boundary -- the exact spacing textContent produces at hand-off, so the
  // letters end where they'll rest and the normalize is seamless.
  const dotRect = dot.getBoundingClientRect();
  const liveRect = live.getBoundingClientRect();
  live.style.position = 'relative';
  dot.style.position = 'absolute';
  dot.style.left = `${dotRect.left - liveRect.left}px`;
  dot.style.top = `${dotRect.top - liveRect.top}px`;
  live.insertBefore(document.createTextNode(' '), lEl);

  void live.offsetWidth;

  const anims: Animation[] = [];
  // Letters past the boundary ease to their final resting positions.
  for (const [id, el] of glyphs) {
    if (el === dot) continue;
    const f = first.get(id);
    if (!f) continue;
    const dx = f.left - el.getBoundingClientRect().left;
    if (Math.abs(dx) < 0.5) continue;
    anims.push(
      el.animate([{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }], {
        duration: RESOLVE_MS,
        easing: EASE_SETTLE,
      }),
    );
  }
  // The dot dissolves where the new space sits.
  anims.push(
    dot.animate(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0.4)' },
      ],
      { duration: RESOLVE_MS * 0.75, easing: 'ease-out', fill: 'forwards' },
    ),
  );

  return waitAnimations(anims);
}

/** Build T0, run the two beats, then hand the resting name to kinetic-type. */
async function play(live: HTMLElement, target: string): Promise<void> {
  try {
    const glyphs = new Map<string, HTMLSpanElement>();
    const frag = document.createDocumentFragment();
    for (const spec of T0) {
      const el = makeGlyph(spec);
      glyphs.set(spec.id, el);
      frag.appendChild(el);
    }
    // Replace the SSR "alzr.us" text node with identical glyph spans -- no visual
    // change, so the page that already painted alzr.us stays put until it expands.
    live.textContent = '';
    live.appendChild(frag);

    await delay(T0_HOLD_MS);
    await expand(live, glyphs);
    await delay(MID_HOLD_MS);
    await resolve(live, glyphs);
  } catch {
    /* fall through to the clean resting state below */
  }

  // Hand off: normalize to plain text, restore kinetic, resume breath.
  live.textContent = target;
  live.style.removeProperty('position'); // clear the relative set during resolve
  live.setAttribute('aria-label', target);
  live.setAttribute('data-kinetic', '');
  live.setAttribute('data-morph-state', 'done');
  initKineticType();
}

/**
 * Wire the current document. Idempotent and safe on every `astro:after-swap`.
 * No-op on pages without a `[data-wordmark-morph]` hero. MUST run before
 * BaseLayout's initKineticType(): the play path removes `data-kinetic` from the
 * hero synchronously so kinetic skips it until the morph hands it back.
 */
export function init(): void {
  const live = document.querySelector<HTMLElement>('[data-wordmark-morph]');
  if (!live) return;

  const state = live.getAttribute('data-morph-state');
  if (state === 'playing' || state === 'done') return; // already handled this view

  const target = live.getAttribute('data-wordmark-morph') || 'adam lazarus';

  if (reducedMotion() || sessionShown()) {
    snap(live, target);
    return;
  }

  markShown();
  live.removeAttribute('data-kinetic'); // claim the hero from kinetic for the morph
  live.setAttribute('data-morph-state', 'playing');
  void play(live, target);
}
