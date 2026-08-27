/* ===================================================================
   PROLEGAL — JASA PELAPORAN LKPM
   Mobile nav, dropdown accordion, header state, grouped scroll-reveal
   =================================================================== */
(function () {
  'use strict';

  /* ---------- 1. MOBILE NAV TOGGLE ---------- */
  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');

  function closeNav() {
    header.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.has-dropdown.is-open').forEach(function (li) {
      li.classList.remove('is-open');
    });
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Close mobile menu on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  // Close mobile menu if resized back to desktop width
  var mq = window.matchMedia('(min-width: 960px)');
  mq.addEventListener('change', function (e) {
    if (e.matches) closeNav();
  });

  /* ---------- 2. DROPDOWN ACCORDION (mobile) / HOVER (desktop) ---------- */
  document.querySelectorAll('.has-dropdown').forEach(function (item) {
    var toggle = item.querySelector('.dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function (e) {
      // Only intercept as accordion when the mobile panel is open
      if (header.classList.contains('nav-open')) {
        e.preventDefault();
        var willOpen = !item.classList.contains('is-open');
        document.querySelectorAll('.has-dropdown.is-open').forEach(function (other) {
          if (other !== item) other.classList.remove('is-open');
        });
        item.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', String(willOpen));
      }
    });
  });

  // Close mobile nav when a real link inside it is followed
  document.querySelectorAll('.main-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (header.classList.contains('nav-open')) closeNav();
    });
  });

  /* ---------- 3. HEADER SCROLL STATE ---------- */
  var lastScrolled = false;
  function onScroll() {
    var scrolled = window.scrollY > 8;
    if (scrolled !== lastScrolled) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. GROUPED SCROLL-REVEAL ----------
     Reveal elements grouped by their nearest [data-reveal-group]
     ancestor so siblings inside the same row/grid always animate
     in DOM order (left→right / top→bottom) instead of racing each
     other based on which one happened to cross the viewport edge
     first — consistent behaviour on both mobile and desktop.
  ------------------------------------------------------------------ */
  var STAGGER_MS = 90;
  var MAX_STAGGER_STEPS = 7;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealItems(items) {
    items.forEach(function (el, i) {
      var delay = Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS;
      el.style.setProperty('--reveal-delay', delay + 'ms');
    });
    requestAnimationFrame(function () {
      items.forEach(function (el) { el.classList.add('is-visible'); });
    });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    // Show everything immediately, no motion / no observer support
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    // A) Grouped containers: children stagger in DOM order together
    var groupObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var group = entry.target;
        var items = Array.prototype.slice
          .call(group.querySelectorAll('[data-reveal]'))
          .filter(function (el) {
            // Only claim items whose nearest reveal-group ancestor is *this* group
            return el.closest('[data-reveal-group]') === group;
          });
        revealItems(items);
        obs.unobserve(group);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('[data-reveal-group]').forEach(function (g) {
      groupObserver.observe(g);
    });

    // B) Orphan [data-reveal] elements not inside any group: reveal individually
    var soloObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealItems([entry.target]);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (!el.closest('[data-reveal-group]')) {
        soloObserver.observe(el);
      }
    });
  }
})();
