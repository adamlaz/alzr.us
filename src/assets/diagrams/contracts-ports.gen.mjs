// Regenerates contracts-ports-{light,dark}.svg. Author-time only.
// The inspection station's five ports, each with the mock that runs with no
// network and the real adapter behind it. Mock and real are told apart by
// column and by border weight, never by hue alone.
// Run: node src/assets/diagrams/contracts-ports.gen.mjs
import { writeFileSync } from 'node:fs';
import { dark, light } from './_palette.mjs';

const ports = [
  {
    name: 'Order lookup',
    asks: 'Which tapes are in this box?',
    mock: ['Three sample orders, plus', 'orders generated per test'],
    real: ['Order service', 'one GET per scan'],
  },
  {
    name: 'Media locator',
    asks: 'Where is each file?',
    mock: ['Bundled test clips, capture', 'versions in a JSON file'],
    real: ['Media service', 'locate per order, refresh per file'],
  },
  {
    name: 'Inspection sink',
    asks: 'Save this result.',
    mock: ['Append-only file; refuses', 'what production refuses'],
    real: ['Inspection API', 'POST, deduplicated by event ID'],
  },
  {
    name: 'Inspection reader',
    asks: 'What has any station saved?',
    mock: ['Reads the same file back', ''],
    real: ['Inspection API', 'GET, read back by order'],
  },
  {
    name: 'Notify sink',
    asks: 'Post the order summary.',
    mock: ['Appends to a log file', ''],
    real: ['Slack', 'one message per finished round'],
  },
];

function render(p) {
  const W = 680;
  const top = 44;
  const rowH = 62;
  const gap = 10;
  const colPort = 20;
  const colMock = 200;
  const colReal = 422;
  const mockW = 208;
  const realW = 238;
  const H = top + ports.length * (rowH + gap) + 6;

  const head = `
    <text x="${colPort}" y="26" font-size="12" font-weight="700" letter-spacing="0.05em" fill="${p.line}">PORT</text>
    <text x="${colMock}" y="26" font-size="12" font-weight="700" letter-spacing="0.05em" fill="${p.line}">MOCK MODE (DEFAULT)</text>
    <text x="${colReal}" y="26" font-size="12" font-weight="700" letter-spacing="0.05em" fill="${p.accent}">REAL MODE</text>`;

  const rows = ports
    .map((port, i) => {
      const y = top + i * (rowH + gap);
      const mid = y + rowH / 2;
      const two = (lines, x, fill2) =>
        lines[1]
          ? `<text x="${x}" y="${y + 27}" font-size="13.5" font-weight="600" fill="${p.text}">${lines[0]}</text>
    <text x="${x}" y="${y + 46}" font-size="12.5" fill="${fill2}">${lines[1]}</text>`
          : `<text x="${x}" y="${mid + 5}" font-size="13.5" font-weight="600" fill="${p.text}">${lines[0]}</text>`;
      const mockLines = port.mock[1]
        ? `<text x="${colMock + 14}" y="${y + 27}" font-size="13" fill="${p.text}">${port.mock[0]}</text>
    <text x="${colMock + 14}" y="${y + 46}" font-size="13" fill="${p.text}">${port.mock[1]}</text>`
        : `<text x="${colMock + 14}" y="${mid + 5}" font-size="13" fill="${p.text}">${port.mock[0]}</text>`;
      return `
    <!-- ${port.name} -->
    <text x="${colPort}" y="${y + 27}" font-size="14.5" font-weight="700" fill="${p.text}">${port.name}</text>
    <text x="${colPort}" y="${y + 46}" font-size="12.5" fill="${p.line}">${port.asks}</text>
    <rect x="${colMock}" y="${y}" width="${mockW}" height="${rowH}" rx="8" fill="${p.edgeFill}" stroke="${p.border}" stroke-width="1.5" stroke-dasharray="5 3" />
    ${mockLines}
    <rect x="${colReal}" y="${y}" width="${realW}" height="${rowH}" rx="8" fill="${p.node}" stroke="${p.accent}" stroke-width="2" />
    ${two(port.real, colReal + 14, p.line)}`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <g font-family="Inter Variable, system-ui, sans-serif" fill="${p.text}">
    ${head}
    ${rows}
  </g>
</svg>\n`;
}

for (const [theme, palette] of [
  ['light', light],
  ['dark', dark],
]) {
  writeFileSync(new URL(`./contracts-ports-${theme}.svg`, import.meta.url), render(palette));
}
