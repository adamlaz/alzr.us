// Run: node src/assets/diagrams/writing-voice-typed-dictated.gen.mjs
// Share of work chat messages with each feature: 372 messages I typed
// (May through 2026-08-29) against 225 I dictated (Sep-Oct 2026).
// Neutral bar = typed, accent bar = dictated.
import { emit, line, rect, scale, t } from './_chart.mjs';

const rows = [
  { label: 'Starts lowercase', typed: 61, spoken: 18 },
  { label: 'Ends on a period', typed: 16, spoken: 74 },
  { label: 'Has a double dash ( -- )', typed: 24, spoken: 0 },
  { label: 'Has an emoji', typed: 20, spoken: 0 },
  { label: 'Says “I think”, “I guess” or “I mean”', typed: 4, spoken: 15 },
];

emit(import.meta.url, 'writing-voice-typed-dictated', (p) => {
  const x = scale(0, 100, 62, 400);
  const rowH = 104;
  const bar = (v, y, fill) =>
    v > 0 ? rect(x(0), y, x(v) - x(0), 22, { fill }) : line(x(0), y, x(0), y + 22, { stroke: fill, sw: 3 });
  const body = rows
    .map(({ label, typed, spoken }, i) => {
      const y = 8 + i * rowH;
      return `${t(0, y + 14, label, { size: 15, weight: 600 })}
${t(54, y + 43, 'typed', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}
${bar(typed, y + 28, p.line)}
${t(x(typed) + 10, y + 47, `${typed}%`, { size: 22, weight: 500, font: 'display' })}
${t(54, y + 75, 'spoken', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}
${bar(spoken, y + 60, p.accent)}
${t(x(spoken) + 10, y + 79, `${spoken}%`, { size: 22, weight: 500, font: 'display', fill: p.accent })}`;
    })
    .join('\n');
  return {
    height: 8 + rows.length * rowH + 14,
    body: `${body}
${t(0, 8 + rows.length * rowH + 8, 'share of messages', { size: 12, fill: p.soft, font: 'mono' })}`,
  };
});
