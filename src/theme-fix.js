(function () {
  'use strict';

  /* ── CSS fix (injected before any layout paint) ─────────────────────────── */
  var css = [
    /* 1. Remove clip-path from theme + close buttons — it conflicts with rotate */
    '.theme-btn, .mob-close-btn {',
      'clip-path: none !important;',
      'transform-origin: center center !important;',
    '}',

    /* 2. Hover rotate ONLY on real pointer devices (mouse/trackpad) */
    /*    On touch screens :hover is sticky — the button stays rotated after tap */
    '@media (hover: hover) and (pointer: fine) {',
      '.theme-btn:hover {',
        'transform: scale(1.1) rotate(15deg) !important;',
      '}',
      '.mob-close-btn:hover {',
        'transform: rotate(90deg) scale(1.06) !important;',
      '}',
    '}',

    /* 3. Explicitly reset hover on touch/coarse devices */
    '@media (hover: none), (pointer: coarse) {',
      '.theme-btn:hover,',
      '.mob-close-btn:hover {',
        'transform: none !important;',
        'background: rgba(var(--accent-rgb), .16) !important;',
      '}',
    '}',

    /* 4. Click spin animation — always completes back to 0° */
    '@keyframes sfl-theme-spin {',
      '0%   { transform: scale(1)    rotate(0deg); }',
      '30%  { transform: scale(1.16) rotate(180deg); }',
      '70%  { transform: scale(1.1)  rotate(330deg); }',
      '100% { transform: scale(1)    rotate(360deg); }',
    '}',

    /* class added by JS on click, removed when done */
    '.sfl-theme-spinning {',
      'animation: sfl-theme-spin .42s cubic-bezier(.4, 0, .2, 1) both !important;',
      'pointer-events: none;',  /* block double-click during animation */
    '}',
  ].join('\n');

  var styleTag = document.createElement('style');
  styleTag.id  = 'sfl-theme-fix';
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ── Click animation handler ────────────────────────────────────────────── */
  function addSpinHandler(btn) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      /* force reflow to allow restarting animation if button clicked quickly */
      btn.classList.remove('sfl-theme-spinning');
      void btn.offsetWidth;
      btn.classList.add('sfl-theme-spinning');
      setTimeout(function () {
        btn.classList.remove('sfl-theme-spinning');
      }, 440);
    });
  }

  /* ── Init ───────────────────────────────────────────────────────────────── */
  function init() {
    ['themeToggleDesktop', 'themeToggleMobile'].forEach(function (id) {
      addSpinHandler(document.getElementById(id));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
