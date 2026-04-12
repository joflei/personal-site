# Project Context

## Overview
Personal portfolio website (Astro + Tailwind). Projects showcase, about/experience sections, project-specific explorations (Necta analyzer, CSEE trends).

## Directory Structure
- `src/pages/` — main nav pages (index, about, experience, projects)
- `src/components/` — reusable UI components
- `src/layouts/` — page templates
- `src/styles/` — global CSS/Tailwind
- `public/` — static assets, standalone HTML projects
- `public/necta/` — Necta explorer interactive tool
- `public/projects/` — static project pages

## Critical Conventions

**Relative Paths**: Static HTML in `public/` must use relative paths for internal links.
- From `public/projects/necta-exam-pulse/csee-trend.html` → `../../projects`
- From `public/necta/necta-explorer.html` → `../projects`

**Copy & Voice**: Always use `/my-voice` skill for any site copy (hero, about, descriptions).

**Dev Workflow**: `npm run dev` → http://localhost:4322/personal-site

## Tech Stack
- Astro 5.5.0
- Tailwind 3.4.17
- No frameworks (static/vanilla JS)

## Build & Deploy
- `npm run build` — static output to dist/
- Site: https://joflei.github.io/personal-site
