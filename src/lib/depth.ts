/**
 * Depth posts -- shared vocabulary for the build (reading time per level) and
 * the client (slider, URL param, remembered choice).
 *
 * A depth post opts in with `depth: true` in frontmatter and wraps level-specific
 * content in <Depth min={..} max={..}>. Level 1 is the short summary,
 * level 5 the technical deep dive. Readers start on level 1; the server
 * renders level 3 so readers without JS (who can't move the slider) get the
 * full story.
 */

export type DepthLevel = 1 | 2 | 3 | 4 | 5;

export const DEPTH_MIN: DepthLevel = 1;
export const DEPTH_MAX: DepthLevel = 5;
/** Where a reader starts when no ?depth= link or remembered choice says otherwise. */
export const DEPTH_DEFAULT: DepthLevel = 1;
/** What the server renders: the no-JS view, before the prepaint script picks the reader's level. */
export const DEPTH_STATIC: DepthLevel = 3;
export const DEPTH_LEVELS: readonly DepthLevel[] = [1, 2, 3, 4, 5];

export const DEPTH_LABELS: Record<DepthLevel, string> = {
  1: 'Summary',
  2: 'Overview',
  3: 'Full story',
  4: 'Under the hood',
  5: 'Technical deep dive',
};

/** What a screen reader hears after a change, as a phrase that reads naturally. */
export const DEPTH_ANNOUNCE: Record<DepthLevel, string> = {
  1: 'Showing the summary',
  2: 'Showing the overview',
  3: 'Showing the full story',
  4: "Showing what's under the hood",
  5: 'Showing the technical deep dive',
};

/** localStorage key for the reader's remembered level (shared across posts). */
export const DEPTH_STORAGE_KEY = 'depth';
/** localStorage flag: the reader has met the slider, so its first-visit breath is spent. */
export const DEPTH_SEEN_KEY = 'depth-seen';
/** URL search param that pins a level for a shared link. */
export const DEPTH_PARAM = 'depth';

// `business` and `technical` are the scale's first names; links in the wild use them.
const NAMED: Record<string, DepthLevel> = { summary: 1, 'deep-dive': 5, business: 1, technical: 5 };

export function isDepthLevel(n: unknown): n is DepthLevel {
  return typeof n === 'number' && Number.isInteger(n) && n >= DEPTH_MIN && n <= DEPTH_MAX;
}

/** Parse `?depth=` / a stored value: 1-5, or the names `summary` (1) and `deep-dive` (5). */
export function parseDepth(value: string | null | undefined): DepthLevel | null {
  if (value == null) return null;
  const v = value.trim().toLowerCase();
  if (v in NAMED) return NAMED[v];
  const n = Number(v);
  return isDepthLevel(n) ? n : null;
}

export function depthReadout(level: DepthLevel, minutes: number): string {
  return `${DEPTH_LABELS[level]} · ${minutes} min read`;
}

// ── Build-time: the post body as a reader at a given level would see it ──

// An innermost <Depth ...>...</Depth> (its content holds no other <Depth).
// Props are plain numbers, so the attribute run never contains '>'.
const DEPTH_TAG = /<Depth\b([^>]*)>((?:(?!<Depth\b)[\s\S])*?)<\/Depth>/g;
// Fenced code, inline code spans and MDX comments: a post (or a copy of the
// template) may *show* <Depth> markup without using it.
const CODE = /(```|~~~)[\s\S]*?\1|`[^`\n]*`|\{\/\*[\s\S]*?\*\/\}/g;
const SLOT = /(\d+)/g;

function readProp(attrs: string, name: 'min' | 'max'): number | undefined {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(?:\\{\\s*(\\d+)\\s*\\}|["'](\\d+)["'])`));
  if (!m) return undefined;
  return Number(m[1] ?? m[2]);
}

/** Run `fn` over the body with code set aside, then put the code back. */
function outsideCode(body: string, fn: (text: string) => string): string {
  const code: string[] = [];
  const masked = body.replace(CODE, (m) => `${code.push(m) - 1}`);
  return fn(masked).replace(SLOT, (_m, i: string) => code[Number(i)]);
}

/** True when the body uses <Depth> outside code. */
export function usesDepth(body: string): boolean {
  let found = false;
  outsideCode(body, (text) => {
    found = /<Depth\b/.test(text);
    return text;
  });
  return found;
}

/** The raw MDX body with every <Depth> outside `level` removed (and the tags
 *  stripped from the ones that stay). Feeds `reading-time`. */
export function depthBodyAt(body: string, level: DepthLevel): string {
  return outsideCode(body, (text) => {
    let out = text;
    let prev = '';
    // Innermost first, so an inline clause inside a block resolves cleanly.
    while (out !== prev) {
      prev = out;
      out = out.replace(DEPTH_TAG, (_match, attrs: string, inner: string) => {
        const min = readProp(attrs, 'min') ?? DEPTH_MIN;
        const max = readProp(attrs, 'max') ?? DEPTH_MAX;
        return level >= min && level <= max ? inner : '';
      });
    }
    return out;
  });
}
