// Regenerates render-loop-{light,dark}.svg. Author-time only. The CAD loop
// from the post: ask -> model edits source -> render -> human judgment, with
// the cycle edge back to the ask. Do NOT straighten the loop into a pipeline;
// the iteration edge is the whole point.
// Run: CHROME_PATH="…" node src/assets/diagrams/render-loop.gen.mjs
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
  A([one-line ask]) --> M[Claude edits the .scad]
  M --> R[openscad render to PNG]
  R --> E{{eyeball it,<br/>sometimes slice it}}
  E -->|not right yet| A
  E -->|holds up| P[print in ASA]

  A:::edge
  E:::accent
  P:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

renderThemedPair({ here, slug: 'render-loop', graph });
