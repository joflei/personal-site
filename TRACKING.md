# Self-Hosted Web Tracking Infrastructure

## Overview
Lightweight, privacy-first analytics. Track traffic without third-party services. See `self_hosted_web_tracking.md` for full starter guide.

**Status**: Planned (not yet implemented)

---

## Implementation Plan

### Backend (Node.js + Express)
**Endpoint**: POST `/track`
**Accepts**: JSON payload with page, referrer, session ID

**Captures**:
- Page URL/path
- Referrer (traffic source)
- Timestamp (ISO 8601)
- User agent (browser/device)
- IP address (anonymized if possible)
- Session ID (localStorage-based)

**Storage Options** (in priority order):
1. SQLite database (local, scalable)
2. JSON log file (newline-delimited, simple)

### Frontend Tracking Script
Minimal JS snippet injected into site:
- Runs on page load
- Sends POST to `/track`
- Generates/persists session ID in localStorage
- Non-blocking (async/await)
- Graceful error handling

### Analytics Outputs
Compute from logs:
- Daily traffic volume
- Unique visitors (by session or IP)
- Most visited pages
- Traffic sources
- Referrer breakdown

---

## Privacy & Compliance

**Data Collection**:
- Avoid storing full IP (optional hashing)
- Session-based tracking preferred over IP-based
- Transparent to users (privacy notice/cookie banner)

**Considerations**:
- GDPR: User consent for tracking
- CCPA: Right to opt-out
- Minimal data retention (suggest 90 days)

---

## Deployment

**Local Dev**:
```bash
node server.js
# Listens on http://localhost:3000
```

**Production**:
- HTTPS only (no HTTP fallback)
- Rate limiting on `/track`
- CORS configured for your domain only
- Environment variables for secrets

---

## Related Files
- `self_hosted_web_tracking.md` — complete starter guide with code
- `claude_tracking_prompt.md` — AI coding prompt for building the system

---

## When to Build
- After site is stable and live
- Once you need traffic insights
- Future iteration (not in MVP)

---

## Integration with Site
1. Deploy tracking server (separate from main Astro site)
2. Add frontend script to BaseLayout
3. Create simple dashboard to view metrics
4. Set up log rotation/archival
