// Regenerates review-lanes-{light,dark}.svg. Author-time only.
// Native SVG showing how pull requests split via the station-impact checklist
// into the fast lane (self-merges on green CI) vs the contract lane (code owner requested, never required).
// Run: node src/assets/diagrams/review-lanes.gen.mjs
import { writeFileSync } from 'node:fs';
import { dark, light } from './_palette.mjs';

function render(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="340" viewBox="0 0 680 340">
  <g font-family="Inter Variable, system-ui, sans-serif" fill="${p.text}">
    <!-- Top banner node -->
    <rect x="20" y="16" width="640" height="64" rx="8" fill="${p.edgeFill}" stroke="${p.border}" stroke-width="1.5" />
    <text x="340" y="38" font-size="12" font-weight="700" letter-spacing="0.06em" text-anchor="middle" fill="${p.line}">PULL REQUEST OPENED</text>
    <text x="340" y="61" font-size="15" font-weight="600" text-anchor="middle" fill="${p.text}">"Station impact" checklist declares what the change touches</text>

    <!-- Split connectors from top banner to the two lane cards -->
    <path d="M 340 80 L 340 94 L 174 94 L 174 106" fill="none" stroke="${p.accent}" stroke-width="2" />
    <polygon points="174,110 169,102 179,102" fill="${p.accent}" />

    <path d="M 340 80 L 340 94 L 506 94 L 506 106" fill="none" stroke="${p.fail}" stroke-width="2" />
    <polygon points="506,110 501,102 511,102" fill="${p.fail}" />

    <!-- Left Card: Fast Lane (UI & Flows) -->
    <rect x="20" y="110" width="308" height="210" rx="8" fill="${p.node}" stroke="${p.accent}" stroke-width="2" />
    <text x="40" y="136" font-size="12" font-weight="700" letter-spacing="0.05em" fill="${p.accent}">FAST LANE · UI &amp; FLOWS</text>
    <text x="40" y="162" font-size="18" font-weight="600" fill="${p.text}">Self-merges on green CI</text>
    <line x1="40" y1="176" x2="308" y2="176" stroke="${p.border}" stroke-width="1" />

    <circle cx="46" cy="197" r="3.5" fill="${p.accent}" />
    <text x="58" y="202" font-size="14" fill="${p.text}">Screens, station kit &amp; copy</text>

    <circle cx="46" cy="223" r="3.5" fill="${p.accent}" />
    <text x="58" y="228" font-size="14" fill="${p.text}">Keyboard shortcuts &amp; pause guide</text>

    <circle cx="46" cy="249" r="3.5" fill="${p.accent}" />
    <text x="58" y="254" font-size="14" fill="${p.text}">Interactive training &amp; QA review UI</text>

    <rect x="36" y="272" width="276" height="32" rx="6" fill="${p.edgeFill}" stroke="${p.border}" stroke-width="1" />
    <text x="174" y="293" font-size="12.5" font-weight="600" text-anchor="middle" fill="${p.text}">No approval required · ~5 min median</text>

    <!-- Right Card: Contract Lane (Seams & Gates) -->
    <rect x="352" y="110" width="308" height="210" rx="8" fill="${p.node}" stroke="${p.fail}" stroke-width="2" />
    <rect x="356" y="114" width="300" height="202" rx="5" fill="none" stroke="${p.fail}" stroke-width="1" stroke-dasharray="4 3" />
    <text x="372" y="136" font-size="12" font-weight="700" letter-spacing="0.05em" fill="${p.failText}">CONTRACT LANE · SEAMS &amp; GATES</text>
    <text x="372" y="162" font-size="18" font-weight="600" fill="${p.text}">Code owner requested</text>
    <line x1="372" y1="176" x2="640" y2="176" stroke="${p.border}" stroke-width="1" />

    <rect x="374.5" y="193.5" width="7" height="7" rx="1.5" fill="${p.fail}" />
    <text x="390" y="202" font-size="14" fill="${p.text}">Order, media, inspection &amp; Slack seams</text>

    <rect x="374.5" y="219.5" width="7" height="7" rx="1.5" fill="${p.fail}" />
    <text x="390" y="228" font-size="14" fill="${p.text}">Local mock parity with production rules</text>

    <rect x="374.5" y="245.5" width="7" height="7" rx="1.5" fill="${p.fail}" />
    <text x="390" y="254" font-size="14" fill="${p.text}">CI workflow &amp; PR template</text>

    <rect x="368" y="272" width="276" height="32" rx="6" fill="${p.failFill}" stroke="${p.fail}" stroke-width="1" />
    <text x="506" y="293" font-size="12.5" font-weight="600" text-anchor="middle" fill="${p.failText}">Not required · reviewed by commit</text>
  </g>
</svg>\n`;
}

for (const [theme, palette] of [
  ['light', light],
  ['dark', dark],
]) {
  writeFileSync(new URL(`./review-lanes-${theme}.svg`, import.meta.url), render(palette));
}
