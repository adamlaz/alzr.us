// @ts-check

import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

// https://astro.build/config
export default defineConfig({
  site: 'https://alzr.us',
  output: 'static',
  adapter: vercel(),
  vite: { plugins: [tailwindcss()] },
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      // Dual-theme: Shiki emits --shiki-light/--shiki-dark CSS vars and no
      // hardcoded colors (defaultColor: false), so the post stylesheet can
      // swap token colors on [data-theme] and keep the on-brand block bg.
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          properties: {
            className: ['heading-anchor'],
            ariaLabel: 'Link to this section',
          },
          content: { type: 'text', value: '#' },
        },
      ],
    ],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
