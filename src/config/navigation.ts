// ============================================================
// NAVIGATION CONFIGURATION
// ============================================================
// Toggle pages on/off by changing `enabled` to true or false.
// Only pages with `enabled: true` will appear in the site navigation.
// The page itself will still be accessible by URL even if disabled —
// this only controls whether it shows in the nav menu.
//
// Example: To enable the Writing page, change its `enabled` to `true`:
//   { label: 'Writing', href: '/writing', enabled: true },
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  enabled: boolean;
}

export const navigationItems: NavItem[] = [
  { label: 'Home',       href: '/',           enabled: true  },
  { label: 'About',      href: '/about',      enabled: true  },
  { label: 'Experience',  href: '/experience', enabled: true  },
  { label: 'Contact',    href: '/contact',    enabled: true  },

  // ----------------------------------------------------------
  // HIDDEN PAGES — built and routed, but not shown in nav yet.
  // Change `enabled` to `true` when you're ready to launch them.
  // ----------------------------------------------------------
  { label: 'Writing',    href: '/writing',    enabled: false },
  { label: 'Projects',   href: '/projects',   enabled: false },
];

export const siteConfig = {
  name: 'Geoffrey Rugarabamu',
  title: 'Geoffrey Rugarabamu — Data Governance & Analytics',
  description: 'I help organizations trust their data and make better decisions with it. Data governance strategist, analytics leader, and cross-functional partner.',
  url: 'https://joflei.github.io/personal-site',
  email: 'geoffrey.rugarabamu@gmail.com',
  linkedin: 'https://www.linkedin.com/in/geoffreyrugarabamu/',
};
