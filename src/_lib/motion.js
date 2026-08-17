/**
 * Shared motion system.
 *
 * Loaded as a classic script after gsap, ScrollTrigger, SplitText and Lenis.
 * Pages describe what they want with data attributes rather than each one
 * shipping its own animation code — the same reason the design tokens live in
 * one place. Adding a reveal to a new section is one attribute, and the timing,
 * easing and reduced-motion behaviour come with it.
 *
 *   data-reveal              fade and rise on enter
 *   data-reveal="lines"      split into lines and wipe each out from a mask
 *   data-reveal="chars"      per-character, for short display type only
 *   data-reveal="clip"       reveal by animating a clip-path, for images
 *   data-stagger="0.08"      gap between children or split pieces, seconds
 *   data-delay="0.2"         delay before the reveal starts, seconds
 *   data-parallax="-0.15"    fraction of scroll distance to offset by
 *   data-pin                 pin this element while its section scrolls past
 *   data-count="4200"        count a number up when it enters
 *
 * ── The two rules this file exists to enforce ──────────────────────────────
 *
 * 1. Nothing is hidden unless it will definitely be revealed. The `has-motion`
 *    class that hides elements is set by a boot snippet in <head> that also
 *    arms a timer to remove it again; this file clears that timer. So if GSAP
 *    fails to load, or throws, or the browser is too old, the timer fires and
 *    the page shows its content. A reveal system that can hide content
 *    permanently is worse than no reveal system.
 *
 * 2. Reduced motion is honoured before anything is measured, not by shortening
 *    durations afterwards. The boot snippet never adds `has-motion` when the
 *    user prefers reduced motion, so this file returns early and the page is a
 *    static document — no Lenis, no ScrollTrigger, no split text.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  // Whatever happens below, the page must not stay hidden.
  if (window.__motionFallback) clearTimeout(window.__motionFallback);

  var reduced = !root.classList.contains('has-motion');
  var missing = !window.gsap || !window.ScrollTrigger;

  if (reduced || missing) {
    // Reduced motion, or the libraries did not arrive. Either way the document
    // stands on its own: drop the flag so the CSS start-states stop applying.
    root.classList.remove('has-motion');
    root.classList.add('motion-off');
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var SplitText = window.SplitText;

  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  /* ── Smooth scroll ───────────────────────────────────────────────────────
   *
   * Lenis replaces the browser's scroll stepping with an interpolated value.
   * Two things make it safe rather than the scroll-hijacking that gives this
   * pattern a bad name:
   *
   *   - `syncTouch` is left off, so touch devices keep their native scrolling.
   *     Momentum on a phone is the platform's job and it already feels right.
   *   - It drives from gsap.ticker rather than its own requestAnimationFrame,
   *     so scroll interpolation and every animation advance on the same frame.
   *     Two independent rAF loops is what makes a Lenis site judder.
   */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.05,
      // Expo-out. Long tail, so a flick settles rather than stopping dead.
      easing: function (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      },
      wheelMultiplier: 1,
      syncTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // An interpolated scroll position breaks any in-page anchor that relies on
    // native behaviour, including the skip link. Hand those to Lenis.
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: -24 });

      // Moving the scroll position is not moving focus. Without this the skip
      // link scrolls the page and leaves the keyboard where it was, which is
      // the exact failure the skip link exists to prevent.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ── Reveals ─────────────────────────────────────────────────────────────
   *
   * `once: true` throughout. Re-animating on the way back up is the single
   * most common complaint about scroll reveals: it makes re-reading a page
   * feel broken, and it means content is hidden again on a scroll direction
   * the reader did not choose.
   */
  var EASE = 'power3.out';
  var DURATION = 0.9;

  var num = function (el, name, fallback) {
    var raw = parseFloat(el.dataset[name]);
    return isNaN(raw) ? fallback : raw;
  };

  /**
   * Above the fold, animate on load. Below it, animate on scroll.
   *
   * This distinction is the whole difference between a hero that introduces
   * itself and one that sits there broken. A scroll trigger starting at
   * `top 85%` never fires for an element already sitting in the lower part of
   * the first screen — the reader would have to scroll to reveal content that
   * is *already in front of them*, and if the page is short enough that they
   * never scroll, it stays invisible for good. That is exactly what the hero
   * call-to-action buttons did before this split existed.
   *
   * So anything visible at load joins an intro timeline that simply plays, and
   * only content further down gets a ScrollTrigger.
   */
  var INTRO_DELAY = 0.1;

  var aboveFold = function (el) {
    var rect = el.getBoundingClientRect();
    // Measured from the document top rather than the current scroll position:
    // a reload restoring a mid-page scroll would otherwise classify whatever
    // happens to be on screen as "hero" and play it all at once.
    return rect.top + window.scrollY < window.innerHeight * 0.95;
  };

  /**
   * Attach an animation either to the intro timeline or to a scroll trigger.
   *
   * ── Why fromTo, and never from ──────────────────────────────────────────
   *
   * `gsap.from()` animates from the values given *to whatever the element
   * currently computes to*. The start-states in motion.css set `opacity: 0`,
   * so a `from({opacity: 0})` tween reads the end value as 0 as well and
   * animates 0 → 0: the element stays invisible, silently, and only on the
   * pages where the CSS matched. Worse, it depended on whether the tween was
   * built before or after the stylesheet applied, so it was intermittent.
   *
   * Naming both ends removes the dependency on CSS entirely. The stylesheet
   * prevents the flash before JavaScript runs; this decides the animation.
   */
  var reveal = function (el, targets, from, to, delay) {
    var end = Object.assign({ duration: DURATION, ease: EASE, overwrite: 'auto' }, to);

    if (aboveFold(el)) {
      // Standalone tweens with their own delay rather than positions on one
      // shared intro timeline.
      //
      // A timeline looks like the tidier way to sequence a hero, but it only
      // works if every tween is added before it starts playing — and the split
      // text ones cannot be. `autoSplit` deliberately waits for the webfonts,
      // because line breaks are not known until the real face has loaded, so
      // its onSplit callback fires well after the timeline has run to
      // completion. A tween added to a finished timeline never plays: that is
      // why the headline stayed masked while the paragraph beneath it worked.
      //
      // Delays give the same sequencing with no ordering hazard.
      end.delay = INTRO_DELAY + (delay || 0);
      return gsap.fromTo(targets, from, end);
    }

    end.scrollTrigger = { trigger: el, start: 'top 85%', once: true };
    return gsap.fromTo(targets, from, end);
  };

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var kind = el.dataset.reveal || 'fade';
    var delay = num(el, 'delay', 0);
    var stagger = num(el, 'stagger', 0.08);

    if (kind === 'lines' && SplitText) {
      // `mask: 'lines'` wraps each line so it can be wiped out from behind its
      // own edge rather than fading in place. `aria: 'auto'` puts the original
      // text on the parent as a label and hides the pieces, without which a
      // screen reader reads a line-broken heading one fragment at a time.
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        aria: 'auto',
        autoSplit: true, // re-split on resize; line breaks move when the box does
        onSplit: function (self) {
          return reveal(
            el,
            self.lines,
            { yPercent: 110 },
            { yPercent: 0, stagger: stagger },
            delay,
          );
        },
      });
      return;
    }

    if (kind === 'chars' && SplitText) {
      SplitText.create(el, {
        type: 'chars',
        aria: 'auto',
        onSplit: function (self) {
          return reveal(
            el,
            self.chars,
            { yPercent: 60, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.6,
              stagger: Math.min(stagger, 0.03),
            },
            delay,
          );
        },
      });
      return;
    }

    if (kind === 'clip') {
      reveal(
        el,
        el,
        { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.08 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.15, ease: 'power2.out' },
        delay,
      );
      return;
    }

    // 'fade' — the default. Applied to children when there are several, so a
    // list staggers without every item needing its own attribute.
    var targets =
      el.children.length > 1 && el.hasAttribute('data-stagger') ? el.children : el;

    reveal(el, targets, { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: stagger }, delay);
  });

  /* ── Parallax ────────────────────────────────────────────────────────────
   *
   * Scrubbed against scroll rather than run on a timer, so it tracks the
   * reader's own movement exactly. The offset is a fraction of the element's
   * travel, which keeps the effect proportional at any viewport height —
   * a fixed pixel offset is subtle on a laptop and absurd on a tall monitor.
   */
  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    var amount = num(el, 'parallax', -0.15);
    gsap.to(el, {
      yPercent: amount * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* ── Pinning ─────────────────────────────────────────────────────────── */
  document.querySelectorAll('[data-pin]').forEach(function (el) {
    var section = el.closest('[data-pin-section]') || el.parentElement;
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: el,
      pinSpacing: false,
    });
  });

  /* ── Counters ────────────────────────────────────────────────────────────
   *
   * The final value is in the HTML as text, so a reader without any of this
   * still sees the real number. The animation overwrites it and puts it back.
   */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = num(el, 'count', 0);
    var decimals = (el.dataset.countDecimals || '0') | 0;
    var prefix = el.dataset.countPrefix || '';
    var suffix = el.dataset.countSuffix || '';
    var state = { value: 0 };

    gsap.to(state, {
      value: end,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: trigger(el),
      onUpdate: function () {
        el.textContent = prefix + state.value.toFixed(decimals) + suffix;
      },
    });
  });

  /* ── Header behaviour ────────────────────────────────────────────────────
   *
   * Condense on scroll, and hide when moving down / show when moving up. The
   * hide is skipped near the top of the page and whenever focus is inside the
   * header, so tabbing into the navigation cannot scroll it out of view.
   */
  var header = document.querySelector('[data-header]');
  if (header) {
    var last = 0;
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: function (self) {
        var y = self.scroll();
        header.classList.toggle('is-condensed', y > 80);
        if (header.contains(document.activeElement)) {
          header.classList.remove('is-hidden');
        } else {
          header.classList.toggle('is-hidden', y > last && y > 300);
        }
        last = y;
      },
    });
  }

  // Split text and webfont swaps both change line boxes after the triggers
  // were measured. Recalculating once the fonts are in place stops every
  // trigger below the fold from firing at the wrong scroll position.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      ScrollTrigger.refresh();
    });
  }

  root.classList.add('motion-ready');
})();
