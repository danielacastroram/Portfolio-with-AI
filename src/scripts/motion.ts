/**
 * All site interactions live here.
 * - Runs once for things that persist across page navigations (smooth scroll, cursor, nav, progress).
 * - Re-runs per page on `astro:page-load`, and cleans up on `astro:before-swap`.
 * - Respects prefers-reduced-motion: content is visible and functional, just not animated.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

const mq = (q: string) => window.matchMedia(q).matches;
const reduced = mq('(prefers-reduced-motion: reduce)');
const finePointer = mq('(hover: hover) and (pointer: fine)');
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

// Scroll progress + hide nav on scroll down
{
  const bar = document.querySelector<HTMLElement>('.progress span');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (nav) nav.classList.toggle('is-hidden', y > lastY && y > 200);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('astro:page-load', onScroll);
}

// Custom cursor (mouse / trackpad only)
const cursor = document.querySelector<HTMLElement>('[data-cursor-el]');
const cursorLabel = document.querySelector<HTMLElement>('[data-cursor-label]');
const resetCursor = () => cursor?.classList.remove('is-label', 'is-link', 'is-hidden');
if (cursor && cursorLabel && finePointer) {
  document.documentElement.classList.add('has-cursor');
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  let current: Element | null = null;

  window.addEventListener('pointermove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
    const t = (e.target as Element).closest?.('[data-cursor-hide],[data-cursor-label],a,button,[data-fact]') ?? null;
    if (t === current) return;
    current = t;
    resetCursor();
    if (!t) return;
    if (t.hasAttribute('data-cursor-hide')) return cursor.classList.add('is-hidden');
    const label = t.getAttribute('data-cursor-label');
    if (label) {
      const cs = getComputedStyle(t);
      cursor.style.setProperty('--cursor-bg', cs.getPropertyValue('--cursor-bg').trim() || '#0a0a0a');
      cursor.style.setProperty('--cursor-ink', cs.getPropertyValue('--cursor-ink').trim() || '#fff');
      cursorLabel.textContent = label;
      cursor.classList.add('is-label');
    } else {
      cursor.classList.add('is-link');
    }
  });
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.addEventListener('astro:after-swap', () => { current = null; resetCursor(); });
}

/* ------------------------------------------------------------- helpers ---- */

/** Wrap every word of an element in spans, keeping <br> and inline elements. */
function splitWords(el: HTMLElement, outer = 'w', inner = 'wi') {
  if (el.dataset.splitDone) return $$<HTMLElement>(`.${inner}`, el);
  el.setAttribute('aria-label', el.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(' ');
          const o = document.createElement('span');
          o.className = outer;
          o.setAttribute('aria-hidden', 'true');
          const i = document.createElement('span');
          i.className = inner;
          i.textContent = part;
          o.append(i);
          frag.append(o);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
  el.dataset.splitDone = '1';
  return $$<HTMLElement>(`.${inner}`, el);
}

/** Elements drift toward the pointer and spring back on leave. */
function magnetic(el: HTMLElement) {
  if (el.dataset.magInit) return;
  el.dataset.magInit = '1';
  const strength = parseFloat(el.dataset.magneticStrength || '0.35');
  const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  });
  el.addEventListener('pointerleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
  });
}

/* ------------------------------------------------------------ per page ---- */

let ctx: gsap.Context | null = null;
let cleanups: Array<() => void> = [];

function initPage() {
  // Things that work regardless of motion preference
  $$<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const toast = btn.querySelector<HTMLElement>('.email__toast');
    const onClick = async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy!);
        if (toast) toast.textContent = 'Copied to clipboard';
        btn.classList.add('is-copied');
        setTimeout(() => btn.classList.remove('is-copied'), 1800);
      } catch {
        window.location.href = `mailto:${btn.dataset.copy}`;
      }
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  if (finePointer) $$('[data-magnetic]').forEach(magnetic);

  if (reduced) return;
  lenis?.resize();

  ctx = gsap.context(() => {
    /* Hero intro */
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    if (hero) {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
      tl.fromTo('.hero .line-inner', { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.5, stagger: 0.09 })
        .fromTo('[data-hero-star]', { scale: 0, rotation: -180, opacity: 1 }, { scale: 1, rotation: 0, duration: 1.3, ease: 'back.out(2)' }, 0.5)
        .fromTo('[data-hero-avatar]', { scale: 0, rotation: -50 }, { scale: 1, rotation: -6, duration: 1.2, ease: 'back.out(2.2)' }, 0.75)
        .fromTo('[data-hero-burst]', { scale: 0, opacity: 1 }, { scale: 1, duration: 1.6, ease: 'elastic.out(1, 0.55)' }, 0.8)
        .fromTo('[data-hero-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.7);

      // Decorations follow the pointer at different depths
      if (finePointer) {
        const floats = $$<HTMLElement>('[data-float]', hero).map((el) => ({
          depth: parseFloat(el.dataset.float || '1'),
          x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }),
          y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' }),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          floats.forEach((f) => { f.x(nx * 40 * f.depth); f.y(ny * 40 * f.depth); });
        };
        window.addEventListener('pointermove', onMove);
        cleanups.push(() => window.removeEventListener('pointermove', onMove));
      }

      // Title drifts up and softens as you leave the hero
      gsap.to('.hero__title', {
        yPercent: -14, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    /* Section titles: words rise out of a mask */
    $$<HTMLElement>('[data-split]').forEach((el) => {
      const words = splitWords(el);
      gsap.fromTo(words, { yPercent: 115 }, {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    /* Generic fade-up */
    $$<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 32 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    /* Project images: open from a smaller rounded window */
    $$<HTMLElement>('[data-clip]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen (e.g. coming back)
      gsap.fromTo(el,
        { clipPath: 'inset(14% 12% 14% 12% round 40px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.6, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%' } });
    });

    /* Image parallax inside its frame */
    $$<HTMLElement>('[data-parallax]').forEach((img) => {
      const frame = img.parentElement!;
      if (img.dataset.parallax === 'soft') {
        gsap.to(img, { scale: 1.08, ease: 'none', scrollTrigger: { trigger: frame, start: 'top top', end: 'bottom top', scrub: true } });
      } else {
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
    });

    /* Read-along paragraph: words light up as you scroll */
    $$<HTMLElement>('[data-read]').forEach((el) => {
      const words = splitWords(el, 'rw', 'rwi');
      gsap.fromTo(words, { opacity: 0.14 }, {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      });
    });

    /* Experience: rules draw in, rows follow */
    $$<HTMLElement>('[data-exp]').forEach((list) => {
      const rows = $$<HTMLElement>('.exp__row', list);
      const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 80%' } });
      tl.fromTo(rows.map((r) => r.querySelector('.exp__line')), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut', stagger: 0.07 })
        .fromTo(rows.map((r) => Array.from(r.children).filter((c) => !c.classList.contains('exp__line'))),
          { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 }, 0.2);
    });

    /* Fact stickers: pop in, then draggable with inertia on desktop */
    $$<HTMLElement>('[data-facts]').forEach((wrap) => {
      const cards = $$<HTMLElement>('[data-fact]', wrap);
      gsap.fromTo(cards, { scale: 0.6, opacity: 0, rotation: () => gsap.utils.random(-20, 20) }, {
        scale: 1, opacity: 1, rotation: 0, duration: 1, ease: 'back.out(1.8)', stagger: 0.1,
        scrollTrigger: { trigger: wrap, start: 'top 80%' },
      });
      if (finePointer && mq('(min-width: 960px)')) {
        let z = 10;
        const d = Draggable.create(cards, {
          bounds: wrap.closest('section') ?? wrap,
          inertia: true,
          edgeResistance: 0.75,
          onPress() { (this.target as HTMLElement).style.zIndex = String(++z); this.target.classList.add('is-dragging'); gsap.to(this.target, { scale: 1.06, duration: 0.3 }); },
          onRelease() { this.target.classList.remove('is-dragging'); gsap.to(this.target, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }); },
          onDrag() { gsap.to(this.target, { rotation: gsap.utils.clamp(-14, 14, this.deltaX * 0.6), duration: 0.4 }); },
          onThrowComplete() { gsap.to(this.target, { rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' }); },
        });
        cleanups.push(() => d.forEach((x) => x.kill()));
      }
    });

    /* Marquee: endless, speeds up and flips with scroll direction */
    $$<HTMLElement>('[data-marquee]').forEach((m) => {
      const track = m.querySelector<HTMLElement>('.marquee__track')!;
      const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        trigger: m, start: 'top bottom', end: 'bottom top',
        onUpdate(self) {
          const v = self.getVelocity() / 300;
          const dir = self.direction;
          gsap.to(loop, { timeScale: dir * Math.max(1, Math.min(Math.abs(v), 6)), duration: 0.3, overwrite: true });
          gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.3, overwrite: false });
        },
      });
    });

    /* Footer shapes rise as you reach the end */
    $$<HTMLElement>('[data-shapes]').forEach((s) => {
      gsap.fromTo(s.children, { yPercent: 100 }, {
        yPercent: 0, ease: 'none', stagger: 0.15,
        scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
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
