/* ============================================================
   RUGS DE INDISKA — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----------------------------------------------------------
     0 · Page loader
     ---------------------------------------------------------- */
  var loader = $('#loader');

  if (loader) {
    // proves the script is alive, which cancels the CSS failsafe in styles.css
    loader.classList.add('is-ready');

    var loaderShownAt = Date.now();
    var LOADER_MIN    = 550;   // don't let it flash on a warm cache
    var LEAVE_MS      = 420;   // time the exit animation gets before we navigate

    var hideLoader = function () {
      var wait = Math.max(0, LOADER_MIN - (Date.now() - loaderShownAt));
      window.setTimeout(function () {
        loader.classList.add('is-done');
        document.documentElement.classList.add('loaded');
      }, wait);
    };

    if (document.readyState === 'complete') hideLoader();
    else window.addEventListener('load', hideLoader);

    // Re-raise the overlay when leaving for another page on this site.
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.hasAttribute('download')) return;
      if (a.target && a.target !== '_self') return;

      var url;
      try { url = new URL(a.getAttribute('href'), location.href); } catch (_) { return; }

      // note: on file:// both origins read as "null", so this still matches
      if (url.origin !== location.origin) return;
      if (url.href === location.href) return;
      // in-page anchor — let the browser scroll, no overlay
      if (url.pathname === location.pathname && url.hash) return;

      e.preventDefault();
      loader.classList.remove('is-done');
      loader.classList.add('is-leaving');
      window.setTimeout(function () { location.href = url.href; }, LEAVE_MS);
    });

    // Restored from the back/forward cache: the overlay must not still be up.
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      loader.classList.remove('is-leaving');
      loader.classList.add('is-done');
      document.documentElement.classList.add('loaded');
    });
  }

  /* ----------------------------------------------------------
     1 · Header — shrink on scroll, hide on scroll-down
     ---------------------------------------------------------- */
  var header   = $('#siteHeader');
  var lastY    = window.scrollY;
  var headerUp = false;

  function updateHeader(y) {
    if (!header) return;

    header.classList.toggle('is-stuck', y > 60);

    // hide when scrolling down past the hero, reveal on the way back up
    var goingDown = y > lastY;
    var past      = y > 420;

    if (goingDown && past && !headerUp && !document.body.classList.contains('nav-open')) {
      header.classList.add('is-hidden');
      headerUp = true;
    } else if ((!goingDown || !past) && headerUp) {
      header.classList.remove('is-hidden');
      headerUp = false;
    }
    lastY = y;
  }

  /* ----------------------------------------------------------
     2 · Mobile navigation
     ---------------------------------------------------------- */
  var burger = $('#burger');
  var nav    = $('#primaryNav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-open', open);
      if (open) header.classList.remove('is-hidden');
    });

    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ----------------------------------------------------------
     3 · Scroll reveals
     ---------------------------------------------------------- */
  var revealables = $$('.reveal, .reveal-img');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     4 · Heritage timeline — rail fills as it scrolls past
     ---------------------------------------------------------- */
  /* Same treatment on the craftsmanship page's stage rail, so both are driven
     by one pass: [track element, fill element]. */
  var rails = [
    [$('#timeline'), $('#timelineFill')],
    [$('.stages'),   $('#stageFill')]
  ].filter(function (pair) { return pair[0] && pair[1]; });

  function updateTimeline() {
    rails.forEach(function (pair) {
      var r    = pair[0].getBoundingClientRect();
      var mark = window.innerHeight * 0.62;         // fill line sits just below centre
      var p    = (mark - r.top) / r.height;
      pair[1].style.height = Math.max(0, Math.min(1, p)) * 100 + '%';
    });
  }

  /* ----------------------------------------------------------
     5 · Parallax — hero + closing band
     ---------------------------------------------------------- */
  var heroMedia = $('.hero__media');
  var heroInner = $('.hero__inner');
  var hero      = $('#hero');
  var ctaImg    = $('#ctaImg');
  var cta       = $('#cta');

  /* Generic drift: any [data-parallax="0.22"] element shifts by that fraction
     of its travel through the viewport. Used by the collections banner. */
  var drifters = $$('[data-parallax]').map(function (el) {
    return { el: el, rate: parseFloat(el.getAttribute('data-parallax')) || 0.2 };
  });

  function updateDrifters() {
    drifters.forEach(function (d) {
      var box = d.el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      var prog = (window.innerHeight - box.top) / (window.innerHeight + box.height);
      d.el.style.transform =
        'translate3d(0,' + ((prog - 0.5) * box.height * d.rate).toFixed(2) + 'px,0)';
    });
  }

  function updateParallax(y) {
    if (reduceMotion) return;

    updateDrifters();

    if (hero && heroMedia) {
      var h = hero.offsetHeight;
      if (y < h) {
        var t = y / h;
        heroMedia.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(2) + 'px,0)';
        if (heroInner) {
          heroInner.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(2) + 'px,0)';
          heroInner.style.opacity   = String(Math.max(0, 1 - t * 1.5));
        }
      }
    }

    if (cta && ctaImg) {
      var c = cta.getBoundingClientRect();
      if (c.top < window.innerHeight && c.bottom > 0) {
        var prog = (window.innerHeight - c.top) / (window.innerHeight + c.height); // 0 → 1
        ctaImg.style.transform = 'translate3d(0,' + ((prog - 0.5) * 70).toFixed(2) + 'px,0)';
      }
    }
  }

  /* ----------------------------------------------------------
     6 · One rAF-throttled scroll loop
     ---------------------------------------------------------- */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      updateHeader(y);
      updateTimeline();
      updateParallax(y);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     7 · Newsletter
     ---------------------------------------------------------- */
  /* Bound per-form rather than by id: the collections page carries both the
     footer form and the Inner Circle form. */
  $$('form.news-form').forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var msg   = form.querySelector('.news__msg');
    if (!input || !msg) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      msg.textContent = valid
        ? 'Thank you — a letter is on its way.'
        : 'Please enter a valid email address.';
      msg.style.color = valid ? '' : '#d9a3a3';
      msg.classList.add('is-on');

      if (valid) {
        form.reset();
        window.setTimeout(function () { msg.classList.remove('is-on'); }, 5000);
      }
    });

    input.addEventListener('input', function () { msg.classList.remove('is-on'); });
  });

  /* ----------------------------------------------------------
     7b · Contact enquiry form
     ---------------------------------------------------------- */
  var enquiry = $("#enquiryForm");

  if (enquiry) {
    var eMsg = $("#formMsg");
    enquiry.addEventListener("submit", function (e) {
      e.preventDefault();
      var name  = enquiry.querySelector("#fName");
      var email = enquiry.querySelector("#fEmail");
      var okName  = name.value.trim().length > 1;
      var okEmail = /^[^s@]+@[^s@]+.[^s@]{2,}$/.test(email.value.trim());
      var target  = !okName ? name : (!okEmail ? email : null);

      if (target) {
        eMsg.textContent = !okName
          ? "Please enter your name."
          : "Please enter a valid email address.";
        eMsg.style.color = "#c07a7a";
        eMsg.classList.add("is-on");
        target.focus();
        return;
      }

      eMsg.textContent = "Thank you — we will be in touch shortly.";
      eMsg.style.color = "";
      eMsg.classList.add("is-on");
      enquiry.reset();
      window.setTimeout(function () { eMsg.classList.remove("is-on"); }, 6000);
    });

    enquiry.addEventListener("input", function () { eMsg.classList.remove("is-on"); });
  }

  /* ----------------------------------------------------------
     8 · Mark the page ready (kills any first-paint flash)
     ---------------------------------------------------------- */
  window.addEventListener('load', function () {
    document.body.classList.add('is-loaded');
    onScroll();
  });

})();
