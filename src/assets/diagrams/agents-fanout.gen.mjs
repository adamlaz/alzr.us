// Regenerates agents-fanout-{light,dark}.svg. Author-time only; the SVGs are
// committed and CI just bundles them. Run: CHROME_PATH="…" node src/assets/diagrams/agents-fanout.gen.mjs
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
  MSG([one message]) --> LAUNCH[launch the wave]
  LAUNCH --> A1["agent · candidate 1<br/>run_in_background"]
  LAUNCH --> A2["agent · candidate 2<br/>run_in_background"]
  LAUNCH --> A3["agent · candidate 3<br/>run_in_background"]
  LAUNCH --> AN["… 64 total"]
  A1 --> PAGES[structured research pages]
  A2 --> PAGES
  A3 --> PAGES
  AN --> PAGES
  PAGES --> RECAP[one-page recap · verdicts]

  MSG:::edge
  AN:::edge
  A1:::accent
  A2:::accent
  A3:::accent
  RECAP:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
`;

renderThemedPair({ here, slug: 'agents-fanout', graph });
