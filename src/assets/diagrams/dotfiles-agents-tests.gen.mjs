// Run: node src/assets/diagrams/dotfiles-agents-tests.gen.mjs
// Unit chart of the eleven regression tests for the Codex config sync and
// rollback, one square each, grouped by what the test exercises. A filled
// square is a test that passes only if the installer refuses or blocks; a
// hollow square is a test that passes only if the write or restore goes
// through. Fill carries the distinction, never hue alone.
import { emit, rect, t } from './_chart.mjs';

emit(import.meta.url, 'dotfiles-agents-tests', (p) => {
  // [label, refusals, successes]
  const rows = [
    ['Sync and drift detection', 3, 2],
    ['Install, then uninstall', 0, 1],
    ['Rollback', 4, 1],
  ];
  const S = 26;
  const GAP = 10;
  const ROW = 78;
  const square = (x, y, refuses) =>
    refuses
      ? rect(x, y, S, S, { fill: p.accent, rx: 4 })
      : rect(x + 1.25, y + 1.25, S - 2.5, S - 2.5, { stroke: p.text, sw: 2.5, rx: 4 });
  const body = rows
    .map(([label, refuses, succeeds], i) => {
      const y = 22 + i * ROW;
      const marks = Array.from({ length: refuses + succeeds }, (_, k) =>
        square(k * (S + GAP), y + 10, k < refuses),
      ).join('\n');
      return `${t(0, y, label, { size: 14.5, weight: 500 })}
${marks}`;
    })
    .join('\n');
  const KEY = 22 + rows.length * ROW + 6;
  return {
    height: KEY + 26,
    body: `${body}
${square(0, KEY - 2, true)}
${t(S + 10, KEY + 17, 'must refuse (7)', { size: 14, fill: p.soft })}
${square(190, KEY - 2, false)}
${t(190 + S + 10, KEY + 17, 'must go through (4)', { size: 14, fill: p.soft })}`,
  };
});
