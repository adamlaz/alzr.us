// Regenerates frame-request-{light,dark}.svg. Author-time only. The delivery
// route from the post: signed link -> edge worker (verify + cache) -> frame
// service -> object storage, with the cache-hit edge going straight to the
// JPEG. Keep both paths landing on the same output node; the instant second
// look is the point of the cache-key paragraph.
// Run: CHROME_PATH="…" node src/assets/diagrams/frame-request.gen.mjs
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
  L(["signed link<br/>?at=30min&w=640"]) --> W["edge worker<br/>verify, check cache"]
  W -->|"seen this moment before -- instant"| J(["one JPEG"])
  W -->|"first look"| S["frame service<br/>pinned ffmpeg, read-only key"]
  S -->|"range-reads a few MB"| B[("private<br/>object storage")]
  S -->|"~2 s"| J

  L:::edge
  J:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
`;

renderThemedPair({ here, slug: 'frame-request', graph });
