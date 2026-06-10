/* ══════════════════════════════════════════════════════════════
   CINEMATIC.JS — shared ultra-premium motion layer
   · Scroll-progress bar
   · rAF-throttled image parallax ([data-parallax])
   · Count-up hero stats
   · Hero pointer parallax (desktop, fine pointer)
   Fully guards prefers-reduced-motion and missing elements.
══════════════════════════════════════════════════════════════ */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar    = document.getElementById('scroll-progress');
  var items  = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var vh     = window.innerHeight;
  var ticking = false;

  function update() {
    ticking = false;
    var st = window.pageYOffset || document.documentElement.scrollTop;

    if (bar) {
      var h = document.documentElement.scrollHeight - vh;
      bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    }

    if (!reduce) {
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue; // offscreen — skip
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        var y = -(((r.top + r.height / 2) - vh / 2) * speed);
        el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(1.18)';
      }
    }
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; onScroll(); }, { passive: true });
  update();

  /* ── Count-up hero stats ── */
  var stats = [].slice.call(document.querySelectorAll('.stats-row .stat-c .display'));
  if (stats.length && 'IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, raw = el.textContent.trim();
        if (raw.indexOf('/') > -1) return;            // e.g. "24/7" — leave it
        var m = raw.match(/^(\D*)(\d[\d,]*)(.*)$/);    // prefix · number · suffix
        if (!m) return;
        var pre = m[1], target = parseInt(m[2].replace(/,/g, ''), 10), suf = m[3];
        var dur = 1100, t0 = null;
        requestAnimationFrame(function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(target * eased).toLocaleString() + suf;
          if (p < 1) requestAnimationFrame(step);
        });
      });
    }, { threshold: 0.4 });
    stats.forEach(function (s) { co.observe(s); });
  }

  /* ── Pause hero's continuous animations when it scrolls out of view ──
     Wheel scrolling on laptops is main-thread; constantly compositing the
     Ken Burns + aurora while scrolling the rest of the page causes jank.
     Touch scroll (phones) is compositor-threaded, so it stays smooth — this
     is why the lag was laptop-only. */
  var hero = document.getElementById('hero') || document.getElementById('page-hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      hero.classList.toggle('sfl-hero-out', !es[0].isIntersecting);
    }, { threshold: 0 }).observe(hero);
  }

  /* ── Hero pointer parallax (desktop only) ──
     Moves only the inner text wrapper, NOT .hero-content (which carries the
     blurred aurora pseudo) — keeps the per-frame repaint cheap. */
  var hcInner = hero && hero.querySelector('.hero-content > div');
  if (hcInner && !reduce &&
      window.matchMedia('(pointer:fine)').matches && window.innerWidth > 1024) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf2 = null;
    function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      hcInner.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf2 = requestAnimationFrame(loop);
      else raf2 = null;
    }
    hero.addEventListener('mousemove', function (ev) {
      var r = hero.getBoundingClientRect();
      tx = ((ev.clientX - r.left) / r.width - 0.5) * 10;
      ty = ((ev.clientY - r.top) / r.height - 0.5) * 7;
      if (!raf2) raf2 = requestAnimationFrame(loop);
    }, { passive: true });
    hero.addEventListener('mouseleave', function () {
      tx = 0; ty = 0; if (!raf2) raf2 = requestAnimationFrame(loop);
    });
  }
})();
