# Deploy Checklist: Google Analytics Setup

**Project:** Personal Website Analytics POC  
**Date:** 2026-04-11  
**Status:** Ready for deployment (separate session)  
**Context:** Adding GA to Astro site on GitHub Pages to track visits with IP exclusion

---

## Overview

This is **Stage 1** of a two-stage analytics plan:
- **Stage 1 (now):** Google Analytics POC — quick, free, one-line embed. Exclude your IPs, capture geo data and referrer source.
- **Stage 2 (future):** Build custom serverless tracking system as a portfolio/learning project once you understand what metrics matter.

---

## Pre-Deploy

### GA Account & Configuration
- [ ] Create Google Analytics 4 (GA4) account if you don't have one
- [ ] Create a new property for your personal website
- [ ] Copy the Measurement ID (looks like `G-XXXXXXXXXX`)
- [ ] Go to **Admin → Data Streams** and note your stream ID
- [ ] In GA Admin, create a custom audience or use filters to exclude your traffic (see steps below)

### Identify Your IPs to Exclude
- [ ] Get your home/computer IP address (what you'll use to browse your site)
- [ ] Get your phone's IP address (if you want to test from mobile)
- [ ] Document these clearly — you'll need them in GA filters

### Code Review
- [ ] Understand where the GA script tag will go (in your Astro BaseLayout or `<head>`)
- [ ] Confirm no conflicts with existing analytics or tracking scripts
- [ ] Review Astro + GA integration (should be straightforward)

### Communication
- [ ] No team to notify, but document this in your site README if you have one

---

## Deploy Steps

### 1. Add GA Script to Your Astro Site
- [ ] Add the GA script tag to your Astro layout (recommended: `src/layouts/BaseLayout.astro` or equivalent)
  - Script should look like: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>`
  - Followed by the initialization code
- [ ] Use Astro's `<script>` tag syntax (not inline HTML if possible, for better performance)
- [ ] Confirm the Measurement ID is correct (no typos)

### 2. Test Locally
- [ ] Run `npm run dev` to start the dev server
- [ ] Open your site in browser
- [ ] Open DevTools → Network tab, search for `google-analytics` or `gtag` to confirm script loads
- [ ] Open DevTools → Console, check for any GA errors
- [ ] Navigate to a few different pages on your site — GA should log each page view

### 3. Deploy to GitHub Pages
- [ ] Commit the Astro changes to your repo
- [ ] Push to `main` branch (or your configured deploy branch)
- [ ] Wait for GitHub Pages build to complete (check Actions tab)
- [ ] Once live, visit your site at `joflei.github.io/personal-site`

### 4. Verify GA is Receiving Data
- [ ] Go to Google Analytics dashboard
- [ ] Go to **Reports → Realtime**
- [ ] Visit your site (live URL), refresh a few pages
- [ ] Watch Realtime dashboard — you should see your session appear within 10-30 seconds
- [ ] If nothing appears after 2 min: check browser console for errors, verify script loaded in Network tab

### 5. Configure IP Exclusion (Exclude Your Traffic)
- [ ] Go to GA Admin → **Data Filters** (or **Admin → Filters** if using older interface)
- [ ] Create a new filter: "Exclude Internal Traffic"
  - Filter Type: **Exclude**
  - Traffic Type: **IP Address**
  - IP Address: Your home IP (use exact match, no wildcards initially)
  - Apply to: Your website property
- [ ] Test by visiting your site — your traffic should NOT appear in reports after filter is applied (can take 24 hours to fully apply)
- [ ] Add a second filter for your phone IP if you tested from mobile
- [ ] Verify in Realtime that you don't see your own sessions after ~5 minutes

---

## Post-Deploy (24+ Hours Later)

### Verify Data Collection
- [ ] GA is collecting data from visitors (should start seeing non-filtered traffic)
- [ ] Geo data is populated (check **Reports → Audience → Geographic**)
- [ ] Referrer source is showing (check **Reports → Traffic → Source/Medium**)
- [ ] Your own traffic is excluded (IP filters are working)

### Document Findings
- [ ] Screenshot your first GA dashboard for reference
- [ ] Note any surprises or data quality issues
- [ ] Check if any visitors found your site (referrer source will tell you which app/context)

### Cleanup & Next Steps
- [ ] Remove test/development traffic patterns from future analysis (optional: create a separate view)
- [ ] Keep this checklist + GA setup as part of your site documentation
- [ ] Decide: Is this data enough for Stage 1, or do you need tweaks?

---

## Testing Checklist (Before Going Live)

### Local Testing
- [ ] GA script loads without errors (Network tab)
- [ ] No console errors in DevTools
- [ ] Realtime dashboard shows test sessions from localhost (or not — may not capture localhost)

### Live Site Testing (After GitHub Pages Deploy)
- [ ] Visit your live site from different locations/networks
- [ ] Check Realtime dashboard for incoming sessions
- [ ] Test from phone to verify referrer source and geo data
- [ ] Refresh page multiple times — GA should log each pageview separately (not de-duplicate within a session)

---

## Rollback / Troubleshooting

**If GA script doesn't load:**
- [ ] Verify Measurement ID is correct (no typos, correct format `G-XXXXXXXXXX`)
- [ ] Check that GitHub Pages deployed the latest version (view page source, search for `gtag`)
- [ ] Verify no browser extensions blocking GA script
- [ ] Try a different browser to rule out local issues

**If data isn't appearing in GA:**
- [ ] Wait 24-48 hours (GA can be slow on first setup)
- [ ] Check **Admin → Data Streams** to confirm stream is active
- [ ] Verify filter isn't blocking all traffic (temporarily disable IP filter to test)
- [ ] Check that you're looking at the correct property/view

**If your traffic isn't being filtered:**
- [ ] Verify your IP address is correct (IPs can change, especially on mobile)
- [ ] Try excluding IP with CIDR range instead of exact match (e.g., `192.168.1.0/24`)
- [ ] Filters take 24 hours to apply — be patient
- [ ] Check IP under **Admin → Audience** to see what GA thinks your IP is

**To rollback:**
- [ ] Remove the GA script tag from your Astro layout
- [ ] Commit and push to GitHub
- [ ] GA will stop receiving data (but historical data is preserved)
- [ ] No harm done — you can re-add anytime

---

## Success Criteria

✅ **You'll know this is working when:**
1. GA is collecting pageviews from real visitors
2. Your own traffic (excluded IPs) doesn't appear in reports
3. You can see rough geographic location of visitors
4. You can identify referrer source (which app/context drove traffic)
5. Dashboard is easy to check — no confusion about which property/view you're in

---

## Stage 2 (Future)

Once you've had GA running for a week or two and understand what data matters:
- Build a custom serverless tracking function (Vercel or Netlify)
- Own the code, learn the architecture
- Add to your portfolio/resume
- Can extend with custom events, better privacy controls, etc.

---

## Resources

- [Google Analytics 4 Setup Guide](https://support.google.com/analytics/answer/10089681)
- [GA4 IP Exclusion Filters](https://support.google.com/analytics/answer/1033867)
- [Astro + GA Integration](https://docs.astro.build/en/guides/integrations-guide/google-analytics/)
- Your GitHub Pages site: `https://joflei.github.io/personal-site`

---

## Notes from Planning Session (2026-04-11)

**Decision:** Start with Google Analytics free tier as Stage 1 POC.

**Rationale:**
- One-line embed, zero infra needed
- Gets data flowing immediately
- Free forever
- Good resume skill
- Stage 2: Build custom serverless tracker later as learning project

**Constraints Met:**
- ✅ No backend infrastructure
- ✅ No cost
- ✅ Simple to set up
- ✅ IP exclusion capability
- ✅ Geo data included

**What We're Measuring:**
- Visit count (minus your IPs)
- Geographic origin
- Referrer source (which apps/contexts drive traffic)
- Page hits (nice-to-have for future)
