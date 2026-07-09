// Regenerates hypothesis-funnel-{light,dark}.svg. Author-time only. Mirrors
// the diagnostic's convergence protocol: cheap async inputs feed nine written
// hypotheses; day 1 narrows where the interview hours go. The lower branch is
// "kept on pre-work evidence" (neutral styling, NOT fail) -- the post's table
// scores all nine confirmed, so the branch is about attention, not survival.
// Run: CHROME_PATH="…" node src/assets/diagrams/hypothesis-funnel.gen.mjs
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
  SC([system scans<br/>6 automated passes]) --> H["9 named hypotheses<br/>confirm + kill evidence"]
  SV([5 surveys · N=57]) --> H
  H --> D1{{day 1:<br/>narrow to 5}}
  D1 -->|weaker signal| X[four kept on pre-work<br/>evidence · no interview slot]
  D1 --> D23[days 2-3:<br/>targeted interviews]
  D23 --> SCORE[scored evidence chains]
  SCORE --> OUT[friction register · 30/60/90<br/>leave-alone list]

  SC:::edge
  SV:::edge
  D1:::accent
  X:::edge
  OUT:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

renderThemedPair({ here, slug: 'hypothesis-funnel', graph });
