// Regenerates run-loop-{light,dark}.svg. Author-time only. The unattended run
// from the wedding-app post: one brief per unit, an executor in its own
// worktree, a fresh-context reviewer, a merge that is a production deploy, and
// the ledger row that hands the next unit back to the orchestrator. Keep the
// REVISE edge and the STOP branch; the loop and the refusal are the point.
// Run: CHROME_PATH="…" node src/assets/diagrams/run-loop.gen.mjs
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
    rankSpacing: 40
    padding: 10
---
flowchart TD
  P([plan + pre-flight:<br/>every decision made up front]) --> O[orchestrator writes<br/>one brief per unit]
  O --> E[executor in its own<br/>worktree opens a PR]
  E --> C[CI on the final commit]
  C --> R{{review: a hostile agent,<br/>or the orchestrator's read}}
  R -->|REVISE| E
  R -->|APPROVE| M[merge = production deploy]
  M --> V[check the live site]
  V --> L[row in the run ledger]
  L -->|next unit| O
  E -->|STOP condition| S[BLOCKED line,<br/>waits for me]

  P:::edge
  R:::accent
  M:::accent
  S:::fail

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
  classDef fail fill:${p.failFill},stroke:${p.fail},color:${p.failText}
`;

renderThemedPair({ here, slug: 'run-loop', graph });
