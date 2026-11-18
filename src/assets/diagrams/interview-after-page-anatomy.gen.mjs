// Run: node src/assets/diagrams/interview-after-page-anatomy.gen.mjs
// The six blocks of the per-candidate interview page, top to bottom, and which
// of them change per candidate. Structure only: nothing about any candidate.
// Per-candidate blocks are filled and say so in words; fixed blocks are
// outlined. Kind is carried by fill and label, never by hue alone.
import { emit, rect, t } from './_chart.mjs';

emit(import.meta.url, 'interview-after-page-anatomy', (p) => {
  const rows = [
    { name: 'Header', note: 'links to the research', kind: 'fixed' },
    { name: 'The read', note: 'written per candidate', kind: 'own' },
    { name: 'How I run it', note: 'same on every page', kind: 'fixed' },
    { name: 'Probe bank', note: 'written per candidate', kind: 'own' },
    { name: 'Scorecard', note: 'fixed rows, evidence pre-filled', kind: 'mixed' },
    { name: 'After the call', note: 'same on every page', kind: 'fixed' },
  ];
  const H = 36;
  const GAP = 8;
  const body = rows
    .map((r, i) => {
      const y = i * (H + GAP) + 1;
      const box =
        r.kind === 'own'
          ? rect(1, y, 418, H, { fill: p.accent, stroke: p.accent, rx: 4 })
          : r.kind === 'mixed'
            ? rect(1, y, 418, H, { fill: p.accentSoft, stroke: p.accent, rx: 4 })
            : rect(1, y, 418, H, { fill: p.page, stroke: p.line, rx: 4 });
      const ink = r.kind === 'own' ? p.onAccent : p.text;
      const soft = r.kind === 'own' ? p.onAccent : r.kind === 'mixed' ? p.text : p.soft;
      return `${box}
${t(14, y + 23, r.name, { size: 15, weight: 600, fill: ink })}
${t(406, y + 23, r.note, { size: 13.5, anchor: 'end', fill: soft })}`;
    })
    .join('\n');
  return { height: rows.length * (H + GAP) - GAP + 2, body };
});
