// Regenerates data-engine-{light,dark}.svg. Author-time only. The diagnostic's
// collection-to-decision pipeline: platform APIs -> seven scan rounds -> raw
// JSON -> classified CSVs + identity reconciliation -> generated chart specs
// -> the minisite. The dotted branch (CSVs -> interview questions) is the
// post's "recon pays out in the room" claim -- keep it.
// Run: CHROME_PATH="…" node src/assets/diagrams/data-engine.gen.mjs
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
  A([Jira · repos · wiki<br/>cloud · directory APIs]) --> C[collectors<br/>7 scan rounds]
  C --> R[("raw inventory<br/>JSON dumps")]
  R --> K[classify + reconcile<br/>27 CSVs · unified identities]
  K --> G[generator chain<br/>114 chart specs]
  G --> M[minisite · 33 pages<br/>source line on every chart]
  K -.-> Q[data-cited<br/>interview questions]

  A:::edge
  K:::accent
  M:::accent
  Q:::edge

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

renderThemedPair({ here, slug: 'data-engine', graph });
