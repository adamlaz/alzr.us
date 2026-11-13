// Run: node src/assets/diagrams/reading-hours.gen.mjs
// Hours of first-pass reading, estimated: all 816 by hand against the 124
// research notes. Solid = the low end, lighter = up to the high end.
import { emit, line, rect, scale, t } from './_chart.mjs';

emit(import.meta.url, 'reading-hours', (p) => {
  const x = scale(0, 54, 0, 400);
  // Solid up to the low estimate, a lighter run on to the high one.
  const row = (y, label, sub, lo, hi, fill, value) => `
${t(0, y + 14, label, { size: 15, weight: 600 })}
${t(0, y + 32, sub, { size: 13, fill: p.soft })}
${rect(0, y + 44, x(hi), 26, { fill: fill === p.accent ? p.accentSoft : p.faint })}
${rect(0, y + 44, x(lo), 26, { fill })}
${t(0, y + 102, value, { size: 30, weight: 500, font: 'display', fill: fill === p.accent ? p.accent : p.text })}`;
  return {
    height: 262,
    body: `
${row(0, 'Reading all 816 by hand', 'two to four minutes each', 27, 54, p.line, '27 to 54 hours')}
${line(0, 124, 418, 124, { stroke: p.grid })}
${row(140, 'Reading the 124 research notes', 'a minute or two each', 2, 4, p.accent, '2 to 4 hours')}
${t(418, 258, 'estimates, not yet measured', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}`,
  };
});
