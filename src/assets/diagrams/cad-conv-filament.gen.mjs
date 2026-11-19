// Run: node src/assets/diagrams/cad-conv-filament.gen.mjs
// Solid-mesh mass of every piece in the silverware-drawer kit, computed off
// the STLs and recorded in the project notes (grams, per-piece mass x count).
// "Solid" is the mesh volume at 100% infill; the notes budget 1.2 to 1.4 kg
// once the slicer applies sparse infill. The bins are the subject, so they
// carry the accent; plates and rails are neutral.
import { emit, rect, scale, t } from './_chart.mjs';

const rows = [
  ['Bins, 2x5', '4 at 184 g', 736, true],
  ['Bins, 2x6', '2 at 219 g', 438, true],
  ['Bins, 2x4', '2 at 150 g', 300, true],
  ['Rear plates with pad', '2 at 66 g', 132, false],
  ['Rails and the test bin', '3 pieces', 101, false],
  ['Front plates', '2 at 36 g', 72, false],
];

emit(import.meta.url, 'cad-conv-filament', (p) => {
  const x = scale(0, 760, 0, 330);
  const rowH = 58;
  const body = rows
    .map(([label, count, g, bin], i) => {
      const y = 4 + i * rowH;
      return `${t(0, y + 14, label, { size: 15, weight: 600 })}
${t(410, y + 14, count, { size: 13.5, fill: p.soft, font: 'mono', anchor: 'end' })}
${rect(0, y + 22, x(g), 14, { fill: bin ? p.accent : p.line })}
${t(x(g) + 8, y + 35, `${g} g`, { size: 14, weight: 600, font: 'mono' })}`;
    })
    .join('\n');
  const end = 4 + rows.length * rowH - 6;
  return {
    height: end + 44,
    body: `${body}
${t(0, end + 28, '~1.8 kg', { size: 30, weight: 500, font: 'display', fill: p.accent })}
${t(130, end + 14, 'solid, all 15 pieces', { size: 14 })}
${t(130, end + 32, 'budgeted at 1.2 to 1.4 kg after infill', { size: 14, fill: p.soft })}`,
  };
});
