/**
 * Depth slider -- reshapes a depth post between five reading levels.
 *
 * Visibility is pure CSS: the post body carries data-depth="N" and every
 * <Depth> wrapper lists the levels it covers, so with no JS the reader gets the
 * server-rendered level 3. This script only adds the motion and the controls:
 *
 *  - Leaving blocks collapse (height, margins, padding, borders to 0) and fade;
 *    entering blocks expand from 0 and fade in. Block wrappers are
 *    display: contents, so each child box animates in the normal flow and
 *    margins collapse exactly as they do at rest.
 *  - Inline clauses fade; their paragraph's height eases to the new size.
 *  - A level change mid-animation retargets from the current animated values,
 *    so fast drags never stack or snap.
 *  - Scroll anchoring is manual: the first element in view that is stable at
 *    both levels keeps its viewport offset every frame (Safari has no CSS
 *    overflow-anchor). Reduced motion switches instantly, still anchored.
 *
 * Lifecycle: binds on load and astro:page-load, tears down on astro:before-swap.
 * Everything per-page hangs off one AbortController, so nothing leaks across
 * ClientRouter navigations.
 *
 * ── Motion plan ("Ink & ruler") ──
 *
 * Focal moment: a depth change. Nothing else on the control moves on its own.
 *
 * Feedback (the instrument; CSS keyed off data-level, WAAPI for the detent):
 *  - Thumb glides to the stop and the ink fill follows it: translate / scale,
 *    180 ms + 45 ms per extra stop crossed, cubic-bezier(0.16, 1, 0.3, 1).
 *  - Ticks take ink as the thumb reaches them (120 ms, delayed along the
 *    travel).
 *  - Detent on arrival: the thumb compresses to 0.9 and settles, 260 ms, no
 *    overshoot; the tick under it flashes past the thumb's edges, 420 ms.
 *  - Label: Fraunces SOFT (100 at Summary to 0 at Technical deep dive) with wght 380
 *    to 540 and a small tracking shift, tweened from wherever they are to the
 *    new level, 300 ms, same ease, so a drag reads as one morph. Optical size
 *    is the browser's.
 *  - Minutes: each changed digit rolls in its slot, up when the number grows,
 *    260 ms, tens 30 ms behind ones.
 *  Keyboard, end labels and both controls all run through the same path.
 *
 * Continuity (what the level added; drawn once the page has settled):
 *  - A cobalt hairline in the gutter beside each block that appeared: scaleY
 *    from the top 400 ms, hold 1200 ms, fade 600 ms. Document order, 70 ms
 *    apart, the last starting within 250 ms of the first. Near the viewport
 *    only. Inline clauses get a faint cobalt wash drawn left to right.
 *  - Removals keep the quick collapse and get no mark.
 *
 * Discovery: on a reader's first depth post the header thumb breathes once
 * (swell to 1.3 and back plus one expanding ring, 2200 ms, ease-in-out), after
 * 1400 ms in view and idle. A stored flag, or any use of the slider, spends it.
 *
 * Budget: transform + opacity for the thumb, fill, flash, ring, digits and
 * marks. Font-variation tweening touches one small label per control. The
 * wash animates background-size on one clause. Everything is skipped
 * while the tab is hidden, and the pill's effects are skipped while it is.
 *
 * Reduced motion: thumb, fill, axes and digits switch at once; no detent, no
 * breath; marks and washes appear by opacity (150 ms), hold, then fade.
 */
import {
  DEPTH_DEFAULT,
  DEPTH_LABELS,
  DEPTH_PARAM,
  DEPTH_SEEN_KEY,
  DEPTH_STORAGE_KEY,
  type DepthLevel,
  depthReadout,
  isDepthLevel,
  parseDepth,
} from '../lib/depth';

const DURATION = 320; // ms, block collapse/expand
const EASE_SIZE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const EASE_FADE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
const SETTLE_MS = 350; // URL + storage + announcement after the slider rests
const HOLD = 'data-depth-hold';

// The instrument and the marks (see the motion plan above).
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const TRAVEL = 180; // ms, thumb + ink to the next stop
const TRAVEL_STEP = 45; // ms more per extra stop crossed
const DETENT = 260;
const FLASH = 420;
const MORPH = 300;
const ROLL = 260;
const ROLL_LAG = 30; // ms each digit trails the one to its right
const MARK_DRAW = 400;
const MARK_HOLD = 1200;
const MARK_FADE = 600;
const MARK_APPEAR = 150; // reduced motion: opacity in, no draw
const MARK_STAGGER = 70;
const MARK_SPREAD = 250; // the last mark starts within this of the first
const BREATH = 2200;
const BREATH_IDLE = 1400;
const NBSP = '\u00a0';

const SIZE_PROPS = [
  'height',
  'marginTop',
  'marginBottom',
  'paddingTop',
  'paddingBottom',
  'borderTopWidth',
  'borderBottomWidth',
] as const;
type SizeProp = (typeof SIZE_PROPS)[number];
type Box = Record<SizeProp, number>;
type Boxy = HTMLElement | SVGElement;

const ZERO: Box = {
  height: 0,
  marginTop: 0,
  marginBottom: 0,
  paddingTop: 0,
  paddingBottom: 0,
  borderTopWidth: 0,
  borderBottomWidth: 0,
};

const CLIP = typeof CSS !== 'undefined' && CSS.supports('overflow', 'clip') ? 'clip' : 'hidden';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Level resolution: ?depth= > remembered choice > 3 ──

function readStored(): DepthLevel | null {
  try {
    return parseDepth(localStorage.getItem(DEPTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(level: DepthLevel): void {
  try {
    localStorage.setItem(DEPTH_STORAGE_KEY, String(level));
  } catch {
    // Private mode or blocked storage: the URL still carries the level.
  }
}

function hasMetSlider(): boolean {
  try {
    return localStorage.getItem(DEPTH_SEEN_KEY) !== null || localStorage.getItem(DEPTH_STORAGE_KEY) !== null;
  } catch {
    return true; // can't remember the breath, so don't repeat it on every visit
  }
}

function markSliderMet(): void {
  try {
    localStorage.setItem(DEPTH_SEEN_KEY, '1');
  } catch {
    // Nothing to remember it in.
  }
}

function resolveInitial(): DepthLevel {
  return parseDepth(new URLSearchParams(location.search).get(DEPTH_PARAM)) ?? readStored() ?? DEPTH_DEFAULT;
}

function readMinutes(root: HTMLElement): number[] {
  const mins = (root.dataset.depthMinutes ?? '').split(' ').map(Number);
  return mins.length === 5 && mins.every((n) => n > 0) ? mins : [];
}

/** Set the minutes on an odometer readout. `dir` rolls each changed digit:
 *  1 up (the number grew), -1 down, 0 no motion. A digit already rolling is
 *  cut over and restarted, so fast changes never stack. */
function setMinutes(el: Element, min: number, dir: number): void {
  const slots = el.querySelectorAll<HTMLElement>('[data-depth-slot]');
  const padded = String(min).padStart(slots.length, NBSP);
  slots.forEach((slot, i) => {
    const [cur, ghost] = slot.children;
    if (!(cur instanceof HTMLElement) || !(ghost instanceof HTMLElement)) return;
    const ch = padded[i];
    const old = cur.textContent ?? '';
    if (old === ch) return;
    for (const a of [...cur.getAnimations(), ...ghost.getAnimations()]) a.cancel();
    cur.textContent = ch;
    ghost.textContent = '';
    if (!dir) return;
    ghost.textContent = old;
    const timing: KeyframeAnimationOptions = {
      duration: ROLL,
      delay: (slots.length - 1 - i) * ROLL_LAG,
      easing: EASE_OUT,
      fill: 'both',
    };
    cur.animate([{ transform: `translateY(${dir * 100}%)` }, { transform: 'translateY(0)' }], timing);
    const out = ghost.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${dir * -100}%)` }], timing);
    out.finished.then(
      () => {
        ghost.textContent = '';
        out.cancel();
      },
      () => {},
    );
  });
}

/** Sync every control + readout to `level`. Safe to call before binding.
 *  `roll` is the odometer direction; 0 paints without motion. */
function paintUI(level: DepthLevel, minutes: number[], roll = 0): void {
  const min = minutes[level - 1];
  const label = DEPTH_LABELS[level];
  const valuetext = min ? `${label}, ${min} min read` : label;
  for (const input of document.querySelectorAll<HTMLInputElement>('[data-depth-input]')) {
    if (input.value !== String(level)) input.value = String(level);
    input.setAttribute('aria-valuetext', valuetext);
  }
  // Thumb, ink, passed ticks and the label's axes all key off data-level.
  for (const el of document.querySelectorAll<HTMLElement>('[data-depth-instrument]')) el.dataset.level = String(level);
  if (!min) return;
  for (const el of document.querySelectorAll('[data-depth-readout]')) el.textContent = depthReadout(level, min);
  for (const el of document.querySelectorAll('[data-depth-label]')) el.textContent = label;
  for (const el of document.querySelectorAll('[data-depth-min]')) setMinutes(el, min, roll);
}

/** Apply the resolved level with no motion: first paint and incoming swaps. */
function prepaint(root: HTMLElement): DepthLevel {
  const level = resolveInitial();
  root.dataset.depth = String(level);
  paintUI(level, readMinutes(root));
  for (const el of document.querySelectorAll<HTMLElement>('[data-depth-control]')) el.hidden = false;
  return level;
}

// ── Box helpers ──

/** The rendered boxes a wrapper contributes to the flow, looking through
 *  display: contents. */
function flowBoxes(parent: Element): Boxy[] {
  const out: Boxy[] = [];
  for (const child of parent.children) {
    if (!(child instanceof HTMLElement || child instanceof SVGElement)) continue;
    const display = getComputedStyle(child).display;
    if (display === 'none') continue;
    if (display === 'contents') out.push(...flowBoxes(child));
    else out.push(child);
  }
  return out;
}

function readBox(el: Element): Box {
  const cs = getComputedStyle(el);
  return {
    height: el.getBoundingClientRect().height,
    marginTop: Number.parseFloat(cs.marginTop) || 0,
    marginBottom: Number.parseFloat(cs.marginBottom) || 0,
    paddingTop: Number.parseFloat(cs.paddingTop) || 0,
    paddingBottom: Number.parseFloat(cs.paddingBottom) || 0,
    borderTopWidth: Number.parseFloat(cs.borderTopWidth) || 0,
    borderBottomWidth: Number.parseFloat(cs.borderBottomWidth) || 0,
  };
}

function readOpacity(el: Element): number {
  const o = Number.parseFloat(getComputedStyle(el).opacity);
  return Number.isFinite(o) ? o : 1;
}

/** Inline tables and inline-level boxes can't collapse by height; they fade
 *  and toggle instead. */
function canCollapse(el: Element): boolean {
  const d = getComputedStyle(el).display;
  return !d.startsWith('inline') && !d.startsWith('table');
}

// Elements can carry their own inline overflow (Shiki sets overflow-x: auto on
// code blocks). Clip for the animation, then put theirs back exactly.
const savedOverflow = new WeakMap<Element, [string, string]>();

function clip(el: Boxy): void {
  if (!savedOverflow.has(el)) savedOverflow.set(el, [el.style.overflowX, el.style.overflowY]);
  el.style.overflow = CLIP;
}

function unclip(el: Element): void {
  const saved = savedOverflow.get(el);
  if (!saved || !(el instanceof HTMLElement || el instanceof SVGElement)) return;
  savedOverflow.delete(el);
  el.style.removeProperty('overflow');
  if (saved[0]) el.style.overflowX = saved[0];
  if (saved[1]) el.style.overflowY = saved[1];
}

function boxFrame(b: Box): Keyframe {
  const kf: Keyframe = {};
  for (const p of SIZE_PROPS) kf[p] = `${b[p]}px`;
  return kf;
}

/** The nearest ancestor that lays out as a block (the paragraph an inline
 *  clause sits in). */
function blockHost(el: Element): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    const d = getComputedStyle(node).display;
    if (d !== 'inline' && d !== 'contents') return node;
    node = node.parentElement;
  }
  return null;
}

interface Wrapper {
  el: HTMLElement;
  inline: boolean;
  levels: Set<number>;
  host: HTMLElement | null;
  gen: number; // bumps on every retarget; stale completions check it
  busy: boolean;
}

class DepthController {
  readonly root: HTMLElement;
  private level: DepthLevel;
  private readonly minutes: number[];
  private readonly wrappers: Wrapper[];
  private readonly ac = new AbortController();
  private readonly running = new Set<Animation>();
  private readonly anims = new Map<Element, Animation[]>();
  private readonly hostGen = new Map<Element, number>();
  private anchor: { el: Element; top: number } | null = null;
  private lastAnchor: { el: Element; top: number } | null = null;
  private quiet = false; // swallow scroll events caused by anchor corrections
  private corrected = false;
  private loop = 0;
  private release = 0;
  private frame = 0;
  private pending: DepthLevel | null = null;
  private settleTimer = 0;
  private observer: IntersectionObserver | null = null;
  private readonly fx = new Set<Animation>(); // instrument, marks, breath
  private readonly morphs = new Map<Element, Animation>();
  private readonly marks = new Set<HTMLElement>();
  private markFrom: DepthLevel; // the level the reader last saw settled
  private headerInView = false;
  private breathTimer = 0;
  private breath: Animation[] = [];
  private met = hasMetSlider();

  constructor(root: HTMLElement) {
    this.root = root;
    this.minutes = readMinutes(root);
    this.level = prepaint(root);
    this.markFrom = this.level;
    this.wrappers = [...root.querySelectorAll<HTMLElement>('.depth')].map((el) => {
      const inline = el.classList.contains('depth--inline');
      return {
        el,
        inline,
        levels: new Set((el.dataset.depthLevels ?? '').split(' ').map(Number)),
        host: inline ? blockHost(el) : null,
        gen: 0,
        busy: false,
      };
    });
    this.wireControls();
    this.wirePill();
    root.dataset.depthBound = '';
  }

  destroy(): void {
    this.ac.abort();
    this.observer?.disconnect();
    cancelAnimationFrame(this.loop);
    cancelAnimationFrame(this.release);
    cancelAnimationFrame(this.frame);
    clearTimeout(this.settleTimer);
    clearTimeout(this.breathTimer);
    this.settleAll();
    this.clearMarks();
    for (const a of [...this.fx]) a.cancel();
    this.fx.clear();
    this.morphs.clear();
    for (const el of document.querySelectorAll<HTMLElement>('[data-depth-instrument]')) {
      el.style.removeProperty('--travel');
      for (const tick of el.querySelectorAll<HTMLElement>('[data-depth-tick]'))
        tick.style.removeProperty('--tick-delay');
      for (const slot of el.querySelectorAll('[data-depth-slot]')) {
        for (const a of slot.getAnimations({ subtree: true })) a.cancel();
        if (slot.children[1]) slot.children[1].textContent = '';
      }
    }
    this.quiet = false;
    document.documentElement.style.removeProperty('overflow-anchor');
    delete this.root.dataset.depthBound;
  }

  // ── Controls ──

  private wireControls(): void {
    const { signal } = this.ac;
    for (const input of document.querySelectorAll<HTMLInputElement>('[data-depth-input]')) {
      input.addEventListener('input', () => this.request(Number(input.value)), { signal });
    }
    // End labels are a pointer shortcut; keyboard users get Home/End natively.
    for (const el of document.querySelectorAll<HTMLElement>('[data-depth-set]')) {
      el.addEventListener('click', () => this.request(Number(el.dataset.depthSet)), { signal });
    }
    // A reader's own scroll during a transition wins over the anchor.
    const release = (e: Event) => {
      if (this.anchor && !(e.target instanceof Element && e.target.closest('.depth-control'))) this.anchor = null;
    };
    window.addEventListener('wheel', release, { passive: true, signal });
    window.addEventListener('touchmove', release, { passive: true, signal });
    // Anchor corrections scroll the page every frame. Keep those scrolls from
    // reaching page-level listeners: the router records scroll position on
    // every scrollend (Safari caps history writes at 100 per 10 s) and the
    // mobile nav would slide in and out over the paragraph being held.
    const swallow = (e: Event) => {
      if (this.quiet) e.stopImmediatePropagation();
    };
    window.addEventListener('scroll', swallow, { capture: true, signal });
    window.addEventListener('scrollend', swallow, { capture: true, signal });
    // Nothing plays to a hidden tab: drop the marks and the breath, and let
    // the breath re-arm when the reader comes back.
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) {
          this.clearMarks();
          this.stopBreath();
        }
        this.armBreath();
      },
      { signal },
    );
  }

  /** Coalesce input events to one level change per frame. */
  private request(n: number): void {
    if (!isDepthLevel(n)) return;
    this.meet();
    this.pending = n;
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const next = this.pending;
      this.pending = null;
      if (!next || next === this.level) return;
      this.apply(next);
      clearTimeout(this.settleTimer);
      this.settleTimer = window.setTimeout(() => this.settle(), SETTLE_MS);
    });
  }

  /** After the slider rests: shareable URL, remembered choice, announcement. */
  private settle(): void {
    const level = this.level;
    try {
      const url = new URL(location.href);
      url.searchParams.set(DEPTH_PARAM, String(level));
      // Keep the router's history.state (scroll + index) intact.
      history.replaceState(history.state, '', url);
    } catch {
      // Safari throttles history writes; the next settle catches up.
    }
    writeStored(level);
    const live = document.querySelector('[data-depth-live]');
    const min = this.minutes[level - 1];
    const time = min ? `, ${min} min read` : '';
    if (live) live.textContent = `Showing the ${DEPTH_LABELS[level].toLowerCase()} version${time}.`;
  }

  /** The compact control appears once the header control scrolls away, and
   *  steps aside when the reader reaches the end of the post. On phones it
   *  follows the sticky nav: out of the way while reading down, back on any
   *  scroll up, so it never sits over the text being read. */
  private wirePill(): void {
    const pill = document.querySelector<HTMLElement>('[data-depth-pill]');
    const header = document.querySelector<HTMLElement>('[data-depth-control]');
    if (!pill || !header) return;
    pill.hidden = false;
    const end = document.querySelector('[data-depth-end]');
    const narrow = matchMedia('(max-width: 40rem)');
    let headerAbove = false;
    let atEnd = false;
    let readingDown = false;
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const keep = pill.contains(document.activeElement);
      const tucked = narrow.matches && readingDown;
      pill.dataset.shown = String(keep || (headerAbove && !atEnd && !tucked));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        this.armBreath(); // scrolling isn't idle: start the wait again
        if (Math.abs(y - lastY) < 8) return;
        readingDown = y > lastY;
        lastY = y;
        update();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true, signal: this.ac.signal });
    this.observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === header) {
          headerAbove = !e.isIntersecting && e.boundingClientRect.top < 0;
          this.headerInView = e.isIntersecting;
          this.armBreath();
        } else atEnd = e.isIntersecting || e.boundingClientRect.top < 0;
      }
      update();
    });
    this.observer.observe(header);
    if (end) this.observer.observe(end);
    pill.addEventListener('focusout', () => requestAnimationFrame(update), { signal: this.ac.signal });
  }

  // ── The instrument: thumb, ink, ticks, detent, label, minutes ──

  /** Run a one-off effect and forget it when it ends. */
  private play(el: Element, frames: Keyframe[], timing: KeyframeAnimationOptions): Animation {
    const a = el.animate(frames, timing);
    this.fx.add(a);
    const done = () => this.fx.delete(a);
    a.finished.then(done, done);
    return a;
  }

  /** Move both controls from `prev` to `next`. Dragging, arrow keys and the
   *  end labels all land here, so they get the same feedback. */
  private instrument(prev: DepthLevel, next: DepthLevel): void {
    const motion = !reducedMotion() && !document.hidden;
    const steps = Math.abs(next - prev);
    const travel = motion ? TRAVEL + TRAVEL_STEP * (steps - 1) : 0;
    const controls = [...document.querySelectorAll<HTMLElement>('[data-depth-instrument]')];
    const labels = motion ? controls.map((c) => c.querySelector<HTMLElement>('[data-depth-label]')) : [];

    // READ: where each label's axes are right now (possibly mid-morph).
    const from = labels.map((el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { fontVariationSettings: cs.fontVariationSettings, letterSpacing: cs.letterSpacing };
    });

    // WRITE: retarget. Each tick between the two stops changes as the thumb
    // reaches it; going up the near tick goes first, going down the far one.
    const lo = Math.min(prev, next) - 1;
    for (const c of controls) {
      c.style.setProperty('--travel', `${travel}ms`);
      c.querySelectorAll<HTMLElement>('[data-depth-tick]').forEach((tick, i) => {
        const order = next > prev ? i - lo : lo + steps - i;
        const crossed = i > lo && i <= lo + steps;
        tick.style.setProperty(
          '--tick-delay',
          motion && crossed ? `${Math.round((travel * 0.6 * order) / steps)}ms` : '0ms',
        );
      });
    }
    for (const el of labels) if (el) this.morphs.get(el)?.cancel();
    paintUI(next, this.minutes, motion ? Math.sign(next - prev) : 0);
    if (!motion) return;

    // READ the new axes, then tween to them.
    const to = labels.map((el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { fontVariationSettings: cs.fontVariationSettings, letterSpacing: cs.letterSpacing };
    });
    labels.forEach((el, i) => {
      const a = from[i];
      const b = to[i];
      if (!el || !a || !b) return;
      this.morphs.set(el, this.play(el, [a, b], { duration: MORPH, easing: EASE_OUT }));
    });

    // Detent, timed to the thumb's arrival. A hidden pill gets none.
    const arrive = travel * 0.5;
    for (const c of controls) {
      if (c.dataset.shown === 'false') continue;
      const dot = c.querySelector('[data-depth-dot]');
      const flash = c.querySelector('[data-depth-flash]');
      for (const el of [dot, flash]) for (const a of el?.getAnimations() ?? []) a.cancel();
      if (dot) {
        this.play(
          dot,
          [
            { transform: 'scale(1)', easing: 'cubic-bezier(0.3, 0, 0.7, 0.4)' },
            { transform: 'scale(0.9)', offset: 0.3, easing: EASE_OUT },
            { transform: 'scale(1)' },
          ],
          { duration: DETENT, delay: arrive },
        );
      }
      if (flash) {
        this.play(
          flash,
          [
            { opacity: 1, transform: 'scaleY(0.4)', easing: EASE_OUT },
            { opacity: 1, transform: 'scaleY(1)', offset: 0.35, easing: 'ease-in' },
            { opacity: 0, transform: 'scaleY(1)' },
          ],
          { duration: FLASH, delay: arrive },
        );
      }
    }
  }

  // ── First-visit breath ──

  /** The reader has used the slider (or watched it breathe): never again. */
  private meet(): void {
    if (this.met) return;
    this.met = true;
    clearTimeout(this.breathTimer);
    this.stopBreath();
    markSliderMet();
  }

  private stopBreath(): void {
    for (const a of this.breath) a.cancel();
    this.breath = [];
  }

  /** (Re)start the idle wait. The breath plays only with the header control
   *  in view, the tab visible and nothing having happened for a moment. */
  private armBreath(): void {
    clearTimeout(this.breathTimer);
    if (this.met || this.breath.length > 0 || !this.headerInView || document.hidden || reducedMotion()) return;
    this.breathTimer = window.setTimeout(() => this.breathe(), BREATH_IDLE);
  }

  private breathe(): void {
    if (this.met || !this.headerInView || document.hidden || reducedMotion()) return;
    const header = document.querySelector('[data-depth-control]');
    const dot = header?.querySelector('[data-depth-dot]');
    const ring = header?.querySelector('[data-depth-ring]');
    if (!dot || !ring) return;
    const timing = { duration: BREATH, easing: 'ease-in-out' };
    this.breath = [
      this.play(
        dot,
        [{ transform: 'scale(1)' }, { transform: 'scale(1.3)', offset: 0.42 }, { transform: 'scale(1)' }],
        timing,
      ),
      this.play(
        ring,
        [
          { opacity: 0, transform: 'scale(0.3)' },
          { opacity: 0.8, transform: 'scale(0.5)', offset: 0.25 },
          { opacity: 0, transform: 'scale(1)' },
        ],
        { duration: BREATH * 0.85, delay: BREATH * 0.15, easing: 'ease-out' },
      ),
    ];
    // Spent once it has played through; a hidden tab cancels it and it waits.
    Promise.all(this.breath.map((a) => a.finished)).then(
      () => this.meet(),
      () => {},
    );
  }

  // ── Marks: what the level just added ──

  private clearMarks(): void {
    for (const el of this.marks) {
      for (const a of el.getAnimations()) a.cancel();
      if (el.classList.contains('depth-mark')) el.remove();
      else el.classList.remove('depth--arrived');
    }
    this.marks.clear();
  }

  /** Once the page has settled, show the reader what arrived since the level
   *  they last saw settled: a hairline in the gutter per block, a wash per
   *  inline clause. In or near the viewport only, in document order. */
  private flushMarks(): void {
    const from = this.markFrom;
    const now = this.level;
    this.markFrom = now;
    if (from === now || document.hidden) return;
    const fresh = this.wrappers.filter((w) => w.levels.has(now) && !w.levels.has(from));
    if (fresh.length === 0) return;
    const freshBlocks = new Set<Element>(fresh.filter((w) => !w.inline).map((w) => w.el));
    const vh = window.innerHeight;
    const near = (top: number, bottom: number) => bottom > -0.25 * vh && top < 1.25 * vh;
    const rootTop = this.root.getBoundingClientRect().top;

    // READ every rect first, then write.
    const jobs: { top: number; run: (delay: number) => void }[] = [];
    for (const w of fresh) {
      if (w.inline) {
        // A clause inside a block that is itself new is covered by its mark.
        const block = w.el.closest('.depth--block');
        if (block && freshBlocks.has(block)) continue;
        const r = w.el.getBoundingClientRect();
        if (r.width === 0 || !near(r.top, r.bottom)) continue;
        jobs.push({ top: r.top, run: (delay) => this.wash(w.el, delay) });
      } else {
        const els = flowBoxes(w.el);
        if (els.length === 0) continue;
        const top = els[0].getBoundingClientRect().top;
        const bottom = els[els.length - 1].getBoundingClientRect().bottom;
        if (bottom - top < 1 || !near(top, bottom)) continue;
        jobs.push({ top, run: (delay) => this.mark(top - rootTop, bottom - top, delay) });
      }
    }
    jobs.sort((a, b) => a.top - b.top);
    const step = jobs.length > 1 ? Math.min(MARK_STAGGER, MARK_SPREAD / (jobs.length - 1)) : 0;
    jobs.forEach((job, i) => {
      job.run(i * step);
    });
  }

  /** Draw (or, under reduced motion, show), hold, fade. Offsets are fractions
   *  of the whole run. */
  private markFrames(drawn: Keyframe, undrawn: Keyframe, faded: Keyframe): { frames: Keyframe[]; duration: number } {
    const reduce = reducedMotion();
    const lead = reduce ? MARK_APPEAR : MARK_DRAW;
    const duration = lead + MARK_HOLD + MARK_FADE;
    const start = reduce ? faded : undrawn;
    return {
      duration,
      frames: [
        { ...start, easing: reduce ? 'ease-out' : EASE_OUT },
        { ...drawn, offset: lead / duration },
        { ...drawn, offset: (lead + MARK_HOLD) / duration, easing: 'ease-in-out' },
        { ...faded },
      ],
    };
  }

  private mark(top: number, height: number, delay: number): void {
    const el = document.createElement('span');
    el.className = 'depth-mark';
    el.setAttribute('aria-hidden', 'true');
    el.style.top = `${top}px`;
    el.style.height = `${height}px`;
    this.root.append(el);
    this.marks.add(el);
    const { frames, duration } = this.markFrames(
      { opacity: 1, transform: 'scaleY(1)' },
      { opacity: 1, transform: 'scaleY(0)' },
      { opacity: 0, transform: 'scaleY(1)' },
    );
    this.play(el, frames, { duration, delay, fill: 'backwards' }).finished.then(
      () => {
        el.remove();
        this.marks.delete(el);
      },
      () => {},
    );
  }

  /** The clause's words, wrapped once so the wash starts after any leading
   *  punctuation or space (": three samples" washes from "three"). */
  private washTarget(el: HTMLElement): HTMLElement {
    const existing = el.querySelector<HTMLElement>(':scope > .depth-wash');
    if (existing) return existing;
    const first = el.firstChild;
    if (first instanceof Text) {
      const lead = first.data.match(/^[\s:;,.\u2013\u2014-]+/)?.[0].length ?? 0;
      if (lead > 0 && lead < first.data.length) first.splitText(lead);
    }
    const span = document.createElement('span');
    span.className = 'depth-wash';
    const skip = first instanceof Text && /^[\s:;,.\u2013\u2014-]+$/.test(first.data) ? first : null;
    for (const node of [...el.childNodes]) if (node !== skip) span.append(node);
    el.append(span);
    return span;
  }

  private wash(clause: HTMLElement, delay: number): void {
    const el = this.washTarget(clause);
    const accent = getComputedStyle(el).getPropertyValue('--accent').trim();
    if (!accent) return;
    const ink = `color-mix(in oklch, ${accent} 14%, transparent)`;
    el.classList.add('depth--arrived');
    this.marks.add(el);
    const { frames, duration } = this.markFrames(
      { backgroundSize: '100% 100%', '--depth-ink': ink },
      { backgroundSize: '0% 100%', '--depth-ink': ink },
      { backgroundSize: '100% 100%', '--depth-ink': 'transparent' },
    );
    this.play(el, frames, { duration, delay, fill: 'backwards' }).finished.then(
      () => {
        el.classList.remove('depth--arrived');
        this.marks.delete(el);
      },
      () => {},
    );
  }

  // ── Level changes ──

  private apply(next: DepthLevel): void {
    const prev = this.level;
    this.level = next;
    this.instrument(prev, next);
    this.clearMarks();

    const changing = this.wrappers.filter((w) => w.levels.has(prev) !== w.levels.has(next));
    if (changing.length === 0) {
      this.root.dataset.depth = String(next);
      return;
    }
    const blocks = changing.filter((w) => !w.inline);
    const inlines = changing.filter((w) => w.inline);
    const hosts = new Set<HTMLElement>();
    for (const w of inlines) if (w.host) hosts.add(w.host);

    // READ: the anchor, from the layout as the reader sees it right now.
    const unstable = new Set<Element>(blocks.map((w) => w.el));
    for (const w of this.wrappers) if (w.busy && !w.inline) unstable.add(w.el);
    const picked = this.pickAnchor(unstable, hosts);
    // Same paragraph as last time and it hasn't moved: hold its original
    // offset, so sub-pixel rounding can't drift across repeated changes.
    const last = this.lastAnchor;
    if (picked && last && picked.el === last.el && Math.abs(picked.top - last.top) < 1) picked.top = last.top;
    this.anchor = picked ?? this.anchor;

    if (reducedMotion()) {
      this.settleAll();
      this.root.dataset.depth = String(next);
      this.keepAnchor();
      this.lastAnchor = this.anchor;
      this.anchor = null;
      this.releaseScroll();
      this.flushMarks();
      return;
    }

    // READ: current (possibly mid-animation) state of everything retargeting.
    const from = new Map<Element, { box: Box; opacity: number }>();
    for (const w of blocks) {
      if (!this.rendered(w)) continue;
      for (const el of flowBoxes(w.el)) from.set(el, { box: readBox(el), opacity: readOpacity(el) });
    }
    const inlineFrom = new Map<Element, number>();
    for (const w of inlines) inlineFrom.set(w.el, this.rendered(w) ? readOpacity(w.el) : 0);
    const hostFrom = new Map<Element, number>();
    for (const h of hosts) hostFrom.set(h, h.getBoundingClientRect().height);

    // WRITE: drop in-flight animations, switch level, keep leavers rendered.
    for (const el of from.keys()) this.stop(el);
    for (const w of inlines) this.stop(w.el);
    for (const h of hosts) this.stopHost(h);
    for (const w of changing) {
      w.gen++;
      w.busy = true;
      if (w.levels.has(next)) w.el.removeAttribute(HOLD);
      else w.el.setAttribute(HOLD, '');
    }
    this.root.dataset.depth = String(next);

    // READ: natural sizes at the new level.
    const plans = blocks.map((w) => {
      const els = flowBoxes(w.el);
      const enter = w.levels.has(next);
      const to = enter ? els.map((el) => readBox(el)) : [];
      return { w, els, enter, to };
    });
    const hostTo = new Map<Element, number>();
    for (const h of hosts) hostTo.set(h, h.getBoundingClientRect().height);

    // WRITE: animate.
    for (const { w, els, enter, to } of plans) {
      const started: Animation[] = [];
      els.forEach((el, i) => {
        const start = from.get(el) ?? { box: ZERO, opacity: 0 };
        if (canCollapse(el)) started.push(this.size(el, start.box, enter ? to[i] : ZERO));
        started.push(this.fade(el, start.opacity, enter ? 1 : 0));
      });
      this.whenDone(w, started, () => {
        if (!enter) w.el.removeAttribute(HOLD);
        for (const el of els) this.clear(el);
      });
    }

    for (const w of inlines) {
      const start = inlineFrom.get(w.el) ?? 0;
      if (w.levels.has(next)) {
        const a = this.fade(w.el, start, 1);
        this.whenDone(w, [a], () => this.clear(w.el));
      } else {
        // Fade the clause out in place, then let the paragraph close the gap.
        const a = this.fade(w.el, start, 0, DURATION * 0.45);
        this.whenDone(w, [a], () => this.closeInline(w));
      }
    }

    for (const h of hosts) {
      if (from.has(h)) continue; // inside a block that is already resizing
      this.resizeHost(h, hostFrom.get(h) ?? 0, hostTo.get(h) ?? 0);
    }

    this.keepAnchor();
    this.startLoop();
  }

  private rendered(w: Wrapper): boolean {
    return getComputedStyle(w.el).display !== 'none';
  }

  /** Second half of an inline exit: drop the clause, ease the paragraph. */
  private closeInline(w: Wrapper): void {
    const host = w.host;
    const h0 = host ? host.getBoundingClientRect().height : 0;
    if (host) this.stopHost(host);
    w.el.removeAttribute(HOLD);
    this.clear(w.el);
    w.busy = false;
    if (host) this.resizeHost(host, h0, host.getBoundingClientRect().height);
    // The loop may have wound down while the clause faded; hold the same
    // paragraph through the reflow (startLoop is a no-op while it runs).
    if (!this.anchor) this.anchor = this.lastAnchor;
    this.keepAnchor();
    this.startLoop();
  }

  private resizeHost(host: HTMLElement, h0: number, h1: number): void {
    if (Math.abs(h0 - h1) < 0.5) return;
    const gen = (this.hostGen.get(host) ?? 0) + 1;
    this.hostGen.set(host, gen);
    clip(host);
    const a = this.track(
      host,
      host.animate([{ height: `${h0}px` }, { height: `${h1}px` }], {
        duration: DURATION * 0.75,
        easing: EASE_SIZE,
        fill: 'forwards',
      }),
    );
    a.finished.then(
      () => {
        if (this.hostGen.get(host) === gen) this.clear(host);
      },
      () => {},
    );
  }

  // ── Animation primitives ──

  private size(el: Boxy, a: Box, b: Box): Animation {
    clip(el);
    return this.track(
      el,
      el.animate([boxFrame(a), boxFrame(b)], { duration: DURATION, easing: EASE_SIZE, fill: 'forwards' }),
    );
  }

  /** Leaving content fades fast, entering content fades in after the space
   *  starts to open, so outgoing and incoming text never overlap at full ink. */
  private fade(el: Element, from: number, to: number, duration?: number): Animation {
    const entering = to > from;
    const dur = duration ?? (entering ? DURATION * 0.7 : DURATION * 0.55);
    const delay = entering && from === 0 ? DURATION * 0.3 : 0;
    return this.track(
      el,
      el.animate([{ opacity: from }, { opacity: to }], { duration: dur, delay, easing: EASE_FADE, fill: 'both' }),
    );
  }

  private track(el: Element, a: Animation): Animation {
    this.running.add(a);
    const list = this.anims.get(el) ?? [];
    list.push(a);
    this.anims.set(el, list);
    const done = () => this.running.delete(a);
    a.finished.then(done, done);
    return a;
  }

  private whenDone(w: Wrapper, started: Animation[], fn: () => void): void {
    const gen = w.gen;
    Promise.all(started.map((a) => a.finished)).then(
      () => {
        if (w.gen !== gen) return;
        fn();
        w.busy = false;
      },
      () => {},
    );
  }

  private stop(el: Element): void {
    for (const a of this.anims.get(el) ?? []) a.cancel();
    this.anims.delete(el);
  }

  private stopHost(host: Element): void {
    this.hostGen.set(host, (this.hostGen.get(host) ?? 0) + 1);
    this.stop(host);
  }

  private clear(el: Element): void {
    this.stop(el);
    unclip(el);
  }

  /** Jump everything to its resting state (reduced motion, teardown). */
  private settleAll(): void {
    for (const el of [...this.anims.keys()]) this.clear(el);
    for (const w of this.wrappers) {
      w.gen++;
      w.busy = false;
      w.el.removeAttribute(HOLD);
      w.el.classList.remove('depth--arrived');
    }
    this.running.clear();
  }

  // ── Scroll anchoring ──

  /** The first element in view that stays rendered across this change. */
  private pickAnchor(unstable: Set<Element>, hosts: Set<Element>): { el: Element; top: number } | null {
    const nav = document.querySelector('[data-sticky-nav]');
    let inset = 0;
    if (nav && getComputedStyle(nav).position === 'sticky' && !nav.hasAttribute('data-hidden')) {
      inset = Math.max(0, nav.getBoundingClientRect().bottom);
    }
    const vh = window.innerHeight;
    const header = this.root.closest('article')?.querySelector('header');
    const candidates: Element[] = header ? [header] : [];
    for (const child of this.root.children) {
      if (child.classList.contains('depth--block')) {
        if (unstable.has(child) || getComputedStyle(child).display === 'none') continue;
        candidates.push(...child.children);
      } else {
        candidates.push(child);
      }
    }
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.bottom <= inset) continue;
      if (r.top >= vh) break;
      // A paragraph cut by the top edge whose own text is about to reflow
      // would shift the line being read; prefer the next one.
      if (r.top < inset && hosts.has(el)) continue;
      return { el, top: r.top };
    }
    return null;
  }

  private keepAnchor(): void {
    const a = this.anchor;
    if (!a) return;
    if (!a.el.isConnected) {
      this.anchor = null;
      return;
    }
    const delta = a.el.getBoundingClientRect().top - a.top;
    if (Math.abs(delta) > 0.25) {
      this.quiet = true;
      this.corrected = true;
      window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' });
    }
  }

  private startLoop(): void {
    cancelAnimationFrame(this.release);
    this.release = 0;
    if (this.loop) return;
    // Native scroll anchoring (Chromium, Firefox) would pick its own node and
    // fight ours; switch it off while we hold the page.
    document.documentElement.style.setProperty('overflow-anchor', 'none');
    const tick = () => {
      this.keepAnchor();
      if (this.running.size > 0) {
        this.loop = requestAnimationFrame(tick);
        return;
      }
      this.loop = 0;
      this.lastAnchor = this.anchor;
      this.anchor = null;
      document.documentElement.style.removeProperty('overflow-anchor');
      this.releaseScroll();
      this.flushMarks();
    };
    this.loop = requestAnimationFrame(tick);
  }

  /** The last correction's scroll events land next frame: let them pass
   *  quietly, then hand page listeners (the router) one real scrollend. */
  private releaseScroll(): void {
    cancelAnimationFrame(this.release);
    this.release = requestAnimationFrame(() => {
      this.release = 0;
      this.quiet = false;
      if (this.corrected) window.dispatchEvent(new Event('scrollend'));
      this.corrected = false;
    });
  }
}

// ── Lifecycle ──

let controller: DepthController | null = null;

function teardown(): void {
  controller?.destroy();
  controller = null;
}

function boot(): void {
  const root = document.querySelector<HTMLElement>('[data-depth-root]');
  if (!root) {
    teardown();
    return;
  }
  if (controller?.root === root) return;
  teardown();
  controller = new DepthController(root);
}

boot();
document.addEventListener('astro:page-load', boot);
document.addEventListener('astro:before-swap', teardown);
// Resolve the level on the incoming page before the view transition captures
// it, so a remembered level never flashes level 3 first.
document.addEventListener('astro:after-swap', () => {
  const root = document.querySelector<HTMLElement>('[data-depth-root]');
  if (root) prepaint(root);
});
