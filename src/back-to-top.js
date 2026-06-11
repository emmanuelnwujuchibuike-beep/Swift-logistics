(function () {
  'use strict';

  var CIRC = +(2 * Math.PI * 19).toFixed(2); // circumference for r=19 → 119.38
  var btn, ring;
  var visible = false;
  var ticking  = false;

  /* ── Scroll helpers ─────────────────────────────────────────────────────── */
  function scrollY()   { return window.pageYOffset || document.documentElement.scrollTop; }
  function maxScroll() { return document.documentElement.scrollHeight - window.innerHeight; }
  function progress()  { var m = maxScroll(); return m > 0 ? scrollY() / m : 0; }

  /* show after scrolling 1.6× the viewport height (past ~2nd section) */
  function shouldShow() { return scrollY() > window.innerHeight * 1.6; }

  /* ── CSS ────────────────────────────────────────────────────────────────── */
  function injectCSS() {
    var css = [
      '#sfl-btt{',
        'position:fixed;bottom:80px;left:18px;',  /* above lang widget space */
        'width:44px;height:44px;',
        'z-index:8990;',
        'background:none;border:none;padding:0;cursor:pointer;',
        'opacity:0;pointer-events:none;',
        'transform:translateY(16px) scale(.9);',
        'will-change:opacity,transform;',
        'transition:opacity .34s ease,transform .34s cubic-bezier(.4,0,.2,1);',
        'filter:drop-shadow(0 3px 14px rgba(37,99,235,.42));',
      '}',
      '#sfl-btt.sfl-btt-on{',
        'opacity:1;pointer-events:all;',
        'transform:translateY(0) scale(1);',
      '}',
      '#sfl-btt:hover{',
        'filter:drop-shadow(0 5px 22px rgba(59,130,246,.78));',
        'transform:translateY(-2px) scale(1.07) !important;',
      '}',
      '#sfl-btt:active{',
        'transform:scale(.94) !important;',
        'filter:drop-shadow(0 2px 10px rgba(37,99,235,.5));',
      '}',
    ].join('');
    var tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  /* ── HTML ───────────────────────────────────────────────────────────────── */
  function injectHTML() {
    btn = document.createElement('button');
    btn.id = 'sfl-btt';
    btn.setAttribute('aria-label', 'Back to top');

    /* SVG — all drawing done in SVG so drop-shadow filter works cleanly */
    btn.innerHTML = [
      '<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
        '<defs>',
          /* inner button radial glow */
          '<radialGradient id="btt-ig" cx="40%" cy="28%" r="65%">',
            '<stop offset="0%"   stop-color="#1d4ed8" stop-opacity=".32"/>',
            '<stop offset="100%" stop-color="#000000" stop-opacity="0"/>',
          '</radialGradient>',
          /* rim shimmer gradient */
          '<linearGradient id="btt-rim" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%"   stop-color="#60a5fa" stop-opacity=".7"/>',
            '<stop offset="50%"  stop-color="#2563eb" stop-opacity=".3"/>',
            '<stop offset="100%" stop-color="#93c5fd" stop-opacity=".6"/>',
          '</linearGradient>',
        '</defs>',

        /* ── track ring (background) ── */
        '<circle cx="22" cy="22" r="19"',
          ' stroke="rgba(37,99,235,.15)" stroke-width="2" fill="none"/>',

        /* ── progress ring (animates with scroll) ── */
        '<circle id="sfl-btt-ring" cx="22" cy="22" r="19"',
          ' stroke="url(#btt-rim)" stroke-width="2.2" fill="none"',
          ' stroke-linecap="round"',
          ' stroke-dasharray="' + CIRC + ' ' + CIRC + '"',
          ' stroke-dashoffset="' + CIRC + '"',
          ' transform="rotate(-90 22 22)"/>',

        /* ── button body (dark glass disc) ── */
        '<circle cx="22" cy="22" r="15.5" fill="rgba(3,10,30,.92)"/>',
        /* inner radial glow */
        '<circle cx="22" cy="22" r="15.5" fill="url(#btt-ig)"/>',
        /* inner border */
        '<circle cx="22" cy="22" r="15.5"',
          ' fill="none" stroke="rgba(59,130,246,.38)" stroke-width="1.2"/>',

        /* ── arrow chevron ── */
        '<path d="M16,25.5 L22,18.5 L28,25.5"',
          ' stroke="#60a5fa" stroke-width="2.4"',
          ' stroke-linecap="round" stroke-linejoin="round" fill="none"/>',

        /* optional: tiny speed-line accent under arrow */
        '<line x1="19" y1="27.5" x2="25" y2="27.5"',
          ' stroke="#2563eb" stroke-width="1" stroke-linecap="round" opacity=".55"/>',
      '</svg>',
    ].join('');

    document.body.appendChild(btn);

    ring = document.getElementById('sfl-btt-ring');
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Scroll handler ─────────────────────────────────────────────────────── */
  function update() {
    ticking = false;

    /* progress ring */
    var p = progress();
    ring.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(2);

    /* show/hide */
    var show = shouldShow();
    if (show !== visible) {
      visible = show;
      if (visible) {
        btn.classList.add('sfl-btt-on');
      } else {
        btn.classList.remove('sfl-btt-on');
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  /* ── Init ───────────────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    injectHTML();
    update(); /* set initial state */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
