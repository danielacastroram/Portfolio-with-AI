# Daniela Castro — Portfolio

Built with [Astro](https://astro.build), [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering). Deploys to GitHub Pages on every push to `main`.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:4321
```

## Where things live

| What | File |
| --- | --- |
| Name, email, links, experience, fun facts | `src/data/site.ts` |
| Case studies (one Markdown file each) | `src/content/work/*.md` |
| Images | `public/images/` |
| CV | `public/cv.pdf` (add yours) |
| Colors, fonts | `src/styles/global.css` (`:root`) |
| All interactions | `src/scripts/motion.ts` |

### Images

All images in `public/images/` come from the published design at danielacastrodesign.com. To change a cover, drop the new file in and update `cover:` in the matching `src/content/work/*.md`. Add a 1200×630 `public/og.png` for link previews.

### Writing a case study

Edit the Markdown under `src/content/work/`. Front matter controls the title, tagline, cover, accent color, and the Role / Year / Team / Platform row. In the body:

- `## Heading` for sections
- `> quote` renders as a big editorial callout
- `![alt](images/your-file.png)` for images (no leading slash)

To add a project, copy one of the files and give it a new `order`.

## Interactions

The layout and type match the Figma design exactly (three fixed-width frames: 375 / 800 / 1280px). Motion is kept to smooth scrolling (Lenis), the headline's line-by-line reveal, a 40px fade-up as sections enter, the sticky Experience title, and image morphs between the home page and case studies. Everything respects `prefers-reduced-motion`.

## Deploying

The workflow in `.github/workflows/deploy.yml` builds and publishes to GitHub Pages.

1. Create a repo called `portfolio` on GitHub and push this folder.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. The site appears at `https://danielacastroram.github.io/portfolio/`.

**Custom domain:** in Settings → Pages add `www.danielacastrodesign.com`, follow GitHub's DNS steps, then in `deploy.yml` set `BASE_PATH: /` and `SITE_URL: https://www.danielacastrodesign.com`.
