// Regenerates guardrail-stack-{light,dark}.svg. Author-time only.
// Four-row architectural guardrail stack in native SVG (680x340).
// Run: node src/assets/diagrams/guardrail-stack.gen.mjs
import { writeFileSync } from 'node:fs';
import { dark, light } from './_palette.mjs';

const layers = [
  {
    num: '1. ONE-PAGE',
    title: 'AGENT BRIEF',
    line1: 'Six hard rules · zero open choices',
    line2: 'Self-checkable acceptance criteria',
    tag: 'SPEC',
    tone: 'neutral',
  },
  {
    num: '2. MOCK-BACKED',
    title: 'ADAPTERS',
    line1: 'Order, media, inspection &amp; chat seams',
    line2: 'Mock refuses what prod refuses',
    tag: 'SEAMS',
    tone: 'contract',
  },
  {
    num: '3. CODE-OWNERS +',
    title: 'PR CHECKLIST',
    line1: 'UI &amp; copy self-merge on green CI',
    line2: 'Adapter &amp; CI changes require co-owner',
    tag: 'ROUTING',
    tone: 'contract',
  },
  {
    num: '4. BROWSER',
    title: 'BENCHMARK SUITE',
    line1: 'Locked word caps · &gt;=60% video · &gt;=20px type',
    line2: 'Keycaps · training &amp; pause guide',
    tag: 'CI GATE',
    tone: 'accent',
  },
];

function render(p) {
  const cardX = 20;
  const cardW = 640;
  const cardH = 66;
  const badgeW = 190;
  const gap = 14;
  const startY = 18;

  const rows = layers
    .map((layer, i) => {
      const y = startY + i * (cardH + gap);
      const isAccent = layer.tone === 'accent';
      const isContract = layer.tone === 'contract';

      const borderStroke = isAccent ? p.accent : isContract ? p.fail : p.border;
      const borderWidth = isAccent || isContract ? 2 : 1.5;
      const badgeFill = isAccent ? p.accent : isContract ? p.failFill : p.edgeFill;
      const badgeNumColor = isAccent ? p.onAccent : isContract ? p.failText : p.line;
      const badgeTitleColor = isAccent ? p.onAccent : isContract ? p.failText : p.text;
      const tagFill = isAccent ? p.edgeFill : isContract ? p.failFill : p.edgeFill;
      const tagStroke = isAccent ? p.accent : isContract ? p.fail : p.border;
      const tagText = isAccent ? p.accent : isContract ? p.failText : p.line;

      const connector =
        i < layers.length - 1
          ? `
            <line x1="115" y1="${y + cardH}" x2="115" y2="${y + cardH + gap}" stroke="${p.line}" stroke-width="1.5" stroke-dasharray="3 2" />
            <polygon points="115,${y + cardH + gap} 111,${y + cardH + gap - 6} 119,${y + cardH + gap - 6}" fill="${p.line}" />
          `
          : '';

      return `
        <!-- Layer ${i + 1} -->
        <rect x="${cardX}" y="${y}" width="${cardW}" height="${cardH}" rx="8" fill="${p.node}" stroke="${borderStroke}" stroke-width="${borderWidth}" />
        <path d="M ${cardX + 8} ${y} H ${cardX + badgeW} V ${y + cardH} H ${cardX + 8} A 8 8 0 0 1 ${cardX} ${y + cardH - 8} V ${y + 8} A 8 8 0 0 1 ${cardX + 8} ${y} Z" fill="${badgeFill}" />
        <line x1="${cardX + badgeW}" y1="${y}" x2="${cardX + badgeW}" y2="${y + cardH}" stroke="${borderStroke}" stroke-width="1.5" />

        <text x="${cardX + 18}" y="${y + 27}" font-size="12" font-weight="700" letter-spacing="0.05em" fill="${badgeNumColor}">${layer.num}</text>
        <text x="${cardX + 18}" y="${y + 47}" font-size="13.5" font-weight="700" letter-spacing="0.03em" fill="${badgeTitleColor}">${layer.title}</text>

        <text x="${cardX + badgeW + 20}" y="${y + 28}" font-size="14.5" font-weight="600" fill="${p.text}">${layer.line1}</text>
        <text x="${cardX + badgeW + 20}" y="${y + 49}" font-size="13.5" fill="${p.line}">${layer.line2}</text>

        <rect x="${cardX + cardW - 92}" y="${y + 20}" width="74" height="26" rx="5" fill="${tagFill}" stroke="${tagStroke}" stroke-width="1" />
        <text x="${cardX + cardW - 55}" y="${y + 37}" font-size="12" font-weight="700" letter-spacing="0.04em" text-anchor="middle" fill="${tagText}">${layer.tag}</text>
        ${connector}
      `;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="340" viewBox="0 0 680 340">
  <g font-family="Inter Variable, system-ui, sans-serif" fill="${p.text}">
    ${rows}
  </g>
</svg>\n`;
}

for (const [theme, palette] of [
  ['light', light],
  ['dark', dark],
]) {
  writeFileSync(new URL(`./guardrail-stack-${theme}.svg`, import.meta.url), render(palette));
}
