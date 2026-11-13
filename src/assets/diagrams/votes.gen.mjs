// Run: node src/assets/diagrams/votes.gen.mjs
// How the three reads voted on the pile, across 812 applications.
import { emit, rect, scale, t } from './_chart.mjs';

emit(import.meta.url, 'votes', (p) => {
  const x = scale(0, 812, 0, 418);
  const y = 50;
  const split = x(745);
  return {
    height: 132,
    body: `
${t(0, 28, '745', { size: 30, weight: 500, font: 'display' })}
${t(60, 18, 'all three agreed', { size: 15, weight: 600 })}
${t(60, 35, '92% of 812', { size: 13, fill: p.soft })}
${rect(0, y, split - 1.5, 26, { fill: p.line })}
${rect(split + 1.5, y, 418 - split - 1.5, 26, { fill: p.accent })}
${t(418, 112, '67', { size: 30, weight: 500, font: 'display', anchor: 'end', fill: p.accent })}
${t(376, 102, 'split two to one', { size: 15, weight: 600, anchor: 'end' })}
${t(376, 119, 'no three-way splits', { size: 13, anchor: 'end', fill: p.soft })}`,
  };
});
