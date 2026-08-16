// Regenerates frame-anatomy-{light,dark}.svg. Author-time only. The byte-level
// picture from the post: one multi-gigabyte master laid out header -> data ->
// index, and the three small reads ffmpeg makes against it. The point is the
// asymmetry -- gigabytes present, megabytes touched -- so keep the data node
// visually the widest of the three.
// Run: CHROME_PATH="…" node src/assets/diagrams/frame-anatomy.gen.mjs
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
  H["start of file -- header"] --- D["gigabytes of video --<br/>keyframes + diffs"] --- I["index (moov) -- at the tail"]
  I -->|"1 -- read the map"| F["ffmpeg -ss 2:13:00"]
  F -->|"2 -- range-read a few MB<br/>around the keyframe"| D
  F -->|"3 -- emit"| J([one 30 KB JPEG])

  F:::edge
  J:::accent

  classDef edge fill:${p.edgeFill},stroke:${p.border},color:${p.text}
  classDef accent fill:${p.accent},stroke:${p.accent},color:${p.onAccent}
`;

renderThemedPair({ here, slug: 'frame-anatomy', graph });
