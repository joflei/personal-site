# Geoffrey Rugarabamu — Personal Website

A personal brand site built with [Astro](https://astro.build) and Tailwind CSS. Static, fast, and deployed via GitHub Pages.

## Quick Start

```bash
npm install
npm run dev
```

The site will be running at `http://localhost:4321`.

## Project Structure

```
src/
├── components/       # Reusable UI components (Nav, Footer, cards)
├── config/
│   └── navigation.ts # ⭐ Page toggle config — enable/disable pages here
├── layouts/
│   └── BaseLayout.astro
├── pages/            # Each file = one page route
│   ├── index.astro   # Home
│   ├── about.astro
│   ├── experience.astro
│   ├── contact.astro
│   ├── writing.astro  # Built but hidden from nav
│   └── projects.astro # Built but hidden from nav
└── styles/
    └── global.css
```

## Enable / Disable Pages

Open `src/config/navigation.ts`. Each page has an `enabled` flag:

```ts
{ label: 'Writing', href: '/writing', enabled: false },
```

Change `false` to `true` and the page appears in the navigation. That's it.

## Swap the Headshot

Replace the file at `public/images/headshot.jpg` with your photo. Recommended size: at least 500×500px, square crop.

## Add a Blog Post

1. Enable the Writing page in `navigation.ts` (set `enabled: true`).
2. Open `src/pages/writing.astro`.
3. Add a new entry to the `posts` array, or create individual post pages under `src/pages/writing/`.

## Add a Project

1. Enable the Projects page in `navigation.ts` (set `enabled: true`).
2. Open `src/pages/projects.astro`.
3. Add a new entry to the `projects` array.

## Deploy to GitHub Pages

Deployment is automated via GitHub Actions. Every push to `main` triggers a build and deploy.

### First-time setup:

1. Create a **private** GitHub repository (e.g., `geoffreyrugarabamu.github.io` for a user site, or any name for a project site).
2. Push this code to the repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to **Settings → Pages** in your GitHub repo.
4. Under **Source**, select **GitHub Actions**.
5. The workflow at `.github/workflows/deploy.yml` will handle the rest.
6. Your site will be live at `https://YOUR_USERNAME.github.io/` (for user sites) or `https://YOUR_USERNAME.github.io/YOUR_REPO/` (for project sites).

### Connect a custom domain (rugarabamu.ai):

1. In your GitHub repo, go to **Settings → Pages → Custom domain**.
2. Enter `rugarabamu.ai` and click Save.
3. In your domain registrar (Spaceship, Porkbun, etc.), add these DNS records:
   - **A records** (for apex domain `rugarabamu.ai`):
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - **CNAME record** (for `www.rugarabamu.ai`):
     ```
     YOUR_USERNAME.github.io
     ```
4. Wait for DNS propagation (can take up to 24 hours, usually much faster).
5. Back in GitHub Pages settings, check **Enforce HTTPS** once the certificate is provisioned.
6. Update `astro.config.mjs` to set `site: 'https://rugarabamu.ai'`.

## Build for Production

```bash
npm run build    # Output in ./dist
npm run preview  # Preview the build locally
```

## Tech Stack

- **Framework**: [Astro](https://astro.build) (static site, zero JS by default)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Fonts**: Source Serif 4 + DM Sans (Google Fonts)
- **Hosting**: GitHub Pages (free, works with private repos)
