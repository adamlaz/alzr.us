// Run: node src/assets/diagrams/tasks-ai-evening-log.gen.mjs
// The theme repo's git log for its first evening, on a true time axis
// (9:15 PM to 10:45 PM). Eleven commits: the first one, four fixes, two
// automated release commits, and four doc or showcase-site changes.
// Kind is carried by row and shape, never by hue alone.
import { dot, emit, line, rect, scale, t } from './_chart.mjs';

emit(import.meta.url, 'tasks-ai-evening-log', (p) => {
  const min = (h, m) => h * 60 + m;
  const x = scale(min(21, 15), min(22, 45), 14, 406);
  const rows = [
    { y: 32, label: 'First commit, 9:24 PM', at: [min(21, 24)], kind: 'first' },
    { y: 78, label: '4 fixes', at: [min(21, 41), min(21, 45), min(21, 48), min(21, 55)], kind: 'fix' },
    { y: 124, label: '2 releases', at: [min(21, 43), min(22, 22)], kind: 'release' },
    { y: 170, label: '4 doc and site changes', at: [min(22, 7), min(22, 21), min(22, 25), min(22, 38)], kind: 'doc' },
  ];
  const mark = (kind, cx, cy) => {
    if (kind === 'first') return dot(cx, cy, 6.5, { fill: p.page, stroke: p.text, sw: 2.5 });
    if (kind === 'fix') return dot(cx, cy, 6, { fill: p.accent, stroke: p.page, sw: 1.5 });
    if (kind === 'release') return rect(cx - 6, cy - 6, 12, 12, { fill: p.page, stroke: p.accent, sw: 2.5, rx: 2 });
    return dot(cx, cy, 4.5, { fill: p.line, stroke: p.page, sw: 1.5 });
  };
  const AX = 196;
  const ticks = [
    [min(21, 30), '9:30'],
    [min(22, 0), '10:00'],
    [min(22, 30), '10:30 PM'],
  ]
    .map(
      ([m, label]) =>
        `${line(x(m), AX - 4, x(m), AX + 4, { stroke: p.line })}
${t(x(m), AX + 22, label, { size: 13.5, anchor: 'middle', fill: p.soft, font: 'mono' })}`,
    )
    .join('\n');
  return {
    height: AX + 30,
    body: `
${rows
  .map(
    (r) => `${t(0, r.y - 14, r.label, { size: 14, weight: r.kind === 'first' ? 600 : 500 })}
${line(14, r.y, 406, r.y, { stroke: p.grid })}
${r.at.map((m) => mark(r.kind, x(m), r.y)).join('\n')}`,
  )
  .join('\n')}
${line(14, AX, 406, AX, { stroke: p.line })}
${ticks}`,
  };
});
