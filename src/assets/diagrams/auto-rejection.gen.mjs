// Regenerates auto-rejection-{light,dark}.svg. Author-time only.
// Run: CHROME_PATH="…" node src/assets/diagrams/auto-rejection.gen.mjs
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
    nodeSpacing: 34
    rankSpacing: 52
    padding: 10
---
flowchart TB
   S["sample opening 15s<br/>@ 2fps"] --- R["signalstats<br/>blue + black reject"]
   R -->|"survivors"| T([select representative])
   
   T -- "empty?" --> E1["seek mid-tape<br/>3s fallback"]
   E1 --> R2["signalstats<br/>blue + black reject"]
   R2 -->|"survivors"| T
   R2 -- "empty?" --> E2["412 PRECONDITION_FAILED"]
   E2 --> PH([caller shows placeholder])
   
   R:::reject
   T:::accent
   
   classDef reject fill:${p.failFill},stroke:${p.fail},color:${p.failText}
   classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
`;

renderThemedPair({ here, slug: 'auto-rejection', graph });
