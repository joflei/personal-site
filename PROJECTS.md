# Projects Inventory

## Published Projects

### 1. Necta Exam Data Explorer
**Location**: `public/necta/necta-explorer.html`
**Purpose**: Interactive visualization and analysis tool for Tanzanian national exam (CSEE) data.
**Features**:
- Dynamic charts (necta-charts.js)
- Data queries and filtering
- Trend analysis
- Responsive styling (necta-styles.css)
- Embedded data (public/necta/data/)

**Files**:
- `necta-explorer.html` — main interactive interface
- `necta-charts.js` — charting logic
- `necta-styles.css` — styles
- `data/` — CSV datasets

**Link on site**: `/projects` → points to this

### 2. CSEE Trend Analysis
**Location**: `public/projects/necta-exam-pulse/csee-trend.html`
**Purpose**: Historical trend analysis for CSEE exam performance.
**Type**: Static HTML explorer with embedded analysis.

**Relative link path**: From public files use `../../projects`

---

## Future/Planned Projects

Document new projects here as you add them.

**Template**:
```
### Project Name
Location: public/projects/{slug}/
Purpose: [what it does]
Status: [Draft/In Progress/Published]
Notes: [key details]
```

---

## Project Naming Convention
- Slugs: kebab-case (e.g., `necta-exam-pulse`)
- Folders: `public/projects/{slug}/`
- Static files: Keep relative links intact
- Entry point: index.html or main HTML file named after project

## Adding a New Project
1. Create folder in `public/projects/{slug}/`
2. Build static HTML (use relative paths for internal links)
3. Add entry above with location and purpose
4. Link from projects page (`src/pages/projects.astro`)
