// Run: node src/assets/diagrams/redaction.gen.mjs
// Share of the saved packets that still carried a piece
// of the applicant's own name, or a "City, ST" line. Before = the first
// night's packets; after = the packets built after the fix. Same count both
// sides. The after numbers describe the packets, not every score (see post).
import { emit, line, rect, scale, t } from './_chart.mjs';

const rows = [
  { label: 'A piece of their own name', before: 35, after: 6 },
  { label: 'A “City, ST” line', before: 69, after: 0 },
];

emit(import.meta.url, 'redaction', (p) => {
  const x = scale(0, 100, 62, 330);
  const rowH = 108;
  const body = rows
    .map(({ label, before, after }, i) => {
      const y = 8 + i * rowH;
      return `${t(0, y + 14, label, { size: 15, weight: 600 })}
${t(54, y + 43, 'before', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}
${rect(x(0), y + 28, x(before) - x(0), 22, { fill: p.line })}
${t(x(before) + 10, y + 47, `${before}%`, { size: 22, weight: 500, font: 'display' })}
${t(54, y + 75, 'after', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}
${after > 0 ? rect(x(0), y + 60, x(after) - x(0), 22, { fill: p.accent }) : line(x(0), y + 60, x(0), y + 82, { stroke: p.accent, sw: 3 })}
${t(x(after) + 10, y + 79, `${after}%`, { size: 22, weight: 500, font: 'display', fill: p.accent })}`;
    })
    .join('\n');
  return {
    height: 8 + rows.length * rowH + 14,
    body: `${body}
${t(0, 8 + rows.length * rowH + 8, 'share of saved packets', { size: 12, fill: p.soft, font: 'mono' })}`,
  };
});
