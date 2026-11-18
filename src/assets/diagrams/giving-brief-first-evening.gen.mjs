// Run: node src/assets/diagrams/giving-brief-first-evening.gen.mjs
// The kit repo's git log for its first evening, on a true time axis
// (9:30 PM to 11:30 PM). Eight commits in 90 minutes: the first one, one
// wording change, two paths added for runs with nobody at the keyboard, two
// permission fixes, and two rules for unattended runs.
// Kind is carried by row and shape, never by hue alone.
import { dot, emit, line, rect, scale, t } from './_chart.mjs';

emit(import.meta.url, 'giving-brief-first-evening', (p) => {
  const min = (h, m) => h * 60 + m;
  const x = scale(min(21, 30), min(23, 30), 14, 406);
  const rows = [
    { y: 32, label: 'First commit, 9:41 PM', at: [min(21, 41)], kind: 'first' },
    { y: 78, label: '1 wording change', at: [min(21, 51)], kind: 'doc' },
    { y: 124, label: '2 paths for headless runs', at: [min(21, 54), min(22, 2)], kind: 'path' },
    { y: 170, label: '2 permission fixes', at: [min(22, 25), min(22, 56)], kind: 'fix' },
    { y: 216, label: '2 rules for unattended runs', at: [min(23, 7), min(23, 11)], kind: 'fix' },
  ];
  const mark = (kind, cx, cy) => {
    if (kind === 'first') return dot(cx, cy, 6.5, { fill: p.page, stroke: p.text, sw: 2.5 });
    if (kind === 'fix') return dot(cx, cy, 6, { fill: p.accent, stroke: p.page, sw: 1.5 });
    if (kind === 'path') return rect(cx - 6, cy - 6, 12, 12, { fill: p.page, stroke: p.accent, sw: 2.5, rx: 2 });
    return dot(cx, cy, 4.5, { fill: p.line, stroke: p.page, sw: 1.5 });
  };
  const AX = 242;
  const ticks = [
    [min(22, 0), '10:00'],
    [min(22, 30), '10:30'],
    [min(23, 0), '11:00 PM'],
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
