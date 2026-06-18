// Regenerates founder-habits-{light,dark}.svg. Author-time only.
// The four pairs are lifted from the post's "Four habits I had to break"
// section (each item's old reflex -> its replacement). They are NOT the
// separate "Four habits I had to build" list.
// Run: CHROME_PATH="…" node src/assets/diagrams/founder-habits.gen.mjs
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderThemedPair } from './_render.mjs';

const here = dirname(fileURLToPath(import.meta.url));

const graph = (p) => `---
config:
  theme: base
  themeVariables:
    background: "transparent"
    edgeLabelBackground: "${p.page}"
    primaryColor: "${p.node}"
    primaryTextColor: "${p.text}"
    primaryBorderColor: "${p.border}"
    lineColor: "${p.line}"
    secondaryColor: "${p.node}"
    tertiaryColor: "${p.node}"
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "15px"
  flowchart:
    htmlLabels: true
    curve: basis
    nodeSpacing: 40
    rankSpacing: 46
    padding: 10
---
flowchart LR
  B1[fix it yourself] --> R1["name the owner,<br/>let them work"]
  B2["fastest path<br/>to the answer"] --> R2["slower path<br/>through the team"]
  B3["strongest<br/>opinion first"] --> R3["ask first,<br/>opinion last"]
  B4["all-hands<br/>runs tactical"] --> R4["all-hands<br/>runs strategic"]

  %% If the four rows don't stack vertically, uncomment to force order:
  %% R1 ~~~ B2
  %% R2 ~~~ B3
  %% R3 ~~~ B4

  B1:::edge
  B2:::edge
  B3:::edge
  B4:::edge
  R1:::accent
  R2:::accent
  R3:::accent
  R4:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
`;

renderThemedPair({ here, slug: 'founder-habits', graph });
