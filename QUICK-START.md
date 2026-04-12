# Quick Start

## Start Dev Server
```bash
npm run dev
```
Opens at http://localhost:4322/personal-site

## Build for Production
```bash
npm run build
```

## Common Tasks

**Edit a page**: Update file in `src/pages/` (`.astro` format)
**Add copy**: Use `/my-voice` skill
**Add component**: Create in `src/components/`
**Add static HTML project**: Place in `public/projects/` with relative links
**Edit styles**: Tailwind classes or `src/styles/`

## Link Format
- Pages: `/about`, `/projects`, `/experience`
- Static HTML: relative paths (`../projects`)

## Key Files
- `astro.config.mjs` — site config, base URL
- `package.json` — deps, scripts
- `.claude/` — project memory/context
