---
title: "Why Metric Definitions Matter More Than Dashboards"
date: 2026-04-13
series: "Thinking"
description: "Most analytics teams jump straight to visualization. But if stakeholders can't agree on what \"attrition rate\" means, the prettiest dashboard in the world won't help."
draft: false
---

## The Moment It Broke

A few years back, I watched a metric definition cascade into an org problem in real time. The metric was attrition. The team that got hit didn't see it coming.

The definition was straightforward: voluntary employee departures over a trailing 12-month period. One caveat was tucked in there. A specific employee category was included in the calculation. It was a technical edge case, the kind that rarely shifts the numbers in a meaningful way. Or so everyone thought.

Then one team's attrition rate spiked. Not slightly. Dramatically. When we traced it back, that "benign" caveat was the culprit. That particular employee category had grown significantly within one team. Because they were counted in the calculation, the team's attrition numbers looked catastrophically worse. The definition was working exactly as written. But nobody had anticipated how much that inclusion could matter, and nobody had flagged to stakeholders that it *might*.

That's when I learned something that nobody tells you about metrics: a definition that isn't widely understood and actively managed isn't really a definition. It's a time bomb.

## The Problem Isn't What You Think It Is

Most analytics teams assume the hard part is building the dashboard. Getting the SQL right, choosing the visualization, making it fast. That's where the effort goes.

The actual hard part is keeping the definition stable and understood as the world around it changes.

## How Definitions Drift

There are different flavors of unknowns that show up in metric definitions. Some you know about. Some you don't.

**Known unknowns** are the things where you're aware of the ambiguity but haven't resolved it. Example: attrition can be calculated as voluntary or involuntary, by tenure cohort, by department, by cost center. You know these options exist. You've chosen one. But have you told stakeholders why you chose that one over the others? And what happens if the business changes and now they want the calculation different?

Worse: dimensions that seem stable can shift after someone escalates them. A departure type gets classified as regrettable, then senior leadership recategorizes it as unregrettable six months later. What was understood as one form of attrition is now treated as its complete opposite. The definition hasn't changed, but the data it references has. When that happens and nobody catches it, your historical trend breaks. Not because something went wrong. Because something legitimate changed and the definition didn't account for it.

**Unknown unknowns** are scarier because you can't see them until they matter. An employee type included in attrition might evolve due to compliance changes or business restructuring. You didn't anticipate it because you weren't thinking about the future state of the org. You were thinking about today's org. A data pipeline dependency that's worked for two years suddenly fails silently. An AI agent that's been accurate 99.8% of the time generates an output that's subtly wrong, and nobody catches it because evals only surface the statistical pattern, not the edge case.

These unknowns don't show up in documentation. They show up when something expensive breaks.

## When It Actually Gets Expensive

The thing about metric definitions is that they matter most when they're tied to incentives.

A dashboard with a definition ambiguity might live undetected for months if it's just something people look at. But when that metric determines a team's performance rating, drives a compensation decision, or gets cited to the board, suddenly the definition becomes critical. And that's when the unknowns surface.

A stakeholder looks at attrition and wants it annualized instead of trailing 12. Another stakeholder interprets "attrition rate" as the inverse of "retention rate" and expects them to mean the same thing, when they don't. A team wants to adjust a specific group to make their numbers look better. The definition, which seemed clear when it was written, now has to survive scrutiny from people who want different things.

This isn't abnormal. This is what happens when a metric actually matters.

The problem is that most teams don't have a way to surface these collisions early. They just accept them as crisis management.

## Where Most Teams Fail

I've seen this play out the same way across different organizations. A dashboard gets built with all the right process. Documentation is solid. There are confluence pages. There's a data dictionary. Everything looks buttoned up.

Then stakeholders start using it, and the unknowns surface at consumption time.

Someone in a board meeting talks about attrition in a way that assumes it includes a specific group. Someone else in the room assumes it excludes that group. The metric definition is correct. But the stakeholders weren't reading the documentation, and nobody had briefed them on what the caveat actually meant. That's not a definition problem. That's a communication problem that disguises itself as one.

Or a team wants to adjust the calculation to improve their numbers. They know what the definition says, but they push back because the definition doesn't align with what they think should count.

The dashboard is fine. The definition is fine. What's missing is the ongoing communication about what the definition means *to the people who use it*.

## What Actually Works

This needs a system. Not just documentation. A system. There are six parts to it.

**1. Start with an FAQ in your metrics catalog.** Every metric should have a section: "Known issues, caveats, and things to watch." It's not comprehensive. You can't anticipate everything. But known unknowns belong there. If someone encounters a question about attrition, they should be able to go to a central place and check: is this a known thing? Has someone else run into this? This becomes your first filter for whether something is a surprise or a known pattern.

   Eventually, you might layer a DQ agent into this that can automatically triage new issues and flag them against known ones. But start with the FAQ.

**2. Tier your metrics so you know what to prioritize when something breaks.** Not all metrics carry the same risk. Treating them the same wastes resources on low-stakes issues and underprotects the ones that actually matter.

   *Tier 0* is company-critical. These are the metrics cited in board presentations, tied to compensation, or used to evaluate team performance. When something shifts in a Tier 0 metric, it needs attention immediately. These are the attrition numbers that can make one team look catastrophically worse overnight.

   *Tier 1* supports Tier 0. These metrics feed into or affect the top-level ones. They're not the headline number, but they influence it. If something breaks here and nobody notices, the Tier 0 metric is compromised. Issues in Tier 1 should be addressed within 24 hours.

   *Tier 2* is team-critical. These are the metrics teams rely on for internal analysis and operational decisions. They rarely surface to senior leadership directly. Issues can typically wait up to 72 hours without major consequences. But Tier 2 deserves its own caution: because these metrics get the least visibility and attention, they're often where drift starts. A small inconsistency accumulates quietly over months, and by the time it surfaces, it's already feeding a Tier 0 problem that nobody can easily explain. The attrition incident above? The early signals were buried in Tier 2 data.

**3. Implement mini-audits to catch drift.** Not one-time audits. Recurring ones. Look at how the definition is being used in hindsight. If you defined attrition one way in Q2 and your numbers shifted in Q3, trace why. Was it a legitimate business change? A data pipeline shift? An interpretation drift? Document it. Over time, this becomes your drift trend analysis. Tier the mini-audits too: Tier 0 metrics warrant more frequent checks, Tier 2 metrics at minimum need a scheduled review before they have the chance to go dark.

**4. Assign a Strategic Technical Owner.** Not just a metrics owner. An STO. Someone who understands the inner workings of the metric: how it's built, what the dependencies are, where the fragile points are. This is critical now that AI is generating SQL and metrics. An STO needs to know exactly how the sausage is made. They need to be able to push back when a stakeholder asks for something that doesn't align with how the metric is actually constructed. They need permission to say: "I understand why you want that, but here's why the definition can't support it."

**5. Make it easy for people to flag issues.** A bug icon in your catalog. A bot in Slack. A simple form. The barrier to reporting should be low. And the issues that come in should go somewhere. After a board meeting, if a stakeholder points out that board members talked about attrition as if it included a group it doesn't, that's a signal. It means your definition is getting misinterpreted at the highest levels. The low-friction mechanism catches it before the next quarter's board review.

**6. Hold recurring QBRs focused on metric health.** These aren't meetings about the metrics themselves. They're meetings about how the definitions are holding up. What issues came in? What patterns do we see? Where is there confusion? The cumulative view matters. One bizarre output is noise. Five similar outputs across different teams is a signal. When you show this pattern to people, they understand that maintaining definitions isn't a one-time thing. It's ongoing stewardship.

## The Human Part Nobody Talks About

All of this requires people to speak up. And they often don't.

Fear is part of it. People worry about looking dumb if they flag something. Silos are part of it. The data steward doesn't know what the business stakeholder needs. But there's another reason that's easy to miss: nothing changed the last time they spoke up.

You fix this by making three things true.

Make it easy. The mechanism should require minimal friction.

Make it safe. An STO should be able to absorb pushback without it becoming political. The process should assume good intent.

Make it visible. When someone flags an issue and it gets resolved, they should see that it mattered. When patterns emerge, share them. Show that the feedback loops are working.

Without visibility, the feedback loop feels thankless. And people stop feeding it.

## This Isn't About Documentation

You can document everything and still fail. Because documentation is static. Definitions are living.

Data stewardship isn't a documentation problem. It's a practice problem. It's about treating definitions as systems that need tending, like a garden and not a snapshot. A snapshot captures a moment and gets filed away. A garden left unattended starts drifting from what you intended the moment conditions change.

The difference between a team that manages definitions well and a team that gets blindsided is that the good team has built governance into the rhythm of their work. They have the FAQ. They have the tiered audit schedule. They have the STO who's paying attention. They have the low-friction way for people to flag issues. And they have the recurring meetings that show patterns cumulatively.

It's not complicated. But it does require accepting that a definition isn't done once it's written. It's done when the organization understands it, uses it consistently, and has a mechanism to catch when reality diverges from the intent.

That's when a metric definition actually means something.
