// Run: node src/assets/diagrams/what-they-sent.gen.mjs
// What turned up where the form asked for work and for an AI story, out of
// 769 distinct applications. Generic counts only.
import { emit, rect, scale, t } from './_chart.mjs';

const rows = [
  ['A LinkedIn profile where the work goes', 250, true],
  ['The AI question left blank', 51, false],
  ['No work linked at all', 33, false],
];

emit(import.meta.url, 'what-they-sent', (p) => {
  const x = scale(0, 769, 0, 418);
  const rowH = 62;
  const body = rows
    .map(([label, n, hot], i) => {
      const y = 4 + i * rowH;
      return `${t(0, y + 14, label, { size: 15, weight: hot ? 600 : 400 })}
${rect(0, y + 24, 418, 18, { fill: p.grid })}
${rect(0, y + 24, x(n), 18, { fill: hot ? p.accent : p.line })}
${t(x(n) + 10, y + 39, n, { size: 18, weight: 500, font: 'display', fill: hot ? p.accent : p.text })}`;
    })
    .join('\n');
  const end = 4 + rows.length * rowH;
  return {
    height: end + 10,
    body: `${body}
${t(418, end + 4, 'of 769 applications', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}`,
  };
});
