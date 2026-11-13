# alzr.us

Adam Lazarus' personal site. Editorial / paper-and-ink, cobalt accent. Astro on Vercel.

## Stack

- **Astro 6** (static output) + **Tailwind 4** (CSS-first `@theme`)
- **MDX** content collection for writing (`src/content/writing/*.mdx`)
- **Variable fonts** — Fraunces (display), Inter (body), Geist Mono — self-hosted via Fontsource
- **Cross-document view transitions** + **Speculation Rules API** for instant nav on Chromium
- **Biome** for lint + format
- **Vercel** adapter + hosting

## Commands

```sh
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
npm run check    # biome lint + format check
npm run format   # biome write fixes
```

## Structure

```
src/
├── content.config.ts          # writing collection schema
├── content/writing/           # MDX posts
├── layouts/BaseLayout.astro
├── components/
│   ├── Nav.astro
│   ├── Footer.astro
│   ├── Wordmark.astro         # Fraunces wonk-axis flourish
│   └── PostCard.astro
├── pages/
│   ├── index.astro            # /
│   ├── projects.astro         # /projects
│   ├── now.astro              # /now
│   └── writing/
│       ├── index.astro        # /writing
│       └── [...slug].astro    # /writing/<post>
└── styles/global.css          # OKLCH tokens, cobalt accent
```

## Writing a post

Drop a `.mdx` file in `src/content/writing/` with frontmatter:

```mdx
---
title: 'Running candidate background research with parallel Claude Code agents'
date: 2026-06-15
description: 'A short blurb for the index and OG card.'
draft: false
---

Body content here.
```

`draft: true` hides the post from the index and build.

### Depth posts

A post can let the reader choose how deep to go: a five-stop slider from **Business** (short, plain) to **Technical** (the deep dive). The levels are 1 Business, 2 Mostly business, 3 Balanced (the default), 4 Mostly technical, 5 Technical deep dive. Opt in with `depth: true` in frontmatter, then wrap level-specific content in `<Depth>`:

```mdx
import Depth from '../../components/post/Depth.astro';

<Depth max={1}>

Shown only at level 1.

</Depth>

<Depth min={4}>

## A heading and paragraphs shown at levels 4-5

</Depth>

Shared text <Depth inline min={4}>with a technical clause</Depth> keeps going.
```

- `min` and `max` are 1-5 (defaults 1 and 5). `inline` renders a `<span>` inside a paragraph; a block wrapper takes no box of its own, so spacing matches plain markdown.
- Leave a blank line after the opening tag and before the closing one, so the children parse as markdown blocks.
- Don't nest `<Depth>` elements.
- Content outside any `<Depth>` shows at every level. Write that shared spine so it reads well at both ends.
- Keep `<Note>` (and `<Footnotes>`) out of `<Depth>`. Footnote numbers are set by hand, so a hidden note leaves a gap in the sequence and a Notes entry whose reference isn't on the page.
- Reading time is computed per level at build. The readout under the slider shows the level and its minutes, and updates as the reader drags.
- After a change, each block the new level added gets a cobalt hairline in the left gutter for a moment, and each new inline clause a brief underline. Keep a `<Depth>` block to content that sits in the text column, so the mark lands beside it. The motion plan (timings, reduced-motion path) is at the top of `src/scripts/depth-slider.ts`.
- Links can pin a level: `?depth=1` to `?depth=5`, `?depth=business`, `?depth=technical`. The reader's last choice is remembered across posts; a URL param wins over it.
- Without JS, readers get level 3 and no slider. The RSS feed carries descriptions only, so it's unaffected.
- Using `<Depth>` in a post without `depth: true` fails the build.

## Deploy

`main` auto-deploys to Vercel. Domain `alzr.us` is on Cloudflare (DNS only — `proxied: false` so Vercel can issue TLS).
