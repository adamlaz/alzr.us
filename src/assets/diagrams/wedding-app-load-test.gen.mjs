// Run: node src/assets/diagrams/wedding-app-load-test.gen.mjs
// The passing load-test run: median and 95th-percentile latency in
// milliseconds for the three server actions an upload makes and for the PUT
// to storage. From the run's saved summary, rounded to whole milliseconds.
import { emit, rect, scale, t } from './_chart.mjs';

const rows = [
  ['Start a file', 76, 122],
  ['Gallery copies confirmed', 126, 188],
  ['Original completed', 139, 202],
  ['One PUT to storage', 193, 293],
];

emit(import.meta.url, 'wedding-app-load-test', (p) => {
  const x = scale(0, 300, 0, 330);
  const rowH = 70;
  const body = rows
    .map(([label, p50, p95], i) => {
      const y = 4 + i * rowH;
      return `${t(0, y + 14, label, { size: 15, weight: 600 })}
${rect(0, y + 24, x(p95), 12, { fill: p.accentSoft })}
${t(x(p95) + 8, y + 35, `p95 ${p95}`, { size: 13.5, font: 'mono', fill: p.soft })}
${rect(0, y + 40, x(p50), 12, { fill: p.accent })}
${t(x(p50) + 8, y + 51, `median ${p50}`, { size: 13.5, weight: 600, font: 'mono' })}`;
    })
    .join('\n');
  return { height: 4 + rows.length * rowH, body };
});
