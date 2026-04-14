# Writing/Thinking Section: Workflow Reference

## How Articles Are Structured

Articles live as markdown files in `src/content/blog/`.
The writing page at `src/pages/writing.astro` reads them dynamically.
Each article gets its own page via `src/pages/writing/[slug].astro`.

---

## File Locations

| File | Purpose |
|---|---|
| `src/content/config.ts` | Defines the blog collection schema (title, date, description, series, draft) |
| `src/content/blog/[slug].md` | Individual article files |
| `src/pages/writing.astro` | The writing index page |
| `src/pages/writing/[slug].astro` | Dynamic template that renders each article |
| `src/components/BlogCard.astro` | The article card component (shows title, date, series, draft badge) |
| `src/config/navigation.ts` | Controls which pages appear in the nav |

---

## Publishing a New Article

### Step 1: Create the markdown file

Create a new file in `src/content/blog/your-slug.md`.

Use this frontmatter template:

```markdown
---
title: "Your Article Title Here"
date: YYYY-MM-DD
slug: your-slug
series: "Thinking"
description: "One sentence that summarises what this article is about."
draft: false
---

Your article content starts here.
```

### Step 2: Write the content

Write in markdown below the frontmatter. Key formatting:
- `##` for section headings
- `---` for section breaks
- `**bold**` for emphasis
- Keep paragraphs short (2-3 sentences)
- No em-dashes

### Step 3: Test locally

Run the dev server if it's not already running:
```bash
npm run dev
```

Navigate to `http://localhost:4321/personal-site/writing` to preview.
Click through to the article at `http://localhost:4321/personal-site/writing/your-slug`.

### Step 4: Deploy

Stage and commit only this article file:
```bash
git add src/content/blog/your-slug.md
git commit -m "Add article: Your Article Title"
git push origin main
```

Wait 2-3 minutes, then check `https://joflei.github.io/personal-site/writing`.

---

## Keeping a Draft Hidden

Add `draft: true` to the frontmatter:

```markdown
draft: true
```

Locally: the article shows with a greyed-out "Draft" badge and no link.
Production: the article is completely invisible to visitors.

When ready to publish, change to `draft: false` and push.

---

## Modifying an Existing Article

1. Open `src/content/blog/your-slug.md`
2. Edit the content directly
3. Save — changes appear instantly in dev server
4. Commit and push when ready:
```bash
git add src/content/blog/your-slug.md
git commit -m "Update article: Your Article Title"
git push origin main
```

---

## Article Authoring Workflow (Interview Method)

Used for case study articles in the "Thinking" series.

**Phase 1: Extract** — Answer interview questions one at a time. Share raw thinking.

**Phase 2: Outline** — Structure the extracted thinking using this framework:
1. Problem and Context
2. Initial Thinking and Where You Were Wrong
3. The Framework You Landed On
4. Decision and Rationale
5. Reflection and Why It Matters

**Phase 3: Draft** — Use `/my-voice` skill to write in authentic voice.

Voice guardrails:
- Calm and collected, no drama
- Short paragraphs (2-3 sentences)
- Active voice, concrete examples
- No em-dashes
- No corporate filler
- Pass the "would I say this out loud?" test

---

## Draft Articles Currently in Progress

| Article | Status | File |
|---|---|---|
| Why Metric Definitions Matter More Than Dashboards | Draft, notes ready | `metric-definitions.md` |
| The Hidden Cost of Bad Data: A Framework for Investment Sizing | Draft, not yet started | `cost-of-bad-data.md` |
