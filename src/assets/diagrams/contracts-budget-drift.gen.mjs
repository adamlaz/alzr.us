// Run: node src/assets/diagrams/contracts-budget-drift.gen.mjs
// The browser benchmark's word budget for each of the eleven budgeted screen
// states, at two commits: the Sunday-night lock and the merge five days later.
// Hollow ring = locked Sunday, filled accent dot = at merge. A single filled
// neutral dot marks a budget that did not move. Dashed rule = the 15-word target.
import { dot, emit, line, scale, t } from './_chart.mjs';

const states = [
  ['Scan', 9, 9],
  ['Order ready', 3, 16],
  ['Tape playing', 8, 10],
  ['Fail, picking a symptom', 3, 10],
  ['Fail, Other needs a note', 10, 17],
  ['Exception', 15, 17],
  ['Could not inspect', 15, 17],
  ['Result', 15, 15],
  ['Already inspected', 17, 17],
  ['Round 2 ready', 13, 28],
  ['Round 2 tape', 18, 20],
];

emit(import.meta.url, 'contracts-budget-drift', (p) => {
  const x = scale(0, 30, 176, 396);
  const top = 46;
  const rowH = 27;
  const bottom = top + states.length * rowH;
  const rows = states
    .map(([label, locked, merged], i) => {
      const y = top + i * rowH + 10;
      const moved = locked !== merged;
      return `${t(0, y + 5, label, { size: 13.5 })}
${line(176, y, 396, y, { stroke: p.grid })}
${
  moved
    ? `${line(x(locked) + 6, y, x(merged) - 6, y, { stroke: p.accent, sw: 2 })}
${dot(x(locked), y, 5, { fill: p.page, stroke: p.text, sw: 2 })}
${dot(x(merged), y, 5.5, { fill: p.accent })}
${t(x(merged) + 10, y + 5, String(merged), { size: 13.5, weight: 600, fill: p.accent })}`
    : `${dot(x(locked), y, 5.5, { fill: p.line })}
${t(x(locked) + 10, y + 5, String(locked), { size: 13.5, fill: p.soft })}`
}`;
    })
    .join('\n');
  const ticks = [0, 15, 30]
    .map((v) =>
      t(x(v), bottom + 24, v === 15 ? '15-word target' : String(v), {
        size: 13.5,
        anchor: 'middle',
        fill: p.soft,
        font: 'mono',
      }),
    )
    .join('\n');
  return {
    height: bottom + 34,
    body: `
${dot(6, 14, 5, { fill: p.page, stroke: p.text, sw: 2 })}
${t(18, 19, 'Locked Sunday', { size: 13.5, fill: p.soft })}
${dot(136, 14, 5.5, { fill: p.accent })}
${t(148, 19, 'At merge', { size: 13.5, fill: p.soft })}
${dot(232, 14, 5.5, { fill: p.line })}
${t(244, 19, 'Unchanged', { size: 13.5, fill: p.soft })}
${line(x(15), top - 4, x(15), bottom + 4, { stroke: p.line, dash: '4 3' })}
${rows}
${ticks}`,
  };
});
