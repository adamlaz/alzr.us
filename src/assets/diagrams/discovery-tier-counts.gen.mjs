// Run: node src/assets/diagrams/discovery-tier-counts.gen.mjs
// Where 6,690 username hits landed across 49 saved research runs: 6,218 noise,
// 389 possible, 83 likely. Counts only, summed from each run's tier totals.
// The accent marks the likely tier; the other two are neutral.
import { emit, rect, scale, t } from './_chart.mjs';

const TOTAL = 6690;
const rows = [
  ['Noise: a bare hit, or metadata that matched nothing', 6218, false],
  ['Possible: name in free text or handle, or a location', 389, false],
  ['Likely: first and last name in a name field', 83, true],
];

emit(import.meta.url, 'discovery-tier-counts', (p) => {
  const x = scale(0, TOTAL, 0, 418);
  const rowH = 62;
  const body = rows
    .map(([label, n, hot], i) => {
      const y = 4 + i * rowH;
      const w = x(n);
      const inside = w > 300;
      return `${t(0, y + 14, label, { size: 15, weight: hot ? 600 : 400 })}
${rect(0, y + 24, 418, 18, { fill: p.grid })}
${rect(0, y + 24, w, 18, { fill: hot ? p.accent : p.line })}
${t(inside ? w - 8 : w + 10, y + 39, n.toLocaleString('en-US'), {
  size: 18,
  weight: 500,
  font: 'display',
  anchor: inside ? 'end' : undefined,
  fill: inside ? p.page : hot ? p.accent : p.text,
})}`;
    })
    .join('\n');
  const end = 4 + rows.length * rowH;
  return {
    height: end + 10,
    body: `${body}
${t(418, end + 4, 'of 6,690 hits', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}`,
  };
});
