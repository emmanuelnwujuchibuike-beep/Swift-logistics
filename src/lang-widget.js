(function () {
  'use strict';

  /* ── 20 languages ───────────────────────────────────────────────────────── */
  var LANGS = [
    { code: 'en',    label: 'English',    native: 'English',    flag: '🇺🇸' },
    { code: 'fr',    label: 'French',     native: 'Français',   flag: '🇫🇷' },
    { code: 'es',    label: 'Spanish',    native: 'Español',    flag: '🇪🇸' },
    { code: 'de',    label: 'German',     native: 'Deutsch',    flag: '🇩🇪' },
    { code: 'zh-CN', label: 'Chinese',    native: '中文',        flag: '🇨🇳' },
    { code: 'ar',    label: 'Arabic',     native: 'العربية',    flag: '🇸🇦' },
    { code: 'pt',    label: 'Portuguese', native: 'Português',  flag: '🇧🇷' },
    { code: 'ja',    label: 'Japanese',   native: '日本語',      flag: '🇯🇵' },
    { code: 'ru',    label: 'Russian',    native: 'Русский',    flag: '🇷🇺' },
    { code: 'it',    label: 'Italian',    native: 'Italiano',   flag: '🇮🇹' },
    { code: 'ko',    label: 'Korean',     native: '한국어',      flag: '🇰🇷' },
    { code: 'nl',    label: 'Dutch',      native: 'Nederlands', flag: '🇳🇱' },
    { code: 'tr',    label: 'Turkish',    native: 'Türkçe',     flag: '🇹🇷' },
    { code: 'pl',    label: 'Polish',     native: 'Polski',     flag: '🇵🇱' },
    { code: 'sv',    label: 'Swedish',    native: 'Svenska',    flag: '🇸🇪' },
    { code: 'hi',    label: 'Hindi',      native: 'हिन्दी',      flag: '🇮🇳' },
    { code: 'vi',    label: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'th',    label: 'Thai',       native: 'ภาษาไทย',    flag: '🇹🇭' },
    { code: 'id',    label: 'Indonesian', native: 'Bahasa',     flag: '🇮🇩' },
    { code: 'uk',    label: 'Ukrainian',  native: 'Українська', flag: '🇺🇦' },
  ];

  var isOpen     = false;
  var activeLang = LANGS[0];

  /* ── Cookie helpers ─────────────────────────────────────────────────────── */
  function readCookieLang() {
    var m = document.cookie.match(/googtrans=([^;]+)/);
    if (!m) return LANGS[0];
    var parts = decodeURIComponent(m[1]).split('/');
    var code  = parts[2] || 'en';
    return LANGS.find(function (l) {
      return l.code === code || l.code.split('-')[0] === code;
    }) || LANGS[0];
  }

  function setGTCookie(code) {
    var val  = '/en/' + code;
    var host = location.hostname;
    document.cookie = 'googtrans=' + val + '; path=/;';
    document.cookie = 'googtrans=' + val + '; path=/; domain=' + host + ';';
    document.cookie = 'googtrans=' + val + '; path=/; domain=.' + host + ';';
  }

  function clearGTCookie() {
    var exp  = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
    var host = location.hostname;
    document.cookie = 'googtrans=; ' + exp + '; path=/;';
    document.cookie = 'googtrans=; ' + exp + '; path=/; domain=' + host + ';';
    document.cookie = 'googtrans=; ' + exp + '; path=/; domain=.' + host + ';';
  }

  /* ── Google Translate ───────────────────────────────────────────────────── */
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      { pageLanguage: 'en', autoDisplay: false },
      'sfl-gt-el'
    );
  };

  function loadGT() {
    var d  = document.createElement('div');
    d.id   = 'sfl-gt-el';
    d.setAttribute('style', 'display:none;position:absolute;width:0;height:0;overflow:hidden;');
    document.body.appendChild(d);
    var s  = document.createElement('script');
    s.src  = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(s);
  }

  function execTranslate(code) {
    var done = false;
    var go   = function () {
      var sel = document.querySelector('.goog-te-combo');
      if (sel) { sel.value = code; sel.dispatchEvent(new Event('change')); done = true; }
    };
    go();
    if (!done) {
      var n = 0, t = setInterval(function () { go(); if (done || ++n > 40) clearInterval(t); }, 100);
    }
  }

  /* ── CSS ────────────────────────────────────────────────────────────────── */
  function injectCSS() {
    var css = [
      /* hide GT chrome */
      '.goog-te-banner-frame,.goog-te-gadget{display:none!important}',
      'body{top:0!important}',
      '.skiptranslate{display:none!important}',

      /* force LTR on widget */
      '#sfl-lang-overlay,#sfl-lang-tab,#sfl-lang-panel{direction:ltr;}',

      /* ── overlay ─────────────────────────────────────────────── */
      '#sfl-lang-overlay{',
        'position:fixed;inset:0;z-index:9996;',
        'background:rgba(0,4,16,.55);',
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
        'opacity:0;pointer-events:none;',
        'transition:opacity .22s ease;',
      '}',
      '#sfl-lang-overlay.sfl-lo-on{opacity:1;pointer-events:all;}',

      /* ── tab (bottom-center, flush to bottom wall) ────────────── */
      '#sfl-lang-tab{',
        'position:fixed;',
        'bottom:0;left:50%;',
        'transform:translateX(-50%) translateZ(0);',
        'z-index:9999;',
        'padding:9px 20px max(10px,env(safe-area-inset-bottom));',
        'display:flex;flex-direction:row;align-items:center;gap:8px;',
        'border-radius:14px 14px 0 0;',
        'background:linear-gradient(180deg,rgba(8,16,42,.96) 0%,rgba(2,8,22,.99) 100%);',
        'backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);',
        'border:1px solid rgba(59,130,246,.3);border-bottom:none;',
        'border-top:2.5px solid #2563eb;',
        'box-shadow:0 -5px 30px rgba(37,99,235,.26),0 -1px 0 rgba(99,165,250,.1) inset;',
        'cursor:pointer;outline:none;user-select:none;-webkit-user-select:none;',
        'will-change:opacity;',
        'transition:opacity .18s ease,box-shadow .22s,border-color .22s;',
        'white-space:nowrap;min-width:100px;',
      '}',
      '#sfl-lang-tab:hover{',
        'border-color:rgba(96,165,250,.58);border-top-color:#60a5fa;',
        'box-shadow:0 -8px 40px rgba(37,99,235,.42),0 0 20px rgba(59,130,246,.12) inset;',
      '}',
      'body.sfl-open #sfl-lang-tab{opacity:0;pointer-events:none;}',

      '.sfl-tab-globe{width:15px;height:15px;color:#93c5fd;flex-shrink:0;transition:color .18s;}',
      '#sfl-lang-tab:hover .sfl-tab-globe{color:#bfdbfe;}',
      '.sfl-tab-label{',
        'font-size:10px;font-weight:700;letter-spacing:.1em;color:#7dd3fc;',
        'font-family:"DM Sans",system-ui,sans-serif;text-transform:uppercase;',
        'transition:color .18s;',
      '}',
      '#sfl-lang-tab:hover .sfl-tab-label{color:#bae6fd;}',
      '.sfl-tab-code{',
        'font-size:10px;font-weight:800;letter-spacing:.1em;color:#93c5fd;',
        'font-family:"JetBrains Mono","Courier New",monospace;',
        'text-transform:uppercase;transition:color .18s;',
      '}',
      '#sfl-lang-tab:hover .sfl-tab-code{color:#bfdbfe;}',
      '.sfl-tab-dot{',
        'width:4px;height:4px;border-radius:50%;background:#2563eb;flex-shrink:0;',
        'box-shadow:0 0 8px rgba(59,130,246,.9);',
        'animation:sfl-dp 2.4s ease-in-out infinite;',
      '}',
      '@keyframes sfl-dp{',
        '0%,100%{box-shadow:0 0 5px rgba(59,130,246,.7);}',
        '50%{box-shadow:0 0 14px rgba(59,130,246,1),0 0 24px rgba(96,165,250,.38);}',
      '}',

      /* ── panel (bottom sheet, slides up) ─────────────────────── */
      '#sfl-lang-panel{',
        'position:fixed;left:0;right:0;bottom:0;top:auto;',
        'z-index:9997;',
        'max-height:72vh;',
        'display:flex;flex-direction:column;',
        'background:linear-gradient(180deg,rgba(5,13,32,.99) 0%,rgba(2,8,20,1) 100%);',
        'backdrop-filter:blur(32px) saturate(210%);-webkit-backdrop-filter:blur(32px) saturate(210%);',
        'border-top:1px solid rgba(59,130,246,.18);',
        'border-radius:22px 22px 0 0;',
        'box-shadow:0 -12px 60px rgba(0,0,14,.85),0 -1px 0 rgba(59,130,246,.12) inset;',
        'transform:translate3d(0,100%,0);',
        'will-change:transform;',
        'transition:transform .28s cubic-bezier(.4,0,.2,1);',
        'overflow:hidden;',
      '}',
      '#sfl-lang-panel.sfl-p-on{transform:translate3d(0,0,0);}',

      /* top glow line (replaces right-edge glow for left panel) */
      '#sfl-lang-panel::before{',
        'content:"";position:absolute;top:0;left:0;right:0;height:1px;pointer-events:none;z-index:1;',
        'background:linear-gradient(90deg,transparent 0%,rgba(59,130,246,.45) 30%,rgba(96,165,250,.7) 50%,rgba(59,130,246,.45) 70%,transparent 100%);',
      '}',

      /* drag handle */
      '#sfl-lang-panel::after{',
        'content:"";position:absolute;top:10px;left:50%;transform:translateX(-50%);',
        'width:40px;height:4px;border-radius:4px;',
        'background:rgba(59,130,246,.25);pointer-events:none;',
      '}',

      /* header */
      '.sfl-ph{',
        'padding:24px 20px 12px;',
        'border-bottom:1px solid rgba(59,130,246,.09);',
        'flex-shrink:0;display:flex;align-items:center;gap:12px;',
      '}',
      '.sfl-ph-icon{',
        'width:28px;height:28px;border-radius:7px;flex-shrink:0;',
        'background:linear-gradient(135deg,#1d4ed8,#1e3a8a);',
        'display:flex;align-items:center;justify-content:center;',
        'box-shadow:0 0 14px rgba(37,99,235,.5);',
      '}',
      '.sfl-ph-brand{',
        'font-size:10px;font-weight:800;letter-spacing:.16em;color:#d6e6ff;',
        'text-transform:uppercase;font-family:"DM Sans",system-ui,sans-serif;flex:1;',
      '}',
      '.sfl-ph-sub{',
        'font-size:9px;font-weight:700;letter-spacing:.18em;color:#2b3e54;',
        'text-transform:uppercase;font-family:"DM Sans",system-ui,sans-serif;',
        'margin-right:4px;',
      '}',
      '.sfl-ph-close{',
        'width:26px;height:26px;border-radius:7px;flex-shrink:0;',
        'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);',
        'display:flex;align-items:center;justify-content:center;',
        'cursor:pointer;color:#3d4e60;',
        'transition:background .15s,border-color .15s,color .15s;',
      '}',
      '.sfl-ph-close:hover{background:rgba(239,68,68,.13);border-color:rgba(239,68,68,.3);color:#f87171;}',

      /* ── 2-column language grid ───────────────────────────────── */
      '.sfl-pl{',
        'flex:1;overflow-y:auto;',
        'display:grid;grid-template-columns:1fr 1fr;gap:4px;',
        'padding:10px 12px;',
        'scrollbar-width:thin;scrollbar-color:rgba(59,130,246,.16) transparent;',
        '-webkit-overflow-scrolling:touch;',
      '}',
      '.sfl-pl::-webkit-scrollbar{width:3px;}',
      '.sfl-pl::-webkit-scrollbar-track{background:transparent;}',
      '.sfl-pl::-webkit-scrollbar-thumb{background:rgba(59,130,246,.2);border-radius:3px;}',

      /* lang cell */
      '.sfl-lb{',
        'padding:10px 10px;',
        'display:flex;align-items:center;gap:8px;',
        'background:rgba(255,255,255,.02);',
        'border:1px solid rgba(59,130,246,.06);',
        'border-radius:10px;',
        'cursor:pointer;text-align:left;',
        'position:relative;overflow:hidden;',
        'will-change:background;',
        'transition:background .12s ease,border-color .12s ease;',
      '}',
      '.sfl-lb::before{',
        'content:"";position:absolute;top:0;left:0;bottom:0;',
        'width:2.5px;border-radius:0 2px 2px 0;',
        'background:linear-gradient(180deg,#60a5fa,#1d4ed8);',
        'transform:scaleY(0);transform-origin:center;',
        'will-change:transform;',
        'transition:transform .13s cubic-bezier(.4,0,.2,1);',
      '}',
      '.sfl-lb:hover{background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.18);}',
      '.sfl-lb:hover::before{transform:scaleY(1);}',
      '.sfl-lb.sfl-on{background:rgba(37,99,235,.14);border-color:rgba(59,130,246,.28);}',
      '.sfl-lb.sfl-on::before{transform:scaleY(1);background:linear-gradient(180deg,#93c5fd,#3b82f6);}',

      '.sfl-lb-f{font-size:17px;line-height:1;flex-shrink:0;}',
      '.sfl-lb-t{flex:1;min-width:0;overflow:hidden;}',
      '.sfl-lb-n{',
        'display:block;font-size:11px;font-weight:600;color:#b8cde8;',
        'font-family:"DM Sans",system-ui,sans-serif;line-height:1.25;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
        'transition:color .12s;',
      '}',
      '.sfl-lb-s{',
        'display:block;font-size:9px;color:#2e4255;',
        'font-family:"DM Sans",system-ui,sans-serif;line-height:1.3;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
        'transition:color .12s;',
      '}',
      '.sfl-lb:hover .sfl-lb-n,.sfl-lb.sfl-on .sfl-lb-n{color:#ddeeff;}',
      '.sfl-lb:hover .sfl-lb-s{color:#5a7a94;}',
      '.sfl-lb.sfl-on .sfl-lb-s{color:#60a5fa;}',

      /* footer */
      '.sfl-pf{',
        'padding:8px 20px max(10px,env(safe-area-inset-bottom));',
        'border-top:1px solid rgba(59,130,246,.07);',
        'display:flex;align-items:center;gap:8px;flex-shrink:0;',
      '}',
      '.sfl-pf-l{flex:1;height:1px;background:rgba(59,130,246,.07);}',
      '.sfl-pf-t{',
        'font-size:8px;font-weight:500;letter-spacing:.09em;color:#1e2d3d;',
        'text-transform:uppercase;font-family:"DM Sans",system-ui,sans-serif;white-space:nowrap;',
      '}',
    ].join('');

    var tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  /* ── SVG helpers ────────────────────────────────────────────────────────── */
  function globeSVG(size, stroke) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  }
  function closeSVG() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }

  /* ── HTML ───────────────────────────────────────────────────────────────── */
  function injectHTML() {
    /* overlay */
    var ov = document.createElement('div');
    ov.id  = 'sfl-lang-overlay';
    ov.addEventListener('click', panelClose);

    /* tab — bottom-center pill */
    var tab = document.createElement('button');
    tab.id  = 'sfl-lang-tab';
    tab.setAttribute('aria-label', 'Open language selector');
    tab.addEventListener('click', panelToggle);
    tab.innerHTML =
      '<span class="sfl-tab-globe">' + globeSVG(15, 'currentColor') + '</span>' +
      '<span class="sfl-tab-label">Language</span>' +
      '<span class="sfl-tab-code" id="sfl-tc">' + activeLang.code.split('-')[0].toUpperCase() + '</span>' +
      '<span class="sfl-tab-dot" aria-hidden="true"></span>';

    /* panel — bottom sheet */
    var panel = document.createElement('div');
    panel.id  = 'sfl-lang-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Language selection');

    var listRows = LANGS.map(function (l) {
      var on = l.code === activeLang.code;
      return (
        '<button class="sfl-lb' + (on ? ' sfl-on' : '') + '" data-code="' + l.code + '" aria-pressed="' + on + '">' +
          '<span class="sfl-lb-f" aria-hidden="true">' + l.flag + '</span>' +
          '<span class="sfl-lb-t"><span class="sfl-lb-n">' + l.label + '</span><span class="sfl-lb-s">' + l.native + '</span></span>' +
        '</button>'
      );
    }).join('');

    panel.innerHTML =
      '<div class="sfl-ph">' +
        '<div class="sfl-ph-icon">' + globeSVG(14, '#60a5fa') + '</div>' +
        '<span class="sfl-ph-brand">Swift Freight</span>' +
        '<span class="sfl-ph-sub">Language</span>' +
        '<button class="sfl-ph-close" aria-label="Close">' + closeSVG() + '</button>' +
      '</div>' +
      '<div class="sfl-pl" id="sfl-pl">' + listRows + '</div>' +
      '<div class="sfl-pf"><div class="sfl-pf-l"></div><span class="sfl-pf-t">Powered by Google Translate</span><div class="sfl-pf-l"></div></div>';

    document.body.appendChild(ov);
    document.body.appendChild(tab);
    document.body.appendChild(panel);

    panel.querySelector('.sfl-ph-close').addEventListener('click', panelClose);
    document.getElementById('sfl-pl').addEventListener('click', onPick);
  }

  /* ── Panel open / close ─────────────────────────────────────────────────── */
  function panelOpen() {
    isOpen = true;
    document.getElementById('sfl-lang-panel').classList.add('sfl-p-on');
    document.getElementById('sfl-lang-overlay').classList.add('sfl-lo-on');
    document.body.classList.add('sfl-open');
  }
  function panelClose() {
    isOpen = false;
    document.getElementById('sfl-lang-panel').classList.remove('sfl-p-on');
    document.getElementById('sfl-lang-overlay').classList.remove('sfl-lo-on');
    document.body.classList.remove('sfl-open');
  }
  function panelToggle() { isOpen ? panelClose() : panelOpen(); }

  /* ── Language pick ──────────────────────────────────────────────────────── */
  function onPick(e) {
    var btn = e.target.closest('.sfl-lb');
    if (!btn) return;
    var code = btn.dataset.code;
    var lang = LANGS.find(function (l) { return l.code === code; }) || LANGS[0];

    /* instant UI update */
    document.querySelectorAll('.sfl-lb').forEach(function (b) {
      b.classList.remove('sfl-on');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('sfl-on');
    btn.setAttribute('aria-pressed', 'true');
    document.getElementById('sfl-tc').textContent = code.split('-')[0].toUpperCase();
    activeLang = lang;

    /* close immediately, translate in background */
    panelClose();

    if (code === 'en') {
      clearGTCookie();
      setTimeout(function () { location.reload(); }, 120);
    } else {
      setGTCookie(code);
      execTranslate(code);
    }
  }

  /* ── Init ───────────────────────────────────────────────────────────────── */
  function init() {
    activeLang = readCookieLang();
    injectCSS();
    injectHTML();
    loadGT();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
