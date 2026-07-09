// Regenerates vault-pipeline-{light,dark}.svg. Author-time only. Mirrors the
// post's platform shape: sources fan into the schedules, everything writes
// through the Activity Log spine, and failures land in the SAME log the
// surfaces read (that's the alerting thesis; keep the failure edge).
// Run: CHROME_PATH="…" node src/assets/diagrams/vault-pipeline.gen.mjs
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
  S([iMessage · Gmail · Amazon<br/>calendar · sensors · git]) --> J["7 launchd schedules<br/>~40 scripts"]
  J --> B{{hash-fenced blocks<br/>people + project pages}}
  J --> L[("Activity Log.md<br/>append-only spine")]
  J -->|on failure| F[error row, deduped<br/>toast is a courtesy]
  F --> L
  L --> V[dashboard · daily note<br/>podcast · standup]
  B --> V

  S:::edge
  L:::accent
  F:::fail

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

renderThemedPair({ here, slug: 'vault-pipeline', graph });
