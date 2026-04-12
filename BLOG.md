# Writing / Blog System

## Overview
Personal essays on data governance, analytics leadership, and organizational data maturity.

**Page**: `/writing` (navigable from main site)
**Component**: `src/pages/writing.astro`
**Theme**: Calm, detail-oriented, grounded in first principles thinking

---

## Current Structure

### Page Layout (writing.astro)
- Uses `BaseLayout` template
- `BlogCard` component displays each post
- Static array of posts (currently placeholder "Coming soon" entries)

### Existing Post Drafts
1. **"Why Metric Definitions Matter More Than Dashboards"**
   - Topic: Analytics fundamentals, stakeholder alignment
   - Status: Coming soon

2. **"The Hidden Cost of Bad Data: A Framework for Investment Sizing"**
   - Topic: Data quality ROI, leadership pitch
   - Status: Coming soon

---

## Adding a Blog Post

### Step 1: Write Copy
Use `/my-voice` skill to draft the essay in your authentic voice.

### Step 2: Create Post Entry
Update `src/pages/writing.astro`:
```astro
{
  title: 'Post Title',
  excerpt: 'First 100-150 words as teaser...',
  date: 'April 9, 2026',
  slug: 'post-slug',
}
```

### Step 3: Create Post Page (Optional)
For full essays, either:
- **Option A**: Create `src/pages/writing/[post-slug].astro` for dynamic routing
- **Option B**: Embed full content in card with "read more" modal
- **Option C**: Link to static HTML in `public/writing/` with relative paths

### Step 4: Verify Voice & Tone
All posts must align with project voice: calm, competent, authentic, detail-oriented.

---

## Voice Guidelines for Writing

**Tone**: Conversational yet authoritative. Show, don't tell.

**Audience**: Data professionals, analytics leaders, decision-makers trying to improve data culture.

**Structure**:
1. **Hook**: Concrete problem or insight
2. **Context**: Why this matters (the stakes)
3. **Framework/Solution**: Your approach or mental model
4. **Closing**: Actionable takeaway or challenge to reader

**Style**:
- Short paragraphs (2-3 sentences)
- Active voice
- Concrete examples over theory
- No corporate jargon

---

## Technical Setup

### BlogCard Component
Located: `src/components/BlogCard.astro`
Props: `title`, `excerpt`, `date`, (optional) `slug`

### Future Enhancements
- Full post routing with dynamic pages
- Archive by date/topic
- Related posts suggestions
- Search functionality
- RSS feed

---

## Publishing Workflow
1. Draft in `/my-voice` skill
2. Add post to writing.astro array
3. Test on dev server (`npm run dev`)
4. Verify tone matches existing voice
5. Build and deploy (`npm run build`)
