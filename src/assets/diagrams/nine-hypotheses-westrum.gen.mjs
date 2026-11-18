// Run: node src/assets/diagrams/nine-hypotheses-westrum.gen.mjs
// Westrum culture mean on the 1-5 scale the post reports: leadership expected
// about 2.5, the survey came back 3.82, and the generative band runs 3.5-5.0
// (all three published in the post and its third footnote). Expected is a
// hollow dot, measured a filled accent dot.
import { dot, emit, line, rect, scale, t } from './_chart.mjs';

const expected = 2.5;
const measured = 3.82;
const band = [3.5, 5];

emit(import.meta.url, 'nine-hypotheses-westrum', (p) => {
  const x = scale(1, 5, 14, 406);
  const axis = 118;
  const ticks = [1, 2, 3, 4, 5]
    .map(
      (v) => `${line(x(v), axis - 5, x(v), axis + 5, { stroke: p.line })}
${t(x(v), axis + 26, v, { size: 13.5, anchor: 'middle', fill: p.soft, font: 'mono' })}`,
    )
    .join('\n');
  return {
    height: 176,
    body: `
${rect(x(band[0]), axis - 22, x(band[1]) - x(band[0]), 44, { fill: p.accentSoft, rx: 3 })}
${line(x(1), axis, x(5), axis, { stroke: p.line })}
${ticks}
${t(x(band[1]), axis - 30, 'generative, 3.5 to 5', { size: 13.5, anchor: 'end', fill: p.soft })}
${dot(x(expected), axis, 8, { fill: p.page, stroke: p.text, sw: 2.2 })}
${t(x(expected), 28, 'about 2.5', { size: 22, weight: 500, font: 'display', anchor: 'middle' })}
${t(x(expected), 48, 'leadership expected', { size: 13.5, anchor: 'middle', fill: p.soft })}
${line(x(expected), 56, x(expected), axis - 11, { stroke: p.faint })}
${dot(x(measured), axis, 9, { fill: p.accent, stroke: p.page, sw: 2 })}
${t(x(measured), 28, '3.82', { size: 30, weight: 500, font: 'display', anchor: 'middle', fill: p.accent })}
${t(x(measured), 48, 'the survey', { size: 13.5, weight: 600, anchor: 'middle', fill: p.accent })}
${line(x(measured), 56, x(measured), axis - 12, { stroke: p.accent })}
${t(x(1), 170, 'Westrum culture mean, 1 to 5', { size: 13.5, fill: p.soft, font: 'mono' })}`,
  };
});
