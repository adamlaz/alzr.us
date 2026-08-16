import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

const geist = await readFile(resolve(process.cwd(), 'src/assets/fonts/Geist-Regular.ttf'));

const COBALT = '#1a3d99';
const INK = '#252550';
const INK_SOFT = '#5a5a78';
const PAPER = '#f8f8f8';
const RULE = '#dadae0';

export async function getStaticPaths() {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.map((post) => ({ params: { slug: post.id } }));
}

type Treatment = 'default' | 'candidate-grid' | 'struck-em-dash' | 'era-timeline';

const frameStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  background: PAPER,
  padding: '64px 72px',
  fontFamily: 'Geist',
  justifyContent: 'space-between',
};

const wordmarkStyle = {
  display: 'flex',
  fontFamily: 'Geist',
  fontSize: 22,
  color: INK_SOFT,
  letterSpacing: '0.04em',
};

const titleStyle = (size: number, maxWidth = 1056) => ({
  display: 'flex',
  fontFamily: 'Geist',
  fontSize: size,
  fontWeight: 700,
  lineHeight: 1.1,
  color: INK,
  letterSpacing: '-0.02em',
  maxWidth,
});

// Scale the title down as it gets longer so it never overflows the 630px
// canvas or collides with the grid/timeline a treatment draws beneath it.
// Each treatment passes its own comfortable starting size; the buckets step
// down from there. Real titles already hit ~70 chars, so this is load-bearing.
function fitTitleSize(title: string, base: number): number {
  const len = title.trim().length;
  if (len <= 30) return base;
  if (len <= 45) return Math.round(base * 0.82);
  if (len <= 60) return Math.round(base * 0.68);
  if (len <= 80) return Math.round(base * 0.56);
  return Math.round(base * 0.46);
}

const footerStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
};

const accentRuleStyle = {
  display: 'flex',
  width: 80,
  height: 3,
  background: COBALT,
};

function defaultTreatment(title: string) {
  return {
    type: 'div',
    props: {
      style: frameStyle,
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex' },
            children: { type: 'div', props: { style: titleStyle(fitTitleSize(title, 78)), children: title } },
          },
        },
        {
          type: 'div',
          props: {
            style: footerStyle,
            children: [
              { type: 'div', props: { style: wordmarkStyle, children: 'alzr.us' } },
              { type: 'div', props: { style: accentRuleStyle, children: '' } },
            ],
          },
        },
      ],
    },
  };
}

function candidateGrid(title: string) {
  const cards = Array.from({ length: 10 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    const struck = i === 1 || i === 6;
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 172,
          height: 96,
          background: PAPER,
          border: `1px solid ${RULE}`,
          borderRadius: 6,
          fontSize: 24,
          color: struck ? INK_SOFT : INK,
          letterSpacing: '0.04em',
          position: 'relative' as const,
          overflow: 'hidden' as const,
        },
        children: struck
          ? [
              { type: 'div', props: { style: { display: 'flex' }, children: `Candidate ${letter}` } },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    position: 'absolute' as const,
                    left: 12,
                    right: 12,
                    top: '50%',
                    height: 2,
                    background: COBALT,
                    transform: 'rotate(-6deg)',
                  },
                  children: '',
                },
              },
            ]
          : `Candidate ${letter}`,
      },
    };
  });

  return {
    type: 'div',
    props: {
      style: frameStyle,
      children: [
        { type: 'div', props: { style: titleStyle(fitTitleSize(title, 52)), children: title } },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              width: 952,
              marginTop: 24,
            },
            children: cards,
          },
        },
        {
          type: 'div',
          props: {
            style: footerStyle,
            children: [
              { type: 'div', props: { style: wordmarkStyle, children: 'alzr.us' } },
              { type: 'div', props: { style: accentRuleStyle, children: '' } },
            ],
          },
        },
      ],
    },
  };
}

function struckEmDash(title: string) {
  return {
    type: 'div',
    props: {
      style: frameStyle,
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    position: 'relative' as const,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 480,
                    height: 240,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 280,
                          lineHeight: 1,
                          color: COBALT,
                          fontWeight: 700,
                          letterSpacing: '-0.04em',
                        },
                        children: '—',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          position: 'absolute' as const,
                          left: 40,
                          right: 40,
                          top: '50%',
                          height: 4,
                          background: COBALT,
                          transform: 'rotate(-12deg)',
                        },
                        children: '',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    marginTop: 32,
                    ...titleStyle(fitTitleSize(title, 40), 920),
                    textAlign: 'center' as const,
                  },
                  children: title,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: footerStyle,
            children: [
              { type: 'div', props: { style: wordmarkStyle, children: 'alzr.us' } },
              { type: 'div', props: { style: accentRuleStyle, children: '' } },
            ],
          },
        },
      ],
    },
  };
}

function eraTimeline(title: string) {
  const years = ['2005', '2010', '2015', '2020', 'now'];
  const filledIndex = 4;
  return {
    type: 'div',
    props: {
      style: frameStyle,
      children: [
        { type: 'div', props: { style: titleStyle(fitTitleSize(title, 56)), children: title } },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 1000,
              marginTop: 56,
              position: 'relative' as const,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    position: 'absolute' as const,
                    top: 10,
                    left: 12,
                    right: 12,
                    height: 2,
                    background: RULE,
                  },
                  children: '',
                },
              },
              ...years.map((year, i) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          width: i === filledIndex ? 22 : 14,
                          height: i === filledIndex ? 22 : 14,
                          borderRadius: '50%',
                          background: i === filledIndex ? COBALT : PAPER,
                          border: `2px solid ${COBALT}`,
                        },
                        children: '',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          marginTop: 14,
                          fontSize: 22,
                          color: i === filledIndex ? COBALT : INK_SOFT,
                          letterSpacing: '0.04em',
                        },
                        children: year,
                      },
                    },
                  ],
                },
              })),
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: footerStyle,
            children: [
              { type: 'div', props: { style: wordmarkStyle, children: 'alzr.us' } },
              { type: 'div', props: { style: accentRuleStyle, children: '' } },
            ],
          },
        },
      ],
    },
  };
}

function render(treatment: Treatment, title: string) {
  switch (treatment) {
    case 'candidate-grid':
      return candidateGrid(title);
    case 'struck-em-dash':
      return struckEmDash(title);
    case 'era-timeline':
      return eraTimeline(title);
    default:
      return defaultTreatment(title);
  }
}

export const GET: APIRoute = async ({ params }) => {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  const post = posts.find((p) => p.id === params.slug);

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const treatment = (post.data.ogTreatment ?? 'default') as Treatment;
  // Satori consumes a custom React-element shape via plain objects, not JSX.
  const visual = render(treatment, post.data.title) as ConstructorParameters<typeof ImageResponse>[0];

  return new ImageResponse(visual, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Geist',
        data: geist,
        style: 'normal',
        weight: 400,
      },
      {
        name: 'Geist',
        data: geist,
        style: 'normal',
        weight: 700,
      },
    ],
  });
};
