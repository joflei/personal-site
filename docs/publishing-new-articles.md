# Publishing New Articles: End-to-End Guide

A practical reference for adding future articles to the Thinking section on your own, without needing Claude. Includes every issue encountered during setup and the cleanest way to fix each one.

---

## Overview

Articles live as markdown files in `src/content/blog/`. The site reads them automatically — add a file, it appears on the Thinking page. The only manual steps are writing the file, checking it locally, and pushing to GitHub.

---

## Step 1: Create the Article File

Create a new file at `src/content/blog/your-slug.md`. The slug becomes the URL: `/writing/your-slug`.

**Frontmatter template:**

```markdown
---
title: "Your Article Title"
date: YYYY-MM-DD
slug: your-slug
series: "Case Study"
description: "One sentence that appears under the title on the index page."
draft: false
---

Your article content starts here.
```

**Field notes:**
- `series` — displays as a small uppercase tag above the title. Current value: `"Case Study"`. Change freely, e.g., `"Framework"`, `"Reflection"`.
- `draft: true` — hides the article in production, shows it locally with a greyed "Draft" badge and no link. Use this while writing. Flip to `false` when ready to publish.
- `date` — controls sort order on the index (newest first). Use a real date even if you're still drafting.

---

## Step 2: Write the Article

Write in standard markdown below the frontmatter. The article template (`src/pages/writing/[slug].astro`) already handles all styling — headings, lists, blockquotes, inline code, links.

**Formatting conventions used in this site:**
- Section headings: `##`
- Sub-headings: `###`
- Horizontal rule `---` between major sections
- Italic closing note: `*The interactive analysis this piece draws from is [available here](url).*`
- No em dashes (site-wide rule — they read as AI-generated)

---

## Step 3: Test Locally

Start the dev server:

```bash
cd /Users/baba/Documents/claude_code_website
npm run dev
```

Open your browser:
- **Thinking index:** `http://localhost:4321/writing`
- **Your article:** `http://localhost:4321/writing/your-slug`

> **Known issue — card links 404 locally:**
> On the Thinking index, clicking an article card will 404 in the local dev server. This is expected. The card links are hardcoded with the `/personal-site/` prefix (matching GitHub Pages), but the dev server serves from `/`. Go directly to `http://localhost:4321/writing/your-slug` to preview the article page. The links work correctly in production.

---

## Step 4: Commit and Push

### The simple case (no divergence)

```bash
# Stage only your writing files
git add src/content/blog/your-slug.md

# If you also changed BlogCard, navigation, or the writing page:
git add src/components/BlogCard.astro
git add src/config/navigation.ts
git add src/pages/writing.astro
git add src/pages/writing/[slug].astro
git add docs/

# Commit
git commit -m "Add [article title] to Thinking section"

# Push
git push
```

GitHub Actions will deploy to `https://rugarabamu.me` within ~2 minutes.

---

## Known Issues and How to Fix Them

These are real problems encountered during the initial setup of this section, with the exact resolution for each.

---

### Issue 1: Merge conflicts blocking the build

**Symptom:** The dev server throws a build error, or files contain `<<<<<<< HEAD`, `=======`, `>>>>>>>` markers.

**What causes it:** Two separate sessions both made changes to the same file (e.g., `BaseLayout.astro`), creating a conflict that was never resolved.

**How to fix:**

Open the conflicted file. Find the conflict markers. They look like this:

```
<<<<<<< HEAD
  your local version of the code
=======
  the remote version of the code
>>>>>>> commit-hash
```

Delete the markers and keep the version you want. Then:

```bash
git add src/layouts/BaseLayout.astro
# repeat for each conflicted file
git commit -m "Resolve merge conflicts"
```

**Which version to keep:** For files unrelated to your current work (BaseLayout, about.astro, projects.astro), keep whichever version has the most recent changes. When in doubt, keep the remote version — it reflects the production state.

**Files that conflicted in this session and what was chosen:**
| File | Conflict | Resolution |
|---|---|---|
| `src/layouts/BaseLayout.astro` | Two identical Google Analytics blocks, slightly different formatting | Kept HEAD (cleaner spacing) |
| `src/pages/about.astro` | `(Claude, Codex, Copilot, Manus)` vs `(Claude, Codex, Copilot, and Manus)` | Kept remote (grammatically correct) |
| `src/pages/projects.astro` | Different link path and tags for NECTA project | Kept HEAD (correct `/personal-site/` prefix for staging) |

---

### Issue 2: Branch diverged from remote — push rejected

**Symptom:** `git push` fails with:

```
! [rejected] main -> main (non-fast-forward)
error: failed to push some refs
hint: Updates were rejected because the tip of your current branch is behind its remote counterpart.
```

**What causes it:** Someone (or another Claude session) pushed commits to GitHub while your local branch was also making commits. Now the two histories have split.

**How to check:**
```bash
git fetch origin
git log --oneline HEAD...origin/main
```

**The clean fix:**

```bash
git fetch origin
git rebase origin/main
# If rebase succeeds cleanly:
git push
```

**If rebase hits conflicts:**
```bash
# Fix each conflicted file (remove markers, keep correct version)
git add <conflicted-file>
git rebase --continue
# Repeat until done, then:
git push
```

**If things go wrong mid-rebase:**
```bash
git rebase --abort   # cancel and go back to where you started
```

**If there's a stale lock file blocking git commands:**
```bash
rm .git/index.lock
```
This happens when a git process was interrupted (e.g., Claude session ended mid-rebase). Safe to delete.

---

### Issue 3: Incomplete merge left in progress

**Symptom:** `git status` shows `Unmerged paths` and says "You have unmerged paths. Fix conflicts and run `git commit`." Even after you fix the files.

**What causes it:** A `git merge` or `git pull` started, hit conflicts, and was never finished (either committed or aborted).

**How to fix:**

1. Open each file listed under "Unmerged paths" and remove any conflict markers (if present)
2. Stage each file to mark it as resolved:
   ```bash
   git add src/layouts/BaseLayout.astro
   git add src/pages/about.astro
   git add src/pages/projects.astro
   ```
3. Complete the merge:
   ```bash
   git commit -m "Resolve merge conflicts"
   ```

If you'd rather bail out entirely:
```bash
git merge --abort
```

---

### Issue 4: Accidentally staging files you don't want to commit

**Symptom:** `git status` shows unrelated files in "Changes to be committed."

**What causes it:** A previous session ran `git add .` or `git add -A`, sweeping in everything.

**How to unstage a file:**
```bash
git restore --staged path/to/file
```

**Files to always exclude from writing-section commits:**
```
.astro/content.d.ts
.astro/data-store.json
.astro/types.d.ts
REGIONAL_MAP_CONTEXT.md
public/necta/data/extended_analysis.json
public/necta/necta-charts.js
public/necta/necta-explorer.html
```

These are either auto-generated or belong to a different feature. Stage only what you wrote.

---

### Issue 5: Local URLs don't match production URLs

**Symptom:** A link that works on `rugarabamu.me` gives a 404 locally (or vice versa).

**Why this happens:** The site is deployed to GitHub Pages at the path `/personal-site/`, but the local dev server has no `base` configured and serves from `/`. Some hardcoded links in the codebase use the `/personal-site/` prefix.

**In practice:**
| URL | Local dev | Production |
|---|---|---|
| Thinking index | `http://localhost:4321/writing` | `https://rugarabamu.me/writing` |
| Article page | `http://localhost:4321/writing/necta-case-study` | `https://rugarabamu.me/writing/necta-case-study` |
| Article card link (from index) | ❌ 404 (has `/personal-site/` prefix) | ✅ Works |

**Rule of thumb:** Always test article pages directly via their URL. Don't rely on clicking cards in the local index.

---

## Publishing Workflow Summary

```
1. Create src/content/blog/your-slug.md
2. Write frontmatter + article content
3. npm run dev → check http://localhost:4321/writing/your-slug
4. When ready: set draft: false
5. git fetch origin
6. git rebase origin/main  (pulls in any remote changes first)
7. git add src/content/blog/your-slug.md
8. git commit -m "Add [title] to Thinking section"
9. git push
10. Wait ~2 min → check https://rugarabamu.me/writing
```

---

## File Reference

| File | What it does |
|---|---|
| `src/content/blog/*.md` | Article markdown files |
| `src/content/config.ts` | Blog collection schema (fields: title, date, description, series, draft) |
| `src/pages/writing.astro` | Thinking index page |
| `src/pages/writing/[slug].astro` | Article template (auto-renders any blog post) |
| `src/components/BlogCard.astro` | The card on the index (title, date, series tag, draft badge) |
| `src/config/navigation.ts` | Nav config — toggle pages on/off, change labels |
| `docs/writing-workflow.md` | Earlier workflow notes |
| `docs/ARTICLE_1_CONTEXT.md` | Full context from the NECTA article session |
