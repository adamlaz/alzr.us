// Regenerates discovery-tiering-{light,dark}.svg. Author-time only.
// Run: CHROME_PATH="…" node src/assets/diagrams/discovery-tiering.gen.mjs
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
flowchart TB
  U([username]) --> MAIGRET["Maigret · 3,000+ sites<br/>parses each profile"]
  U -.-> SHERLOCK["Sherlock · ~400<br/>cheap cross-check"]
  MAIGRET --> TIER{{tiering · 3 rules}}
  SHERLOCK -.-> TIER
  TIER --> LIKELY[likely]
  TIER --> POSSIBLE[possible]
  TIER -.-> NOISE["noise · ~95%"]
  LIKELY --> WRITE[agent writes candidate]
  POSSIBLE --> WRITE
  WRITE --> HUMAN[human judgment]
  NOISE -.-> AUDIT[audit only]

  U:::edge
  SHERLOCK:::edge
  NOISE:::edge
  AUDIT:::edge
  MAIGRET:::accent
  WRITE:::accent
  HUMAN:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
`;

renderThemedPair({ here, slug: 'discovery-tiering', graph });
