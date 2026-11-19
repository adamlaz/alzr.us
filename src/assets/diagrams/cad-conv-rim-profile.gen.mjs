// Run: node src/assets/diagrams/cad-conv-rim-profile.gen.mjs
// End-wall elevation of the v3 cutlery bin, to scale, plotted from the model's
// own function: dipz(x) = dip_d / 2 * (1 + cos(180 * x / dip_hw)) for
// |x| < dip_hw, else 0, with dip_w = 56, dip_d = 13, an 83.5 mm wide end wall
// and the rim crest at 42 mm. The interior floor sits at 7 mm. The rim line is
// the subject and carries the accent.
import { emit, line, path, t } from './_chart.mjs';

emit(import.meta.url, 'cad-conv-rim-profile', (p) => {
  const S = 4; // px per mm
  const X0 = 43;
  const TOP = 44;
  const OX = 83.5;
  const H = 42;
  const HW = 28;
  const D = 13;
  const px = (x) => X0 + (x + OX / 2) * S;
  const py = (z) => TOP + (H - z) * S;
  const dipz = (x) => (Math.abs(x) < HW ? (D / 2) * (1 + Math.cos((Math.PI * x) / HW)) : 0);
  const rim = [];
  for (let x = -OX / 2; x <= OX / 2 + 1e-9; x += 0.25) rim.push([px(x), py(H - dipz(x))]);
  const base = py(0);
  return {
    height: base + 30,
    body: `
${line(px(-OX / 2), py(H), px(-OX / 2), base, { stroke: p.line, sw: 1.5 })}
${line(px(OX / 2), py(H), px(OX / 2), base, { stroke: p.line, sw: 1.5 })}
${line(px(-OX / 2), base, px(OX / 2), base, { stroke: p.line, sw: 1.5 })}
${line(px(-OX / 2), py(7), px(OX / 2), py(7), { stroke: p.line, dash: '4 4' })}
${t(px(0), py(7) - 8, 'interior floor, 7 mm', { size: 13.5, anchor: 'middle', fill: p.soft })}
${path(rim, { stroke: p.accent, sw: 3.5 })}
${line(px(-HW), TOP - 14, px(HW), TOP - 14, { stroke: p.text })}
${line(px(-HW), TOP - 19, px(-HW), TOP - 9, { stroke: p.text })}
${line(px(HW), TOP - 19, px(HW), TOP - 9, { stroke: p.text })}
${t(px(0), TOP - 22, 'dip 56 mm wide', { size: 14, weight: 600, anchor: 'middle' })}
${line(px(0), py(H), px(0), py(H - D), { stroke: p.text, dash: '2 4' })}
${t(px(0), py(H - D) + 22, '13 mm deep', { size: 14, weight: 600, anchor: 'middle' })}
${t(px(-OX / 2) + 6, py(H) + 20, 'crest 42 mm', { size: 13.5, fill: p.soft })}
${t(px(0), base + 22, 'end wall, 83.5 mm', { size: 13.5, anchor: 'middle', fill: p.soft })}`,
  };
});
