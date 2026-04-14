# Article 1: NECTA Case Study — Full Context

## Strategic Direction

**Goal**: Demonstrate deep system thinking, analytical rigor, boldness, and self-awareness to hiring managers.

**Format**: Project case study (not a principles essay — that comes later)

**Nav Label**: "Thinking" (landed on after considering "Writing", "Writings", "Thoughts", "Notes")
- Rationale: "Thinking" signals process and reasoning, not just polished opinions. Invites people into how you reason.
- Second choice if revisiting: "Notes"
- URL stays at `/writing` — "Thinking" is the nav label and page heading only

**First Piece**: NECTA case study (second project — fresher in mind, meatier content)

**Status**: Article drafted, implemented on site, pending git deployment to production

---

## Article: NECTA Case Study

**Title**: Seeing Past the Data: What 22 Years of NECTA Results Taught Me About Analytics

**File**: `src/content/blog/necta-case-study.md`

**Frontmatter**:
```markdown
---
title: "Seeing Past the Data: What 22 Years of NECTA Results Taught Me About Analytics"
date: 2026-04-01
slug: necta-case-study
series: "Thinking"
description: "How a fragmented historical dataset became a lesson in data governance and pragmatic analysis."
draft: false
---
```

**Article URL (local)**: `http://localhost:4321/personal-site/writing/necta-case-study`

**Article URL (production)**: `https://joflei.github.io/personal-site/writing/necta-case-study`

---

## Case Study Structure (Used for All Articles)

1. **Problem and Context** — What was the problem? What mattered? What were the constraints?
2. **Initial Thinking and Where You Were Wrong** — What did you assume? What proved incorrect?
3. **The Framework You Landed On** — How did your thinking evolve?
4. **Decision and Rationale** — What did you choose and why? What tradeoffs did you make?
5. **Reflection** — What surprised you? What would you do differently? Why this matters.

**Goal**: Show intellectual honesty, ability to adjust when wrong, and clear articulation of reasoning.

---

## Extraction Interview Workflow (For Future Articles)

**Phase 1: Extract** — Answer interview questions one at a time. Share raw thinking, whatever detail or messiness feels real.

**Phase 2: Outline** — Structure extracted thinking using the case study structure above. Identify the narrative arc.

**Phase 3: Draft** — Use `/my-voice` skill to write in authentic voice. Refine language, pacing, and tone.

**Key rule**: Ask interview questions one at a time. Let answers breathe before moving on.

---

## Voice and Tone Guardrails

- Calm, collected, detail-oriented — grounded in competence and first principles
- Conversational yet authoritative — show, don't tell
- Honest about uncertainty — self-aware, not defensive
- Active voice, concrete examples — no corporate jargon
- Short paragraphs (2-3 sentences) — easy to scan
- No em-dashes
- Pass the "would I say this out loud?" test
- "Thinking out loud" tone — show deliberation, not just conclusions

---

## Site Implementation: Thinking Section

### How It Works

Articles are markdown files in `src/content/blog/`. The writing page reads them dynamically using Astro content collections. Each article gets its own page via a dynamic route.

### Key Files

| File | Purpose |
|---|---|
| `src/content/config.ts` | Blog collection schema (title, date, description, series, draft) |
| `src/content/blog/[slug].md` | Individual article markdown files |
| `src/pages/writing.astro` | The Thinking index page |
| `src/pages/writing/[slug].astro` | Dynamic template that renders each article |
| `src/components/BlogCard.astro` | Article card (title, date, series tag, draft badge) |
| `src/config/navigation.ts` | Nav configuration — toggle pages on/off here |
| `docs/writing-workflow.md` | Publishing workflow reference |

### Navigation Config

In `src/config/navigation.ts`:
- Contact: `enabled: false` (hidden — duplicative with "Get in touch" section)
- Thinking/Writing: `enabled: true`, label: `"Thinking"`, href: `"/writing"`

### Draft System

Add `draft: true` to any article's frontmatter to hide it from production.

- **Locally**: Draft articles show with a greyed-out "Draft" badge and no link
- **Production**: Draft articles are completely invisible to visitors
- **To publish**: Change `draft: true` to `draft: false`, commit, push

### Content Collection Schema

```typescript
schema: z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string(),
  series: z.string().optional(),
  draft: z.boolean().optional().default(false),
})
```

---

## Articles in Progress

### Published
| Article | File | Status |
|---|---|---|
| Seeing Past the Data: What 22 Years of NECTA Results Taught Me About Analytics | `necta-case-study.md` | Written, pending production deploy |

### Drafts
| Article | File | Status |
|---|---|---|
| Why Metric Definitions Matter More Than Dashboards | `metric-definitions.md` | Notes ready, interview not started |
| The Hidden Cost of Bad Data: A Framework for Investment Sizing | `cost-of-bad-data.md` | Not yet started |

---

## Publishing Workflow

### Adding a New Article

1. Create `src/content/blog/[slug].md` with this frontmatter:
```markdown
---
title: "Your Title"
date: YYYY-MM-DD
slug: your-slug
series: "Thinking"
description: "One sentence summary."
draft: false
---
```
2. Write content in markdown below the frontmatter
3. Test locally: `npm run dev` then check `http://localhost:4321/personal-site/writing`
4. Commit and push (see deployment section below)

### Modifying an Existing Article

1. Open `src/content/blog/[slug].md`
2. Edit directly
3. Save — changes appear instantly in dev server
4. Commit and push when ready

---

## Deployment: Git State and Known Issues

### Current Git State (as of this session)

The branch is **diverged** from `origin/main`:
- 1 local commit ahead
- 11 remote commits behind

This means a simple `git push` will be rejected. The divergence needs to be resolved before pushing.

### Why It Diverged

Multiple git operations happened during this session:
1. An incomplete rebase was in progress (resolved with `git rebase --abort`)
2. A lock file blocked the abort (resolved with `rm .git/index.lock`)
3. A merge attempt created conflicts in unrelated files (resolved with `git merge --abort`)

### Files Modified for This Feature (need to be committed)

**New files (untracked):**
```
src/content/config.ts
src/content/blog/necta-case-study.md
src/content/blog/metric-definitions.md
src/content/blog/cost-of-bad-data.md
src/pages/writing/[slug].astro
docs/writing-workflow.md
docs/ARTICLE_1_CONTEXT.md
```

**Modified tracked files:**
```
src/components/BlogCard.astro
src/config/navigation.ts
src/pages/writing.astro
```

**Do NOT commit these (unrelated changes):**
```
public/necta/data/extended_analysis.json
public/necta/necta-charts.js
public/necta/necta-explorer.html
public/projects/necta-exam-pulse/csee-trend.html
public/projects/necta-exam-pulse/csee-trend.js
.astro/content.d.ts
.astro/data-store.json
.astro/types.d.ts
REGIONAL_MAP_CONTEXT.md
```

### Recommended Deployment Steps (Next Session)

**Option A: Resolve divergence then push (recommended)**
1. `git fetch origin`
2. `git log --oneline origin/main` to see what's on remote
3. Resolve the 11 commit divergence (may require merge or rebase)
4. Selectively stage only the writing files
5. Commit and push

**Option B: Use VS Code Source Control (simpler)**
1. Open Source Control panel (`Cmd+Shift+G`)
2. Stage only the writing-related files by clicking + next to each
3. Write commit message: `Add Thinking section with NECTA case study`
4. Click Commit
5. Click Sync/Push

**Conflict files to watch out for:**
When pulling remote changes, these files had merge conflicts:
- `src/layouts/BaseLayout.astro`
- `src/pages/about.astro`
- `src/pages/projects.astro`

These are unrelated to the writing section. If conflicts appear, resolve them by keeping the remote version (it has newer changes from other sessions).

---

## Local Dev Reference

- Start server: `npm run dev` from project root (`/Users/baba/Documents/claude_code_website`)
- Local URL: `http://localhost:4321/personal-site`
- Writing page: `http://localhost:4321/personal-site/writing`
- Article page: `http://localhost:4321/personal-site/writing/necta-case-study`
- Production URL: `https://joflei.github.io/personal-site`

---

## Notes

- This is about demonstrating thinking for hiring managers, not just sharing outcomes
- First piece is proof point of how you reason — foundation before LinkedIn reposting
- All writing should pass the "would I say this out loud?" test
- The messiest datasets often have the best insights — that is the through-line of this article
- Next article (metric definitions) has notes ready — use same interview extraction method
