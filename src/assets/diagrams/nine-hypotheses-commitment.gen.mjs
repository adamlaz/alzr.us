// Run: node src/assets/diagrams/nine-hypotheses-commitment.gen.mjs
// The first pair from the post's signal table: 27.7% of the trailing year's
// epics finished, 89.4% of open engineering issues marked High. Both numbers
// are published in the post. The finished share is the accent; the High share
// is a hollow bar, so the two separate by shape and not by hue.
import { emit, line, rect, scale, t } from './_chart.mjs';

const rows = [
  { value: 27.7, head: 'epics finished', detail: 'of roughly 480 opened in the trailing 12 months', accent: true },
  { value: 89.4, head: 'marked High priority', detail: 'of open engineering issues', accent: false },
];

emit(import.meta.url, 'nine-hypotheses-commitment', (p) => {
  const x = scale(0, 100, 0, 412);
  const bar = 26;
  const pitch = 104;
  const body = rows
    .map(({ value, head, detail, accent }, i) => {
      const y = 8 + i * pitch;
      const mark = accent
        ? rect(0, y + 38, x(value), bar, { fill: p.accent, rx: 3 })
        : rect(1, y + 39, x(value) - 2, bar - 2, { stroke: p.text, sw: 1.8, rx: 3 });
      return `${t(0, y + 26, `${value}%`, { size: 30, weight: 500, font: 'display', fill: accent ? p.accent : p.text })}
${t(104, y + 24, head, { size: 15, weight: 600 })}
${line(0, y + 38 + bar / 2, x(100), y + 38 + bar / 2, { stroke: p.grid })}
${mark}
${t(0, y + 84, detail, { size: 13.5, fill: p.soft })}`;
    })
    .join('\n');
  return { height: 8 + rows.length * pitch - 8, body: `\n${body}` };
});
