// Run: node src/assets/diagrams/one-frame-seek-times.gen.mjs
// The three seeks behind the post's "1.9 to 3.0 seconds": one frame each from
// 10 seconds, 200 minutes and 380 minutes into the 4.8 GB, 6.68-hour file,
// drawn against the plan's 10-second stop line.
import { emit, line, rect, scale, t } from './_chart.mjs';

emit(import.meta.url, 'one-frame-seek-times', (p) => {
  const x = scale(0, 10, 0, 400);
  const rows = [
    ['10 seconds in', 1.9],
    ['200 minutes in', 2.4],
    ['380 minutes in', 3.0],
  ];
  const top = 8;
  const pitch = 62;
  const bars = rows
    .map(([label, s], i) => {
      const y = top + i * pitch;
      return `
${t(0, y + 14, label, { size: 15, weight: 600 })}
${rect(0, y + 24, x(s), 22, { fill: p.accent })}
${t(x(s) + 10, y + 41, `${s.toFixed(1)} s`, { size: 17, weight: 500, font: 'display', fill: p.accent })}`;
    })
    .join('');
  const bottom = top + rows.length * pitch;
  return {
    height: bottom + 30,
    body: `
${line(x(10), top, x(10), bottom - 8, { stroke: p.text, sw: 1.5, dash: '5 4' })}
${bars}
${line(0, bottom, 400, bottom, { stroke: p.grid })}
${t(0, bottom + 20, '0', { size: 13.5, fill: p.soft, font: 'mono' })}
${t(x(10), bottom + 20, '10 s: the stop line', { size: 13.5, fill: p.soft, font: 'mono', anchor: 'end' })}`,
  };
});
