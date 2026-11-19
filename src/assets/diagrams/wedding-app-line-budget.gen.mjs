// Run: node src/assets/diagrams/wedding-app-line-budget.gen.mjs
// App-code lines (the counted source folder) as the run ledger recorded them,
// unit by unit, against the 5,600-line stop. The last bar is the executor's
// estimate for the app plus the memories feature, which it refused to start.
import { emit, line, rect, scale, t } from './_chart.mjs';

const CAP = 5600;
const units = [
  ['Infrastructure', 344],
  ['Access gate', 1024],
  ['Data and API', 2309],
  ['Uploader', 3827],
  ['Views', 4711],
  ['Map', 4882],
  ['Admin', 5340],
];
const ESTIMATE = 6020;

emit(import.meta.url, 'wedding-app-line-budget', (p) => {
  const x = scale(0, 6400, 112, 360);
  const rowH = 30;
  const top = 26;
  const fmt = (n) => n.toLocaleString('en-US');
  const bars = units
    .map(([label, n], i) => {
      const y = top + i * rowH;
      return `${t(104, y + 15, label, { size: 13.5, anchor: 'end' })}
${rect(x(0), y + 3, x(n) - x(0), 16, { fill: i === units.length - 1 ? p.accent : p.line })}
${t(420, y + 16, fmt(n), { size: 13.5, weight: 600, font: 'mono', anchor: 'end' })}`;
    })
    .join('\n');
  const ey = top + units.length * rowH + 8;
  const bottom = ey + 30;
  return {
    height: bottom + 4,
    body: `
${t(x(CAP), 14, `stop at ${fmt(CAP)}`, { size: 13.5, anchor: 'end', fill: p.soft, font: 'mono' })}
${bars}
${t(104, ey + 15, 'With memories', { size: 13.5, anchor: 'end' })}
${rect(x(0), ey + 3, x(ESTIMATE) - x(0), 16, { stroke: p.text, sw: 1.5, dash: '4 3' })}
${t(420, ey + 16, '~6,020', { size: 13.5, weight: 600, font: 'mono', anchor: 'end' })}
${line(x(CAP), 20, x(CAP), bottom, { stroke: p.text, sw: 1.5, dash: '2 4' })}`,
  };
});
