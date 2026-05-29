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

## Deploy

`main` auto-deploys to Vercel. Domain `alzr.us` is on Cloudflare (DNS only — `proxied: false` so Vercel can issue TLS).
