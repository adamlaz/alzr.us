// Run: node src/assets/diagrams/calibration.gen.mjs
// The seven times the model, alone, decided an earlier applicant didn't add
// up: right about four applicants our research had flagged as fake, wrong about three real people. Filled vs hollow.
import { dot, emit, t } from './_chart.mjs';

emit(import.meta.url, 'calibration', (p) => {
  const r = 20;
  const pitch = 52;
  const y = 30;
  const right = [0, 1, 2, 3].map((i) => dot(24 + i * pitch, y, r, { fill: p.accent })).join('\n');
  const wrongX = (i) => 24 + 4 * pitch + 22 + i * pitch;
  const wrong = [0, 1, 2].map((i) => dot(wrongX(i), y, r - 1.5, { stroke: p.text, sw: 3 })).join('\n');
  return {
    height: 122,
    body: `
${right}
${wrong}
${t(4, 84, '4', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(26, 76, 'flagged as fake', { size: 15, weight: 600 })}
${t(26, 94, 'by our earlier research', { size: 13, fill: p.soft })}
${t(wrongX(0) - r, 84, '3', { size: 30, weight: 500, font: 'display' })}
${t(wrongX(0) + 2, 76, 'real people', { size: 15, weight: 600 })}
${t(wrongX(0) + 2, 94, 'the hunch was wrong', { size: 13, fill: p.soft })}
${t(4, 118, 'from a test on 91 earlier applicants', { size: 12, fill: p.soft, font: 'mono' })}`,
  };
});
