# Website QA Schedule (Future)

## Overview
Automated, periodic quality assurance for the personal website. Uses scheduled task to run QA checks on a regular cadence.

**Status**: Planned (future iteration)
**Reference**: `claude_tracking_prompt.md` (contains QA prompt template)

---

## Checklist: What to QA

### Content
- [ ] All copy aligns with `/my-voice` skill (tone, authenticity)
- [ ] No broken internal links
- [ ] All projects have descriptions and working links
- [ ] Blog posts display correctly and are published

### Technical
- [ ] All pages load without errors (dev server)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Relative paths in `public/` are correct
- [ ] Images load properly
- [ ] CSS/Tailwind classes render correctly

### Build & Deploy
- [ ] `npm run build` completes successfully
- [ ] No console warnings or errors
- [ ] Production build size is reasonable

### SEO & Accessibility
- [ ] Page titles are descriptive
- [ ] Meta descriptions present (where applicable)
- [ ] Images have alt text
- [ ] Headings follow hierarchy (h1 → h2 → h3)
- [ ] Color contrast meets WCAG AA

### Branding
- [ ] Logo/favicon displays
- [ ] Colors match design system
- [ ] Typography is consistent
- [ ] Brand voice is consistent across pages

---

## Scheduled QA Workflow

### Frequency
Suggest: **Weekly** (every Monday 9 AM) or **Monthly** (first Monday of month)

### Trigger
```
mcp__scheduled-tasks__create_scheduled_task({
  taskId: "website-qa",
  cronExpression: "0 9 * * 1",  // Weekly Monday 9am
  prompt: "[See below]",
  description: "Weekly QA audit of personal website"
})
```

### QA Prompt Template
See `claude_tracking_prompt.md` for full prompt structure.

**Core steps**:
1. Run dev server locally
2. Navigate each page and verify content
3. Check responsive design
4. Test all links
5. Review recent git commits for unintended changes
6. Generate report of issues found
7. Suggest fixes or improvements

---

## QA Report Output

Expected format:
```markdown
# Website QA Report — [Date]

## Issues Found
- [Issue 1] — Severity: High/Med/Low
- [Issue 2]

## Quick Wins
- [Fix 1]
- [Fix 2]

## Next Steps
- [Action 1]
- [Action 2]

## Summary
Site is [healthy/needs attention]. [Key findings].
```

---

## When to Enable Scheduled QA
1. After initial site launch
2. Once you have stable content
3. When blog posts start publishing
4. Before sharing site publicly

---

## Notes
- Schedule should align with your work cadence
- Adjust checklist based on site maturity
- Use `/my-voice` skill to review copy tone during QA
- Flag voice/tone inconsistencies for quick fixes
