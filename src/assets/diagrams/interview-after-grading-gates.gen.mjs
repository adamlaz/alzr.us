// Regenerates interview-after-grading-gates-{light,dark}.svg. Author-time only.
// Structural only: the gates in the grading pass, never a candidate's scores.
// Run: CHROME_PATH="…" node src/assets/diagrams/interview-after-grading-gates.gen.mjs
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
    nodeSpacing: 36
    rankSpacing: 36
    padding: 10
---
flowchart TB
  TX["transcript or notes<br/>on the page?"] -->|no| ASK["stop and ask for them"]
  TX -->|yes| PICK["pick 1-2 quotes<br/>per dimension"]
  PICK --> CHECK["script finds the quote<br/>in the transcript?"]
  CHECK -->|no| DROP["quote dropped"]
  CHECK -->|yes| SCORE["score 1-4<br/>no checked quote: N/A"]
  DROP --> SCORE
  SCORE --> DRAFT["result block appended<br/>to the page"]
  DRAFT --> STOP["stop for review"]
  STOP --> HUMAN["I set the fields<br/>and the status"]

  ASK:::edge
  DROP:::edge
  HUMAN:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
`;

renderThemedPair({ here, slug: 'interview-after-grading-gates', graph });
