// Run: node src/assets/diagrams/parallel-agents-file-size.gen.mjs
// Resume file sizes on a log scale against the 10 KB line. Spring: two
// fabricated resumes at 8.5 and 8.9 KB (filled) and one real candidate's at
// 5.9 KB (hollow). August: every resume in the wave sat between 65 and 360 KB.
import { dot, emit, line, rect, t } from './_chart.mjs';

emit(import.meta.url, 'parallel-agents-file-size', (p) => {
  const x0 = 8;
  const x1 = 412;
  const lo = Math.log10(5);
  const hi = Math.log10(400);
  const x = (kb) => x0 + ((Math.log10(kb) - lo) / (hi - lo)) * (x1 - x0);
  const spring = 62;
  const august = 160;
  const axis = 204;
  const ticks = [5, 10, 50, 100, 400];
  return {
    height: axis + 30,
    body: `
${t(x0, 20, 'Spring rounds', { size: 14, weight: 600 })}
${t(x0, 122, 'August wave', { size: 14, weight: 600 })}
${line(x(10), 30, x(10), axis, { stroke: p.text, sw: 1.2, dash: '4 4' })}
${t(x(10) + 6, 40, '10 KB line', { size: 13.5, fill: p.soft })}
${dot(x(5.9), spring, 6, { stroke: p.text, sw: 1.8, fill: p.page })}
${dot(x(8.5), spring, 6, { fill: p.accent, stroke: p.page, sw: 1.5 })}
${dot(x(8.9), spring, 6, { fill: p.accent, stroke: p.page, sw: 1.5 })}
${t(x(5.9) - 7, spring + 24, '5.9 real', { size: 13.5, fill: p.soft })}
${t(x(10) + 6, spring + 5, '8.5 and 8.9, fabricated', { size: 13.5, fill: p.accent, weight: 600 })}
${rect(x(65), august - 9, x(360) - x(65), 18, { fill: p.line, rx: 3 })}
${t(x(65), august - 16, 'every resume, 65 to 360 KB', { size: 13.5, fill: p.soft })}
${t(x(65), august + 28, '0 fabricated under the line', { size: 13.5, weight: 600 })}
${line(x0, axis, x1, axis, { stroke: p.faint, sw: 1 })}
${ticks
  .map(
    (k) => `${line(x(k), axis, x(k), axis + 5, { stroke: p.faint, sw: 1 })}
${t(x(k), axis + 22, k === 400 ? '400 KB' : String(k), { size: 13.5, fill: p.soft, anchor: k === 5 ? 'start' : k === 400 ? 'end' : 'middle' })}`,
  )
  .join('\n')}`,
  };
});
