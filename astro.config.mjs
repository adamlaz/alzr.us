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
