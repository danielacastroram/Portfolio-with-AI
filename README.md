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

### Swapping in your images

1. Drop files into `public/images/` (e.g. `gostudent-cover.png`).
2. Update `cover:` in the matching `src/content/work/*.md`.
3. Replace `public/images/avatar.svg` with your photo (e.g. `avatar.jpg`) and update the path in `src/components/Hero.astro`.
4. Add a 1200×630 `public/og.png` for link previews.

### Writing a case study

Edit the Markdown under `src/content/work/`. Front matter controls the title, tagline, cover, accent color, and the Role / Year / Team / Platform row. In the body:

- `## Heading` for sections
- `> quote` renders as a big editorial callout
- `![alt](images/your-file.png)` for images (no leading slash)

To add a project, copy one of the files and give it a new `order`.

## Interactions

- Smooth scrolling (Lenis) and a scroll-progress bar
- Hero: masked line-by-line headline reveal, pointer-reactive star and burst
- Custom cursor that becomes a colored "View case" label on projects
- Magnetic nav, buttons and links
- Project images open from a rounded window, with parallax inside the frame
- Section titles rise word by word; intro paragraph lights up as you read
- Experience rules draw in; rows highlight on hover
- Fact cards are draggable stickers with inertia (desktop) or a swipe row (touch)
- Velocity-reactive "Want to say hello?" marquee; click-to-copy email
- Page transitions: the project image morphs into the case-study hero (View Transitions)
- Everything respects `prefers-reduced-motion`

## Deploying

The workflow in `.github/workflows/deploy.yml` builds and publishes to GitHub Pages.

1. Create a repo called `portfolio` on GitHub and push this folder.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. The site appears at `https://danielacastroram.github.io/portfolio/`.

**Custom domain:** in Settings → Pages add `www.danielacastrodesign.com`, follow GitHub's DNS steps, then in `deploy.yml` set `BASE_PATH: /` and `SITE_URL: https://www.danielacastrodesign.com`.
