// Run: node src/assets/diagrams/parallel-agents-resume-pass.gen.mjs
// One square per candidate in a wave that was researched without resumes and
// then re-read once 24 resumes arrived. 19 verdicts held, 1 moved up, 4 moved
// down. Filled neutral = held, filled accent = up, hollow = down.
import { emit, rect, t } from './_chart.mjs';

emit(import.meta.url, 'parallel-agents-resume-pass', (p) => {
  const s = 13.5;
  const pitch = 17.2;
  const top = 44;
  const groups = [19, 1, 4];
  let i = 0;
  const squares = [];
  const starts = [];
  for (const [g, n] of groups.entries()) {
    starts.push(i * pitch);
    for (let k = 0; k < n; k++, i++) {
      const x = i * pitch;
      if (g === 0) squares.push(rect(x, top, s, s, { fill: p.line, rx: 2 }));
      else if (g === 1) squares.push(rect(x, top, s, s, { fill: p.accent, rx: 2 }));
      else squares.push(rect(x + 1, top + 1, s - 2, s - 2, { stroke: p.text, sw: 1.8, rx: 2 }));
    }
  }
  const L = top + s + 30;
  const row = (y, swatch, head, detail) => `${swatch(y)}
${t(20, y + 11, head, { size: 14, weight: 600 })}
${t(20, y + 29, detail, { size: 13.5, fill: p.soft })}`;
  return {
    height: L + 3 * 50 - 8,
    body: `
${t(starts[0], 30, '19', { size: 30, weight: 500, font: 'display' })}
${t(starts[1] - 9, 30, '1', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(starts[2], 30, '4', { size: 30, weight: 500, font: 'display' })}
${squares.join('\n')}
${row(
  L,
  (y) => rect(0, y, 12, 12, { fill: p.line, rx: 2 }),
  '19 verdicts held',
  'the resume agreed with the footprint-only read',
)}
${row(L + 50, (y) => rect(0, y, 12, 12, { fill: p.accent, rx: 2 }), '1 moved up', 'verify-first to interview-grade')}
${row(
  L + 100,
  (y) => rect(1, y + 1, 10, 10, { stroke: p.text, sw: 1.8, rx: 2 }),
  '4 moved down',
  'two to verify-first, two to pass',
)}`,
  };
});
