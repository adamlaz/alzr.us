/**
 * Depth posts -- shared vocabulary for the build (reading time per level) and
 * the client (slider, URL param, remembered choice).
 *
 * A depth post opts in with `depth: true` in frontmatter and wraps level-specific
 * content in <Depth min={..} max={..}>. Level 1 is the plain business read,
 * level 5 the technical deep dive, level 3 the default.
 */

export type DepthLevel = 1 | 2 | 3 | 4 | 5;

export const DEPTH_MIN: DepthLevel = 1;
export const DEPTH_MAX: DepthLevel = 5;
export const DEPTH_DEFAULT: DepthLevel = 3;
export const DEPTH_LEVELS: readonly DepthLevel[] = [1, 2, 3, 4, 5];

export const DEPTH_LABELS: Record<DepthLevel, string> = {
  1: 'Business',
  2: 'Mostly business',
  3: 'Balanced',
  4: 'Mostly technical',
  5: 'Technical deep dive',
};

/** localStorage key for the reader's remembered level (shared across posts). */
export const DEPTH_STORAGE_KEY = 'depth';
/** localStorage flag: the reader has met the slider, so its first-visit breath is spent. */
export const DEPTH_SEEN_KEY = 'depth-seen';
/** URL search param that pins a level for a shared link. */
export const DEPTH_PARAM = 'depth';

const NAMED: Record<string, DepthLevel> = { business: 1, technical: 5 };

export function isDepthLevel(n: unknown): n is DepthLevel {
  return typeof n === 'number' && Number.isInteger(n) && n >= DEPTH_MIN && n <= DEPTH_MAX;
}

/** Parse `?depth=` / a stored value: 1-5, or the names `business` (1) and `technical` (5). */
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
