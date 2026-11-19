// Run: node src/assets/diagrams/one-frame-blue-threshold.gen.mjs
// signalstats ULOW (10th-percentile Cb, tv-range decode) for the frames the
// blue cutoff was calibrated on. Hollow = kept, filled = dropped at the
// production cutoff of 160. The dashed line is the first cutoff, 180.
import { dot, emit, line, t } from './_chart.mjs';

emit(import.meta.url, 'one-frame-blue-threshold', (p) => {
  const x0 = 214;
  const x1 = 410;
  const x = (v) => x0 + (v / 255) * (x1 - x0);
  const CUT = 160;
  // [label, low, high, value text]
  const rows = [
    ['real content', 36, 114, '36–114'],
    ['gray or black', 128, 128, '128'],
    ['sky blue', 151, 151, '151'],
    ['steel blue', 159, 159, '159'],
    ['purple', 165, 165, '165'],
    ['cyan', 166, 166, '166'],
    ['VCR channel screen', 166, 167, '166–167'],
    ['navy', 184, 184, '184'],
    ['magenta', 202, 202, '202'],
    ['tape leader', 217, 218, '217–218'],
    ['pure blue', 240, 240, '240'],
  ];
  const top = 34;
  const pitch = 25;
  const bottom = top + rows.length * pitch;
  const marks = rows
    .map(([label, lo, hi, text], i) => {
      const y = top + i * pitch + 12;
      const dropped = lo >= CUT;
      const end = (v) =>
        dropped ? dot(x(v), y, 4.5, { fill: p.accent }) : dot(x(v), y, 4, { fill: p.page, stroke: p.text, sw: 1.8 });
      const span = hi - lo > 5 ? line(x(lo), y, x(hi), y, { stroke: dropped ? p.accent : p.text, sw: 1.8 }) : '';
      return `
${t(0, y + 5, label, { size: 14, weight: dropped ? 600 : 400 })}
${t(x0 - 12, y + 5, text, { size: 13.5, font: 'mono', anchor: 'end', fill: dropped ? p.accent : p.soft })}
${span}
${end(lo)}${hi - lo > 5 ? end(hi) : ''}`;
    })
    .join('');
  return {
    height: bottom + 44,
    body: `
${t(x(CUT), 14, '160', { size: 15, weight: 600, anchor: 'middle', fill: p.accent })}
${t(x(180) + 8, 14, '180 at first', { size: 13.5, fill: p.soft })}
${line(x0, top, x0, bottom, { stroke: p.grid })}
${line(x(180), 22, x(180), bottom, { stroke: p.soft, sw: 1.2, dash: '3 4' })}
${line(x(CUT), 22, x(CUT), bottom, { stroke: p.accent, sw: 1.8 })}
${marks}
${line(0, bottom + 6, 418, bottom + 6, { stroke: p.grid })}
${dot(6, bottom + 26, 4, { fill: p.page, stroke: p.text, sw: 1.8 })}
${t(18, bottom + 31, 'kept', { size: 13.5, fill: p.soft })}
${dot(70, bottom + 26, 4.5, { fill: p.accent })}
${t(82, bottom + 31, 'dropped at 160 or above', { size: 13.5, fill: p.soft })}`,
  };
});
