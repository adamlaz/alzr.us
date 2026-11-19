// Run: node src/assets/diagrams/tasks-ai-token-sources.gen.mjs
// Where the dark variant's 19 Chrome color keys get their values, one square
// each: 13 from the app's synced tokens, 2 from the Figma accent file, 4 from
// constants typed by hand in the mapping file. Filled accent = app token,
// filled neutral = Figma accent, hollow = hand-typed.
import { emit, rect, t } from './_chart.mjs';

emit(import.meta.url, 'tasks-ai-token-sources', (p) => {
  const s = 17;
  const pitch = 21.2;
  const top = 44;
  const groups = [
    { n: 13, label: 'from the app’s tokens' },
    { n: 2, label: '' },
    { n: 4, label: '' },
  ];
  let i = 0;
  const squares = [];
  const starts = [];
  for (const [g, { n }] of groups.entries()) {
    starts.push(i * pitch);
    for (let k = 0; k < n; k++, i++) {
      const x = i * pitch;
      if (g === 0) squares.push(rect(x, top, s, s, { fill: p.accent, rx: 2 }));
      else if (g === 1) squares.push(rect(x, top, s, s, { fill: p.line, rx: 2 }));
      else squares.push(rect(x + 1, top + 1, s - 2, s - 2, { stroke: p.text, sw: 1.8, rx: 2 }));
    }
  }
  const L = top + s + 30;
  const row = (y, swatch, head, detail) => `${swatch(y)}
${t(20, y + 11, head, { size: 14, weight: 600 })}
${t(20, y + 29, detail, { size: 13.5, fill: p.soft })}`;
  return {
    height: L + 3 * 50 - 8,
    body: `
${t(starts[0], 30, '13', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(starts[1], 30, '2', { size: 30, weight: 500, font: 'display' })}
${t(starts[2], 30, '4', { size: 30, weight: 500, font: 'display' })}
${squares.join('\n')}
${row(
  L,
  (y) => rect(0, y, 12, 12, { fill: p.accent, rx: 2 }),
  '13 from the app’s synced tokens',
  'frame, toolbar, omnibox, new tab page, text and icons',
)}
${row(
  L + 50,
  (y) => rect(0, y, 12, 12, { fill: p.line, rx: 2 }),
  '2 from the Figma accent file',
  'new-tab links, button background',
)}
${row(
  L + 100,
  (y) => rect(1, y + 1, 10, 10, { stroke: p.text, sw: 1.8, rx: 2 }),
  '4 typed by hand',
  'inactive frame, two incognito frames, inactive-tab text',
)}`,
  };
});
