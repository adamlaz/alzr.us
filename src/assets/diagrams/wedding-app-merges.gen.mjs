// Run: node src/assets/diagrams/wedding-app-merges.gen.mjs
// The first run's fourteen merges on a true time axis (noon Saturday to 6 AM
// Sunday, Eastern). Times are the squash-merge commit times in the app repo's
// git log. Review kind is carried by row and shape, never by hue alone.
import { dot, emit, line, rect, scale, t } from './_chart.mjs';

const min = (h, m) => h * 60 + m; // hours past Saturday midnight; 24+ is Sunday
const KICKOFF = min(12, 9);
const CLOSE = min(29, 21);
const rows = [
  {
    label: 'Fresh-context reviewer, 7 merges',
    kind: 'review',
    at: [min(13, 3), min(13, 49), min(14, 48), min(18, 9), min(18, 58), min(20, 0), min(23, 52)],
  },
  {
    label: "Orchestrator's own read, 7 merges",
    kind: 'read',
    at: [min(21, 17), min(24, 16), min(25, 49), min(26, 5), min(28, 37), min(29, 4), min(29, 19)],
  },
];

emit(import.meta.url, 'wedding-app-merges', (p) => {
  const x = scale(min(12, 0), min(30, 0), 14, 406);
  const mark = (kind, cx, cy) =>
    kind === 'review'
      ? dot(cx, cy, 6, { fill: p.accent, stroke: p.page, sw: 1.5 })
      : rect(cx - 4.5, cy - 4.5, 9, 9, { fill: p.page, stroke: p.text, sw: 2, rx: 2 });
  const AX = 150;
  const ticks = [
    [min(12, 0), 'noon'],
    [min(18, 0), '6 PM'],
    [min(24, 0), 'midnight'],
    [min(30, 0), '6 AM'],
  ]
    .map(
      ([m, label], i, a) =>
        `${line(x(m), AX - 4, x(m), AX + 4, { stroke: p.line })}
${t(x(m), AX + 22, label, { size: 13.5, anchor: i === 0 ? 'start' : i === a.length - 1 ? 'end' : 'middle', fill: p.soft, font: 'mono' })}`,
    )
    .join('\n');
  return {
    height: AX + 30,
    body: `
${rows
  .map((r, i) => {
    const y = 36 + i * 54;
    return `${t(0, y - 16, r.label, { size: 14, weight: 500 })}
${line(14, y, 406, y, { stroke: p.grid })}
${r.at.map((m) => mark(r.kind, x(m), y)).join('\n')}`;
  })
  .join('\n')}
${line(14, AX, 406, AX, { stroke: p.line })}
${line(x(KICKOFF), AX, x(CLOSE), AX, { stroke: p.accent, sw: 5 })}
${ticks}`,
  };
});
