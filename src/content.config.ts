import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/writing' }),
  schema: z.object({
    title: z.string().min(1, 'title is required'),
    date: z.coerce.date(),
    description: z.string().min(1, 'description is required'),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    pullQuote: z.string().optional(),
    ogTreatment: z.enum(['default', 'candidate-grid', 'struck-em-dash', 'era-timeline']).default('default'),
  }),
});

export const collections = { writing };
