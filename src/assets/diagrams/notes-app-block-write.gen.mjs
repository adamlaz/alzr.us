// Run: node src/assets/diagrams/notes-app-block-write.gen.mjs
// What a writer does with a fenced block, by the state it finds on the page.
// Four rows are the shared block helper's behaviour; the "differs" row is the
// check each guarded writer runs before calling it. The accent row is the one
// the post is about; it is also the only bold, thick-stroked box.
import { emit, line, path, rect, t } from './_chart.mjs';

const rows = [
  [['No block on the page yet'], 'Insert, stamp the hash', false],
  [['Opening marker with', 'no closing marker'], 'Write nothing', false],
  [['Marker carries no hash', '(an older block)'], 'Replace, stamp it now', false],
  [['Stamped hash matches', 'the body on disk'], 'Replace, restamp', false],
  [['Stamped hash differs:', 'I edited inside the fence'], 'Skip. My edit stays.', true],
];

emit(import.meta.url, 'notes-app-block-write', (p) => {
  const top = 34;
  const rowH = 56;
  const body = rows
    .map(([cond, outcome, key], i) => {
      const cy = top + i * rowH + 20;
      const text =
        cond.length === 1
          ? t(0, cy + 5, cond[0], { size: 14 })
          : `${t(0, cy - 4, cond[0], { size: 14 })}
${t(0, cy + 14, cond[1], { size: 14 })}`;
      return `${text}
${line(196, cy, 228, cy, { stroke: key ? p.accent : p.line, sw: key ? 2 : 1.5 })}
${path(
  [
    [222, cy - 5],
    [228, cy],
    [222, cy + 5],
  ],
  { stroke: key ? p.accent : p.line, sw: key ? 2 : 1.5 },
)}
${rect(236, cy - 19, 184, 38, { stroke: key ? p.accent : p.line, sw: key ? 2.5 : 1.5, rx: 4 })}
${t(328, cy + 5, outcome, { size: 14, anchor: 'middle', weight: key ? 600 : 400 })}`;
    })
    .join('\n');
  const end = top + rows.length * rowH;
  return {
    height: end + 26,
    body: `
${t(0, 14, 'WHAT THE WRITER FINDS', { size: 13.5, fill: p.soft, spacing: '0.04em' })}
${t(236, 14, 'WHAT IT DOES', { size: 13.5, fill: p.soft, spacing: '0.04em' })}
${body}
${t(236, end + 14, 'A force flag overrides the skip.', { size: 13.5, fill: p.soft })}`,
  };
});
