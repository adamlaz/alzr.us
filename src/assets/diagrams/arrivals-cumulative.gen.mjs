// Run: node src/assets/diagrams/arrivals-cumulative.gen.mjs
// Running total of applications over the first 32 hours, against the busiest
// earlier 32 hours (one earlier posting) and a typical earlier posting (an
// approximate median). Aggregate counts per hour; hour 0 is the first hour
// after posting. The wave's last, partial bucket (3 rows) is folded into the
// 32-hour point so the line ends on the post's 816.
import { dot, emit, line, path, scale, t } from './_chart.mjs';

const wave = [
  21,
  92,
  71,
  40,
  44,
  26,
  20,
  17,
  20,
  12,
  15,
  13,
  17,
  16,
  7,
  10,
  16,
  14,
  13,
  18,
  45,
  47,
  36,
  44,
  26,
  39,
  21,
  23,
  7,
  7,
  9,
  7 + 3,
];
const record = [
  47, 10, 9, 7, 9, 8, 7, 2, 3, 8, 1, 2, 5, 6, 7, 13, 29, 35, 33, 29, 29, 30, 20, 17, 1, 3, 1, 1, 3, 2, 2, 3,
];
const typical = [3, 2, 3, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 4, 4, 1, 1, 3, 2, 1, 0, 3, 1, 1, 0, 0, 1, 0, 1, 0, 0];

const running = (counts) => {
  const points = [[0, 0]];
  let sum = 0;
  counts.forEach((count, i) => {
    sum += count;
    points.push([i + 1, sum]);
  });
  return points;
};

emit(import.meta.url, 'arrivals-cumulative', (p) => {
  const H = 318;
  const x = scale(0, 32, 30, 318);
  const y = scale(0, 850, 276, 22);
  const pts = (counts) => running(counts).map(([h, n]) => [x(h), y(n)]);

  const grid = [200, 400, 600, 800]
    .map(
      (n) =>
        `${line(x(0), y(n), x(32), y(n), { stroke: p.grid })}
${t(x(0) - 6, y(n) + 4, n, { size: 12, anchor: 'end', fill: p.soft, font: 'mono' })}`,
    )
    .join('\n');
  const ticks = [0, 8, 16, 24, 32]
    .map((h) => t(x(h), 296, h, { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' }))
    .join('\n');

  const end = x(32) + 10;
  return {
    height: H,
    body: `
${grid}
${line(x(0), y(0), x(32), y(0), { stroke: p.line })}
${ticks}
${t(x(16), 314, 'hours since the roles went up', { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' })}
${path(pts(typical), { stroke: p.line, sw: 2, dash: '1 5' })}
${path(pts(record), { stroke: p.line, sw: 2 })}
${path(pts(wave), { stroke: p.accent, sw: 3 })}
${dot(x(32), y(816), 4.5, { fill: p.accent, stroke: p.page, sw: 2 })}
${t(end, y(816) + 3, '816', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(end, y(816) + 21, 'these four', { size: 13, fill: p.soft })}
${t(end, y(816) + 37, 'roles', { size: 13, fill: p.soft })}
${t(end, y(382) + 2, '382', { size: 20, weight: 500, font: 'display' })}
${t(end, y(382) + 19, 'old record', { size: 13, fill: p.soft })}
${t(end, y(36) - 10, '36', { size: 20, weight: 500, font: 'display' })}
${t(end, y(36) + 6, 'a typical', { size: 13, fill: p.soft })}
${t(end, y(36) + 22, 'posting', { size: 13, fill: p.soft })}`,
  };
});
