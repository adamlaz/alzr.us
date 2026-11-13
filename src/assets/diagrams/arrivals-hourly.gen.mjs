// Run: node src/assets/diagrams/arrivals-hourly.gen.mjs
// Applications per hour for the first 32 hours. Hour 0 is the first hour after
// posting; the axis stays relative on purpose. Aggregate counts only.
import { emit, line, rect, scale, t } from './_chart.mjs';

const wave = [
  21, 92, 71, 40, 44, 26, 20, 17, 20, 12, 15, 13, 17, 16, 7, 10, 16, 14, 13, 18, 45, 47, 36, 44, 26, 39, 21, 23, 7, 7,
  9, 7, 3,
];

emit(import.meta.url, 'arrivals-hourly', (p) => {
  const H = 250;
  const left = 30;
  const pitch = 11.8;
  const bw = 8.6;
  const y = scale(0, 100, 208, 26);
  const bx = (h) => left + h * pitch;

  const grid = [25, 50, 75]
    .map(
      (n) =>
        `${line(left, y(n), left + 33 * pitch, y(n), { stroke: p.grid })}
${t(left - 6, y(n) + 4, n, { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}`,
    )
    .join('\n');
  const second = (h) => h >= 20 && h <= 27;
  const bars = wave
    .map((n, h) => rect(bx(h), y(n), bw, y(0) - y(n), { fill: h === 1 || second(h) ? p.accent : p.line, rx: 2 }))
    .join('\n');
  const ticks = [0, 8, 16, 24, 32]
    .map((h) => t(bx(h) + bw / 2, 226, h, { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' }))
    .join('\n');

  return {
    height: H,
    body: `
${grid}
${bars}
${line(left, y(0), left + 33 * pitch, y(0), { stroke: p.line })}
${ticks}
${t(left + 16.5 * pitch, 244, 'hours since the roles went up', { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' })}
${t(bx(1) + bw + 8, y(92) + 12, '92', { size: 26, weight: 500, font: 'display', fill: p.accent })}
${t(bx(1) + bw + 44, y(92) + 11, 'in the second hour', { size: 14 })}
${t(bx(23.5) + bw / 2, y(47) - 30, 'A second wave,', { size: 14, anchor: 'middle' })}
${t(bx(23.5) + bw / 2, y(47) - 12, '20 hours in', { size: 14, anchor: 'middle' })}`,
  };
});
