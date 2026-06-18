// Regenerates chrome-theme-pipeline-{light,dark}.svg. Author-time only. Mirrors
// the post's 5-step ASCII pipeline; adds the dual-source fan-in and the Zod gate
// as structure. Do NOT split "sign + self-host" into two steps.
// Run: CHROME_PATH="…" node src/assets/diagrams/chrome-theme-pipeline.gen.mjs
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
  T([design tokens]) --> MAP[map to Chrome theme keys]
  F([Figma accents]) --> MAP
  MAP --> GATE{{validate · Zod contract}}
  GATE -->|renamed token| FAIL[build fails, loudly]
  GATE --> SIGN[sign with own key · self-host]
  SIGN --> BROWSERS["managed browsers<br/>poll + auto-update"]

  T:::edge
  F:::edge
  GATE:::accent
  FAIL:::fail
  BROWSERS:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

renderThemedPair({ here, slug: 'chrome-theme-pipeline', graph });
