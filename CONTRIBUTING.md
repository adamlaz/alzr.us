# Contributing

This is a personal site. PRs come from one person (me). The conventions here exist anyway -- they keep the history readable, the diff scannable, and the lint clean.

## Workflow

1. Branch from `main`. Branch name follows the type of work: `feat/<short>`, `fix/<short>`, `chore/<short>`, etc.
2. Make the change. One concern per commit.
3. Open a PR. Fill in the template ("what this does / what it doesn't do / verification").
4. CI runs Biome, `astro check`, and the build. All must pass.
5. Squash-merge once green.

`main` is protected. No direct pushes. No force pushes.

## Commit messages

Conventional Commits + gitmoji. The subject line starts with a gitmoji, then the conventional prefix.

```
✨ feat(home): wordmark breath on hero
🐛 fix(footer): build-pulse animation skips on safari
📝 docs(readme): note vite override for tailwind 4
```

### Gitmoji legend (the ones I actually use)

| Emoji | When |
|---|---|
| 🎉 | Project init / first commit |
| ✨ | New feature |
| 🐛 | Bug fix |
| 🎨 | Style / design |
| 🏗️ | Layout / architecture |
| 🧱 | Component scaffolding |
| 📄 | New page or route |
| 📚 | Content / collection |
| 📦 | Dependencies |
| 📌 | Pin a version |
| ⚙️ | Config |
| 🛠️ | Tooling |
| 🤖 | CI / automation |
| 🪝 | Hooks |
| 📝 | Docs |
| ✏️ | Copy / typo |
| 🙈 | Gitignore |
| 🔥 | Remove code |
| ♻️ | Refactor |
| ⚡ | Performance |
| ✅ | Tests |

Use Conventional Commit `type(scope): subject` after the emoji. Valid types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.

A `commit-msg` hook (lefthook + commitlint) enforces this locally. CI re-checks on PR.

## Local setup

```sh
npm install         # installs deps + sets up lefthook
npm run dev         # http://localhost:4321
npm run check       # biome
npm run build
npx astro check     # typescript across .astro
```

## Things the hooks block

- Any unformatted or unlinted JS/TS/Astro
- Commit messages without a gitmoji prefix
- Commit messages that don't pass commitlint (conventional commits)
