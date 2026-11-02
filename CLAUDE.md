# Daniela Castro — Portfolio

Personal portfolio of Daniela (Dani) Castro, Senior Product Designer (Vienna, from Costa Rica).
Stack: Astro 5 (static), GSAP (ScrollTrigger), Lenis smooth scroll.
The UI is an exact copy of the Figma Site published at www.danielacastrodesign.com — that site is the design reference.
Deployed to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.
GitHub user: `danielacastroram`, repo: `portfolio`.

## Commands
- `npm run dev` → http://localhost:4321
- `npm run build` → must pass before committing
- Test the deployed base path locally: `BASE_PATH=/portfolio npm run build && BASE_PATH=/portfolio npm run preview`

## Structure
- `src/data/site.ts` — name, email, links, experience, fun facts, and the `url()` helper
- `src/content/work/*.md` — case studies (front matter: title, tagline, order, cover, accent, accentInk, role, year, team, platform, summary)
- `src/components/` — Hero, Work, Experience, About, Contact, Nav
- `src/pages/work/[slug].astro` — case study template
- `src/scripts/motion.ts` — ALL interactions live here
- `src/styles/global.css` — tokens in `:root`
- `public/images/` — images taken from the published design (covers, avatar, fact illustrations, shapes, icons)

## Rules
- **Always build internal links and asset paths with `url()`** from `src/data/site.ts` (site runs under `/portfolio` on GitHub Pages). In Markdown, write images as `images/file.png` (no leading slash); a remark plugin adds the base.
- **Motion must respect `prefers-reduced-motion`.** Content must be visible and usable without JS. Elements hidden before animating use CSS scoped to `.motion` (set in `Base.astro` only when motion is allowed).
- New per-page animations go inside `initPage()` in `motion.ts` (within the `gsap.context`). Anything with listeners must push a cleanup into `cleanups`. Persisted elements (nav, cursor, progress) are set up once.
- Pages use Astro's `<ClientRouter />` (view transitions). Cover images share `transition:name="cover-<id>"` between card and case study; keep that pairing.
- **Layout = three fixed-width frames, like the design:** 375px (mobile), 800px (from 800px wide), 1280px (from 1280px). Use `.frame`; positions and sizes are the design's own pixel values per frame.
- Motion is limited to what the design does: smooth scroll, headline line reveal, 40px fade-up (`data-reveal`). Don't add cursor effects, magnetic hovers, marquees or draggable cards.
- Check mobile (390px wide) for every change: no horizontal scroll.

## Design language
- Style: refined and editorial, playful brand accents. Motion is smooth and purposeful (expo/power3 easing, ~1–1.6s reveals), never gimmicky.
- Colours: ink `#0a0a0a`, paper `#fff`, orange `#ff6816`, green `#49cc8b`, lilac `#d5ccf7`, soft `#f8f8f8`, muted `#a7a7a7`.
- Type: Bricolage Grotesque variable at `opsz 96, wdth 88` (display; set globally on `html`), Archivo Narrow (body), Lisu Bosa 200 (serif, project titles). Self-hosted via @fontsource.
- Signature shapes: orange 4-point star, green starburst, and the green/orange/lilac (or black) blob-square-circle trio used in nav and footer.

## Open to-dos
- Replace `public/og.png`; add `public/cv.pdf`
- Write the four case studies (GoStudent, Lutz, Mimo, Daniillustrates)
- Later: custom domain www.danielacastrodesign.com → set `BASE_PATH: /` and `SITE_URL` in deploy.yml
- Optional: dark mode
