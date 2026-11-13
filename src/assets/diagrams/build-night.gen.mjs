// Run: node src/assets/diagrams/build-night.gen.mjs
// The evening the first pass got built, on a true time axis (7 PM to 11:30 PM).
import { dot, emit, line, scale, t } from './_chart.mjs';

emit(import.meta.url, 'build-night', (p) => {
  const H = 170;
  const min = (h, m) => h * 60 + m;
  const x = scale(min(19, 0), min(23, 30), 26, 406);
  const Y = 86;
  const asked = x(min(19, 24));
  const calls = x(min(22, 15));
  const start = x(min(22, 35));
  const done = x(min(23, 16));
  const hours = [19, 20, 21, 22, 23]
    .map(
      (h) =>
        `${line(x(min(h, 0)), Y - 4, x(min(h, 0)), Y + 4, { stroke: p.line })}
${h === 22 ? '' : t(x(min(h, 0)), Y + 22, `${h - 12} PM`, { size: 12, anchor: 'middle', fill: p.soft, font: 'mono' })}`,
    )
    .join('\n');
  return {
    height: H,
    body: `
${line(x(min(19, 0)), Y, x(min(23, 30)), Y, { stroke: p.line })}
${hours}
${line(start, Y, done, Y, { stroke: p.accent, sw: 7 })}
${dot(asked, Y, 6, { fill: p.page, stroke: p.text, sw: 2.5 })}
${dot(calls, Y, 6, { fill: p.page, stroke: p.text, sw: 2.5 })}
${dot(done, Y, 6.5, { fill: p.accent, stroke: p.page, sw: 2 })}
${t(asked - 8, 22, '7:24', { size: 22, weight: 500, font: 'display' })}
${t(asked - 8, 42, 'I ask for a first pass.', { size: 14 })}
${t(asked - 8, 60, 'About 300 are already in.', { size: 14, fill: p.soft })}
${t(calls + 8, 132, '10:15', { size: 22, weight: 500, font: 'display', anchor: 'end' })}
${t(calls + 8, 152, "I've made my calls", { size: 14, anchor: 'end' })}
${t(406, 22, '11:16', { size: 22, weight: 500, font: 'display', anchor: 'end', fill: p.accent })}
${t(406, 42, 'First 360 scored', { size: 14, anchor: 'end' })}
${t(406, 60, 'in 41 minutes', { size: 14, anchor: 'end', fill: p.soft })}`,
  };
});
