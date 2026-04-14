---
title: "Seeing Past the Data: What 22 Years of NECTA Results Taught Me About Analytics"
date: 2026-04-01
slug: necta-case-study
series: "Case Study"
description: "How a fragmented historical dataset became a lesson in data governance and pragmatic analysis."
---

I got interested in the NECTA exam long before I ever thought to analyze it. At the time, it was personal. Late nights, chasing top grades, the weight of believing one test could determine your trajectory. Over time, that personal fascination evolved into something more analytical. I started wondering if exam results actually told us anything about how a country develops. Could educational outcomes connect to broader economic or social progress?

So I decided to test that idea using 22 years of NECTA data.

---

## The Challenge Wasn't Analysis. It Was the Data.

The initial plan was straightforward. Collect the data. Clean it. Look for patterns. It sounded simple because I thought the hard part would be the analytical work.

I was wrong about that.

NECTA only keeps a few recent years of results publicly available. Historical data is scattered across different archives. I found TETEA, a nonprofit that had done restoration work on older datasets, and they had most of what I needed except the most recent two years. So my dataset became a patchwork: recent years from the official source, historical years from TETEA, and gaps where data either didn't exist or hadn't been digitized.

That immediately raised a question I couldn't ignore. How much could I actually trust an analysis built from data that was this fragmented?

---

## Where Assumptions Met Reality

As I started working through the data, a few patterns emerged that made me reconsider what I was actually trying to do.

Private exam centers, coded as "P," reported their results differently than official school centers, coded as "S." That meant their data wasn't structured the same way. I couldn't aggregate them together or compare them directly. It was a structural inconsistency baked into the dataset itself.

Schools would appear and disappear from the records with no clear explanation. Mzizima Secondary, for example, shows up in some years, vanishes in 2009 and 2010, and then comes back later. I still don't know why. Was the school actually closed? Were records lost? Did someone just not submit data that year?

Then there was 2012. That year had two different datasets because the exam was rescored nationally. So which one was correct? Both. Neither. It depended on what you were trying to measure.

At that point, I realized the problem I was solving wasn't really an analysis problem anymore. It was a data quality problem.

---

## The Choice I Made

I could have taken the easy route. Exclude the messy years. Work only with data that was clean and consistent. It would have made the analysis simpler.

But it would also have meant throwing away most of the historical record the moment it became inconvenient.

Instead, I built a simple data quality tracking system. For every inconsistency I found, I logged what it was, which years it affected, and whether it actually limited what I could say about the data. This let me include more of the dataset while being explicit about what I didn't know.

It also changed how I framed the entire project. Instead of asking "What patterns can I infer from this data?", I shifted to asking "What patterns hold up even when I account for these known constraints?"

That seemed like a small reframe. It turned out to be foundational.

---

## A Pattern That Changed Everything

One finding jumped out quickly and forced me to rethink what I was looking at.

The number of exam candidates increased roughly ninefold over the 22-year period. Over that same timeframe, Tanzania's population roughly doubled. From about 36 million to 70 million.

That gap matters. A lot.

It means exam participation didn't just keep pace with population growth. It exploded beyond it. That's not incremental change. That's a system under rapid expansion, trying to accommodate dramatically more students.

Suddenly, the inconsistencies in the data made more sense. When a system is scaling that fast, format changes and missing schools aren't just annoying edge cases. They're evidence of transformation. The data quality issues themselves became part of what the data was telling me.

---

## What This Actually Taught Me

Working through this project reinforced something I'd suspected but never fully articulated.

Data quality isn't something you handle as a preliminary step and then move on from. It's foundational to everything else you do. You can't analyze your way out of bad data. You have to acknowledge its limits upfront and work within them. The data tracking system I built wasn't about being thorough. It was about being honest.

Real datasets almost never arrive clean. They're fragmented, they change format, they have gaps. The way you actually make progress isn't by waiting for perfect data or by ignoring the problems. It's by working through the inconsistencies systematically and building analysis that holds up despite them.

Frameworks matter more than tools. I could have built a complex pipeline to automatically reconcile the data. Instead, I kept a simple log of what was inconsistent and why. That discipline meant I understood my data better than a more sophisticated but automated approach would have given me.

The most important finding wasn't part of my original hypothesis. The ninefold growth wasn't something I predicted. It emerged because I stayed flexible and kept looking at what the data was actually showing, rather than trying to confirm what I expected to find.

---

## Why This Matters

You can read this as an analysis of Tanzania's education system. But what I want to demonstrate is something about how I approach data work itself.

The messiest, most fragmented datasets often come with the highest stakes. They matter because they cover real systems that people depend on. You can't just walk away when the data gets complicated. You have to find a way to work with it, document what you're uncertain about, and extract whatever signal you can without pretending the noise isn't there.

That's the skill I want to show. Not technical prowess with clean data, but the pragmatism and rigor it takes to work with the data you actually have.

---

*The interactive analysis this piece draws from is [available here](https://rugarabamu.me/projects/necta-exam-pulse/csee-trend.html).*
