// Run: node src/assets/diagrams/piles.gen.mjs
// One mark per sorted application, 812 in all, in three piles. Shape and
// lightness carry the pile (filled cobalt dot, neutral dot, hollow square), so
// it never depends on hue. Counts only; the order inside a pile means nothing.
import { dot, emit, rect, t } from './_chart.mjs';

const RESEARCH = 124;
const MAYBE = 660;
const PASS = 28;

emit(import.meta.url, 'piles', (p) => {
  const cols = 35;
  const pitch = 12;
  const top = 52;
  const total = RESEARCH + MAYBE + PASS;
  const rows = Math.ceil(total / cols);
  const pos = (i) => [6 + (i % cols) * pitch, top + Math.floor(i / cols) * pitch];
  const marks = [];
  for (let i = 0; i < total; i++) {
    const [x, y] = pos(i);
    if (i < RESEARCH) marks.push(dot(x, y, 4.2, { fill: p.accent }));
    else if (i < RESEARCH + MAYBE) marks.push(dot(x, y, 3.1, { fill: p.faint }));
    else marks.push(rect(x - 3.4, y - 3.4, 6.8, 6.8, { stroke: p.text, sw: 1.6, rx: 1 }));
  }
  const bottom = top + (rows - 1) * pitch;
  const midY = top + ((Math.floor(RESEARCH / cols) + rows - 1) / 2) * pitch;
  return {
    height: bottom + 62,
    body: `
${t(0, 22, '124', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(64, 14, 'Research', { size: 15, weight: 600 })}
${t(64, 31, 'a deeper look before any call', { size: 13, fill: p.soft })}
${marks.join('\n')}
${rect(120, midY - 30, 180, 56, { fill: p.page, rx: 6 })}
${t(210, midY + 6, '660', { size: 30, weight: 500, font: 'display', anchor: 'middle' })}
${t(210, midY + 22, 'Maybe, sorted strongest first', { size: 13, anchor: 'middle', fill: p.soft })}
${t(416, bottom + 38, '28', { size: 30, weight: 500, font: 'display', anchor: 'end' })}
${t(372, bottom + 30, 'Likely pass', { size: 15, weight: 600, anchor: 'end' })}
${t(372, bottom + 47, 'still mine to decide', { size: 13, anchor: 'end', fill: p.soft })}`,
  };
});
