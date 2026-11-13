// Shared author-time helpers for the native-SVG charts (the 816-applications
// post onward). A chart's .gen.mjs supplies draw(p) -> { height, body } on a
// 420-unit-wide canvas; emit() writes one SVG per theme. Charts sit straight on
// the page (no box), so the knockout colour is the paper, and type is sized to
// stay legible when the canvas scales down to a 343px phone column.
//
// One accent, used for the thing the chart is about. Everything else is ink or
// a neutral, separated by lightness and shape, never by hue.
import { writeFileSync } from 'node:fs';
import { dark, light } from './_palette.mjs';

export const W = 420;
// Smallest label, in canvas units: about 11px once the canvas is 343px wide.
const MIN_TEXT = 13.5;

// `page` here is the real paper (charts have no box), not the diagram-box tint
// the shared palette carries.
// In dark mode the neutral mark is darker than the shared palette's line gray,
// so a cobalt mark separates from it by lightness and not only by hue.
const themes = {
  light: { ...light, page: '#f6f5f1', soft: '#55565f', grid: '#e3e2de', faint: '#c9c9cc', accentSoft: '#aab1e2' },
  dark: {
    ...dark,
    page: '#08090c',
    line: '#5c5c64',
    soft: '#b9b7b1',
    grid: '#2b2b33',
    faint: '#4a4a54',
    accentSoft: '#414b86',
  },
};

const FONT = {
  sans: "'Inter Variable', system-ui, sans-serif",
  display: "'Fraunces Variable', 'Iowan Old Style', Georgia, serif",
  mono: "'Geist Mono Variable', ui-monospace, monospace",
};

const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');

const r1 = (n) => Math.round(n * 10) / 10;

/** Text. o: size, weight, anchor, fill, font (sans|display|mono), spacing, italic. */
export function t(x, y, value, o = {}) {
  return `<text ${attrs({
    x: r1(x),
    y: r1(y),
    'font-size': o.size === undefined ? undefined : Math.max(o.size, MIN_TEXT),
    'font-weight': o.weight,
    'text-anchor': o.anchor,
    fill: o.fill,
    'font-family': o.font ? FONT[o.font] : undefined,
    'letter-spacing': o.spacing,
    'font-style': o.italic ? 'italic' : undefined,
  })}>${value}</text>`;
}

export function rect(x, y, w, h, o = {}) {
  return `<rect ${attrs({
    x: r1(x),
    y: r1(y),
    width: r1(Math.max(w, 0)),
    height: r1(Math.max(h, 0)),
    rx: o.rx ?? 3,
    fill: o.fill ?? 'none',
    stroke: o.stroke,
    'stroke-width': o.sw,
    'stroke-dasharray': o.dash,
  })}/>`;
}

export function line(x1, y1, x2, y2, o = {}) {
  return `<path ${attrs({
    d: `M${r1(x1)} ${r1(y1)} L${r1(x2)} ${r1(y2)}`,
    fill: 'none',
    stroke: o.stroke,
    'stroke-width': o.sw ?? 1,
    'stroke-dasharray': o.dash,
    'stroke-linecap': o.cap ?? 'round',
  })}/>`;
}

export function path(points, o = {}) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join(' ');
  return `<path ${attrs({
    d,
    fill: 'none',
    stroke: o.stroke,
    'stroke-width': o.sw ?? 2,
    'stroke-dasharray': o.dash,
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round',
  })}/>`;
}

export function dot(x, y, r, o = {}) {
  return `<circle ${attrs({ cx: r1(x), cy: r1(y), r, fill: o.fill ?? 'none', stroke: o.stroke, 'stroke-width': o.sw })}/>`;
}

/** Linear scale. */
export const scale = (d0, d1, r0, r1_) => (v) => r0 + ((v - d0) / (d1 - d0)) * (r1_ - r0);

/** Write <slug>-light.svg and <slug>-dark.svg next to the calling gen script. */
export function emit(metaUrl, slug, draw) {
  for (const [name, p] of Object.entries(themes)) {
    const { height, body } = draw(p);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
<g font-family="${FONT.sans}" font-size="15" fill="${p.text}">
${body}
</g>
</svg>\n`;
    writeFileSync(new URL(`./${slug}-${name}.svg`, metaUrl), svg);
  }
}
