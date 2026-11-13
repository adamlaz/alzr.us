// Run: node src/assets/diagrams/ai-tells.gen.mjs
// Share of intros carrying two classic AI tells: 2,630 intros on earlier
// postings against the 769 distinct applications on this one.
import { dot, emit, line, path, scale, t } from './_chart.mjs';

const series = [
  { label: 'stock phrases', before: 28.7, after: 16.9 },
  { label: 'em dashes', before: 13.9, after: 5.3 },
];

emit(import.meta.url, 'ai-tells', (p) => {
  const H = 300;
  const xa = 132;
  const xb = 318;
  const y = scale(0, 32, 262, 62);

  const lines = series
    .map(({ label, before, after }) => {
      const pct = (v) => `${Math.round(v)}%`;
      return `${path(
        [
          [xa, y(before)],
          [xb, y(after)],
        ],
        { stroke: p.accent, sw: 3 },
      )}
${dot(xa, y(before), 5.5, { fill: p.page, stroke: p.accent, sw: 2.5 })}
${dot(xb, y(after), 6, { fill: p.accent, stroke: p.page, sw: 2 })}
${t(xa - 14, y(before) + 2, pct(before), { size: 26, weight: 500, font: 'display', anchor: 'end' })}
${t(xa - 14, y(before) + 20, label, { size: 14, anchor: 'end', fill: p.soft })}
${t(xb + 14, y(after) + 9, pct(after), { size: 30, weight: 500, font: 'display', fill: p.accent })}`;
    })
    .join('\n');

  return {
    height: H,
    body: `
${line(xa, 50, xa, y(0), { stroke: p.grid })}
${line(xb, 50, xb, y(0), { stroke: p.grid })}
${line(xa - 40, y(0), xb + 40, y(0), { stroke: p.line })}
${t(xa, 18, 'Earlier postings', { size: 15, weight: 600, anchor: 'middle' })}
${t(xa, 36, '2,630 intros', { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' })}
${t(xb, 18, 'These four roles', { size: 15, weight: 600, anchor: 'middle' })}
${t(xb, 36, '769 applications', { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' })}
${lines}
${t((xa + xb) / 2, 284, 'share of intros with the tell', { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' })}`,
  };
});
