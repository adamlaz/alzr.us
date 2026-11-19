// Run: node src/assets/diagrams/writing-voice-draft-dashes.gen.mjs
// Share of work emails carrying each mark: about 45 emails I wrote by hand
// against 65 that agents drafted for me in the same months (Jun-Aug 2026).
// Neutral bar = hand-written, accent bar = agent-drafted.
import { emit, rect, scale, t } from './_chart.mjs';

const rows = [
  { label: 'A tight dash (word-)', mine: 15, drafts: 52 },
  { label: 'A double dash ( -- )', mine: 32, drafts: 62 },
  { label: 'A word from the flag list', mine: 2, drafts: 11 },
];

emit(import.meta.url, 'writing-voice-draft-dashes', (p) => {
  const x = scale(0, 100, 62, 400);
  const rowH = 108;
  const body = rows
    .map(({ label, mine, drafts }, i) => {
      const y = 8 + i * rowH;
      return `${t(0, y + 14, label, { size: 15, weight: 600 })}
${t(54, y + 43, 'mine', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}
${rect(x(0), y + 28, x(mine) - x(0), 22, { fill: p.line })}
${t(x(mine) + 10, y + 47, `${mine}%`, { size: 22, weight: 500, font: 'display' })}
${t(54, y + 75, 'drafts', { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}
${rect(x(0), y + 60, x(drafts) - x(0), 22, { fill: p.accent })}
${t(x(drafts) + 10, y + 79, `${drafts}%`, { size: 22, weight: 500, font: 'display', fill: p.accent })}`;
    })
    .join('\n');
  return {
    height: 8 + rows.length * rowH + 14,
    body: `${body}
${t(0, 8 + rows.length * rowH + 8, 'share of emails', { size: 12, fill: p.soft, font: 'mono' })}`,
  };
});
