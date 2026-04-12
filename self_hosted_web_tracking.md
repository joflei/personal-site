# Self-Hosted Web Tracking (Basic Starter Guide)

## Objective

Create a simple, self-hosted web tracking mechanism to monitor website
traffic without relying on third-party analytics tools.

------------------------------------------------------------------------

## Concept Overview

**Flow:** 1. Visitor loads your website 2. Frontend script sends
tracking data to your server 3. Backend logs the request 4. Data is
stored for analysis

------------------------------------------------------------------------

## Minimal Backend (Node.js + Express)

``` js
const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

app.post('/track', (req, res) => {
  const log = {
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
    page: req.body.page,
    referrer: req.body.referrer
  };

  fs.appendFileSync('logs.json', JSON.stringify(log) + '\n');
  res.sendStatus(200);
});

app.listen(3000, () => console.log('Tracking server running on port 3000'));
```

------------------------------------------------------------------------

## Frontend Tracking Script

``` html
<script>
(async () => {
  try {
    await fetch('https://yourdomain.com/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        referrer: document.referrer
      })
    });
  } catch (e) {
    console.error('Tracking failed', e);
  }
})();
</script>
```

------------------------------------------------------------------------

## Data Captured

-   Page visited
-   Referrer (traffic source)
-   Timestamp
-   IP address (approximate location)
-   Browser/device (user agent)

------------------------------------------------------------------------

## Optional Enhancements

### 1. Session Tracking

``` js
localStorage.setItem('sid', localStorage.getItem('sid') || crypto.randomUUID());
```

Include in payload:

``` js
sid: localStorage.getItem('sid')
```

------------------------------------------------------------------------

### 2. Event Tracking (Clicks)

``` js
document.addEventListener('click', (e) => {
  fetch('/track', {
    method: 'POST',
    body: JSON.stringify({
      type: 'click',
      target: e.target.tagName
    })
  });
});
```

------------------------------------------------------------------------

### 3. Database Upgrade

Replace file logging with: - SQLite (simple, local) - PostgreSQL
(scalable)

------------------------------------------------------------------------

## Basic Analytics You Can Compute

-   Daily traffic volume
-   Unique visitors (IP or session-based)
-   Most visited pages
-   Traffic sources

------------------------------------------------------------------------

## Privacy Considerations

-   Display cookie/privacy notice if required
-   Avoid storing full IP addresses if possible
-   Consider hashing identifiers

------------------------------------------------------------------------

## Limitations

Compared to tools like Google Analytics:

-   No built-in dashboards
-   Limited attribution tracking
-   No automatic bot filtering
-   No cross-device tracking

------------------------------------------------------------------------

## When This Is Useful

-   Personal projects
-   MVPs
-   Internal tools
-   Learning analytics fundamentals

------------------------------------------------------------------------

## Suggested Next Steps

-   Add a database layer
-   Build a simple dashboard (charts, summaries)
-   Filter bots and duplicate traffic
-   Deploy backend securely (HTTPS, rate limiting)

------------------------------------------------------------------------

## Prompt Example (for AI coding tools)

"Create a lightweight analytics service using Express and SQLite that
tracks page views, sessions, and basic traffic metrics with a simple
dashboard."
