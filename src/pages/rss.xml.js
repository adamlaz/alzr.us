import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';

export async function GET(context) {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()).slice(0, 50);

  return rss({
    title: 'alzr.us writing',
    description:
      "Long-form posts on AI-augmented engineering, the operator's view, and the founder/CTO arc. By Adam Lazarus.",
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/writing/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
