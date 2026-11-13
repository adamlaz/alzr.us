// Run: node src/assets/diagrams/triage-lanes.gen.mjs
// Native SVG, like agent-config.gen.mjs: two stacked lanes on the 400px canvas
// so the labels stay readable at phone width. Cobalt marks the person's lane
// and the divider; the machine lane stays neutral. Structural only: the counts
// are the post's, never an applicant's details.
import { writeFileSync } from 'node:fs';
import { dark, light } from './_palette.mjs';

const W = 400;
const X = 24; // inner margin
const IW = W - 2 * X; // inner width
const MID = W / 2;
const COL = { w: 112, gap: 8 }; // three-up rows: model reads, tiers
const colX = (i) => X + i * (COL.w + COL.gap);
const colMid = (i) => colX(i) + COL.w / 2;

const text = (x, y, value, options = '') => `<text x="${x}" y="${y}" ${options}>${value}</text>`;
const box = (x, y, w, h, options = '', rx = 8) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${options}/>`;
const head = (x, y, color) =>
  `<path d="M${x - 5} ${y - 6} L${x} ${y} L${x + 5} ${y - 6}" fill="none" stroke="${color}" stroke-width="2"/>`;
const down = (x, y1, y2, color) =>
  `<path d="M${x} ${y1} V${y2}" fill="none" stroke="${color}" stroke-width="2"/>${head(x, y2, color)}`;

function machines(p, top) {
  const node = `fill="${p.node}" stroke="${p.border}"`;
  const t = (dy) => top + dy;
  const height = 538;
  const one = (y, label) =>
    `${box(X, y, IW, 42, node)}\n${text(MID, y + 27, label, 'text-anchor="middle" font-weight="600"')}`;
  const reads = [0, 1, 2]
    .map(
      (i) => `${box(colX(i), t(180), COL.w, 40, node)}
${text(colMid(i), t(205), 'Model read', 'text-anchor="middle" font-size="16" font-weight="600"')}`,
    )
    .join('\n');
  // The tiers count every scored row, duplicates included, so they sum to 812.
  const tiers = [
    ['Research', '124'],
    ['Maybe', '660'],
    ['Likely pass', '28'],
  ]
    .map(
      ([label, n], i) => `${box(colX(i), t(408), COL.w, 64, node)}
${text(colMid(i), t(433), label, 'text-anchor="middle" font-size="16"')}
${text(colMid(i), t(461), n, 'text-anchor="middle" font-size="24" font-weight="600"')}`,
    )
    .join('\n');
  return {
    height,
    body: `
${box(0, top, W, height, `fill="${p.edgeFill}" stroke="${p.border}"`, 10)}
${text(MID, t(30), 'MACHINES CHECK', 'text-anchor="middle" font-size="16" letter-spacing="1"')}
${one(t(46), '816 applications in 32 hours')}
${down(MID, t(88), t(104), p.line)}
${box(X, t(104), IW, 60, node)}
${text(MID, t(130), 'Scripted checks', 'text-anchor="middle" font-weight="600"')}
${text(MID, t(152), 'the links and public work they gave', 'text-anchor="middle" font-size="16"')}
${down(MID, t(164), t(180), p.line)}
${reads}
<path d="M${colMid(0)} ${t(220)} V${t(230)} H${colMid(2)} V${t(220)}" fill="none" stroke="${p.line}" stroke-width="2"/>
${down(MID, t(230), t(246), p.line)}
${one(t(246), 'Majority vote · one rubric')}
${down(MID, t(288), t(304), p.line)}
${one(t(304), 'A note plus flags')}
<path d="M${MID} ${t(346)} V${t(358)}" fill="none" stroke="${p.line}" stroke-width="2"/>
${text(MID, t(376), '812 sorted so far', 'text-anchor="middle" font-size="16" font-weight="600"')}
<path d="M${MID} ${t(384)} V${t(408)} M${colMid(0)} ${t(408)} V${t(394)} H${colMid(2)} V${t(408)}" fill="none" stroke="${p.line}" stroke-width="2"/>
${[0, 1, 2].map((i) => head(colMid(i), t(408), p.line)).join('\n')}
${tiers}
<path d="M${colMid(2)} ${t(473)} V${t(487)}" fill="none" stroke="${p.line}" stroke-width="2" stroke-dasharray="2 3"/>
${text(X + IW, t(504), 'Likely pass needs evidence,', 'text-anchor="end" font-size="16"')}
${text(X + IW, t(524), 'never suspicion alone', 'text-anchor="end" font-size="16"')}`,
  };
}

function divider(p, top) {
  return {
    height: 70,
    body: `
${box(0, top, W, 70, `fill="${p.accent}"`, 10)}
<g fill="${p.onAccent}" text-anchor="middle" font-size="20" font-weight="600">
${text(MID, top + 30, 'Only a person moves')}
${text(MID, top + 56, 'anyone forward or out')}
</g>`,
  };
}

function person(p, top) {
  const steps = [
    'My read of the queue',
    '30-minute screen',
    'One-week work sample',
    'Deep dive with a teammate',
    'Final round',
  ];
  const pill = { x: 44, w: W - 88, h: 38, pitch: 58, first: top + 46 };
  const body = steps
    .map((label, i) => {
      const y = pill.first + i * pill.pitch;
      const link = i < steps.length - 1 ? down(MID, y + pill.h, y + pill.pitch, p.accent) : '';
      return `${box(pill.x, y, pill.w, pill.h, `fill="${p.node}" stroke="${p.accent}" stroke-width="2"`, pill.h / 2)}
${text(MID, y + 25, label, 'text-anchor="middle" font-weight="600"')}
${link}`;
    })
    .join('\n');
  const height = pill.first - top + (steps.length - 1) * pill.pitch + pill.h + 18;
  return {
    height,
    body: `
${box(0, top, W, height, `fill="${p.edgeFill}" stroke="${p.border}"`, 10)}
${text(MID, top + 30, 'A PERSON DECIDES', `text-anchor="middle" font-size="16" letter-spacing="1" fill="${p.accent}"`)}
${body}`,
  };
}

function lanes(p) {
  const gap = 12;
  const a = machines(p, 0);
  const b = divider(p, a.height + gap);
  const c = person(p, a.height + gap + b.height + gap);
  const height = a.height + gap + b.height + gap + c.height;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
<g font-family="Inter Variable, system-ui, sans-serif" font-size="18" fill="${p.text}">
${a.body}
${b.body}
${c.body}
</g>
</svg>\n`;
}

for (const [theme, palette] of [
  ['light', light],
  ['dark', dark],
]) {
  writeFileSync(new URL(`./triage-lanes-${theme}.svg`, import.meta.url), lanes(palette));
}
