// Run: node src/assets/diagrams/dotfiles-agents-diagrams.gen.mjs
// Two native-SVG diagrams for the depth levels of "Dotfiles for my AI agents",
// drawn the same way as agent-config.gen.mjs: the order of checks before the
// Codex config sync writes, and the path a credential takes from the template
// to terminal sessions and desktop apps. Meaning is carried by position, fill
// and labels, never by hue alone.
import { writeFileSync } from 'node:fs';
import { dark, light } from './_palette.mjs';

const text = (x, y, value, options = '') => `<text x="${x}" y="${y}" ${options}>${value}</text>`;
const box = (x, y, w, h, options = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ${options}/>`;

function svg(p, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="${height}" viewBox="0 0 400 ${height}">
<g font-family="Inter Variable, system-ui, sans-serif" font-size="18" fill="${p.text}">
${body}
</g>
</svg>\n`;
}

function sync(p) {
  const checks = [
    ['Shared and local settings', 'Refuse a differing value'],
    ['Codex process', 'Refuse if it is running'],
    ['Parsed result', 'Refuse if anything else changed'],
    ['File on disk', 'Refuse if it changed mid-run'],
    ['Codex process, again', 'Refuse if it has started'],
  ];
  const H = 74;
  const GAP = 22;
  const TOP = 44;
  const lastY = TOP + checks.length * (H + GAP);
  return svg(
    p,
    lastY + 112,
    `
${text(200, 25, 'FIVE CHECKS, THEN ONE WRITE', 'text-anchor="middle" font-size="16" letter-spacing="1"')}
${checks
  .map(([name, rule], i) => {
    const y = TOP + i * (H + GAP);
    return `
${box(24, y, 352, H, `fill="${p.node}" stroke="${p.border}"`)}
${text(44, y + 31, `${i + 1}`, `font-size="16" fill="${p.line}"`)}
${text(68, y + 31, name, 'font-weight="600"')}
${text(68, y + 57, rule)}
<path d="M200 ${y + H} V${y + H + GAP - 2} m-5 -7 5 7 5 -7" fill="none" stroke="${p.line}" stroke-width="2"/>`;
  })
  .join('')}
${box(24, lastY, 352, 98, `fill="${p.accent}"`)}
<g fill="${p.onAccent}">
${text(44, lastY + 31, 'WRITE', 'font-size="16" letter-spacing="1"')}
${text(44, lastY + 60, 'Swap in the new file', 'font-size="21" font-weight="600"')}
${text(44, lastY + 85, 'Save its digest in the receipt')}
</g>`,
  );
}

function env(p) {
  const rows = [
    { y: 300, name: 'Terminal sessions', a: 'Shell startup reads the file' },
    { y: 404, name: 'Desktop apps', a: 'A LaunchAgent sets each value' },
  ];
  return svg(
    p,
    640,
    `
${box(24, 8, 352, 84, `fill="${p.node}" stroke="${p.border}"`)}
${text(44, 38, 'IN THE REPO', 'font-size="16" letter-spacing="1"')}
${text(44, 68, 'Template of 1Password references', 'font-weight="600"')}
<path d="M200 92 V136 m-5 -7 5 7 5 -7" fill="none" stroke="${p.accent}" stroke-width="2"/>
${text(214, 120, 'op inject', 'font-size="16"')}
${box(24, 140, 352, 110, `fill="${p.accent}"`)}
<g fill="${p.onAccent}">
${text(44, 170, 'ON THIS MAC ONLY', 'font-size="16" letter-spacing="1"')}
${text(44, 201, 'Local env file', 'font-size="21" font-weight="600"')}
${text(44, 229, 'Plaintext · mode 600 · not in git')}
</g>
<path d="M200 250 V274 H24 V450" fill="none" stroke="${p.accent}" stroke-width="2"/>
${rows
  .map(
    ({ y, name, a }) => `
<path d="M24 ${y + 40} H52 m-6 -4 6 4 -6 4" fill="none" stroke="${p.accent}" stroke-width="2"/>
${box(60, y, 316, 80, `fill="${p.node}" stroke="${p.border}"`)}
${text(80, y + 32, name, 'font-size="21" font-weight="600"')}
${text(80, y + 60, a)}`,
  )
  .join('')}
${box(24, 514, 352, 112, `fill="${p.edgeFill}" stroke="${p.line}" stroke-dasharray="5 5"`)}
<g text-anchor="middle">
${text(200, 544, 'THE CHECK READS BOTH', 'font-size="16" letter-spacing="1"')}
${text(200, 577, 'Its own process environment')}
${text(200, 605, 'The GUI launch environment')}
</g>`,
  );
}

for (const [theme, palette] of [
  ['light', light],
  ['dark', dark],
]) {
  for (const [name, render] of [
    ['dotfiles-agents-sync', sync],
    ['dotfiles-agents-env', env],
  ]) {
    writeFileSync(new URL(`./${name}-${theme}.svg`, import.meta.url), render(palette));
  }
}
