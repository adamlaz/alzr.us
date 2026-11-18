// Run: node src/assets/diagrams/founder-operator-retro.gen.mjs
// The 55-minute retro run sheet quoted in the founder-to-operator post's
// level-5 text, on a true time axis. Each bar starts at the minute mark in
// the facilitator guide. The silent brainstorm is the accent bar: it is the
// step where nobody has spoken yet.
import { emit, line, rect, scale, t } from './_chart.mjs';

emit(import.meta.url, 'founder-operator-retro', (p) => {
  const x = scale(0, 55, 0, 406);
  const steps = [
    { at: 0, min: 3, label: 'Welcome and warm-up' },
    { at: 3, min: 5, label: 'Set the scene' },
    { at: 8, min: 10, label: 'Silent brainstorm', accent: true },
    { at: 18, min: 15, label: 'Read out and cluster' },
    { at: 33, min: 3, label: 'Vote' },
    { at: 36, min: 12, label: 'Discuss the top two or three' },
    { at: 48, min: 5, label: 'Commitments' },
    { at: 53, min: 2, label: 'Close' },
  ];
  let y = 16;
  const out = [];
  for (const s of steps) {
    out.push(t(0, y, `${s.label}, ${s.min} min`, { size: 14, weight: s.accent ? 600 : 500 }));
    out.push(line(0, y + 14, 406, y + 14, { stroke: p.grid }));
    out.push(rect(x(s.at), y + 8, x(s.min), 12, { fill: s.accent ? p.accent : p.line, rx: 2 }));
    y += 40;
  }
  const AX = y - 6;
  out.push(line(0, AX, 406, AX, { stroke: p.line }));
  for (const m of [0, 15, 30, 55]) {
    out.push(line(x(m), AX - 4, x(m), AX + 4, { stroke: p.line }));
    out.push(
      t(x(m), AX + 22, m === 55 ? '55 min' : `${m}`, {
        size: 13.5,
        anchor: m === 0 ? 'start' : m === 55 ? 'end' : 'middle',
        fill: p.soft,
        font: 'mono',
      }),
    );
  }
  return { height: AX + 30, body: out.join('\n') };
});
