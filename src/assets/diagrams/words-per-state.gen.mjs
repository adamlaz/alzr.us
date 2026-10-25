// Regenerates words-per-state-{light,dark}.svg. Author-time only.
// Editorial horizontal bar/dumbbell comparison chart of UI words per screen state:
// before redesign vs. locked CI budget today, with a broken axis for the 148-word
// legacy tape-playing screen so the 0..40 word range has wide, legible bars.
// Run: node src/assets/diagrams/words-per-state.gen.mjs
import { writeFileSync } from 'node:fs';
import { dark, light } from './_palette.mjs';

const states = [
  { label: 'Tape playing', before: 148, after: 8, note: '-95%', broken: true },
  { label: 'Fail symptom picker', before: 34, after: 3 },
  { label: 'Order ready', before: 29, after: 3 },
  { label: 'Round 2 ready', before: 24, after: 13 },
  { label: 'Exception (note open)', before: 21, after: 15 },
  { label: "Can't inspect (note open)", before: 20, after: 15 },
  { label: 'Inspection result', before: 18, after: 15 },
  { label: 'Already inspected*', before: 25, after: 17 },
  { label: 'Round 2 tape*', before: 25, after: 18 },
];

function render(p) {
  const left = 190;
  const maxWords = 40;
  const plotWidth = 440; // 11px per word
  const scale = (w) => Math.round((w / maxWords) * plotWidth);
  const budgetX = left + scale(15);

  let y = 92;
  const rowH = 33;
  const rowsSvg = [];

  for (const s of states) {
    const wAfter = scale(s.after);
    let beforeSvg = '';

    if (s.broken) {
      const seg1End = left + scale(29);
      const seg2Start = seg1End + 12;
      const seg2End = left + scale(33);
      beforeSvg = `
        <rect x="${left}" y="${y}" width="${seg1End - left}" height="22" rx="4" fill="${p.edgeFill}" stroke="${p.line}" stroke-width="1.5" stroke-dasharray="4 3" />
        <rect x="${seg2Start}" y="${y}" width="${seg2End - seg2Start}" height="22" rx="4" fill="${p.edgeFill}" stroke="${p.line}" stroke-width="1.5" stroke-dasharray="4 3" />
        <line x1="${seg1End + 4}" y1="${y - 3}" x2="${seg1End - 2}" y2="${y + 25}" stroke="${p.text}" stroke-width="2" />
        <line x1="${seg1End + 11}" y1="${y - 3}" x2="${seg1End + 5}" y2="${y + 25}" stroke="${p.text}" stroke-width="2" />
        <text x="${seg2End + 8}" y="${y + 15}" font-size="12.5" font-weight="700" fill="${p.text}">148 words (${s.note})</text>
      `;
    } else {
      const wBefore = scale(s.before);
      beforeSvg = `
        <rect x="${left}" y="${y}" width="${wBefore}" height="22" rx="4" fill="${p.edgeFill}" stroke="${p.line}" stroke-width="1.5" stroke-dasharray="4 3" />
        <circle cx="${left + wBefore}" cy="${y + 11}" r="3.5" fill="${p.line}" />
        <text x="${left + wBefore + 8}" y="${y + 15}" font-size="12.5" font-weight="500" fill="${p.line}">was ${s.before}</text>
      `;
    }

    const lockDot =
      wAfter >= 60 ? `<circle cx="${left + 10}" cy="${y + 11}" r="3" fill="${p.onAccent}" opacity="0.8" />` : '';

    rowsSvg.push(`
      <text x="${left - 12}" y="${y + 15}" font-size="13.5" font-weight="500" text-anchor="end" fill="${p.text}">${s.label}</text>
      ${beforeSvg}
      <rect x="${left}" y="${y}" width="${wAfter}" height="22" rx="4" fill="${p.accent}" />
      ${lockDot}
      <text x="${left + wAfter - 7}" y="${y + 15}" font-size="12.5" font-weight="700" text-anchor="end" fill="${p.onAccent}">${s.after}</text>
    `);
    y += rowH;
  }

  const chartBottom = y - 3;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="430" viewBox="0 0 680 430">
  <g font-family="Inter Variable, system-ui, sans-serif" fill="${p.text}">
    <!-- Title & Legend -->
    <text x="20" y="26" font-size="15.5" font-weight="700" fill="${p.text}">UI words per screen state: before redesign vs. locked CI budget today</text>

    <rect x="20" y="38" width="18" height="12" rx="3" fill="${p.accent}" />
    <text x="44" y="48" font-size="12" font-weight="600" fill="${p.text}">Locked CI budget today</text>

    <rect x="200" y="38" width="18" height="12" rx="3" fill="${p.edgeFill}" stroke="${p.line}" stroke-width="1.5" stroke-dasharray="3 2" />
    <text x="224" y="48" font-size="12" fill="${p.line}">Before redesign / trim pass</text>

    <text x="660" y="48" font-size="12" text-anchor="end" fill="${p.line}">* +2-3 words for order-history strip</text>

    <!-- Baseline & grid ticks -->
    <line x1="${left}" y1="84" x2="${left}" y2="${chartBottom}" stroke="${p.border}" stroke-width="1.5" />
    ${[0, 5, 10, 15, 20, 25, 30, 35, 40]
      .map((tick) => {
        const tx = left + scale(tick);
        return `
          <line x1="${tx}" y1="${chartBottom}" x2="${tx}" y2="${chartBottom + 5}" stroke="${p.border}" stroke-width="1.2" />
          <text x="${tx}" y="${chartBottom + 21}" font-size="12" text-anchor="middle" fill="${p.line}">${tick}</text>
        `;
      })
      .join('')}
    <line x1="${left}" y1="${chartBottom}" x2="${left + plotWidth}" y2="${chartBottom}" stroke="${p.border}" stroke-width="1" />

    ${rowsSvg.join('\n')}

    <!-- 15-word rule cap reference line -->
    <line x1="${budgetX}" y1="80" x2="${budgetX}" y2="${chartBottom}" stroke="${p.fail}" stroke-width="2" stroke-dasharray="6 4" />
    <rect x="${budgetX - 64}" y="58" width="128" height="22" rx="4" fill="${p.failFill}" stroke="${p.fail}" stroke-width="1.2" />
    <text x="${budgetX}" y="73" font-size="12" font-weight="700" text-anchor="middle" fill="${p.failText}">15-word rule cap</text>
  </g>
</svg>\n`;
}

for (const [theme, palette] of [
  ['light', light],
  ['dark', dark],
]) {
  writeFileSync(new URL(`./words-per-state-${theme}.svg`, import.meta.url), render(palette));
}
