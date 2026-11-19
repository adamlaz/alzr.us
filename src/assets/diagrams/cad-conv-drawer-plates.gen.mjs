// Run: node src/assets/diagrams/cad-conv-drawer-plates.gen.mjs
// Plan view of the silverware drawer, to scale: a 337 x 450 mm interior, an
// 8 x 10 grid of 42 mm cells (336 x 420), split into four plates for a 256 mm
// bed. The front pair is 168 x 210; the rear pair is 168 x 239 because each
// carries the 29 mm fit-to-drawer pad. The pad is the subject, so it carries
// the accent; the seams are drawn heavier than the cell lines.
import { emit, line, rect, t } from './_chart.mjs';

emit(import.meta.url, 'cad-conv-drawer-plates', (p) => {
  const S = 0.6; // px per mm
  const X0 = 6;
  const Y0 = 30;
  const mm = (v) => v * S;
  const W = 336;
  const PAD = 29;
  const GRID = 420;
  const cells = [];
  for (let i = 1; i < 8; i++)
    cells.push(line(X0 + mm(42 * i), Y0 + mm(PAD), X0 + mm(42 * i), Y0 + mm(PAD + GRID), { stroke: p.grid }));
  for (let j = 1; j < 10; j++)
    cells.push(line(X0, Y0 + mm(PAD + 42 * j), X0 + mm(W), Y0 + mm(PAD + 42 * j), { stroke: p.grid }));
  const LX = X0 + mm(W) + 16;
  const bottom = Y0 + mm(PAD + GRID);
  return {
    height: bottom + 34,
    body: `
${t(X0, 16, 'back wall of the drawer', { size: 13.5, fill: p.soft })}
${rect(X0, Y0, mm(W), mm(PAD), { fill: p.accentSoft, stroke: p.accent, sw: 1.5, rx: 2 })}
${cells.join('\n')}
${rect(X0, Y0, mm(W), mm(PAD + GRID), { stroke: p.text, sw: 1.5, rx: 2 })}
${line(X0 + mm(168), Y0, X0 + mm(168), bottom, { stroke: p.text, sw: 2 })}
${line(X0, Y0 + mm(239), X0 + mm(W), Y0 + mm(239), { stroke: p.text, sw: 2 })}
${t(LX, Y0 + 13, '29 mm pad', { size: 14, weight: 600, fill: p.accent })}
${t(LX, Y0 + 31, 'solid strip, no sockets', { size: 13.5, fill: p.soft })}
${t(LX, Y0 + mm(120), 'Rear pair', { size: 15, weight: 600 })}
${t(LX, Y0 + mm(120) + 18, '4 x 5 cells + pad', { size: 13.5, fill: p.soft })}
${t(LX, Y0 + mm(120) + 36, '168 x 239 mm', { size: 13.5, font: 'mono' })}
${t(LX, Y0 + mm(330), 'Front pair', { size: 15, weight: 600 })}
${t(LX, Y0 + mm(330) + 18, '4 x 5 cells', { size: 13.5, fill: p.soft })}
${t(LX, Y0 + mm(330) + 36, '168 x 210 mm', { size: 13.5, font: 'mono' })}
${t(X0, bottom + 22, '336 x 449 mm assembled, in a 337 x 450 mm drawer', { size: 14 })}`,
  };
});
