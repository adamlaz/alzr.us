// Shared author-time render harness for the pre-rendered post diagrams. A gen
// script supplies graph(palette) -> mermaid doc, plus a slug; this renders one
// SVG per theme, embeds the site's Inter so measured node widths match the page
// then strips it, gives each SVG a unique svgId so their inlined <style> blocks
// don't collide when both are in the DOM, and trims mermaid's render-only cruft.
//
// Author-time ONLY. Not imported by any Astro component, never shipped to
// readers — the committed SVGs are. Install mermaid-cli ad hoc and set
// CHROME_PATH before running a gen script (see plans/README.md > Shared
// author-time tooling).
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dark, light } from './_palette.mjs';

const selfDir = dirname(fileURLToPath(import.meta.url));

export function renderThemedPair({ here, slug, graph }) {
  const tmp = mkdtempSync(join(tmpdir(), `${slug}-`));
  const CHROME = process.env.CHROME_PATH || '';

  // Embed the site's Inter so measured node widths match what ships on the page.
  const interPath = join(
    selfDir,
    '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  );
  const b64 = readFileSync(interPath).toString('base64');
  const cssFile = join(tmp, 'inter.css');
  writeFileSync(
    cssFile,
    `@font-face{font-family:'Inter Variable';font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2-variations');}`,
  );

  let pcfg = '';
  if (CHROME) {
    pcfg = join(tmp, 'pcfg.json');
    writeFileSync(pcfg, JSON.stringify({ executablePath: CHROME, args: ['--no-sandbox'] }));
  }

  for (const [name, palette] of [
    ['light', light],
    ['dark', dark],
  ]) {
    const mmd = join(tmp, `${name}.mmd`);
    const out = join(here, `${slug}-${name}.svg`);
    writeFileSync(mmd, graph(palette));
    const args = [`-i ${mmd}`, `-o ${out}`, `--cssFile ${cssFile}`, `-I ${slug}-${name}`, '-b transparent'];
    if (pcfg) args.push(`-p ${pcfg}`);
    execSync(`mmdc ${args.join(' ')}`, { stdio: 'inherit' });

    // Trim render-only cruft + the embedded font (the page already serves Inter).
    let s = readFileSync(out, 'utf8');
    s = s
      .replace(/@font-face\{[^}]*\}/g, '')
      .replace(/\s+data-(points|id|et|edge|look|node|graph)="[^"]*"/g, '')
      .replace(/\s+style=";"/g, '')
      .replace(/\s+aria-(roledescription|label|describedby)="[^"]*"/g, '');
    writeFileSync(out, s);
    console.log(`wrote ${out} (${(s.length / 1024).toFixed(0)} KB)`);
  }
}
