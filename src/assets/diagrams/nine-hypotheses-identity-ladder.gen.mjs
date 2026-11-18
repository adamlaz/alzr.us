// Run: node src/assets/diagrams/nine-hypotheses-identity-ladder.gen.mjs
// The identity resolver's match cascade: six rules tried in order, each with
// the confidence the resolver logs for it. A fuzzy match needs a string score
// of 82 or more out of 100 and logs score/100; anything logged under 0.9 goes
// to the review list. Filled accent = merged without review; hollow = the
// range a fuzzy match can land in.
import { emit, line, rect, scale, t } from './_chart.mjs';

const rules = [
  { n: 1, label: 'same account ID', conf: 1.0 },
  { n: 2, label: 'same email', conf: 1.0 },
  { n: 3, label: 'same normalized name', conf: 1.0 },
  { n: 4, label: 'known alias', conf: 0.95 },
  { n: 5, label: 'same first and last name', conf: 0.9 },
  { n: 6, label: 'fuzzy match, score 82 or more', range: [0.82, 1.0] },
];

emit(import.meta.url, 'nine-hypotheses-identity-ladder', (p) => {
  const x = scale(0.8, 1.0, 232, 404);
  const top = 34;
  const pitch = 34;
  const bottom = top + rules.length * pitch;
  const rows = rules
    .map(({ n, label, conf, range }, i) => {
      const y = top + i * pitch;
      const mark = range
        ? rect(x(range[0]) + 1, y + 5, x(range[1]) - x(range[0]) - 2, 14, { stroke: p.text, sw: 1.8, rx: 2 })
        : rect(x(0.8), y + 4, x(conf) - x(0.8), 16, { fill: p.accent, rx: 2 });
      return `${t(0, y + 17, n, { size: 14, weight: 600, fill: p.soft, font: 'mono' })}
${t(20, y + 17, label, { size: 14 })}
${mark}`;
    })
    .join('\n');
  return {
    height: bottom + 44,
    body: `
${t(x(0.8), 14, '0.8', { size: 13.5, anchor: 'middle', fill: p.soft, font: 'mono' })}
${t(x(0.9), 14, '0.9', { size: 13.5, anchor: 'middle', fill: p.soft, font: 'mono' })}
${t(x(1.0), 14, '1.0', { size: 13.5, anchor: 'end', fill: p.soft, font: 'mono' })}
${line(x(0.8), 22, x(0.8), bottom, { stroke: p.grid })}
${rows}
${line(x(0.9), 22, x(0.9), bottom + 6, { stroke: p.text, dash: '3 4' })}
${t(x(0.9) - 8, bottom + 22, 'under 0.9: review list', { size: 13.5, anchor: 'end', fill: p.soft })}
${t(0, bottom + 40, 'confidence logged for each merge', { size: 13.5, fill: p.soft, font: 'mono' })}`,
  };
});
