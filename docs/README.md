# Shiesuta — Website

This directory contains the website for **Shiesuta**, a modern Discord music bot powered by Kazagumo and Lavalink.

Built with **Tailwind CSS v4 + daisyUI 5** (via CDN — no build step required).

## Structure

```
docs/
├── index.html        # Landing page (Hero, Features, Commands, Setup, Footer)
├── terms.html        # Terms of Service
├── privacy.html      # Privacy Policy
├── theme.css         # Custom purple theme overrides (light/dark) + utilities
├── site.js           # Theme persistence (localStorage) for daisyUI theme-controller
├── og.webp           # Open Graph social preview image
├── hero.png          # Hero illustration
└── favicon.png       # Site favicon
```

## How to Deploy

### Option A — GitHub Pages from `docs/` folder

1. Push this `docs/` folder to your repository (typically on the `main` branch).
2. Go to **Settings → Pages** in your GitHub repo.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch` and select `main` with the `/docs` folder.
4. Save. Your site will be live at `https://<username>.github.io/<repo>/`.

> If your repository is named `<username>.github.io`, the site will be live at `https://<username>.github.io/`.

### Option B — Vercel / Netlify / any static host

The static files in `docs/` can be served by any static host. Just point the root to the `docs/` folder.

## Theme System

- Powered by **daisyUI 5** with two custom themes: `light` and `dark` (purple palette).
- Theme switching uses daisyUI's native **`theme-controller`** radio inputs — pure CSS via `:has()`, no JS needed for switching.
- `site.js` only persists the choice to `localStorage` and restores it before paint (FOUC prevention inline script in each `<head>`).
- Custom utilities in `theme.css`: `.text-gradient`, `.hero-glow`, `.float-anim`, `.reveal` (scroll-driven animations), `.legal` typography.

## Editing Content

- **Hero section**: Edit `<section class="hero ...">` in `index.html`.
- **Features**: Update the feature cards in the `#features` section.
- **Commands**: Update the command cards in the `#commands` section.
- **Setup steps**: Edit the `<ol class="steps ...">` list.
- **Theme colors**: Edit the `[data-theme="light"]` / `[data-theme="dark"]` blocks in `theme.css`.
- **Links**: Update Discord OAuth links, GitHub links, and support links throughout.

## Notes

- All internal paths are **relative** (required for GitHub Pages Project Pages).
- The Discord invite link uses the real application ID (`1549143093272645712`) with `bot` + `applications.commands` scopes.
