// Run: node src/assets/diagrams/guard.gen.mjs
// The 55 times the model voted "likely pass", one square each: 28 went through
// with evidence (21 a checked problem, 7 clearly missed must-haves), 27 were
// held at maybe. Filled = went through, hollow = held.
import { emit, line, rect, t } from './_chart.mjs';

emit(import.meta.url, 'guard', (p) => {
  const s = 15;
  const pitch = 19;
  const perRow = 11;
  const cell = (i, x0, y0) => [x0 + (i % perRow) * pitch, y0 + Math.floor(i / perRow) * pitch];
  const top = 62;
  const xL = 0;
  const xR = 216;
  const through = Array.from({ length: 28 }, (_, i) => {
    const [x, y] = cell(i, xL, top);
    return rect(x, y, s, s, { fill: i < 21 ? p.accent : p.line, rx: 2 });
  }).join('\n');
  const held = Array.from({ length: 27 }, (_, i) => {
    const [x, y] = cell(i, xR, top);
    return rect(x + 1, y + 1, s - 2, s - 2, { stroke: p.text, sw: 1.8, rx: 2 });
  }).join('\n');
  const below = top + 3 * pitch + 14;
  return {
    height: below + 62,
    body: `
${t(xL, 26, '28', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(xL + 44, 16, 'went through', { size: 15, weight: 600 })}
${t(xL + 44, 34, 'evidence behind each', { size: 13, fill: p.soft })}
${t(xR, 26, '27', { size: 30, weight: 500, font: 'display' })}
${t(xR + 42, 16, 'held at maybe', { size: 15, weight: 600 })}
${t(xR + 42, 34, 'a vote, nothing behind it', { size: 13, fill: p.soft })}
${line(xR - 12, 4, xR - 12, below - 16, { stroke: p.grid })}
${through}
${held}
${rect(xL, below, 11, 11, { fill: p.accent, rx: 2 })}
${t(xL + 18, below + 10, '21 with a problem a script checked', { size: 13 })}
${rect(xL, below + 22, 11, 11, { fill: p.line, rx: 2 })}
${t(xL + 18, below + 32, '7 with two must-haves clearly missed', { size: 13 })}`,
  };
});
