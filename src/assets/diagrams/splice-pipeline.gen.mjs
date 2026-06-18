// Regenerates splice-pipeline-{light,dark}.svg from the Mermaid source below.
//
// These SVGs are pre-rendered (not rendered client-side) so no mermaid.js
// runtime ships to readers — see SpliceDiagram.astro. Re-run this after editing
// the graph or the palettes.
//
// Prerequisites (not repo deps — install ad hoc):
//   npm i -g @mermaid-js/mermaid-cli   # provides `mmdc`
//   a Chromium for Puppeteer (set CHROME_PATH below if mmdc can't find one)
//
// Run:  node src/assets/diagrams/splice-pipeline.gen.mjs
//
// Notes baked in from getting this right once:
//  - Each SVG gets a unique -I/--svgId so their inlined <style> blocks don't
//    collide when both are in the DOM (shared id = dark fills win on light).
//  - We render with the site's Inter so node widths match; the @font-face is
//    then stripped from the output (the page already serves Inter Variable).
//  - SpliceDiagram.astro neutralizes ss01/cv11 + letter-spacing on the labels
//    so on-page text doesn't overflow the measured foreignObjects.

import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'splice-'));
const CHROME = process.env.CHROME_PATH || '';

const graph = (p) => `---
config:
  theme: base
  themeVariables:
    background: "transparent"
    edgeLabelBackground: "${p.page}"
    primaryColor: "${p.node}"
    primaryTextColor: "${p.text}"
    primaryBorderColor: "${p.border}"
    lineColor: "${p.line}"
    secondaryColor: "${p.node}"
    tertiaryColor: "${p.node}"
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "15px"
  flowchart:
    htmlLabels: true
    curve: basis
    nodeSpacing: 40
    rankSpacing: 46
    padding: 10
---
flowchart TB
  SRC[Commercial master]:::edge
  SRC --> DEM{{Demucs}}
  DEM -->|instrumental| INST[instrumental stem]
  DEM -->|vocal| LIB["librosa<br/>onset detection"]
  LIB --> SLOTS[chant slots]

  NAME([the name]):::edge --> CHIRP["Chirp 3 HD<br/>neutral TTS"]
  CHIRP --> DSP["stretch · pitch<br/>bandpass · clip"]
  DSP --> CLIPS[name clips]

  SLOTS --> SPLICE[splice]
  CLIPS --> SPLICE
  INST --> MIX
  SPLICE --> MIX[remix]
  MIX --> OUT[Festival edit]:::fail

  DEM:::tool
  LIB:::tool
  CHIRP:::tool

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef tool fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

const light = {
  page: '#f7f6f2',
  node: '#ffffff',
  edgeFill: '#f1f0ec',
  text: '#1c1d24',
  border: '#cfcfd1',
  line: '#8a8a90',
  accent: '#2f3eb0',
  onAccent: '#ffffff',
  fail: '#c0402b',
  failFill: '#f7e6e2',
  failText: '#8f2b1c',
};
const dark = {
  page: '#15151b',
  node: '#1d1d24',
  edgeFill: '#25252d',
  text: '#eceae4',
  border: '#3a3a43',
  line: '#8a8a93',
  accent: '#8fa1ef',
  onAccent: '#14141a',
  fail: '#e0654d',
  failFill: '#3a221d',
  failText: '#f0b6a8',
};

// Embed the site's Inter so measured widths match what ships on the page.
const interPath = join(here, '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
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
  const out = join(here, `splice-pipeline-${name}.svg`);
  writeFileSync(mmd, graph(palette));
  const args = [`-i ${mmd}`, `-o ${out}`, `--cssFile ${cssFile}`, `-I splice-${name}`, '-b transparent'];
  if (pcfg) args.push(`-p ${pcfg}`);
  execSync(`mmdc ${args.join(' ')}`, { stdio: 'inherit' });

  // Trim render-only cruft + the embedded font (page already serves Inter).
  let s = readFileSync(out, 'utf8');
  s = s
    .replace(/@font-face\{[^}]*\}/g, '')
    .replace(/\s+data-(points|id|et|edge|look|node|graph)="[^"]*"/g, '')
    .replace(/\s+style=";"/g, '')
    .replace(/\s+aria-(roledescription|label|describedby)="[^"]*"/g, '');
  writeFileSync(out, s);
  console.log(`wrote ${out} (${(s.length / 1024).toFixed(0)} KB)`);
}
