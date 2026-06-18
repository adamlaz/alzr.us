// Regenerates self-grading-{light,dark}.svg. Author-time only. Structural only —
// shows the grading FLOW, never a candidate's scores.
// Run: CHROME_PATH="…" node src/assets/diagrams/self-grading.gen.mjs
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
  BANK["probe bank<br/>each probe pre-tagged to a dimension"] --> INT[the interview]
  INT --> TX[transcript]
  TX --> PASS["AI pass<br/>reads transcript vs probes"]
  PASS --> DIMS["6 dimensions · 1-4<br/>+ evidence"]
  DIMS --> DRAFT[draft recommendation]
  DRAFT --> HUMAN[human decides]

  BANK:::edge
  HUMAN:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
`;

renderThemedPair({ here, slug: 'self-grading', graph });
