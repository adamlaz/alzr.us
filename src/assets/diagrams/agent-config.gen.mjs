// Run: node src/assets/diagrams/agent-config.gen.mjs
// Native SVG keeps these diagrams readable without a browser render step.
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

function ownership(p) {
  const rows = [
    { y: 158, name: 'Claude Code', a: 'Settings and skills: links', b: '' },
    { y: 272, name: 'Codex', a: 'Settings: selective sync', b: 'Skills: native discovery' },
    { y: 386, name: 'opencode', a: 'Settings: links', b: 'Skills: native discovery' },
  ];
  return svg(
    p,
    672,
    `
${box(24, 8, 352, 106, `fill="${p.accent}"`)}
<g fill="${p.onAccent}" text-anchor="middle">
${text(200, 39, 'SHARED REPO', 'font-size="16" letter-spacing="1"')}
${text(200, 70, '~/.agents', 'font-size="26" font-weight="600"')}
${text(200, 97, 'Instructions · skills · config')}
</g>
<path d="M200 114 V134 H24 V432" fill="none" stroke="${p.accent}" stroke-width="2"/>
${rows
  .map(
    ({ y, name, a, b }) => `
<path d="M24 ${y + 46} H52 m-6 -4 6 4 -6 4" fill="none" stroke="${p.accent}" stroke-width="2"/>
${box(60, y, 316, 98, `fill="${p.node}" stroke="${p.border}"`)}
${text(80, y + 29, name, 'font-size="22" font-weight="600"')}
${text(80, y + 57, a)}
${b ? text(80, y + 83, b) : ''}`,
  )
  .join('')}
${box(24, 528, 352, 130, `fill="${p.edgeFill}" stroke="${p.line}" stroke-dasharray="5 5"`)}
<g text-anchor="middle">
${text(200, 558, 'STAYS ON THIS MAC', 'font-size="16" letter-spacing="1"')}
${text(200, 594, 'Sessions · credentials')}
${text(200, 623, 'Databases · local approvals')}
${text(200, 647, 'Outside shared-config sync', 'font-size="16"')}
</g>`,
  );
}

function rollback(p) {
  return svg(
    p,
    548,
    `
${text(200, 25, 'WITH CODEX CLOSED', 'text-anchor="middle" font-size="16" letter-spacing="1"')}
${box(24, 48, 352, 78, `fill="${p.node}" stroke="${p.border}"`)}
${text(200, 80, 'Compare the current file', 'text-anchor="middle" font-weight="600"')}
${text(200, 107, 'with its installed digest', 'text-anchor="middle"')}
<path d="M200 126 V158 H24 V412" fill="none" stroke="${p.line}" stroke-width="2"/>
<path d="M24 214 H52 m-6 -4 6 4 -6 4" fill="none" stroke="${p.accent}" stroke-width="2"/>
${box(60, 174, 316, 116, `fill="${p.accent}"`)}
<g fill="${p.onAccent}">
${text(80, 205, 'MATCH', 'font-size="16" letter-spacing="1"')}
${text(80, 239, 'Restore the backup', 'font-size="21" font-weight="600"')}
${text(80, 268, 'No later edits to overwrite')}
</g>
<path d="M24 412 H52 m-6 -4 6 4 -6 4" fill="none" stroke="${p.line}" stroke-width="2"/>
${box(60, 334, 316, 186, `fill="${p.edgeFill}" stroke="${p.border}"`)}
${text(80, 365, 'CHANGED OR UNKNOWN', 'font-size="16" letter-spacing="0.6"')}
${text(80, 400, 'Keep the current file', 'font-size="21" font-weight="600"')}
${text(80, 432, 'Report the conflict.')}
${text(80, 463, 'A missing digest also')}
${text(80, 489, 'stops the restore.')}`,
  );
}

for (const [theme, palette] of [
  ['light', light],
  ['dark', dark],
]) {
  for (const [name, render] of [
    ['agent-config', ownership],
    ['safe-rollback', rollback],
  ]) {
    writeFileSync(new URL(`./${name}-${theme}.svg`, import.meta.url), render(palette));
  }
}
