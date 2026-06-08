import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

// The site-wide default share card (home, /now, /projects, /writing). Post
// pages render their own /og/<slug>.png; this resolves the BaseLayout default
// ogImage = '/og.png' so non-post URLs unfurl with a real paper-and-ink card
// instead of a 404. Colors mirror the OKLCH tokens as hex (Satori can't read
// CSS variables), matching src/pages/og/[slug].png.ts.
const geist = await readFile(resolve(process.cwd(), 'src/assets/fonts/Geist-Regular.ttf'));

const COBALT = '#1a3d99';
const INK = '#252550';
const INK_SOFT = '#5a5a78';
const PAPER = '#f8f8f8';

// Satori consumes a custom React-element shape via plain objects, not JSX.
const visual = {
  type: 'div',
  props: {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: PAPER,
      padding: '64px 72px',
      fontFamily: 'Geist',
      justifyContent: 'space-between',
    },
    children: [
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column' },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontSize: 96,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: INK,
                  letterSpacing: '-0.02em',
                },
                children: 'Adam Lazarus',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  marginTop: 24,
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: INK_SOFT,
                  maxWidth: 960,
                },
                children: 'Two decades shipping consumer products, founder-side and operator-side.',
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', fontFamily: 'Geist', fontSize: 22, color: INK_SOFT, letterSpacing: '0.04em' },
                children: 'alzr.us',
              },
            },
            {
              type: 'div',
              props: { style: { display: 'flex', width: 80, height: 3, background: COBALT }, children: '' },
            },
          ],
        },
      },
    ],
  },
};

export const GET: APIRoute = async () => {
  return new ImageResponse(visual as ConstructorParameters<typeof ImageResponse>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Geist', data: geist, style: 'normal', weight: 400 },
      { name: 'Geist', data: geist, style: 'normal', weight: 700 },
    ],
  });
};
