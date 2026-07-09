// Regenerates interview-loop-{light,dark}.svg. Author-time only. The onsite
// rhythm from the diagnostic post: interview all day, consolidate overnight,
// re-aim every morning. The back-edge to the next day IS the diagram; do not
// flatten it into a pipeline.
// Run: CHROME_PATH="…" node src/assets/diagrams/interview-loop.gen.mjs
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
    rankSpacing: 44
    padding: 10
---
flowchart LR
  I([a day of interviews<br/>local capture, names scrubbed]) --> T[overnight re-transcription<br/>slower model, higher accuracy]
  T --> S[synthesis fan: per-person notes<br/>scorecard · contradictions]
  S --> G[interview guides re-aimed<br/>at the thinnest evidence]
  G -->|next morning| I

  I:::edge
  S:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

renderThemedPair({ here, slug: 'interview-loop', graph });
