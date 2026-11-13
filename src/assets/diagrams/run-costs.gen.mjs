// Run: node src/assets/diagrams/run-costs.gen.mjs
// Reported model cost and wall clock per run over the first two days. Cost is
// the estimate the CLI reports on a subscription, not an invoice. The total
// includes calibration and re-runs, so it is not the per-application price of
// one fresh scoring run.
import { emit, rect, scale, t } from './_chart.mjs';

const runs = [
  ['Calibration on 91 earlier applicants', '14 min', 14.78],
  ['First night, 365 applications', '46 min', 53.74],
  ['Overnight arrivals, 153', '20 min', 23.58],
  ['Three runs after the review, all 812', '92 min, 48 of it rate-limited lookups', 45.29],
  ['Work-sample looks, 121', '', 5.34],
];

emit(import.meta.url, 'run-costs', (p) => {
  const x = scale(0, 55, 0, 320);
  const rowH = 66;
  const body = runs
    .map(([label, time, usd], i) => {
      const y = 4 + i * rowH;
      return `${t(0, y + 14, label, { size: 15, weight: 600 })}
${time ? t(0, y + 32, time, { size: 13.5, fill: p.soft, font: 'mono' }) : ''}
${rect(0, y + (time ? 40 : 22), x(usd), 14, { fill: i === 1 ? p.accent : p.line })}
${t(x(usd) + 8, y + (time ? 53 : 35), `$${usd.toFixed(2)}`, { size: 14, weight: 600, font: 'mono' })}`;
    })
    .join('\n');
  const end = 4 + runs.length * rowH - 18;
  return {
    height: end + 36,
    body: `${body}
${t(0, end + 26, '$143', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(80, end + 14, 'in all, calibration and re-runs included', { size: 14 })}
${t(80, end + 32, 'about 17 cents an application, all-in', { size: 14, fill: p.soft })}`,
  };
});
