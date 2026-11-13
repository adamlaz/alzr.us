// Run: node src/assets/diagrams/run-costs.gen.mjs
// Reported model cost per run over the first two days. The figure is the
// estimate the CLI reports on a subscription, not an invoice.
import { emit, rect, scale, t } from './_chart.mjs';

const runs = [
  ['Calibration on 91 earlier applicants', 14.78],
  ['First night, 365 applications', 53.74],
  ['Overnight arrivals, 153', 23.58],
  ['Three runs after the review, all 812', 45.29],
  ['Public-work checks, 121', 5.34],
];

emit(import.meta.url, 'run-costs', (p) => {
  const x = scale(0, 55, 0, 330);
  const rowH = 48;
  const body = runs
    .map(([label, usd], i) => {
      const y = 4 + i * rowH;
      return `${t(0, y + 14, label, { size: 14 })}
${rect(0, y + 22, x(usd), 14, { fill: i === 1 ? p.accent : p.line })}
${t(x(usd) + 8, y + 35, `$${usd.toFixed(2)}`, { size: 14, weight: 600, font: 'mono' })}`;
    })
    .join('\n');
  const end = 4 + runs.length * rowH;
  return {
    height: end + 34,
    body: `${body}
${t(0, end + 24, '$143', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(78, end + 14, 'in all, with a 26-cent test', { size: 14 })}
${t(78, end + 31, 'about fifteen cents an application', { size: 13, fill: p.soft })}`,
  };
});
