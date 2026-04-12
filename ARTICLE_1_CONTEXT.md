# Article 1: Case Study (Second Project)

## Strategic Direction

**Goal**: Create a case study that demonstrates deep system thinking, analytical rigor, boldness, and self-awareness to hiring managers.

**Format**: Project case study (not a principles essay—that comes later)

**Page Name**: `/thinking` (selected from options: "Perspectives" vs "Thinking")
- Rationale: "Thinking" signals process and reasoning, not just polished opinions. Invites people into *how you reason*, which aligns with the self-aware, deep-thinking signal you want.

**First Piece**: Second project (fresher in mind, meatier content)

---

## Case Study Structure

The case study should show thinking, not just outcomes:

1. **Problem & Context** — What was the problem? What mattered? What were the constraints?
2. **Initial Thinking & Where You Were Wrong** — What did you assume initially? What proved incorrect?
3. **The Framework You Landed On** — How did your thinking evolve? What became your approach?
4. **Decision & Rationale** — What did you choose and why? What tradeoffs did you make?
5. **Reflection** — What surprised you? What would you do differently? Why this matters.

**Goal of structure**: Show that you think through hard problems with intellectual honesty, adjust when wrong, and can articulate your reasoning clearly.

---

## Extraction Interview Workflow

**Phase 1: Extract Thinking** (this session)
- Answer targeted questions about the project
- Focus on: problem, tradeoffs, moments of being wrong, frameworks, surprises, learnings
- Share in whatever detail/messiness feels real

**Phase 2: Structure & Outline** (next step)
- Take the extracted thinking
- Build outline using the case study structure above
- Identify the narrative arc

**Phase 3: Draft with Voice** (final step)
- Use `/my-voice` skill to write in your authentic voice
- Refine language, pacing, and tone
- Ensure it reads as *your* thinking, not AI-generated content

---

## Extraction Interview (In Progress)

**Next Question to Answer:**
> "You mentioned this project is 'meatier' and fresher in your mind. What was the core problem you were trying to solve? And more importantly—what made it *hard*? (Not just technically hard, but conceptually hard—where did you have to think differently than you expected?)"

**Questions Pipeline** (once above is answered):
1. What did you initially think would work? Where were you wrong?
2. What framework or mental model helped you adjust your thinking?
3. What surprised you most about the project?
4. If you were to do this again, what would you do differently?
5. Why does this way of thinking matter for data leadership?

---

## Voice & Tone Guardrails

- **Calm, collected, detail-oriented** — grounded in competence and first principles
- **Conversational yet authoritative** — show, don't tell
- **Honest about uncertainty** — self-aware, not defensive
- **Active voice, concrete examples** — no corporate jargon
- **Short paragraphs** (2-3 sentences) — easy to scan

---

## Implementation Decision

**Route**: Keep `/writing` (existing `src/pages/writing.astro`)  
**Series Label**: "Thinking" (case studies showing reasoning process)

Why: `/writing` is the durable container for all your writing. "Thinking" is the series name for this first set of case studies. Later you can add other series (Principles, Essays, etc.) without renaming the page.

**Structure**: 
- Add `series` or `category` field to BlogCard component
- Tag this article as `series: "Thinking"`
- Display series name on the card or page

---

## Next Steps After Extraction

1. Review extracted thinking
2. Build outline using case study structure
3. Draft with `/my-voice` skill
4. Iterate until it feels authentically like you
5. Add to `src/pages/writing.astro` with `series: "Thinking"` field
6. Test on `npm run dev`
7. Deploy when ready

---

## Notes

- This is about *demonstrating thinking* for hiring managers, not just sharing outcomes
- First piece is proof point of how you reason, foundation before LinkedIn reposting
- Avoid "Work Notes"—keeping "Thinking" as the page name
- All writing should pass the "would I say this out loud?" test
