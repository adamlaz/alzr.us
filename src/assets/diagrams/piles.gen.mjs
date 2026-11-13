// Run: node src/assets/diagrams/piles.gen.mjs
// One mark per sorted application, 812 in all, in three piles. Every mark is
// the same size; shape and lightness carry the pile (cobalt dot, neutral dot,
// hollow square), never hue alone. Counts only; order inside a pile means
// nothing.
import { dot, emit, rect, t } from './_chart.mjs';

const RESEARCH = 124;
const MAYBE = 660;
const PASS = 28;

emit(import.meta.url, 'piles', (p) => {
  const cols = 35;
  const pitch = 12;
  const r = 3.6;
  const top = 104;
  const total = RESEARCH + MAYBE + PASS;
  const rows = Math.ceil(total / cols);
  const research = (x, y) => dot(x, y, r, { fill: p.accent });
  const maybe = (x, y) => dot(x, y, r, { fill: p.faint });
  const pass = (x, y) => rect(x - r + 0.8, y - r + 0.8, 2 * r - 1.6, 2 * r - 1.6, { stroke: p.text, sw: 1.6, rx: 1 });
  const marks = [];
  for (let i = 0; i < total; i++) {
    const x = 6 + (i % cols) * pitch;
    const y = top + Math.floor(i / cols) * pitch;
    marks.push(i < RESEARCH ? research(x, y) : i < RESEARCH + MAYBE ? maybe(x, y) : pass(x, y));
  }
  const key = (y, mark, n, label, sub) => `
${mark(6, y - 6)}
${t(62, y, n, { size: 22, weight: 500, font: 'display', anchor: 'end', fill: mark === research ? p.accent : p.text })}
${t(72, y, label, { size: 15, weight: 600 })}
${t(166, y, sub, { size: 14, fill: p.soft })}`;
  return {
    height: top + (rows - 1) * pitch + 8,
    body: `
${key(18, research, '124', 'Research', 'a deeper look before any call')}
${key(46, maybe, '660', 'Maybe', 'sorted, strongest first')}
${key(74, pass, '28', 'Likely pass', 'needs evidence')}
${marks.join('\n')}`,
  };
});
