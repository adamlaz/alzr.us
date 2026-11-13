// Run: node src/assets/diagrams/work-checks.gen.mjs
// What a look at the linked work found for the research pile, 121 checks.
// Pattern level only: four verdicts, counts, nothing about how the look works.
import { emit, rect, scale, t } from './_chart.mjs';

const verdicts = [
  ['Strong', 33],
  ['OK', 52],
  ['Weak', 9],
  ['Not checkable', 27],
];

emit(import.meta.url, 'work-checks', (p) => {
  const x = scale(0, 121, 0, 418);
  const fills = [p.accent, p.line, p.text, 'none'];
  let at = 0;
  const y = 44;
  const body = verdicts
    .map(([label, n], i) => {
      const x0 = x(at);
      const w = x(n) - 3;
      at += n;
      const hollow = fills[i] === 'none';
      const mid = x0 + w / 2;
      return `${rect(x0 + (hollow ? 1 : 0), y + (hollow ? 1 : 0), w - (hollow ? 2 : 0), 26 - (hollow ? 2 : 0), hollow ? { stroke: p.text, sw: 1.8, dash: '4 3' } : { fill: fills[i] })}
${t(mid, y - 12, n, { size: 22, weight: 500, font: 'display', anchor: 'middle', fill: i === 0 ? p.accent : p.text })}
${t(i === 3 ? 418 : mid, y + 46, label, { size: 13, anchor: i === 3 ? 'end' : 'middle', weight: i === 0 ? 600 : 400 })}`;
    })
    .join('\n');
  return { height: 100, body };
});
