// Run: node src/assets/diagrams/ai-scores.gen.mjs
// How 765 scored applications did on the AI question, 1 to 4 (median of three
// reads). Only the 4s are the accent. Labels stop short of a scoring guide.
import { emit, line, rect, scale, t } from './_chart.mjs';

const counts = [151, 387, 206, 21];
const total = 765;

emit(import.meta.url, 'ai-scores', (p) => {
  const H = 300;
  const colW = 74;
  const gap = 22;
  const left = 22;
  const y = scale(0, 400, 236, 34);
  const cx = (i) => left + i * (colW + gap) + colW / 2;

  const cols = counts
    .map((n, i) => {
      const four = i === 3;
      const pct = Math.round((n / total) * 100);
      return `${rect(cx(i) - colW / 2, y(n), colW, y(0) - y(n), { fill: four ? p.accent : p.line, rx: 3 })}
${t(cx(i), y(n) - 9, n, { size: four ? 30 : 22, weight: 500, font: 'display', anchor: 'middle', fill: four ? p.accent : p.text })}
${t(cx(i), 262, i + 1, { size: 20, weight: 600, anchor: 'middle' })}
${t(cx(i), 280, `${pct}%`, { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' })}`;
    })
    .join('\n');

  return {
    height: H,
    body: `
${cols}
${line(left - 8, y(0), cx(3) + colW / 2 + 8, y(0), { stroke: p.line })}
${t(cx(3) + colW / 2, y(21) - 78, 'full marks', { size: 15, weight: 600, anchor: 'end', fill: p.accent })}
${t(cx(3) + colW / 2, y(21) - 60, 'of 765', { size: 13, anchor: 'end', fill: p.soft })}
${t(left - 8, 297, 'score on the AI question, out of 4', { size: 12, fill: p.soft, font: 'mono' })}`,
  };
});
