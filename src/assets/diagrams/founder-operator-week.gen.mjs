// Run: node src/assets/diagrams/founder-operator-week.gen.mjs
// The standing weekly rhythm described in the founder-to-operator post's
// level-4 text: a 30-minute Monday kickoff, 15-minute standups Tuesday to
// Friday, a release cut at noon Tuesday and the release on Wednesday.
// Bar length is meeting minutes. The kickoff is the accent bar; release
// events are open squares, so kind is carried by shape, never by hue alone.
import { emit, line, rect, scale, t } from './_chart.mjs';

emit(import.meta.url, 'founder-operator-week', (p) => {
  const x = scale(0, 30, 0, 200);
  const rows = [
    { day: 'Monday', what: 'kickoff, 30 min', min: 30, kick: true },
    { day: 'Tuesday', what: 'standup, 15 min', min: 15, event: 'release cut, noon' },
    { day: 'Wednesday', what: 'standup, 15 min', min: 15, event: 'release goes out' },
    { day: 'Thursday', what: 'standup, 15 min', min: 15 },
    { day: 'Friday', what: 'standup, 15 min', min: 15 },
  ];
  let y = 18;
  const out = [];
  for (const r of rows) {
    out.push(t(0, y, `${r.day}: ${r.what}`, { size: 14.5, weight: r.kick ? 600 : 500 }));
    const by = y + 10;
    out.push(rect(0, by, x(r.min), 12, { fill: r.kick ? p.accent : p.line, rx: 2 }));
    if (r.event) {
      out.push(rect(x(r.min) + 16, by, 12, 12, { fill: p.page, stroke: p.accent, sw: 2.5, rx: 2 }));
      out.push(t(x(r.min) + 36, by + 11, r.event, { size: 13.5, fill: p.soft }));
    }
    y += 34;
    if (r.kick) {
      out.push(t(0, y + 4, 'gaps, last week, this week, blockers, Wednesday', { size: 13.5, fill: p.soft }));
      y += 20;
    }
    out.push(line(0, y - 4, 420, y - 4, { stroke: p.grid }));
    y += 22;
  }
  return { height: y - 26, body: out.join('\n') };
});
