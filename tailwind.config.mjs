/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        sand: '#FAF6F1',
        'sand-dark': '#F0E8DD',
        espresso: '#2C2418',
        terracotta: '#B8652A',
        'terracotta-light': '#D4874A',
        sage: '#6B7F5E',
        'sage-light': '#8A9E7C',
        walnut: '#3A2E22',
        'warm-gray': '#8C7E72',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
