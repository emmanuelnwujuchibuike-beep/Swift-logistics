/* ══════════════════════════════════════════════════════════════════
   Swift Freight Logistics — Live Chat Widget  v6
   • Inline SVG icons — zero Font Awesome dependency
   • All layout CSS uses !important to survive Tailwind preflight
   • Smooth gate → chat transition
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Config ─── */
  var SB_URL  = 'https://oltbgccsceipedoadgka.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdGJnY2NzY2VpcGVkb2FkZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY0NTQsImV4cCI6MjA5NjQwMjQ1NH0.Q5uoDXqlxBl-FxiISbp5bR3NLDsEL4iOMYVbVugwv94';
  var FN      = SB_URL + '/functions/v1';
  var BUCKET  = 'chat-images';
  var WELCOME = 'Hello! 👋 Welcome to Swift Freight support. How can we help you today?';
  var K_SID   = 'sfl_chat_sid';
  var K_NAME  = 'sfl_chat_name';
  var K_EMAIL = 'sfl_chat_email';
  var HDR     = { 'Content-Type': 'application/json', 'apikey': SB_ANON, 'Authorization': 'Bearer ' + SB_ANON };

  /* ─── Inline SVGs — no icon-font dependency ─── */
  var IC = {
    chat:  '<svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>',
    back:  '<svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1L1 6.5 7 12"/></svg>',
    img:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/><polyline points="21 15 16 10 5 21"/></svg>',
    send:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none"/></svg>',
    arr:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    spin:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity=".4"/><path d="M12 2v4"/></svg>',
  };

  /* ─── State ─── */
  var sbClient        = null;
  var rtSub           = null;
  var sessionId       = localStorage.getItem(K_SID)   || '';
  var visitorName     = localStorage.getItem(K_NAME)  || '';
  var visitorEmail    = localStorage.getItem(K_EMAIL) || '';
  var isOpen          = false;
  var unread          = 0;
  var isFirstMsg      = !sessionId; /* false if restoring existing session */
  var skipWelcomeOnce = false;

  /* ════════════════════════════════════════════════════════════════
     CSS  — !important on every layout property so Tailwind can't
     override padding/margin/display inside the widget.
     Font-family is NOT forced on * so embedded SVGs render fine.
     ════════════════════════════════════════════════════════════════ */
  var css = [

  /* keyframes */
  '@keyframes _sflRing{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.7);opacity:0}}',
  '@keyframes _sflBlink{0%,100%{opacity:1}50%{opacity:.3}}',
  '@keyframes _sflDot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}',
  '@keyframes _sflIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}',
  '@keyframes _sflProg{from{transform:translateX(-100%)}to{transform:translateX(380%)}}',
  '@keyframes _sflFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',

  /* FAB button */
  '#sfl-fab{',
    'position:fixed!important;bottom:28px!important;right:28px!important;z-index:2147483640!important;',
    'width:62px!important;height:62px!important;margin:0!important;padding:0!important;',
    'border:1px solid rgba(255,255,255,.16)!important;',
    'outline:none!important;cursor:pointer!important;',
    'background:linear-gradient(140deg,#1e3a8a 0%,#2563eb 52%,#3b82f6 100%)!important;',
    'border-radius:50%!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'box-shadow:0 12px 36px rgba(37,99,235,.5),0 4px 14px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.3),inset 0 -2px 6px rgba(0,0,0,.25)!important;',
    'transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .35s!important;',
  '}',
  '#sfl-fab:hover{transform:scale(1.08) translateY(-3px)!important;box-shadow:0 20px 50px rgba(37,99,235,.62),0 6px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.35)!important;}',
  '#sfl-fab:active{transform:scale(1.02) translateY(-1px)!important;}',
  '#sfl-fab .sfl-ic{position:absolute!important;display:flex!important;align-items:center!important;justify-content:center!important;',
    'transition:opacity .22s,transform .22s!important;}',
  '#sfl-fab .sfl-ic-chat{opacity:1!important;transform:scale(1)!important;}',
  '#sfl-fab .sfl-ic-close{opacity:0!important;transform:scale(.5) rotate(-90deg)!important;}',
  '#sfl-fab.open .sfl-ic-chat{opacity:0!important;transform:scale(.5) rotate(90deg)!important;}',
  '#sfl-fab.open .sfl-ic-close{opacity:1!important;transform:scale(1) rotate(0)!important;}',

  /* Pulse rings */
  '#sfl-pulse{position:fixed!important;bottom:28px!important;right:28px!important;z-index:2147483638!important;',
    'width:60px!important;height:60px!important;border-radius:50%!important;pointer-events:none!important;}',
  '#sfl-pulse::before,#sfl-pulse::after{content:""!important;position:absolute!important;inset:-4px!important;',
    'border-radius:50%!important;border:2px solid rgba(59,130,246,.42)!important;',
    'animation:_sflRing 3s ease-out infinite!important;}',
  '#sfl-pulse::after{animation-delay:1.5s!important;}',

  /* Unread badge */
  '#sfl-badge{position:fixed!important;bottom:78px!important;right:22px!important;z-index:2147483641!important;',
    'min-width:20px!important;height:20px!important;padding:0 5px!important;',
    'border-radius:10px!important;background:#ef4444!important;',
    'color:#fff!important;font:700 11px/20px -apple-system,BlinkMacSystemFont,sans-serif!important;',
    'text-align:center!important;letter-spacing:0!important;',
    'box-shadow:0 2px 10px rgba(239,68,68,.55)!important;pointer-events:none!important;',
    'transform:scale(0)!important;transition:transform .3s cubic-bezier(.34,1.56,.64,1)!important;}',
  '#sfl-badge.show{transform:scale(1)!important;}',

  /* Panel shell — tall like WhatsApp: anchored top+bottom so it fills the viewport */
  '#sfl-panel{',
    'position:fixed!important;top:12px!important;bottom:100px!important;right:28px!important;z-index:2147483639!important;',
    'width:392px!important;max-width:calc(100vw - 24px)!important;',
    'display:flex!important;flex-direction:column!important;overflow:hidden!important;',
    'background:linear-gradient(170deg,#070e26 0%,#04091c 60%,#03071a 100%)!important;',
    'backdrop-filter:blur(22px) saturate(1.4)!important;-webkit-backdrop-filter:blur(22px) saturate(1.4)!important;',
    'border:1px solid rgba(99,141,255,.2)!important;',
    'border-radius:20px!important;',
    'box-shadow:0 50px 110px rgba(0,0,0,.86),0 12px 40px rgba(0,0,0,.5),0 0 0 1px rgba(37,99,235,.08),inset 0 1px 0 rgba(255,255,255,.05)!important;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif!important;',
    'opacity:0!important;transform:translateY(24px) scale(.94)!important;pointer-events:none!important;',
    'transition:opacity .42s cubic-bezier(.16,1,.3,1),transform .42s cubic-bezier(.16,1,.3,1)!important;',
  '}',
  '#sfl-panel.open{opacity:1!important;transform:none!important;pointer-events:all!important;}',
  /* Top accent line */
  '#sfl-panel::before{content:""!important;position:absolute!important;top:0!important;left:0!important;right:0!important;',
    'height:2px!important;z-index:2!important;',
    'background:linear-gradient(90deg,transparent,#2563eb 25%,#60a5fa 50%,#2563eb 75%,transparent)!important;}',
  /* Ambient corner glow — behind content, above panel bg */
  '#sfl-panel::after{content:""!important;position:absolute!important;top:-60px!important;right:-60px!important;',
    'width:220px!important;height:220px!important;border-radius:50%!important;z-index:-1!important;pointer-events:none!important;',
    'background:radial-gradient(circle,rgba(37,99,235,.14),transparent 70%)!important;}',

  /* Box-model reset for panel children — no font-family here to keep SVG strokes intact */
  '#sfl-panel *{box-sizing:border-box!important;margin:0!important;padding:0!important;}',

  /* ── Header ── */
  '#sfl-panel .sf-hdr{',
    'display:flex!important;align-items:center!important;gap:12px!important;',
    'padding:16px 18px!important;flex-shrink:0!important;position:relative!important;z-index:1!important;',
    'background:linear-gradient(180deg,rgba(37,99,235,.1),rgba(255,255,255,.02))!important;',
    'border-bottom:1px solid rgba(99,141,255,.14)!important;}',
  '#sfl-panel .sf-av{',
    'width:42px!important;height:42px!important;flex-shrink:0!important;',
    'border-radius:50%!important;',
    'background:linear-gradient(135deg,#1e3a8a,#3b82f6)!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'box-shadow:0 0 20px rgba(37,99,235,.4)!important;position:relative!important;',
    'font:700 .9rem/1 "Bebas Neue",system-ui,sans-serif!important;',
    'color:#fff!important;letter-spacing:.06em!important;}',
  '#sfl-panel .sf-av::after{content:""!important;position:absolute!important;bottom:1px!important;right:1px!important;',
    'width:10px!important;height:10px!important;border-radius:50%!important;',
    'background:#22c55e!important;box-shadow:0 0 7px rgba(34,197,94,.8)!important;',
    'border:2px solid #04091c!important;}',
  '#sfl-panel .sf-hdr-info{flex:1!important;min-width:0!important;}',
  '#sfl-panel .sf-hdr-name{',
    'display:block!important;font:700 .88rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:#e2eeff!important;letter-spacing:.02em!important;margin-bottom:4px!important;}',
  '#sfl-panel .sf-hdr-sub{',
    'display:flex!important;align-items:center!important;gap:5px!important;',
    'font:400 .68rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(226,238,255,.4)!important;}',
  '#sfl-panel .sf-dot{',
    'width:6px!important;height:6px!important;flex-shrink:0!important;',
    'border-radius:50%!important;background:#22c55e!important;',
    'box-shadow:0 0 6px rgba(34,197,94,.7)!important;',
    'animation:_sflBlink 2.6s ease-in-out infinite!important;}',
  '#sfl-panel .sf-close{',
    'width:32px!important;height:32px!important;flex-shrink:0!important;',
    'background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.08)!important;',
    'border-radius:8px!important;cursor:pointer!important;',
    'color:rgba(226,238,255,.45)!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'transition:background .2s,color .2s!important;}',
  '#sfl-panel .sf-close:hover{background:rgba(239,68,68,.18)!important;color:#f87171!important;border-color:rgba(239,68,68,.25)!important;}',

  /* ── Gate ── */
  '#sfl-panel .sf-gate{',
    'flex:1!important;display:flex!important;flex-direction:column!important;align-items:center!important;',
    'padding:36px 26px 28px!important;overflow-y:auto!important;',
    'transition:opacity .26s ease,transform .26s ease!important;}',
  '#sfl-panel .sf-gate.fading{opacity:0!important;transform:translateY(-10px)!important;pointer-events:none!important;}',

  /* gate icon */
  '#sfl-panel .sf-gate-ico{',
    'width:72px!important;height:72px!important;margin-bottom:20px!important;flex-shrink:0!important;',
    'border-radius:50%!important;',
    'background:linear-gradient(135deg,rgba(30,58,138,.6),rgba(37,99,235,.35))!important;',
    'border:1px solid rgba(59,130,246,.28)!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'box-shadow:0 0 36px rgba(37,99,235,.22)!important;',
    'font-size:2rem!important;line-height:1!important;}',

  '#sfl-panel .sf-gate h3{',
    'font:800 1.05rem/1.3 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:#e2eeff!important;text-align:center!important;',
    'margin-bottom:10px!important;letter-spacing:.02em!important;}',
  '#sfl-panel .sf-gate p{',
    'font:400 .8rem/1.75 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(226,238,255,.46)!important;text-align:center!important;',
    'margin-bottom:28px!important;max-width:280px!important;}',

  '#sfl-panel .sf-field{width:100%!important;margin-bottom:12px!important;}',
  '#sfl-panel .sf-field label{',
    'display:block!important;margin-bottom:7px!important;',
    'font:700 .65rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'letter-spacing:.15em!important;text-transform:uppercase!important;',
    'color:rgba(226,238,255,.4)!important;}',
  '#sfl-panel .sf-inp{',
    'width:100%!important;padding:12px 14px!important;',
    'background:rgba(255,255,255,.055)!important;',
    'border:1px solid rgba(226,238,255,.1)!important;',
    'border-radius:10px!important;',
    'color:#e2eeff!important;',
    'font:400 .87rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'outline:none!important;',
    'transition:border-color .2s,background .2s!important;}',
  '#sfl-panel .sf-inp::placeholder{color:rgba(226,238,255,.22)!important;}',
  '#sfl-panel .sf-inp:focus{border-color:rgba(59,130,246,.55)!important;background:rgba(37,99,235,.08)!important;}',
  '#sfl-panel .sf-inp.err{border-color:rgba(239,68,68,.6)!important;background:rgba(239,68,68,.06)!important;}',

  '#sfl-panel .sf-start{',
    'width:100%!important;margin-top:6px!important;padding:13px 20px!important;',
    'border:none!important;border-radius:10px!important;cursor:pointer!important;',
    'background:linear-gradient(135deg,#1d4ed8,#3b82f6)!important;',
    'color:#fff!important;',
    'font:700 .82rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'letter-spacing:.12em!important;text-transform:uppercase!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;',
    'box-shadow:0 6px 24px rgba(37,99,235,.42)!important;',
    'transition:opacity .2s,transform .2s,box-shadow .2s!important;}',
  '#sfl-panel .sf-start:hover{opacity:.88!important;transform:translateY(-2px)!important;box-shadow:0 10px 32px rgba(37,99,235,.55)!important;}',
  '#sfl-panel .sf-start svg{flex-shrink:0!important;}',

  /* ── Chat body ── */
  '#sfl-panel .sf-body{flex:1!important;display:none!important;flex-direction:column!important;overflow:hidden!important;min-height:0!important;}',
  '#sfl-panel .sf-body.active{display:flex!important;animation:_sflFadeUp .32s ease both!important;}',

  /* info bar */
  '#sfl-panel .sf-info{',
    'display:flex!important;align-items:center!important;gap:8px!important;',
    'padding:8px 16px 8px 12px!important;',
    'border-bottom:1px solid rgba(59,130,246,.07)!important;flex-shrink:0!important;',
    'background:rgba(255,255,255,.016)!important;}',
  '#sfl-panel .sf-back{',
    'display:flex!important;align-items:center!important;gap:6px!important;',
    'background:none!important;border:none!important;cursor:pointer!important;',
    'color:rgba(226,238,255,.35)!important;padding:6px 10px!important;border-radius:7px!important;',
    'font:400 .7rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'white-space:nowrap!important;transition:color .2s,background .2s!important;}',
  '#sfl-panel .sf-back:hover{color:#60a5fa!important;background:rgba(59,130,246,.1)!important;}',
  '#sfl-panel .sf-vinfo{flex:1!important;min-width:0!important;text-align:right!important;}',
  '#sfl-panel .sf-vname{display:block!important;font:700 .76rem/1.3 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(226,238,255,.68)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}',
  '#sfl-panel .sf-vemail{display:block!important;font:400 .64rem/1.2 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(59,130,246,.55)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;margin-top:2px!important;}',

  /* messages area */
  '#sfl-panel .sf-msgs{',
    'flex:1!important;overflow-y:auto!important;overflow-x:hidden!important;',
    'padding:22px 18px 18px!important;',
    'display:flex!important;flex-direction:column!important;gap:16px!important;',
    'scroll-behavior:smooth!important;min-height:0!important;}',
  '#sfl-panel .sf-msgs::-webkit-scrollbar{width:3px!important;}',
  '#sfl-panel .sf-msgs::-webkit-scrollbar-thumb{background:rgba(59,130,246,.2)!important;border-radius:2px!important;}',

  /* message row */
  '#sfl-panel .sf-row{display:flex!important;flex-direction:column!important;max-width:86%!important;gap:5px!important;}',
  '#sfl-panel .sf-row.visitor{align-self:flex-end!important;align-items:flex-end!important;}',
  '#sfl-panel .sf-row.agent{align-self:flex-start!important;align-items:flex-start!important;}',
  '#sfl-panel .sf-row.anim{animation:_sflIn .3s cubic-bezier(.16,1,.3,1) both!important;}',

  /* bubble */
  '#sfl-panel .sf-bub{',
    'padding:11px 15px!important;border-radius:14px!important;',
    'font:400 .855rem/1.6 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'word-break:break-word!important;max-width:100%!important;}',
  '#sfl-panel .sf-row.visitor .sf-bub{',
    'background:linear-gradient(145deg,#1d4ed8,#3b82f6)!important;',
    'color:#fff!important;border-bottom-right-radius:4px!important;',
    'box-shadow:0 4px 16px rgba(37,99,235,.35)!important;}',
  '#sfl-panel .sf-row.agent .sf-bub{',
    'background:rgba(255,255,255,.075)!important;',
    'border:1px solid rgba(255,255,255,.09)!important;',
    'color:rgba(226,238,255,.9)!important;',
    'border-bottom-left-radius:4px!important;}',
  '#sfl-panel .sf-bub.img-only{padding:4px!important;background:transparent!important;border:none!important;box-shadow:none!important;}',

  /* meta row (sender + time) */
  '#sfl-panel .sf-meta{',
    'display:flex!important;align-items:center!important;gap:6px!important;',
    'padding:0 2px!important;}',
  '#sfl-panel .sf-sender{font:700 .62rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(96,165,250,.75)!important;letter-spacing:.06em!important;text-transform:uppercase!important;}',
  '#sfl-panel .sf-time{font:400 .62rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(226,238,255,.28)!important;}',

  /* image in bubble */
  '#sfl-panel .sf-cimg{display:block!important;max-width:200px!important;max-height:180px!important;',
    'border-radius:10px!important;object-fit:cover!important;cursor:pointer!important;}',
  '#sfl-panel .sf-cimg:hover{opacity:.85!important;}',

  /* typing indicator */
  '#sfl-panel .sf-typing-row{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:5px!important;max-width:86%!important;}',
  '#sfl-panel .sf-typing-lbl{font:700 .62rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(96,165,250,.65)!important;letter-spacing:.06em!important;text-transform:uppercase!important;padding:0 2px!important;}',
  '#sfl-panel .sf-dots{',
    'display:inline-flex!important;align-items:center!important;gap:4px!important;',
    'padding:12px 16px!important;',
    'background:rgba(255,255,255,.075)!important;border:1px solid rgba(255,255,255,.09)!important;',
    'border-radius:14px!important;border-bottom-left-radius:4px!important;}',
  '#sfl-panel .sf-dots span{width:7px!important;height:7px!important;border-radius:50%!important;',
    'background:rgba(96,165,250,.65)!important;display:inline-block!important;',
    'animation:_sflDot .88s ease-in-out infinite!important;}',
  '#sfl-panel .sf-dots span:nth-child(2){animation-delay:.15s!important;}',
  '#sfl-panel .sf-dots span:nth-child(3){animation-delay:.3s!important;}',

  /* date divider */
  '#sfl-panel .sf-date{display:flex!important;align-items:center!important;gap:10px!important;}',
  '#sfl-panel .sf-date span{font:400 .6rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(226,238,255,.25)!important;letter-spacing:.06em!important;white-space:nowrap!important;}',
  '#sfl-panel .sf-date::before,#sfl-panel .sf-date::after{content:""!important;flex:1!important;',
    'height:1px!important;background:rgba(255,255,255,.05)!important;}',

  /* upload progress bar */
  '#sfl-panel .sf-prog{height:2px!important;background:rgba(37,99,235,.12)!important;flex-shrink:0!important;overflow:hidden!important;display:none!important;}',
  '#sfl-panel .sf-prog.on{display:block!important;}',
  '#sfl-panel .sf-prog::after{content:""!important;display:block!important;height:100%!important;width:35%!important;',
    'background:linear-gradient(90deg,transparent,#3b82f6,#60a5fa,transparent)!important;',
    'animation:_sflProg 1.1s linear infinite!important;}',

  /* input row */
  '#sfl-panel .sf-input-row{',
    'display:flex!important;align-items:flex-end!important;gap:8px!important;',
    'padding:12px 14px 14px!important;',
    'border-top:1px solid rgba(59,130,246,.07)!important;',
    'background:rgba(255,255,255,.016)!important;flex-shrink:0!important;}',

  /* image attach button */
  '#sfl-panel .sf-imgbtn{',
    'width:40px!important;height:40px!important;flex-shrink:0!important;align-self:flex-end!important;',
    'background:rgba(255,255,255,.06)!important;border:1px solid rgba(226,238,255,.1)!important;',
    'border-radius:11px!important;cursor:pointer!important;color:rgba(226,238,255,.42)!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'transition:background .2s,color .2s,border-color .2s!important;}',
  '#sfl-panel .sf-imgbtn:hover{background:rgba(37,99,235,.14)!important;color:#60a5fa!important;border-color:rgba(59,130,246,.3)!important;}',
  '#sfl-panel .sf-imgbtn.busy{opacity:.3!important;pointer-events:none!important;}',

  /* textarea */
  '#sfl-panel .sf-ta{',
    'flex:1!important;padding:10px 13px!important;',
    'background:rgba(255,255,255,.06)!important;border:1px solid rgba(226,238,255,.1)!important;',
    'border-radius:10px!important;color:#e2eeff!important;',
    'font:400 .86rem/1.55 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'resize:none!important;outline:none!important;',
    'min-height:40px!important;max-height:110px!important;overflow-y:auto!important;',
    'transition:border-color .2s,background .2s!important;}',
  '#sfl-panel .sf-ta::placeholder{color:rgba(226,238,255,.24)!important;}',
  '#sfl-panel .sf-ta:focus{border-color:rgba(59,130,246,.5)!important;background:rgba(37,99,235,.07)!important;}',

  /* send button */
  '#sfl-panel .sf-send{',
    'width:40px!important;height:40px!important;flex-shrink:0!important;align-self:flex-end!important;',
    'border:1px solid rgba(255,255,255,.16)!important;border-radius:11px!important;cursor:pointer!important;',
    'background:linear-gradient(140deg,#1d4ed8,#3b82f6)!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'box-shadow:0 5px 16px rgba(37,99,235,.45),inset 0 1px 0 rgba(255,255,255,.25)!important;',
    'transition:opacity .2s,transform .2s,box-shadow .2s!important;}',
  '#sfl-panel .sf-send:hover{transform:translateY(-2px)!important;box-shadow:0 9px 24px rgba(37,99,235,.6),inset 0 1px 0 rgba(255,255,255,.3)!important;}',
  '#sfl-panel .sf-send:disabled{opacity:.28!important;pointer-events:none!important;transform:none!important;box-shadow:none!important;}',

  /* footer */
  '#sfl-panel .sf-foot{',
    'text-align:center!important;padding:5px 0 9px!important;flex-shrink:0!important;',
    'font:400 .58rem/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif!important;',
    'color:rgba(226,238,255,.15)!important;letter-spacing:.1em!important;text-transform:uppercase!important;}',

  /* ── Mobile — full-height bottom sheet ── */
  '@media(max-width:520px){',
    '#sfl-panel{',
      'top:0!important;bottom:0!important;right:0!important;left:0!important;',
      'width:100%!important;max-width:100%!important;',
      'border-radius:0!important;',
    '}',
    '#sfl-fab,#sfl-pulse{bottom:18px!important;right:18px!important;z-index:2147483642!important;}',
    '#sfl-badge{bottom:68px!important;right:12px!important;}',
    '#sfl-panel .sf-cimg{max-width:160px!important;}',
    /* When the full-screen panel is open, hide the floating button + pulse so
       they never sit on top of the send button — the header X closes the chat. */
    'body.sfl-chat-open #sfl-fab,body.sfl-chat-open #sfl-pulse{',
      'opacity:0!important;transform:scale(.6)!important;pointer-events:none!important;}',
  '}',

  ].join('');

  var styleEl = document.createElement('style');
  styleEl.id = 'sfl-css';
  document.head.appendChild(styleEl);
  styleEl.textContent = css;

  /* ════════════════════════════════════════════════════════════════
     BUILD DOM
     ════════════════════════════════════════════════════════════════ */
  function buildUI() {
    if (ge('sfl-fab')) return;

    /* Pulse */
    var pulse = mk('div'); pulse.id = 'sfl-pulse';
    document.body.appendChild(pulse);

    /* Badge */
    var badge = mk('div'); badge.id = 'sfl-badge'; badge.textContent = '0';
    document.body.appendChild(badge);

    /* FAB */
    var fab = mk('button'); fab.id = 'sfl-fab'; fab.setAttribute('aria-label', 'Chat with support');
    fab.innerHTML = '<span class="sfl-ic sfl-ic-chat">' + IC.chat + '</span>' +
                    '<span class="sfl-ic sfl-ic-close">' + IC.close + '</span>';
    document.body.appendChild(fab);

    /* Panel */
    var panel = mk('div'); panel.id = 'sfl-panel'; panel.setAttribute('role', 'dialog');
    panel.innerHTML =

      /* Header */
      '<div class="sf-hdr">' +
        '<div class="sf-av">SFL</div>' +
        '<div class="sf-hdr-info">' +
          '<span class="sf-hdr-name">Support Team</span>' +
          '<div class="sf-hdr-sub"><span class="sf-dot"></span><span>Online · replies instantly</span></div>' +
        '</div>' +
        '<button class="sf-close" id="sfl-close" title="Close">' + IC.close + '</button>' +
      '</div>' +

      /* Gate */
      '<div class="sf-gate" id="sfl-gate">' +
        '<div class="sf-gate-ico">💬</div>' +
        '<h3>Swift Freight Live Support</h3>' +
        '<p>Real-time help with tracking, payments & deliveries. Send photos too.</p>' +
        '<div class="sf-field"><label>Your Name</label>' +
          '<input class="sf-inp" id="sfl-inp-name" type="text" placeholder="e.g. John Smith" maxlength="80" autocomplete="name"></div>' +
        '<div class="sf-field"><label>Email Address</label>' +
          '<input class="sf-inp" id="sfl-inp-email" type="email" placeholder="e.g. john@email.com" maxlength="120" autocomplete="email"></div>' +
        '<button class="sf-start" id="sfl-start">Start Chat ' + IC.arr + '</button>' +
      '</div>' +

      /* Chat body */
      '<div class="sf-body" id="sfl-body">' +
        '<div class="sf-info">' +
          '<button class="sf-back" id="sfl-back">' + IC.back + ' &nbsp;New Chat</button>' +
          '<div class="sf-vinfo">' +
            '<span class="sf-vname" id="sfl-vname"></span>' +
            '<span class="sf-vemail" id="sfl-vemail"></span>' +
          '</div>' +
        '</div>' +
        '<div class="sf-msgs" id="sfl-msgs"></div>' +
        '<div class="sf-prog" id="sfl-prog"></div>' +
        '<div class="sf-input-row">' +
          '<label class="sf-imgbtn" id="sfl-imgbtn" for="sfl-img-inp" title="Attach photo">' + IC.img + '</label>' +
          '<input type="file" id="sfl-img-inp" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none!important">' +
          '<textarea class="sf-ta" id="sfl-ta" placeholder="Type a message…" rows="1"></textarea>' +
          '<button class="sf-send" id="sfl-send">' + IC.send + '</button>' +
        '</div>' +
        '<div class="sf-foot">Swift Freight Logistics · Secure Chat</div>' +
      '</div>';

    document.body.appendChild(panel);

    /* Events */
    fab.addEventListener('click', toggle);
    ge('sfl-close').addEventListener('click', closeChat);
    ge('sfl-start').addEventListener('click', startChat);
    ge('sfl-back').addEventListener('click', resetToGate);
    ge('sfl-send').addEventListener('click', sendMsg);

    var ta = ge('sfl-ta');
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    });
    ta.addEventListener('input', autosize);

    ge('sfl-inp-name').addEventListener('keydown',  function (e) { if (e.key === 'Enter') ge('sfl-inp-email').focus(); });
    ge('sfl-inp-email').addEventListener('keydown', function (e) { if (e.key === 'Enter') startChat(); });
    ge('sfl-img-inp').addEventListener('change', handleImageSelect);

    if (sessionId && visitorName) { restoreSession(); }
  }

  function autosize() {
    var ta = ge('sfl-ta');
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 110) + 'px';
  }

  /* ════════════════════════════════════════════════════════════════
     OPEN / CLOSE
     ════════════════════════════════════════════════════════════════ */
  function toggle() { isOpen ? closeChat() : openChat(); }

  function openChat() {
    isOpen = true;
    ge('sfl-panel').classList.add('open');
    ge('sfl-fab').classList.add('open');
    document.body.classList.add('sfl-chat-open');
    clearBadge();
    if (sessionId && visitorName) { loadHistory(); subscribe(); }
  }

  function closeChat() {
    isOpen = false;
    ge('sfl-panel').classList.remove('open');
    ge('sfl-fab').classList.remove('open');
    document.body.classList.remove('sfl-chat-open');
  }

  /* ════════════════════════════════════════════════════════════════
     GATE → CHAT
     ════════════════════════════════════════════════════════════════ */
  function startChat() {
    var name  = ge('sfl-inp-name').value.trim();
    var email = ge('sfl-inp-email').value.trim();
    var ok    = true;

    if (!name)  { ge('sfl-inp-name').classList.add('err');  if (ok) { ge('sfl-inp-name').focus(); }  ok = false; }
    else          ge('sfl-inp-name').classList.remove('err');
    if (!email || !email.includes('@')) {
      ge('sfl-inp-email').classList.add('err'); if (ok) { ge('sfl-inp-email').focus(); } ok = false;
    } else { ge('sfl-inp-email').classList.remove('err'); }
    if (!ok) return;

    visitorName  = name;
    visitorEmail = email;
    sessionId    = 'sfl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(K_SID, sessionId);
    localStorage.setItem(K_NAME, visitorName);
    localStorage.setItem(K_EMAIL, visitorEmail);
    isFirstMsg = true;

    /* Fade gate out, then reveal chat body */
    var gate = ge('sfl-gate');
    gate.classList.add('fading');
    setTimeout(function () {
      hideGate(gate);
      showBody();
      subscribe();
      setTimeout(function () { ge('sfl-ta').focus(); }, 60);
    }, 260);
  }

  /* Inline !important is the highest CSS priority — guaranteed to beat
     any stylesheet rule including our own display:flex!important */
  function hideGate(el) {
    el = el || ge('sfl-gate');
    el.style.setProperty('display', 'none', 'important');
  }

  function showGate(el) {
    el = el || ge('sfl-gate');
    el.style.removeProperty('display');
    el.classList.remove('fading');
  }

  function restoreSession() {
    isFirstMsg = false;
    hideGate();
    ge('sfl-body').classList.add('active');
    ge('sfl-vname').textContent  = visitorName;
    ge('sfl-vemail').textContent = visitorEmail;
  }

  function showBody() {
    ge('sfl-body').classList.add('active');
    ge('sfl-vname').textContent  = visitorName;
    ge('sfl-vemail').textContent = visitorEmail;
    /* Show welcome immediately for new visitors */
    if (isFirstMsg) {
      setTimeout(function () {
        appendMsg({ role:'agent', content:WELCOME, visitor_name:'Support Agent', created_at:new Date().toISOString() }, true);
      }, 180);
    }
  }

  function resetToGate() {
    sessionId = ''; visitorName = ''; visitorEmail = '';
    localStorage.removeItem(K_SID); localStorage.removeItem(K_NAME); localStorage.removeItem(K_EMAIL);
    if (rtSub) { try { rtSub.unsubscribe(); } catch (_) {} rtSub = null; }
    isFirstMsg = true; skipWelcomeOnce = false;
    ge('sfl-msgs').innerHTML = '';
    ge('sfl-inp-name').value = ''; ge('sfl-inp-email').value = '';
    ge('sfl-body').classList.remove('active');
    showGate();
    setTimeout(function () { ge('sfl-inp-name').focus(); }, 60);
  }

  /* ════════════════════════════════════════════════════════════════
     SEND TEXT
     ════════════════════════════════════════════════════════════════ */
  function sendMsg() {
    var ta   = ge('sfl-ta');
    var text = ta.value.trim();
    if (!text || !sessionId) return;

    var btn = ge('sfl-send');
    btn.disabled = true;
    ta.value = ''; ta.style.height = 'auto';

    var wasFirst = isFirstMsg;
    if (wasFirst) { isFirstMsg = false; skipWelcomeOnce = true; }

    var now = new Date().toISOString();
    /* Welcome already shown by showBody() — only insert to DB, not UI */
    appendMsg({ role:'visitor', content:text, visitor_name:visitorName, created_at:now });

    getSb().then(function (sb) {
      function ins(row) {
        return sb.from('chat_messages').insert(row).then(function (r) {
          if (r && r.error) console.error('[SFL] insert error:', r.error.message, r.error);
        });
      }
      var chain = Promise.resolve();
      if (wasFirst) {
        chain = chain.then(function () {
          return ins({ session_id:sessionId, role:'agent', content:WELCOME,
            visitor_name:'Support Agent', visitor_email:'' });
        });
      }
      chain.then(function () {
        return ins({ session_id:sessionId, role:'visitor', content:text,
          visitor_name:visitorName, visitor_email:visitorEmail });
      }).then(function () { notifyAdmin(text, wasFirst); });

    }).catch(function (e) { console.error('[SFL] getSb', e); })
      .finally(function () { btn.disabled = false; ge('sfl-ta').focus(); });
  }

  /* ════════════════════════════════════════════════════════════════
     SEND IMAGE
     ════════════════════════════════════════════════════════════════ */
  function handleImageSelect() {
    var input = ge('sfl-img-inp');
    var file  = input && input.files && input.files[0];
    if (!file || !sessionId) { if (input) input.value = ''; return; }

    if (file.size > 8 * 1024 * 1024) {
      appendMsg({ role:'agent', content:'⚠️ Image must be under 8 MB.', visitor_name:'Support', created_at:new Date().toISOString() });
      input.value = ''; return;
    }

    var imgBtn = ge('sfl-imgbtn');
    var bar    = ge('sfl-prog');
    imgBtn.classList.add('busy'); bar.classList.add('on');

    var wasFirst = isFirstMsg;
    if (wasFirst) { isFirstMsg = false; skipWelcomeOnce = true; }
    var now = new Date().toISOString();
    /* Welcome already shown by showBody() — only insert to DB, not UI */

    getSb().then(function (sb) {
      return uploadImage(sb, file).then(function (url) {
        appendMsg({ role:'visitor', content:'📷 Photo', image_url:url, visitor_name:visitorName, created_at:now });

        function ins(row) {
          return sb.from('chat_messages').insert(row).then(function (r) {
            if (r && r.error) throw new Error(r.error.message);
          });
        }
        var chain = Promise.resolve();
        if (wasFirst) chain = chain.then(function () {
          return ins({ session_id:sessionId, role:'agent', content:WELCOME,
            visitor_name:'Support Agent', visitor_email:'' });
        });
        return chain.then(function () {
          return ins({ session_id:sessionId, role:'visitor', content:'📷 Photo',
            image_url:url, visitor_name:visitorName, visitor_email:visitorEmail });
        }).then(function () { notifyAdmin('📷 Photo', wasFirst); });
      });
    }).catch(function (e) {
      console.error('[SFL] image:', e);
      appendMsg({ role:'agent', content:'⚠️ Could not send image. Try again.', visitor_name:'Support', created_at:new Date().toISOString() });
    }).finally(function () {
      imgBtn.classList.remove('busy'); bar.classList.remove('on');
      input.value = '';
    });
  }

  function uploadImage(sb, file) {
    var ext  = (file.type.split('/')[1] || 'jpg').replace('jpeg','jpg');
    var path = sessionId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2,6) + '.' + ext;
    return sb.storage.from(BUCKET).upload(path, file, { contentType:file.type, cacheControl:'3600' })
      .then(function (r) {
        if (r.error) throw new Error(r.error.message || 'Upload failed');
        return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      });
  }

  /* ════════════════════════════════════════════════════════════════
     NOTIFY ADMIN
     ════════════════════════════════════════════════════════════════ */
  function notifyAdmin(content, wasFirst) {
    fetch(FN + '/chat-notify', {
      method:'POST', headers:HDR,
      body:JSON.stringify({ role:'visitor', content:content, isFirst:!!wasFirst,
        visitorName:visitorName, visitorEmail:visitorEmail, sessionId:sessionId, pageUrl:location.href }),
    }).catch(function (e) { console.error('[SFL] notify:', e); });
  }

  /* ════════════════════════════════════════════════════════════════
     REALTIME — unfiltered, client-side session check.
     Avoids REPLICA IDENTITY FULL requirement for column filters.
     ════════════════════════════════════════════════════════════════ */
  function subscribe() {
    if (rtSub || !sessionId) return;
    getSb().then(function (sb) {
      rtSub = sb.channel('sfl-v-' + sessionId)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'chat_messages' },
          function (payload) {
            var m = payload.new;
            if (m.session_id !== sessionId) return;
            if (m.role !== 'agent') return;
            if (skipWelcomeOnce && m.content === WELCOME) { skipWelcomeOnce = false; return; }
            appendMsg(m, true);
            if (!isOpen) { unread++; updateBadge(); }
          })
        .subscribe(function (status) {
          if (status === 'CHANNEL_ERROR') console.warn('[SFL] Realtime: run Setup SQL in Supabase.');
        });
    }).catch(function (e) { console.error('[SFL] subscribe:', e); });
  }

  /* ════════════════════════════════════════════════════════════════
     LOAD HISTORY
     ════════════════════════════════════════════════════════════════ */
  function loadHistory() {
    var area = ge('sfl-msgs');
    if (!area || !sessionId) return;
    getSb().then(function (sb) {
      return sb.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending:true });
    }).then(function (res) {
      if (res.error) throw res.error;
      area.innerHTML = '';
      if (res.data && res.data.length) {
        isFirstMsg = false;
        var lastDate = '';
        res.data.forEach(function (m) {
          var d = new Date(m.created_at).toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' });
          if (d !== lastDate) { appendDateDiv(d); lastDate = d; }
          appendMsg(m, false);
        });
        scrollBottom();
      }
    }).catch(function (e) { console.error('[SFL] history:', e); });
  }

  /* ════════════════════════════════════════════════════════════════
     RENDER MESSAGES
     ════════════════════════════════════════════════════════════════ */
  function appendMsg(m, animate) {
    var area = ge('sfl-msgs');
    if (!area) return;

    var row = mk('div');
    row.className = 'sf-row ' + m.role + (animate !== false ? ' anim' : '');

    var bub = mk('div');
    if (m.image_url) {
      bub.className = 'sf-bub img-only';
      var img = mk('img');
      img.className = 'sf-cimg'; img.src = m.image_url; img.alt = 'Photo';
      img.setAttribute('loading','lazy');
      img.onclick = function () { window.open(m.image_url,'_blank'); };
      bub.appendChild(img);
    } else {
      bub.className = 'sf-bub';
      bub.textContent = m.content || '';
    }
    row.appendChild(bub);

    var meta = mk('div'); meta.className = 'sf-meta';
    if (m.role === 'agent') {
      var s = mk('span'); s.className = 'sf-sender';
      s.textContent = m.visitor_name || 'Support Agent';
      meta.appendChild(s);
    }
    var t = mk('span'); t.className = 'sf-time';
    t.textContent = fmtTime(m.created_at);
    meta.appendChild(t);
    row.appendChild(meta);

    area.appendChild(row);
    if (animate !== false) scrollBottom();
  }

  function appendDateDiv(label) {
    var d = mk('div'); d.className = 'sf-date';
    d.innerHTML = '<span>' + label + '</span>';
    ge('sfl-msgs').appendChild(d);
  }

  function scrollBottom() {
    var a = ge('sfl-msgs');
    if (a) setTimeout(function () { a.scrollTop = a.scrollHeight; }, 30);
  }

  function fmtTime(iso) {
    try { return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
    catch (_) { return ''; }
  }

  /* ════════════════════════════════════════════════════════════════
     BADGE
     ════════════════════════════════════════════════════════════════ */
  function updateBadge() {
    var b = ge('sfl-badge');
    if (!b) return;
    b.textContent = unread > 9 ? '9+' : String(unread);
    b.classList.toggle('show', unread > 0);
  }
  function clearBadge() { unread = 0; updateBadge(); }

  /* ════════════════════════════════════════════════════════════════
     SUPABASE CLIENT
     ════════════════════════════════════════════════════════════════ */
  function getSb() {
    return new Promise(function (res, rej) {
      if (sbClient) { res(sbClient); return; }
      function init() {
        if (window.supabase && window.supabase.createClient) {
          sbClient = window.supabase.createClient(SB_URL, SB_ANON);
          res(sbClient);
        } else { rej(new Error('Supabase SDK not available')); }
      }
      if (window.supabase && window.supabase.createClient) { init(); return; }
      var n = 0, iv = setInterval(function () {
        n++;
        if (window.supabase && window.supabase.createClient) { clearInterval(iv); init(); }
        else if (n > 60) { clearInterval(iv); rej(new Error('Supabase load timeout')); }
      }, 100);
    });
  }

  /* ─── Utils ─── */
  function ge(id) { return document.getElementById(id); }
  function mk(tag) { return document.createElement(tag); }

  /* ─── Mount ─── */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUI);
  else buildUI();

})();
