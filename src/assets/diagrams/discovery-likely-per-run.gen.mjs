// Run: node src/assets/diagrams/discovery-likely-per-run.gen.mjs
// One square per saved research run, 49 in all: 28 produced at least one
// likely hit (filled accent), 21 produced none (hollow). Fill versus outline
// carries the split, never hue alone. Order inside a group means nothing.
import { emit, rect, t } from './_chart.mjs';

const WITH = 28;
const WITHOUT = 21;

emit(import.meta.url, 'discovery-likely-per-run', (p) => {
  const cols = 25;
  const pitch = 16.7;
  const s = 13;
  const top = 46;
  const marks = [];
  for (let i = 0; i < WITH + WITHOUT; i++) {
    const x = (i % cols) * pitch;
    const y = top + Math.floor(i / cols) * pitch;
    marks.push(
      i < WITH
        ? rect(x, y, s, s, { fill: p.accent, rx: 2 })
        : rect(x + 1, y + 1, s - 2, s - 2, { stroke: p.text, sw: 1.8, rx: 2 }),
    );
  }
  const L = top + 2 * pitch + 22;
  return {
    height: L + 50,
    body: `
${t(0, 30, '28', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(44, 30, 'runs with a likely hit', { size: 15, weight: 600 })}
${marks.join('\n')}
${rect(0, L, 12, 12, { fill: p.accent, rx: 2 })}
${t(20, L + 11, '28 runs: at least one likely hit', { size: 14 })}
${rect(1, L + 25, 10, 10, { stroke: p.text, sw: 1.8, rx: 2 })}
${t(20, L + 35, '21 runs: none', { size: 14 })}`,
  };
});
