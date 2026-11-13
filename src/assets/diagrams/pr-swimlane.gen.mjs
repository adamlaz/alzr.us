// Regenerates pr-swimlane-{light,dark}.svg. Author-time only.
// Swimlane of pull requests by role across the station's first month (Day 1 to Day 31),
// paired with top phase cards showing how leadership flipped from engineering to PM.
// Zero PR numbers or calendar dates.
// Run: node src/assets/diagrams/pr-swimlane.gen.mjs
import { writeFileSync } from 'node:fs';
import { dark, light } from './_palette.mjs';

// Days index 0..30 = Day 1 .. Day 31 (Tue 9/22 .. Wed 10/22, merge dates in ET, from the GitHub API).
// dy nudges a marker off the lane line where consecutive days would overlap.
const pmMerged = [
  { offset: 7, n: 1 },
  { offset: 8, n: 1 },
  { offset: 9, n: 4 },
  { offset: 12, n: 2 },
  { offset: 23, n: 1 },
  { offset: 24, n: 4 },
  { offset: 28, n: 2 },
  { offset: 29, n: 2, dy: -9 },
  { offset: 30, n: 2 },
];
const pmOpen = [{ offset: 29, n: 1, dy: 10 }];

const meMerged = [
  { offset: 1, n: 2 },
  { offset: 3, n: 2 },
  { offset: 7, n: 2 },
  { offset: 12, n: 6 },
  { offset: 29, n: 1, dy: -9 },
  { offset: 30, n: 2 },
];

const engMerged = [
  { offset: 1, n: 1 },
  { offset: 23, n: 1 },
];

function render(p) {
  const left = 216;
  const right = 656;
  const span = right - left;
  const xFor = (offset) => Math.round(left + (offset / 30) * span);

  const outX1 = xFor(11) - 6;
  const outX2 = xFor(22) + 6;
  const hardenX = xFor(12);
  const floorPrX = xFor(8);

  const laneY = {
    pm: 166,
    me: 238,
    eng: 296,
  };

  const drawMarkers = (items, laneYFor, shape) =>
    items
      .map(({ offset, n, dy = 0 }) => {
        const cx = xFor(offset);
        const y = laneYFor + dy;
        const r = n > 1 ? 8.5 : 6.5;
        let glyph = '';
        if (shape === 'circle') {
          glyph = `<circle cx="${cx}" cy="${y}" r="${r}" fill="${p.accent}" />`;
        } else if (shape === 'square') {
          glyph = `<rect x="${cx - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="3" fill="${p.failFill}" stroke="${p.fail}" stroke-width="2" />`;
        } else if (shape === 'diamond') {
          const s = r + 2;
          glyph = `<polygon points="${cx},${y - s} ${cx + s},${y} ${cx},${y + s} ${cx - s},${y}" fill="${p.node}" stroke="${p.text}" stroke-width="1.8" />`;
        } else if (shape === 'open') {
          glyph = `<circle cx="${cx}" cy="${y}" r="7.5" fill="${p.page}" stroke="${p.accent}" stroke-width="2" stroke-dasharray="3 2" />`;
        }
        const label =
          n > 1
            ? `<text x="${cx}" y="${y + 4}" font-size="12" font-weight="700" text-anchor="middle" fill="${shape === 'circle' ? p.onAccent : p.failText}">${n}</text>`
            : '';
        return `${glyph}${label}`;
      })
      .join('\n');

  const ticks = [
    { offset: 0, label: 'Day 1' },
    { offset: 6, label: 'Day 7' },
    { offset: 11, label: 'Day 12' },
    { offset: 23, label: 'Day 24' },
    { offset: 30, label: 'Day 31' },
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="360" viewBox="0 0 680 360">
  <g font-family="Inter Variable, system-ui, sans-serif" fill="${p.text}">
    <!-- Top Section: Three Phase Cards with Proportional Stacked Bars -->
    <!-- Card 1: Week 1 -->
    <rect x="16" y="12" width="208" height="86" rx="8" fill="${p.edgeFill}" stroke="${p.border}" stroke-width="1.5" />
    <text x="28" y="33" font-size="13" font-weight="700" fill="${p.text}">Week 1: Build &amp; launch</text>
    <text x="28" y="53" font-size="13" font-weight="600" fill="${p.line}">Me 4 · Eng 1</text>
    <rect x="28" y="65" width="144" height="14" rx="3" fill="${p.failFill}" stroke="${p.fail}" stroke-width="1.5" />
    <rect x="176" y="65" width="36" height="14" rx="3" fill="${p.node}" stroke="${p.line}" stroke-width="1.5" />

    <!-- Card 2: Weeks 2-3 -->
    <rect x="236" y="12" width="208" height="86" rx="8" fill="${p.edgeFill}" stroke="${p.border}" stroke-width="1.5" />
    <text x="248" y="33" font-size="13" font-weight="700" fill="${p.text}">Weeks 2-3: Floor loops &amp; OOO</text>
    <text x="248" y="53" font-size="13" font-weight="600" fill="${p.line}">PM 8 · Me 8</text>
    <rect x="248" y="65" width="90" height="14" rx="3" fill="${p.accent}" />
    <rect x="342" y="65" width="90" height="14" rx="3" fill="${p.failFill}" stroke="${p.fail}" stroke-width="1.5" />

    <!-- Card 3: Week 4 -->
    <rect x="456" y="12" width="208" height="86" rx="8" fill="${p.node}" stroke="${p.accent}" stroke-width="2" />
    <text x="468" y="33" font-size="13" font-weight="700" fill="${p.accent}">Week 4: Steady state</text>
    <text x="468" y="53" font-size="13" font-weight="600" fill="${p.text}">PM 11 · Me 3 · Eng 1</text>
    <rect x="468" y="65" width="132" height="14" rx="3" fill="${p.accent}" />
    <rect x="604" y="65" width="34" height="14" rx="3" fill="${p.failFill}" stroke="${p.fail}" stroke-width="1.5" />
    <rect x="642" y="65" width="10" height="14" rx="2" fill="${p.node}" stroke="${p.line}" stroke-width="1.5" />

    <!-- Shaded absence window: two-week OOO & async gap -->
    <rect x="${outX1}" y="114" width="${outX2 - outX1}" height="198" rx="6" fill="${p.edgeFill}" stroke="${p.border}" stroke-dasharray="4 4" />
    <text x="${Math.round((outX1 + outX2) / 2)}" y="133" font-size="12" font-weight="600" text-anchor="middle" fill="${p.line}">Two-week OOO &amp; async gap</text>

    <!-- Lane tracks -->
    <line x1="${left}" y1="${laneY.pm}" x2="${right}" y2="${laneY.pm}" stroke="${p.border}" stroke-width="1.5" />
    <line x1="${left}" y1="${laneY.me}" x2="${right}" y2="${laneY.me}" stroke="${p.border}" stroke-width="1.5" />
    <line x1="${left}" y1="${laneY.eng}" x2="${right}" y2="${laneY.eng}" stroke="${p.border}" stroke-width="1.5" />

    <!-- Lane labels (min 12px, titles 15px) -->
    <text x="16" y="${laneY.pm - 5}" font-size="15" font-weight="700">Product manager</text>
    <text x="16" y="${laneY.pm + 14}" font-size="12" fill="${p.line}">19 merged · 14 self in ~5m</text>

    <text x="16" y="${laneY.me - 5}" font-size="15" font-weight="700">Me (contracts &amp; CI)</text>
    <text x="16" y="${laneY.me + 14}" font-size="12" fill="${p.line}">15 merged · 19 commits on 6</text>

    <text x="16" y="${laneY.eng - 5}" font-size="15" font-weight="700">Engineer</text>
    <text x="16" y="${laneY.eng + 14}" font-size="12" fill="${p.line}">2 merged (v1 + slips)</text>

    <!-- Callout 1: 7 of 8 floor issues -> 1 PR (merged 4m after opening) on Day 9 -->
    <line x1="${floorPrX}" y1="140" x2="${floorPrX}" y2="${laneY.pm - 8}" stroke="${p.accent}" stroke-width="1.5" />
    <rect x="188" y="116" width="176" height="24" rx="12" fill="${p.node}" stroke="${p.accent}" stroke-width="1.5" />
    <text x="276" y="132" font-size="12" font-weight="600" text-anchor="middle" fill="${p.accent}">7 floor issues -&gt; 1 PR (4m)</text>

    <!-- Callout 2: 6-PR hardening Sunday on Day 13 -->
    <line x1="${hardenX}" y1="212" x2="${hardenX}" y2="${laneY.me - 13}" stroke="${p.fail}" stroke-width="1.5" />
    <rect x="${hardenX - 14}" y="188" width="160" height="24" rx="12" fill="${p.failFill}" stroke="${p.fail}" stroke-width="1.5" />
    <text x="${hardenX + 66}" y="204" font-size="12" font-weight="600" text-anchor="middle" fill="${p.failText}">6-PR hardening Sunday</text>

    <!-- Callout 3: 11 PRs on return across Days 24-31 -->
    <path d="M ${xFor(23)} 148 L ${xFor(23)} 142 L ${xFor(30)} 142 L ${xFor(30)} 148" fill="none" stroke="${p.accent}" stroke-width="1.5" />
    <rect x="548" y="116" width="116" height="24" rx="12" fill="${p.accent}" />
    <text x="606" y="132" font-size="12" font-weight="700" text-anchor="middle" fill="${p.onAccent}">11 PRs on return</text>

    <!-- Callout 4: v1 (41 files), merged Day 2 -->
    <line x1="${xFor(1) + 9}" y1="${laneY.eng}" x2="250" y2="${laneY.eng}" stroke="${p.line}" stroke-width="1.5" />
    <rect x="250" y="${laneY.eng - 12}" width="96" height="24" rx="12" fill="${p.node}" stroke="${p.border}" stroke-width="1.5" />
    <text x="298" y="${laneY.eng + 4}" font-size="12" font-weight="600" text-anchor="middle" fill="${p.text}">v1 (41 files)</text>

    <!-- Markers -->
    ${drawMarkers(pmMerged, laneY.pm, 'circle')}
    ${drawMarkers(pmOpen, laneY.pm, 'open')}
    ${drawMarkers(meMerged, laneY.me, 'square')}
    ${drawMarkers(engMerged, laneY.eng, 'diamond')}

    <!-- Date axis -->
    <line x1="${left}" y1="322" x2="${right}" y2="322" stroke="${p.border}" stroke-width="1" />
    ${ticks
      .map(({ offset, label }) => {
        const tx = xFor(offset);
        return `
          <line x1="${tx}" y1="322" x2="${tx}" y2="328" stroke="${p.line}" stroke-width="1.2" />
          <text x="${tx}" y="344" font-size="12" text-anchor="middle" fill="${p.line}">${label}</text>
        `;
      })
      .join('')}
  </g>
</svg>\n`;
}

for (const [theme, palette] of [
  ['light', light],
  ['dark', dark],
]) {
  writeFileSync(new URL(`./pr-swimlane-${theme}.svg`, import.meta.url), render(palette));
}
