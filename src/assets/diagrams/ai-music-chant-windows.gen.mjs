// Run: node src/assets/diagrams/ai-music-chant-windows.gen.mjs
// The splice script's replacement windows against the loudness of the
// separated vocal stem, 8 to 30 seconds into the 30-second chorus clip.
// ENV is the stem's RMS (hop 512 at 44.1 kHz), max per 0.1 s bin, starting at
// 8.0 s. WINDOWS are the onsets the script's detector returns on that stem,
// each with its 2.0 s window. BLOCKS are where the RMS climbs back over 0.1
// after at least 0.3 s under it. The windows carry the accent; everything
// else is ink or neutral, and the block starts are a different shape (ticks).
import { emit, line, rect, scale, t } from './_chart.mjs';

const ENV = [
  0.067, 0.063, 0.049, 0.054, 0.056, 0.055, 0.052, 0.053, 0.042, 0.043, 0.031, 0.129, 0.085, 0.017, 0.014, 0.002, 0.0,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  0.001, 0.001, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.001, 0.003, 0.003, 0.001, 0.0, 0.0, 0.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.251, 0.188, 0.122, 0.083, 0.229, 0.194, 0.158, 0.197, 0.235,
  0.208, 0.185, 0.177, 0.12, 0.072, 0.057, 0.055, 0.044, 0.04, 0.046, 0.046, 0.043, 0.28, 0.165, 0.16, 0.177, 0.175,
  0.184, 0.149, 0.166, 0.163, 0.166, 0.191, 0.128, 0.216, 0.172, 0.131, 0.13, 0.068, 0.172, 0.134, 0.101, 0.161, 0.182,
  0.216, 0.087, 0.199, 0.207, 0.156, 0.182, 0.161, 0.1, 0.063, 0.062, 0.05, 0.039, 0.035, 0.044, 0.046, 0.163, 0.263,
  0.151, 0.109, 0.171, 0.179, 0.173, 0.129, 0.143, 0.144, 0.177, 0.177, 0.102, 0.146, 0.133, 0.144, 0.138, 0.17, 0.198,
  0.176, 0.05, 0.206, 0.242, 0.156, 0.145, 0.173, 0.157, 0.187, 0.149, 0.136, 0.063, 0.067, 0.058, 0.044, 0.034, 0.041,
  0.048, 0.052, 0.279, 0.239, 0.129, 0.175, 0.184, 0.202, 0.149, 0.142, 0.151, 0.198, 0.173, 0.165, 0.16, 0.157, 0.16,
  0.16, 0.096, 0.186, 0.185, 0.127, 0.172, 0.167, 0.213, 0.087, 0.166, 0.189, 0.196, 0.184, 0.13, 0.112, 0.057, 0.085,
  0.053, 0.04, 0.037, 0.05, 0.063, 0.19, 0.276, 0.137, 0.115, 0.172, 0.202, 0.193, 0.12, 0.139, 0.133, 0.15, 0.118,
  0.123, 0.246, 0.334, 0.221,
];
const T0 = 8;
const T1 = 30;
const CUT = [9.1, 11.1];
const WINDOWS = [
  [15.13, '0.0'],
  [18.44, '+1.2'],
  [21.46, '+0.5'],
  [24.75, '0.0'],
  [27.77, '−0.7'],
];
const BLOCKS = [15.14, 17.24, 20.99, 24.75, 28.48];

emit(import.meta.url, 'ai-music-chant-windows', (p) => {
  const x = scale(T0, T1, 14, 406);
  const TOP = 44;
  const BASE = 150;
  const y = scale(0, 0.34, BASE, TOP);
  const pts = ENV.map((v, i) => [x(T0 + i * 0.1 + 0.05), y(v)]);
  const area =
    `M${x(T0).toFixed(1)} ${BASE} ` +
    pts.map(([px, py]) => `L${px.toFixed(1)} ${py.toFixed(1)}`).join(' ') +
    ` L${x(T1).toFixed(1)} ${BASE} Z`;
  const ticks = [10, 15, 20, 25, 30]
    .map(
      (s) =>
        `${line(x(s), BASE + 26, x(s), BASE + 32, { stroke: p.line })}
${t(x(s), BASE + 50, s === 30 ? '30 s' : String(s), { size: 13.5, anchor: s === 30 ? 'end' : 'middle', fill: p.soft, font: 'mono' })}`,
    )
    .join('\n');
  return {
    height: BASE + 100,
    body: `
${t(0, 14, 'Shaded: the 2-second windows the script replaced', { size: 14, weight: 500 })}
${rect(x(CUT[0]), TOP, x(CUT[1]) - x(CUT[0]), BASE - TOP, { stroke: p.line, sw: 1.5, dash: '4 4', rx: 2 })}
${t(x(CUT[0]), TOP - 8, 'cut by hand', { size: 13.5, fill: p.soft })}
${WINDOWS.map(([s]) => rect(x(s), TOP, x(s + 2) - x(s), BASE - TOP, { fill: p.accentSoft, rx: 2 })).join('\n')}
${WINDOWS.map(([s, label]) => t(x(s + 1), TOP - 8, label, { size: 13.5, anchor: 'middle', fill: p.accent, font: 'mono', weight: 600 })).join('\n')}
<path d="${area}" fill="${p.text}" fill-opacity="0.82"/>
${line(14, BASE, 406, BASE, { stroke: p.line })}
${BLOCKS.map((s) => line(x(s), BASE + 6, x(s), BASE + 20, { stroke: p.text, sw: 3, cap: 'butt' })).join('\n')}
${ticks}
${line(14, BASE + 71, 14, BASE + 85, { stroke: p.text, sw: 3, cap: 'butt' })}
${t(24, BASE + 83, 'where the loud block starts, every 3.75 s', { size: 13.5, fill: p.soft })}`,
  };
});
