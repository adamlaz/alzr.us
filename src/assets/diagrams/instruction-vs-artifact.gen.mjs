// Regenerates instruction-vs-artifact-{light,dark}.svg. Author-time only.
// Run: CHROME_PATH="…" node src/assets/diagrams/instruction-vs-artifact.gen.mjs
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
  I1["instruction<br/>rules you tell"] --> I2[model is told] --> I3[rarely transfers]
  A1["artifact<br/>folder of your writing"] --> A2[model reads examples] --> A3[transfers reliably]

  %% If the two rows render side-by-side instead of stacked, uncomment:
  %% I3 ~~~ A1

  I1:::edge
  A1:::edge
  I3:::fail
  A3:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

renderThemedPair({ here, slug: 'instruction-vs-artifact', graph });
