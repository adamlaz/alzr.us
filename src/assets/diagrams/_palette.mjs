// Shared light/dark palettes for the pre-rendered post diagrams. Lifted from
// splice-pipeline.gen.mjs so every new diagram matches the shipped one's
// colors. These are hardcoded hex approximations of the site's OKLCH tokens
// (mermaid/Satori can't read CSS variables). Keep roughly in sync with
// src/styles/global.css if the tokens ever shift.
export const light = {
  page: '#f7f6f2',
  node: '#ffffff',
  edgeFill: '#f1f0ec',
  text: '#1c1d24',
  border: '#cfcfd1',
  line: '#8a8a90',
  accent: '#2f3eb0',
  onAccent: '#ffffff',
  fail: '#c0402b',
  failFill: '#f7e6e2',
  failText: '#8f2b1c',
};

export const dark = {
  page: '#15151b',
  node: '#1d1d24',
  edgeFill: '#25252d',
  text: '#eceae4',
  border: '#3a3a43',
  line: '#8a8a93',
  accent: '#8fa1ef',
  onAccent: '#14141a',
  fail: '#e0654d',
  failFill: '#3a221d',
  failText: '#f0b6a8',
};
