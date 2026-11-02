/**
 * All site interactions live here.
 * - Runs once for things that persist across page navigations (smooth scroll).
 * - Re-runs per page on `astro:page-load`, and cleans up on `astro:before-swap`.
 * - Respects prefers-reduced-motion: content is visible and functional, just not animated.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T & Element>(sel)) as unknown as T[];

/* ---------------------------------------------------------------- once ---- */

let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, anchors: { offset: -40 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------ per page ---- */

let ctx: gsap.Context | null = null;
let cleanups: Array<() => void> = [];

function initPage() {
  if (reduced) return;
  lenis?.resize();

  ctx = gsap.context(() => {
    /* Hero intro: headline lines rise out of a mask, the rest fades in */
    if (document.querySelector('[data-hero]')) {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
      tl.fromTo('.hero .line-inner', { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.4, stagger: 0.09 })
        .fromTo('[data-hero-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.5);
    }

    /* Fade-up 40px as blocks scroll into view (as in the design) */
    $$<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%' },
      });
    });

    /* Case study body: each block fades up */
    $$<HTMLElement>('[data-prose] > *').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

function destroyPage() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  ctx?.revert();
  ctx = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

document.addEventListener('astro:page-load', initPage);
document.addEventListener('astro:before-swap', destroyPage);
document.addEventListener('astro:after-swap', () => {
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
});
