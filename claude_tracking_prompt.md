# Prompt: Build a Self-Hosted Web Tracking System

## Objective

Create a lightweight, self-hosted web analytics system that tracks
website traffic without relying on third-party services.

------------------------------------------------------------------------

## Requirements

### Core Functionality

-   Track page visits
-   Capture:
    -   Page URL/path
    -   Referrer
    -   Timestamp
    -   User agent (browser/device)
    -   IP address (or anonymized version)

------------------------------------------------------------------------

## Backend Specifications

-   Use Node.js with Express
-   Create a POST endpoint at `/track`
-   Accept JSON payloads from the frontend
-   Log each request to:
    -   Option A: a JSON log file
    -   Option B: a SQLite database (preferred for scalability)
-   Ensure:
    -   Fast response (non-blocking if possible)
    -   Basic error handling

------------------------------------------------------------------------

## Frontend Specifications

-   Provide a minimal JavaScript snippet that:
    -   Runs on page load
    -   Sends a POST request to `/track`
    -   Includes:
        -   `window.location.pathname`
        -   `document.referrer`

------------------------------------------------------------------------

## Enhancements (Include but keep simple)

### Session Tracking

-   Generate a session ID using `localStorage`
-   Attach session ID to each request

### Event Tracking

-   Capture basic click events
-   Send event type and target element

------------------------------------------------------------------------

## Data Storage

-   Start with file-based logging (`logs.json`)
-   Structure logs as newline-delimited JSON
-   Make it easy to upgrade to a database later

------------------------------------------------------------------------

## Analytics Outputs

Provide simple examples or scripts to compute: - Total visits - Unique
visitors (by session or IP) - Most visited pages - Traffic sources

------------------------------------------------------------------------

## Privacy Considerations

-   Include notes on:
    -   GDPR/CCPA awareness
    -   Avoiding full IP storage (optional hashing)
    -   Transparency (cookie notice)

------------------------------------------------------------------------

## Constraints

-   Keep implementation minimal and easy to understand
-   Avoid external analytics libraries
-   Avoid unnecessary dependencies
-   Code should be readable and modular

------------------------------------------------------------------------

## Deliverables

1.  Backend code (Express server)
2.  Frontend tracking snippet
3.  Example log format
4.  Optional: basic query examples or scripts
5.  Clear instructions for running locally

------------------------------------------------------------------------

## Stretch Goal (Optional)

-   Add a simple dashboard (HTML page) that:
    -   Displays total visits
    -   Lists top pages
    -   Shows basic trends

------------------------------------------------------------------------

## Output Format

-   Return everything in clean, well-structured Markdown
-   Use code blocks for all code
-   Include section headers and brief explanations
-   Keep tone practical and implementation-focused

------------------------------------------------------------------------

## Example Invocation

"Build a minimal self-hosted analytics system using Node.js and Express
with file-based logging, session tracking, and a frontend script. Output
everything in a clean Markdown developer guide."
