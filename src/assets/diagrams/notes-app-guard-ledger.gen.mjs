// Run: node src/assets/diagrams/notes-app-guard-ledger.gen.mjs
// Incidents and the guards that followed them, in date order (2026). Dates
// come from the vault repo's git history and its runbook. An incident is a
// hollow ring, a guard is a filled square: kind is carried by shape and fill,
// never by hue alone.
import { dot, emit, line, rect, t } from './_chart.mjs';

const rows = [
  ['Apr 12', 'incident', 'Category drift repaired on 97 pages'],
  ['May 9', 'incident', 'Package upgrade orphans a permission'],
  ['May 22', 'guard', 'Interpreter moved out of Homebrew’s reach'],
  ['May 23', 'guard', 'Hash fence and budget cap first committed'],
  ['Jun 1', 'incident', 'Three breakages in one morning'],
  ['Jun 1', 'guard', 'Log archive job added'],
  ['Jun 11', 'guard', 'Test suite starts at 69 tests'],
  ['Jun 12', 'guard', 'Drift check joins the test script'],
  ['Jul 2', 'guard', 'Failed jobs write a row in the log'],
  ['Jul 30', 'incident', 'Research agents fail quietly to Aug 14'],
  ['Oct 11', 'guard', 'Every job wrapped; overdue is a status'],
  ['Nov 13', 'incident', 'Stranded rebase, 12 hours on an old tree'],
  ['Nov 14', 'guard', 'Push merges and never rebases'],
];

emit(import.meta.url, 'notes-app-guard-ledger', (p) => {
  const top = 48;
  const rowH = 29;
  const X = 76;
  const y = (i) => top + i * rowH;
  const marks = rows
    .map(([date, kind, label], i) => {
      const cy = y(i);
      const mark =
        kind === 'incident'
          ? dot(X, cy, 6, { fill: p.page, stroke: p.text, sw: 2.5 })
          : rect(X - 6, cy - 6, 12, 12, { fill: p.accent, rx: 2 });
      return `${t(0, cy + 5, date, { size: 13.5, fill: p.soft, font: 'mono' })}
${mark}
${t(X + 18, cy + 5, label, { size: 14, weight: kind === 'incident' ? 600 : 400 })}`;
    })
    .join('\n');
  return {
    height: y(rows.length - 1) + 20,
    body: `
${dot(6, 12, 6, { fill: p.page, stroke: p.text, sw: 2.5 })}
${t(20, 17, 'incident', { size: 14, weight: 600 })}
${rect(104, 6, 12, 12, { fill: p.accent, rx: 2 })}
${t(124, 17, 'guard that landed', { size: 14 })}
${line(X, y(0), X, y(rows.length - 1), { stroke: p.grid, sw: 2 })}
${marks}`,
  };
});
