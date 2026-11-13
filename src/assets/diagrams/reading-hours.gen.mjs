// Run: node src/assets/diagrams/reading-hours.gen.mjs
// Hours of reading to a first shortlist, estimated: all 816 by hand against
// the 124 research notes. Solid = the low estimate, lighter = up to the high
// one. The 660 maybes still get read afterwards; nobody has estimated that, so
// it is drawn as a dashed bar with no length claimed.
import { emit, line, rect, scale, t } from './_chart.mjs';

emit(import.meta.url, 'reading-hours', (p) => {
  const x = scale(0, 54, 0, 400);
  const row = (y, label, sub, lo, hi, fill, value) => `
${t(0, y + 14, label, { size: 15, weight: 600 })}
${t(0, y + 32, sub, { size: 14, fill: p.soft })}
${rect(0, y + 44, x(hi), 26, { fill: fill === p.accent ? p.accentSoft : p.faint })}
${rect(0, y + 44, x(lo), 26, { fill })}
${t(0, y + 102, value, { size: 30, weight: 500, font: 'display', fill: fill === p.accent ? p.accent : p.text })}`;
  return {
    height: 338,
    body: `
${row(0, 'Reading all 816 by hand', 'two to four minutes each', 27, 54, p.line, '27 to 54 hours')}
${line(0, 124, 418, 124, { stroke: p.grid })}
${row(140, 'Reading the 124 research notes first', 'a minute or two each', 2, 4, p.accent, '2 to 4 hours')}
${line(0, 264, 418, 264, { stroke: p.grid })}
${t(0, 294, 'Then the 660 maybes, in order', { size: 15, weight: 600 })}
${rect(1, 306, 398, 24, { stroke: p.soft, sw: 1.5, dash: '5 4' })}
${t(200, 323, 'not yet estimated', { size: 14, anchor: 'middle', fill: p.soft })}`,
  };
});
