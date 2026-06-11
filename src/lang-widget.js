(function () {
  'use strict';

  /* ── Language data ──────────────────────────────────────────────────────── */
  var LANGS = [
    { code: 'en',    label: 'English',    native: 'English',   flag: '🇺🇸' },
    { code: 'fr',    label: 'French',     native: 'Français',  flag: '🇫🇷' },
    { code: 'es',    label: 'Spanish',    native: 'Español',   flag: '🇪🇸' },
    { code: 'de',    label: 'German',     native: 'Deutsch',   flag: '🇩🇪' },
    { code: 'zh-CN', label: 'Chinese',    native: '中文',       flag: '🇨🇳' },
    { code: 'ar',    label: 'Arabic',     native: 'العربية',   flag: '🇸🇦' },
    { code: 'pt',    label: 'Portuguese', native: 'Português', flag: '🇧🇷' },
    { code: 'ja',    label: 'Japanese',   native: '日本語',     flag: '🇯🇵' },
    { code: 'ru',    label: 'Russian',    native: 'Русский',   flag: '🇷🇺' },
    { code: 'it',    label: 'Italian',    native: 'Italiano',  flag: '🇮🇹' },
  ];

  var isOpen     = false;
  var activeLang = LANGS[0];

  /* ── Read active lang from Google Translate cookie ──────────────────────── */
  function readCookieLang() {
    var m = document.cookie.match(/googtrans=([^;]+)/);
    if (!m) return LANGS[0];
    var parts = decodeURIComponent(m[1]).split('/');
    var code  = parts[2] || 'en';
    return LANGS.find(function (l) {
      return l.code === code || l.code.split('-')[0] === code;
    }) || LANGS[0];
  }

  /* ── Google Translate bootstrap ─────────────────────────────────────────── */
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
    s.async = true;
    document.head.appendChild(s);
  }

  function execTranslate(code) {
    var attempt = function () {
      var sel = document.querySelector('.goog-te-combo');
      if (sel) { sel.value = code; sel.dispatchEvent(new Event('change')); return true; }
      return false;
    };
    if (!attempt()) {
      var n = 0;
      var t = setInterval(function () { if (attempt() || ++n > 30) clearInterval(t); }, 300);
    }
  }

  /* ── CSS ────────────────────────────────────────────────────────────────── */
  function injectCSS() {
    var css = [
      /* hide Google Translate chrome */
      '.goog-te-banner-frame,.goog-te-gadget{display:none!important}',
      'body{top:0!important}',
      '.skiptranslate{display:none!important}',

      /* force LTR on widget (safe for Arabic / RTL pages) */
      '#sfl-lang-overlay,#sfl-lang-tab,#sfl-lang-panel{direction:ltr;}',

      /* overlay */
      '#sfl-lang-overlay{',
        'position:fixed;inset:0;z-index:9996;',
        'background:rgba(0,4,16,.54);',
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
        'opacity:0;pointer-events:none;',
        'transition:opacity .32s ease;',
      '}',
      '#sfl-lang-overlay.sfl-lo-on{opacity:1;pointer-events:all;}',

      /* ── tab ─────────────────────────────────────────────────── */
      '#sfl-lang-tab{',
        'position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:9999;',
        'width:40px;padding:14px 0 11px;',
        'display:flex;flex-direction:column;align-items:center;gap:6px;',
        'border-radius:0 15px 15px 0;',
        'background:linear-gradient(180deg,rgba(8,16,42,.96) 0%,rgba(2,8,22,.99) 100%);',
        'backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);',
        'border:1px solid rgba(59,130,246,.3);border-left:2.5px solid #2563eb;',
        'box-shadow:5px 0 30px rgba(37,99,235,.26),0 1px 0 rgba(99,165,250,.1) inset;',
        'cursor:pointer;outline:none;user-select:none;-webkit-user-select:none;',
        'transition:width .24s cubic-bezier(.4,0,.2,1),border-color .24s,box-shadow .24s,opacity .22s ease;',
      '}',
      '#sfl-lang-tab:hover{',
        'width:45px;',
        'border-color:rgba(96,165,250,.58);border-left-color:#60a5fa;',
        'box-shadow:9px 0 40px rgba(37,99,235,.42),0 0 22px rgba(59,130,246,.13) inset;',
      '}',
      'body.sfl-open #sfl-lang-tab{opacity:0;pointer-events:none;}',

      '.sfl-tab-globe{width:17px;height:17px;color:#93c5fd;transition:color .2s;}',
      '#sfl-lang-tab:hover .sfl-tab-globe{color:#bfdbfe;}',

      '.sfl-tab-code{',
        'font-size:8px;font-weight:800;letter-spacing:.12em;color:#7dd3fc;',
        'font-family:"JetBrains Mono","Courier New",monospace;',
        'text-transform:uppercase;line-height:1;transition:color .2s;',
      '}',
      '#sfl-lang-tab:hover .sfl-tab-code{color:#bae6fd;}',

      '.sfl-tab-dot{',
        'width:4px;height:4px;border-radius:50%;background:#2563eb;',
        'box-shadow:0 0 8px rgba(59,130,246,.9);',
        'animation:sfl-dp 2.4s ease-in-out infinite;',
      '}',
      '@keyframes sfl-dp{',
        '0%,100%{box-shadow:0 0 5px rgba(59,130,246,.7);}',
        '50%{box-shadow:0 0 14px rgba(59,130,246,1),0 0 24px rgba(96,165,250,.38);}',
      '}',

      /* ── panel ───────────────────────────────────────────────── */
      '#sfl-lang-panel{',
        'position:fixed;left:0;top:0;bottom:0;z-index:9997;',
        'width:min(270px,88vw);',
        'display:flex;flex-direction:column;',
        'background:linear-gradient(155deg,rgba(4,11,30,.995) 0%,rgba(1,6,18,1) 100%);',
        'backdrop-filter:blur(32px) saturate(210%);-webkit-backdrop-filter:blur(32px) saturate(210%);',
        'border-right:1px solid rgba(59,130,246,.15);',
        'box-shadow:12px 0 58px rgba(0,0,12,.82),1px 0 0 rgba(59,130,246,.1) inset;',
        'transform:translateX(-100%);',
        'transition:transform .38s cubic-bezier(.4,0,.2,1);',
        'overflow:hidden;',
      '}',
      '#sfl-lang-panel.sfl-p-on{transform:translateX(0);}',

      /* decorative right-edge glow line */
      '#sfl-lang-panel::after{',
        'content:"";position:absolute;top:0;right:0;bottom:0;width:1px;pointer-events:none;',
        'background:linear-gradient(180deg,transparent 0%,rgba(59,130,246,.42) 35%,rgba(96,165,250,.62) 50%,rgba(59,130,246,.42) 65%,transparent 100%);',
      '}',

      /* header */
      '.sfl-ph{padding:22px 18px 14px;border-bottom:1px solid rgba(59,130,246,.09);flex-shrink:0;}',
      '.sfl-ph-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;}',
      '.sfl-ph-icon{',
        'width:30px;height:30px;border-radius:8px;flex-shrink:0;',
        'background:linear-gradient(135deg,#1d4ed8,#1e3a8a);',
        'display:flex;align-items:center;justify-content:center;',
        'box-shadow:0 0 16px rgba(37,99,235,.5);',
      '}',
      '.sfl-ph-brand{',
        'font-size:10px;font-weight:800;letter-spacing:.15em;color:#d6e6ff;',
        'text-transform:uppercase;font-family:"DM Sans",system-ui,sans-serif;flex:1;',
      '}',
      '.sfl-ph-close{',
        'width:26px;height:26px;border-radius:7px;flex-shrink:0;',
        'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);',
        'display:flex;align-items:center;justify-content:center;',
        'cursor:pointer;color:#3d4e60;',
        'transition:background .18s,border-color .18s,color .18s;',
      '}',
      '.sfl-ph-close:hover{background:rgba(239,68,68,.13);border-color:rgba(239,68,68,.3);color:#f87171;}',
      '.sfl-ph-sub{',
        'font-size:9px;font-weight:700;letter-spacing:.22em;color:#2b3e54;',
        'text-transform:uppercase;font-family:"DM Sans",system-ui,sans-serif;',
      '}',

      /* list */
      '.sfl-pl{',
        'flex:1;overflow-y:auto;padding:5px 0;',
        'scrollbar-width:thin;scrollbar-color:rgba(59,130,246,.16) transparent;',
      '}',
      '.sfl-pl::-webkit-scrollbar{width:3px;}',
      '.sfl-pl::-webkit-scrollbar-track{background:transparent;}',
      '.sfl-pl::-webkit-scrollbar-thumb{background:rgba(59,130,246,.2);border-radius:3px;}',

      /* lang row button */
      '.sfl-lb{',
        'width:100%;padding:10px 18px;',
        'display:flex;align-items:center;gap:12px;',
        'background:transparent;border:none;border-top:1px solid rgba(59,130,246,.055);',
        'cursor:pointer;text-align:left;',
        'position:relative;transition:background .17s ease;',
      '}',
      '.sfl-lb:first-child{border-top:none;}',
      '.sfl-lb::before{',
        'content:"";position:absolute;left:0;top:18%;bottom:18%;',
        'width:2.5px;border-radius:0 3px 3px 0;',
        'background:linear-gradient(180deg,#60a5fa,#1d4ed8);',
        'transform:scaleY(0);transform-origin:center;',
        'transition:transform .2s cubic-bezier(.4,0,.2,1);',
      '}',
      '.sfl-lb:hover{background:rgba(59,130,246,.055);}',
      '.sfl-lb:hover::before{transform:scaleY(1);}',
      '.sfl-lb.sfl-on{background:rgba(37,99,235,.11);}',
      '.sfl-lb.sfl-on::before{transform:scaleY(1);background:linear-gradient(180deg,#93c5fd,#3b82f6);}',

      '.sfl-lb-f{font-size:19px;line-height:1;flex-shrink:0;}',
      '.sfl-lb-t{flex:1;min-width:0;}',
      '.sfl-lb-n{',
        'display:block;font-size:12px;font-weight:600;color:#b8cde8;',
        'font-family:"DM Sans",system-ui,sans-serif;line-height:1.3;transition:color .17s;',
      '}',
      '.sfl-lb-s{',
        'display:block;font-size:10px;color:#2e4255;',
        'font-family:"DM Sans",system-ui,sans-serif;line-height:1.3;transition:color .17s;',
      '}',
      '.sfl-lb:hover .sfl-lb-n,.sfl-lb.sfl-on .sfl-lb-n{color:#ddeeff;}',
      '.sfl-lb:hover .sfl-lb-s{color:#5a7a94;}',
      '.sfl-lb.sfl-on .sfl-lb-s{color:#60a5fa;}',

      /* radio indicator */
      '.sfl-lb-r{',
        'width:14px;height:14px;border-radius:50%;flex-shrink:0;',
        'border:1.5px solid rgba(59,130,246,.25);',
        'display:flex;align-items:center;justify-content:center;',
        'transition:all .18s;',
      '}',
      '.sfl-lb.sfl-on .sfl-lb-r{background:#2563eb;border-color:#2563eb;}',
      '.sfl-lb-rd{',
        'width:5px;height:5px;border-radius:50%;background:#fff;',
        'opacity:0;transform:scale(0);transition:all .2s cubic-bezier(.4,0,.2,1);',
      '}',
      '.sfl-lb.sfl-on .sfl-lb-rd{opacity:1;transform:scale(1);}',

      /* footer */
      '.sfl-pf{',
        'padding:10px 18px;border-top:1px solid rgba(59,130,246,.07);',
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

  /* ── Inject HTML ────────────────────────────────────────────────────────── */
  function injectHTML() {
    /* overlay */
    var ov = document.createElement('div');
    ov.id  = 'sfl-lang-overlay';
    ov.addEventListener('click', panelClose);

    /* tab */
    var tab = document.createElement('button');
    tab.id  = 'sfl-lang-tab';
    tab.setAttribute('aria-label', 'Open language selector');
    tab.addEventListener('click', panelToggle);
    tab.innerHTML =
      '<span class="sfl-tab-globe">' + globeSVG(17, 'currentColor') + '</span>' +
      '<span class="sfl-tab-code" id="sfl-tc">' + activeLang.code.split('-')[0].toUpperCase() + '</span>' +
      '<span class="sfl-tab-dot" aria-hidden="true"></span>';

    /* panel */
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
          '<span class="sfl-lb-r" aria-hidden="true"><span class="sfl-lb-rd"></span></span>' +
        '</button>'
      );
    }).join('');

    panel.innerHTML =
      '<div class="sfl-ph">' +
        '<div class="sfl-ph-row">' +
          '<div class="sfl-ph-icon">' + globeSVG(16, '#60a5fa') + '</div>' +
          '<span class="sfl-ph-brand">Swift Freight</span>' +
          '<button class="sfl-ph-close" aria-label="Close language panel">' + closeSVG() + '</button>' +
        '</div>' +
        '<div class="sfl-ph-sub">Select Language</div>' +
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

  /* ── Language selection ─────────────────────────────────────────────────── */
  function onPick(e) {
    var btn = e.target.closest('.sfl-lb');
    if (!btn) return;
    var code = btn.dataset.code;
    var lang = LANGS.find(function (l) { return l.code === code; }) || LANGS[0];

    document.querySelectorAll('.sfl-lb').forEach(function (b) {
      b.classList.remove('sfl-on');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('sfl-on');
    btn.setAttribute('aria-pressed', 'true');

    document.getElementById('sfl-tc').textContent = code.split('-')[0].toUpperCase();
    activeLang = lang;

    if (code === 'en') {
      /* clear GT cookie and reload to restore original text */
      var host = location.hostname;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + host + ';';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + host + ';';
      setTimeout(function () { location.reload(); }, 280);
    } else {
      execTranslate(code);
    }

    setTimeout(panelClose, 320);
  }

  /* ── Boot ───────────────────────────────────────────────────────────────── */
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
