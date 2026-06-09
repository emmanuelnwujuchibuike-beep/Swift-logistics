/* ═══════════════════════════════════════════════════════════════
   Swift Freight Logistics — Live Chat Widget  v4
   Features: real-time messaging, image uploads, email notifications
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const SB_URL    = 'https://oltbgccsceipedoadgka.supabase.co';
  const SB_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdGJnY2NzY2VpcGVkb2FkZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY0NTQsImV4cCI6MjA5NjQwMjQ1NH0.Q5uoDXqlxBl-FxiISbp5bR3NLDsEL4iOMYVbVugwv94';
  const FN        = SB_URL + '/functions/v1';
  const BUCKET    = 'chat-images';
  const WELCOME   = 'Hello! 👋 Welcome to Swift Freight support. How can we help you today?';
  const K_SID     = 'sfl_chat_sid';
  const K_NAME    = 'sfl_chat_name';
  const K_EMAIL   = 'sfl_chat_email';
  const HDR       = { 'Content-Type': 'application/json', 'apikey': SB_ANON, 'Authorization': 'Bearer ' + SB_ANON };

  let sbClient        = null;
  let rtSub           = null;
  let sessionId       = localStorage.getItem(K_SID)   || '';
  let visitorName     = localStorage.getItem(K_NAME)  || '';
  let visitorEmail    = localStorage.getItem(K_EMAIL) || '';
  let isOpen          = false;
  let unread          = 0;
  let isFirstMsg      = true;
  let skipWelcomeOnce = false;

  /* ── CSS ── */
  const S = document.createElement('style');
  S.textContent = `
  #sfl-root,#sfl-root *{box-sizing:border-box;margin:0;padding:0}

  /* FAB */
  #sfl-fab{
    position:fixed;bottom:30px;right:30px;z-index:9100;
    width:62px;height:62px;border:none;cursor:pointer;
    background:linear-gradient(135deg,#1d4ed8 0%,#3b82f6 55%,#60a5fa 100%);
    border-radius:6px;
    clip-path:polygon(0 0,calc(100% - 13px) 0,100% 13px,100% 100%,13px 100%,0 calc(100% - 13px));
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 32px rgba(59,130,246,.52),0 2px 8px rgba(0,0,0,.38);
    transition:transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .28s;
    outline:none;font-family:'DM Sans',sans-serif;
  }
  #sfl-fab:hover{transform:translateY(-4px) scale(1.07);box-shadow:0 18px 44px rgba(59,130,246,.62)}
  #sfl-fab svg{width:27px;height:27px;fill:#fff;position:absolute;transition:opacity .22s,transform .22s}
  #sfl-fab .ic-chat{opacity:1;transform:scale(1)}
  #sfl-fab .ic-close{opacity:0;transform:scale(.65)}
  #sfl-fab.open .ic-chat{opacity:0;transform:scale(.65)}
  #sfl-fab.open .ic-close{opacity:1;transform:scale(1)}

  #sfl-pulse{
    position:fixed;bottom:30px;right:30px;z-index:9099;
    width:62px;height:62px;pointer-events:none;
    clip-path:polygon(0 0,calc(100% - 13px) 0,100% 13px,100% 100%,13px 100%,0 calc(100% - 13px));
  }
  #sfl-pulse::before,#sfl-pulse::after{
    content:'';position:absolute;inset:-5px;
    border:2px solid rgba(59,130,246,.48);border-radius:7px;
    animation:sflRing 2.8s ease-out infinite;
    clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));
  }
  #sfl-pulse::after{animation-delay:1.4s}
  @keyframes sflRing{0%{transform:scale(1);opacity:.55}100%{transform:scale(1.55);opacity:0}}

  #sfl-badge{
    position:fixed;bottom:78px;right:26px;z-index:9101;
    min-width:20px;height:20px;padding:0 5px;border-radius:99px;
    background:linear-gradient(135deg,#ef4444,#f97316);
    color:#fff;font-size:10px;font-weight:800;font-family:'DM Sans',sans-serif;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 10px rgba(239,68,68,.55);pointer-events:none;
    transform:scale(0);transition:transform .3s cubic-bezier(.34,1.56,.64,1);
  }
  #sfl-badge.show{transform:scale(1)}

  /* Panel */
  #sfl-panel{
    position:fixed;bottom:110px;right:30px;z-index:9100;
    width:395px;
    background:rgba(4,9,26,.98);
    backdrop-filter:blur(52px) saturate(1.9);
    -webkit-backdrop-filter:blur(52px) saturate(1.9);
    border:1px solid rgba(59,130,246,.14);
    border-radius:8px;
    display:flex;flex-direction:column;overflow:hidden;
    box-shadow:0 44px 96px rgba(0,0,0,.78),0 0 0 1px rgba(59,130,246,.05),0 0 90px rgba(59,130,246,.06);
    transform:translateY(26px) scale(.93);opacity:0;pointer-events:none;
    transition:transform .42s cubic-bezier(.16,1,.3,1),opacity .34s ease;
    max-height:calc(100vh - 136px);
    font-family:'DM Sans',system-ui,sans-serif;
  }
  #sfl-panel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all}
  #sfl-panel *{box-sizing:border-box;margin:0;padding:0}
  #sfl-panel::before{
    content:'';position:absolute;top:0;left:0;right:0;height:2px;z-index:3;
    background:linear-gradient(90deg,transparent,#1d4ed8 20%,#3b82f6 50%,#60a5fa 80%,transparent);
  }

  .sfl-hdr{
    display:flex;align-items:center;gap:13px;padding:16px 18px 15px;
    background:linear-gradient(135deg,rgba(8,15,40,.75),rgba(29,54,130,.22));
    border-bottom:1px solid rgba(59,130,246,.09);flex-shrink:0;
  }
  .sfl-avatar{
    width:44px;height:44px;flex-shrink:0;border-radius:4px;
    background:linear-gradient(135deg,#1e3a8a,#3b82f6);
    clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
    display:flex;align-items:center;justify-content:center;
    font-family:'Bebas Neue',sans-serif;font-size:1.08rem;letter-spacing:.08em;color:#fff;
    box-shadow:0 0 20px rgba(59,130,246,.42);position:relative;
  }
  .sfl-avatar::after{
    content:'';position:absolute;bottom:2px;right:2px;
    width:10px;height:10px;border-radius:50%;
    background:#22c55e;box-shadow:0 0 6px #22c55e;
    border:2px solid rgba(4,9,26,.98);
  }
  .sfl-hdr-info{flex:1;min-width:0}
  .sfl-hdr-name{font-size:.9rem;font-weight:700;color:#e8f0fe;letter-spacing:.025em;line-height:1.2}
  .sfl-hdr-sub{font-size:.69rem;color:rgba(232,240,254,.45);margin-top:3px;display:flex;align-items:center;gap:5px}
  .sfl-online{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e;flex-shrink:0;animation:sflBlink 2.8s ease-in-out infinite}
  @keyframes sflBlink{0%,100%{opacity:1}50%{opacity:.4}}
  .sfl-close-btn{
    width:32px;height:32px;flex-shrink:0;background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.08);border-radius:3px;
    color:rgba(232,240,254,.45);cursor:pointer;
    display:flex;align-items:center;justify-content:center;font-size:.78rem;
    transition:all .2s;
    clip-path:polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px));
  }
  .sfl-close-btn:hover{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);color:#f87171}

  /* Welcome gate */
  .sfl-gate{
    flex:1;display:flex;flex-direction:column;align-items:center;
    padding:34px 28px 28px;overflow-y:auto;
  }
  .sfl-gate-icon{
    width:70px;height:70px;margin-bottom:22px;
    background:linear-gradient(135deg,rgba(30,64,175,.48),rgba(59,130,246,.28));
    border:1px solid rgba(59,130,246,.26);border-radius:6px;
    clip-path:polygon(0 0,calc(100% - 11px) 0,100% 11px,100% 100%,11px 100%,0 calc(100% - 11px));
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 32px rgba(59,130,246,.18);
  }
  .sfl-gate-icon svg{width:32px;height:32px;fill:#60a5fa}
  .sfl-gate h3{font-size:1.08rem;font-weight:700;color:#e8f0fe;letter-spacing:.028em;text-align:center;margin-bottom:10px}
  .sfl-gate p{font-size:.8rem;color:rgba(232,240,254,.48);line-height:1.78;text-align:center;margin-bottom:28px;max-width:285px}
  .sfl-field{width:100%;margin-bottom:13px}
  .sfl-field label{display:block;font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(232,240,254,.48);margin-bottom:7px}
  .sfl-inp{
    width:100%;padding:12px 15px;
    background:rgba(255,255,255,.05);border:1px solid rgba(232,240,254,.1);
    border-radius:4px;color:#e8f0fe;font-size:.87rem;font-family:'DM Sans',sans-serif;
    outline:none;transition:border-color .2s,background .2s;
  }
  .sfl-inp::placeholder{color:rgba(232,240,254,.27)}
  .sfl-inp:focus{border-color:rgba(59,130,246,.52);background:rgba(59,130,246,.05)}
  .sfl-inp.err{border-color:rgba(239,68,68,.55);background:rgba(239,68,68,.04)}
  .sfl-gate-btn{
    width:100%;margin-top:6px;padding:13px;border:none;border-radius:4px;cursor:pointer;
    background:linear-gradient(135deg,#1d4ed8,#3b82f6);
    color:#fff;font:700 .8rem/1 'DM Sans',sans-serif;letter-spacing:.13em;text-transform:uppercase;
    transition:opacity .2s,transform .2s;
    clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));
    box-shadow:0 6px 24px rgba(59,130,246,.4);
  }
  .sfl-gate-btn:hover{opacity:.86;transform:translateY(-2px)}

  /* Chat body */
  #sfl-body{flex:1;display:none;flex-direction:column;overflow:hidden;min-height:0}
  .sfl-info-bar{
    display:flex;align-items:center;gap:10px;padding:9px 14px 9px 12px;
    border-bottom:1px solid rgba(59,130,246,.08);background:rgba(255,255,255,.016);flex-shrink:0;
  }
  .sfl-back-btn{
    display:flex;align-items:center;gap:5px;background:none;border:none;cursor:pointer;
    color:rgba(232,240,254,.38);font-size:.7rem;font-family:'DM Sans',sans-serif;
    padding:5px 9px;border-radius:3px;white-space:nowrap;transition:color .2s,background .2s;
  }
  .sfl-back-btn:hover{color:#60a5fa;background:rgba(59,130,246,.1)}
  .sfl-vinfo{flex:1;min-width:0;text-align:right}
  .sfl-vname{font-size:.77rem;font-weight:700;color:rgba(232,240,254,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sfl-vemail{font-size:.65rem;color:rgba(59,130,246,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}

  /* Messages */
  #sfl-msgs{
    flex:1;overflow-y:auto;padding:24px 18px;
    display:flex;flex-direction:column;gap:16px;scroll-behavior:smooth;
  }
  #sfl-msgs::-webkit-scrollbar{width:3px}
  #sfl-msgs::-webkit-scrollbar-track{background:transparent}
  #sfl-msgs::-webkit-scrollbar-thumb{background:rgba(59,130,246,.22);border-radius:2px}

  /* Bubble */
  .sfl-msg{display:flex;flex-direction:column;max-width:82%;animation:sflMsgIn .32s cubic-bezier(.16,1,.3,1) both}
  @keyframes sflMsgIn{from{opacity:0;transform:translateY(12px) scale(.95)}to{opacity:1;transform:none}}
  .sfl-msg.visitor{align-self:flex-end;align-items:flex-end}
  .sfl-msg.agent{align-self:flex-start;align-items:flex-start}
  .sfl-bubble{padding:13px 17px;font-size:.86rem;line-height:1.65;word-break:break-word;border-radius:4px}
  .sfl-bubble.img-only{padding:5px}
  .sfl-msg.visitor .sfl-bubble{
    background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 45%,#3b82f6 100%);color:#fff;
    box-shadow:0 5px 22px rgba(59,130,246,.38);
    clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,0 100%);
  }
  .sfl-msg.agent .sfl-bubble{
    background:rgba(255,255,255,.068);border:1px solid rgba(255,255,255,.09);
    color:rgba(232,240,254,.9);
    clip-path:polygon(0 0,100% 0,100% 100%,7px 100%,0 calc(100% - 7px));
  }
  .sfl-meta{display:flex;align-items:center;gap:7px;margin-top:5px;padding:0 3px}
  .sfl-sender{font-size:.63rem;font-weight:700;color:rgba(59,130,246,.72);letter-spacing:.07em;text-transform:uppercase}
  .sfl-time{font-size:.63rem;color:rgba(232,240,254,.3)}

  /* Image in bubble */
  .sfl-chat-img{
    max-width:230px;max-height:200px;
    border-radius:4px;display:block;
    cursor:pointer;object-fit:cover;
    transition:opacity .18s;
  }
  .sfl-chat-img:hover{opacity:.88}
  .sfl-img-caption{font-size:.8rem;margin-top:7px;opacity:.9}

  /* Typing indicator */
  .sfl-typing-wrap{display:flex;flex-direction:column;align-items:flex-start;max-width:82%;animation:sflMsgIn .28s both}
  .sfl-typing-lbl{font-size:.63rem;font-weight:700;color:rgba(59,130,246,.7);letter-spacing:.07em;text-transform:uppercase;margin-bottom:6px;padding:0 3px}
  .sfl-typing{
    display:inline-flex;align-items:center;gap:5px;padding:13px 17px;
    background:rgba(255,255,255,.068);border:1px solid rgba(255,255,255,.09);border-radius:4px;
    clip-path:polygon(0 0,100% 0,100% 100%,7px 100%,0 calc(100% - 7px));
  }
  .sfl-typing span{width:7px;height:7px;border-radius:50%;background:rgba(96,165,250,.72);display:inline-block;animation:sflDot .88s ease-in-out infinite}
  .sfl-typing span:nth-child(2){animation-delay:.15s}
  .sfl-typing span:nth-child(3){animation-delay:.3s}
  @keyframes sflDot{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}

  /* Date divider */
  .sfl-date-div{display:flex;align-items:center;gap:12px;margin:2px 0}
  .sfl-date-div span{font-size:.62rem;color:rgba(232,240,254,.27);letter-spacing:.07em;white-space:nowrap}
  .sfl-date-div::before,.sfl-date-div::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.048)}

  /* Input area */
  .sfl-input-row{
    display:flex;gap:8px;align-items:flex-end;
    padding:12px 14px 14px;
    border-top:1px solid rgba(59,130,246,.07);background:rgba(255,255,255,.018);flex-shrink:0;
  }
  /* Image attach button */
  .sfl-img-btn{
    width:38px;height:38px;flex-shrink:0;
    background:rgba(255,255,255,.06);border:1px solid rgba(232,240,254,.1);
    border-radius:4px;cursor:pointer;color:rgba(232,240,254,.48);font-size:.86rem;
    display:flex;align-items:center;justify-content:center;align-self:flex-end;
    transition:all .2s;
    clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
  }
  .sfl-img-btn:hover{background:rgba(59,130,246,.1);border-color:rgba(59,130,246,.3);color:#60a5fa}
  .sfl-img-btn.uploading{opacity:.45;pointer-events:none}
  .sfl-textarea{
    flex:1;padding:11px 14px;
    background:rgba(255,255,255,.06);border:1px solid rgba(232,240,254,.1);
    border-radius:4px;color:#e8f0fe;font-size:.85rem;font-family:'DM Sans',sans-serif;
    line-height:1.55;resize:none;outline:none;min-height:42px;max-height:112px;
    transition:border-color .2s,background .2s;
  }
  .sfl-textarea::placeholder{color:rgba(232,240,254,.27)}
  .sfl-textarea:focus{border-color:rgba(59,130,246,.5);background:rgba(59,130,246,.04)}
  .sfl-send{
    width:38px;height:38px;flex-shrink:0;
    background:linear-gradient(135deg,#1d4ed8,#3b82f6);border:none;border-radius:4px;
    cursor:pointer;color:#fff;font-size:.8rem;
    display:flex;align-items:center;justify-content:center;
    clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
    box-shadow:0 4px 16px rgba(59,130,246,.4);transition:opacity .2s,transform .2s;
    align-self:flex-end;
  }
  .sfl-send:hover{opacity:.84;transform:translateY(-2px)}
  .sfl-send:disabled{opacity:.32;cursor:not-allowed;transform:none}

  /* Upload progress bar */
  .sfl-upload-progress{
    height:2px;background:rgba(59,130,246,.15);flex-shrink:0;overflow:hidden;display:none;
  }
  .sfl-upload-progress.active{display:block}
  .sfl-upload-progress::after{
    content:'';display:block;height:100%;width:35%;
    background:linear-gradient(90deg,transparent,#3b82f6,#60a5fa,transparent);
    animation:sflProg 1.1s linear infinite;
  }
  @keyframes sflProg{from{transform:translateX(-100%)}to{transform:translateX(400%)}}

  .sfl-footer{text-align:center;padding:5px 0 10px;font-size:.59rem;color:rgba(232,240,254,.18);letter-spacing:.1em;text-transform:uppercase;flex-shrink:0}

  @media(max-width:460px){
    #sfl-panel{bottom:0;right:0;left:0;width:100%;border-radius:14px 14px 0 0;max-height:88vh}
    #sfl-panel::before{border-radius:14px 14px 0 0}
    #sfl-fab,#sfl-pulse{bottom:18px;right:18px}
    #sfl-badge{bottom:64px;right:14px}
    .sfl-chat-img{max-width:190px}
  }
  `;
  document.head.appendChild(S);

  /* ── Build DOM ── */
  function buildUI() {
    const pulse = document.createElement('div'); pulse.id = 'sfl-pulse'; document.body.appendChild(pulse);
    const badge = document.createElement('div'); badge.id = 'sfl-badge'; badge.textContent = '0'; document.body.appendChild(badge);

    const fab = document.createElement('button');
    fab.id = 'sfl-fab'; fab.setAttribute('aria-label', 'Open live chat');
    fab.innerHTML = `
      <svg class="ic-chat" viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
      <svg class="ic-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    document.body.appendChild(fab);

    const panel = document.createElement('div');
    panel.id = 'sfl-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Swift Freight live chat');
    panel.innerHTML = `
      <div class="sfl-hdr">
        <div class="sfl-avatar">SFL</div>
        <div class="sfl-hdr-info">
          <div class="sfl-hdr-name">Support Team</div>
          <div class="sfl-hdr-sub"><span class="sfl-online"></span><span>Online &middot; typically replies instantly</span></div>
        </div>
        <button class="sfl-close-btn" id="sfl-close" aria-label="Close"><i class="fas fa-xmark"></i></button>
      </div>

      <div class="sfl-gate" id="sfl-gate">
        <div class="sfl-gate-icon">
          <svg viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        </div>
        <h3>Swift Freight Live Support</h3>
        <p>Get real-time help with tracking, payments, or any delivery question. You can also send photos.</p>
        <div class="sfl-field">
          <label>Your Name</label>
          <input type="text" class="sfl-inp" id="sfl-inp-name" placeholder="e.g. John Smith" maxlength="80" autocomplete="name">
        </div>
        <div class="sfl-field">
          <label>Email Address</label>
          <input type="email" class="sfl-inp" id="sfl-inp-email" placeholder="e.g. john@email.com" maxlength="120" autocomplete="email">
        </div>
        <button class="sfl-gate-btn" id="sfl-start">Start Chat &nbsp;<i class="fas fa-arrow-right" style="font-size:.68rem"></i></button>
      </div>

      <div id="sfl-body">
        <div class="sfl-info-bar">
          <button class="sfl-back-btn" id="sfl-back"><i class="fas fa-chevron-left" style="font-size:.6rem"></i>&nbsp;New Chat</button>
          <div class="sfl-vinfo">
            <div class="sfl-vname" id="sfl-vname"></div>
            <div class="sfl-vemail" id="sfl-vemail"></div>
          </div>
        </div>
        <div id="sfl-msgs"></div>
        <div class="sfl-upload-progress" id="sfl-upload-bar"></div>
        <div class="sfl-input-row">
          <label class="sfl-img-btn" id="sfl-img-btn" for="sfl-img-input" title="Send a photo"><i class="fas fa-image"></i></label>
          <input type="file" id="sfl-img-input" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none">
          <textarea class="sfl-textarea" id="sfl-input" placeholder="Type a message…" rows="1"></textarea>
          <button class="sfl-send" id="sfl-send" aria-label="Send message"><i class="fas fa-paper-plane" style="font-size:.7rem"></i></button>
        </div>
        <div class="sfl-footer">Swift Freight Logistics &middot; Live Support</div>
      </div>`;
    document.body.appendChild(panel);

    /* Events */
    $('sfl-fab').addEventListener('click', toggle);
    $('sfl-close').addEventListener('click', closeChat);
    $('sfl-start').addEventListener('click', startChat);
    $('sfl-back').addEventListener('click', resetToGate);
    $('sfl-send').addEventListener('click', sendMsg);
    $('sfl-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    });
    $('sfl-input').addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 112) + 'px';
    });
    $('sfl-inp-name').addEventListener('keydown', function(e)  { if (e.key === 'Enter') $('sfl-inp-email').focus(); });
    $('sfl-inp-email').addEventListener('keydown', function(e) { if (e.key === 'Enter') startChat(); });
    $('sfl-img-input').addEventListener('change', handleImageSelect);

    if (sessionId && visitorName) showBody();
  }

  /* ── Toggle / open / close ── */
  function toggle() { isOpen ? closeChat() : openChat(); }

  function openChat() {
    isOpen = true;
    $('sfl-panel').classList.add('open');
    $('sfl-fab').classList.add('open');
    clearBadge();
    if (sessionId && visitorName) { loadHistory(); subscribe(); }
  }

  function closeChat() {
    isOpen = false;
    $('sfl-panel').classList.remove('open');
    $('sfl-fab').classList.remove('open');
  }

  /* ── Gate → Body ── */
  function startChat() {
    const name  = $('sfl-inp-name').value.trim();
    const email = $('sfl-inp-email').value.trim();
    let valid = true;
    if (!name)  { $('sfl-inp-name').classList.add('err');  if (valid) $('sfl-inp-name').focus();  valid = false; }
    else          $('sfl-inp-name').classList.remove('err');
    if (!email || !email.includes('@')) {
      $('sfl-inp-email').classList.add('err'); if (valid) $('sfl-inp-email').focus(); valid = false;
    } else { $('sfl-inp-email').classList.remove('err'); }
    if (!valid) return;

    visitorName  = name; visitorEmail = email;
    sessionId    = 'sfl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(K_SID, sessionId); localStorage.setItem(K_NAME, visitorName); localStorage.setItem(K_EMAIL, visitorEmail);
    isFirstMsg = true;
    showBody();
    subscribe();
    setTimeout(() => $('sfl-input').focus(), 80);
  }

  function resetToGate() {
    sessionId = ''; visitorName = ''; visitorEmail = '';
    localStorage.removeItem(K_SID); localStorage.removeItem(K_NAME); localStorage.removeItem(K_EMAIL);
    if (rtSub) { try { rtSub.unsubscribe(); } catch(_){} rtSub = null; }
    isFirstMsg = true; skipWelcomeOnce = false;
    $('sfl-msgs').innerHTML = '';
    $('sfl-inp-name').value = ''; $('sfl-inp-email').value = '';
    $('sfl-body').style.display = 'none';
    $('sfl-gate').style.display = '';
    setTimeout(() => $('sfl-inp-name').focus(), 80);
  }

  function showBody() {
    $('sfl-gate').style.display = 'none';
    $('sfl-body').style.cssText = 'display:flex;flex-direction:column';
    $('sfl-vname').textContent  = visitorName;
    $('sfl-vemail').textContent = visitorEmail;
  }

  /* ── Send text message ── */
  async function sendMsg() {
    const ta = $('sfl-input'), text = ta.value.trim();
    if (!text || !sessionId) return;
    const btn = $('sfl-send');
    btn.disabled = true; ta.value = ''; ta.style.height = 'auto';

    /* Capture first-message state NOW (sync) before any async boundary */
    const wasFirst = isFirstMsg;
    if (wasFirst) { isFirstMsg = false; skipWelcomeOnce = true; }

    const now = new Date().toISOString();
    if (wasFirst) {
      appendMsg({ role:'agent', content:WELCOME, visitor_name:'Support Agent', created_at:now });
    }
    appendMsg({ role:'visitor', content:text, visitor_name:visitorName, created_at:now });

    getSb().then(function(sb) {
      /* Use captured wasFirst (stable closure), not the shared flag, to decide inserts */
      if (wasFirst) {
        sb.from('chat_messages')
          .insert({ session_id:sessionId, role:'agent', content:WELCOME, visitor_name:'Support Agent', visitor_email:'', page_url:location.href })
          .catch(e => console.error('[SFL] welcome insert', e));
      }
      sb.from('chat_messages')
        .insert({ session_id:sessionId, role:'visitor', content:text, visitor_name:visitorName, visitor_email:visitorEmail, page_url:location.href })
        .catch(e => console.error('[SFL] msg insert', e));
      notifyAdmin(text, wasFirst);
    }).catch(e => console.error('[SFL] getSb', e))
      .finally(function() { btn.disabled = false; $('sfl-input').focus(); });
  }

  /* ── Image upload + send ── */
  async function handleImageSelect() {
    const input = $('sfl-img-input');
    const file  = input && input.files && input.files[0];
    if (!file || !sessionId) { if (input) input.value = ''; return; }

    if (file.size > 8 * 1024 * 1024) {
      appendMsg({ role:'agent', content:'⚠ Image must be under 8 MB. Please try a smaller file.', visitor_name:'Support', created_at:new Date().toISOString() });
      input.value = ''; return;
    }

    const imgBtn = $('sfl-img-btn');
    const bar    = $('sfl-upload-bar');
    imgBtn.classList.add('uploading');
    bar.classList.add('active');

    /* Capture first-message state NOW (sync) */
    const wasFirst = isFirstMsg;
    if (wasFirst) { isFirstMsg = false; skipWelcomeOnce = true; }

    const now = new Date().toISOString();
    if (wasFirst) {
      appendMsg({ role:'agent', content:WELCOME, visitor_name:'Support Agent', created_at:now });
    }

    try {
      const sb  = await getSb();
      const url = await uploadImage(sb, file);

      /* Render optimistically — content must be non-empty to satisfy NOT NULL */
      appendMsg({ role:'visitor', content:'📷 Photo', image_url:url, visitor_name:visitorName, created_at:now });

      /* Persist */
      if (wasFirst) {
        await sb.from('chat_messages').insert({ session_id:sessionId, role:'agent', content:WELCOME, visitor_name:'Support Agent', visitor_email:'', page_url:location.href });
      }
      await sb.from('chat_messages').insert({ session_id:sessionId, role:'visitor', content:'📷 Photo', image_url:url, visitor_name:visitorName, visitor_email:visitorEmail, page_url:location.href });

      notifyAdmin('📷 [Photo]', wasFirst);
    } catch(e) {
      console.error('[SFL] image upload', e);
      appendMsg({ role:'agent', content:'⚠ Failed to send image: ' + (e.message || 'Please try again'), visitor_name:'Support', created_at:new Date().toISOString() });
    } finally {
      imgBtn.classList.remove('uploading');
      bar.classList.remove('active');
      input.value = '';
    }
  }

  /* ── Upload to Supabase Storage ── */
  async function uploadImage(sb, file) {
    const ext  = file.type.split('/')[1] || 'jpg';
    const path = (sessionId || 'anon') + '/' + Date.now() + '-' + Math.random().toString(36).slice(2,7) + '.' + ext;
    const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: '3600' });
    if (error) throw new Error(error.message || 'Upload failed');
    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  /* ── Notify admin via edge function ── */
  function notifyAdmin(content, wasFirst) {
    fetch(FN + '/chat-notify', {
      method:'POST', headers:HDR,
      body: JSON.stringify({ role:'visitor', content, isFirst:!!wasFirst, visitorName, visitorEmail, sessionId, pageUrl:location.href }),
    }).catch(e => console.error('[SFL] notify', e));
  }

  /* ── Realtime ── */
  async function subscribe() {
    if (rtSub || !sessionId) return;
    try {
      const sb = await getSb();
      rtSub = sb.channel('sfl-' + sessionId)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'chat_messages', filter:'session_id=eq.' + sessionId },
          function(payload) {
            const m = payload.new;
            if (m.role !== 'agent') return;
            if (skipWelcomeOnce && m.content === WELCOME) { skipWelcomeOnce = false; return; }
            appendMsg(m, true);
            if (!isOpen) { unread++; updateBadge(); }
          })
        .subscribe();
    } catch(e) { console.error('[SFL] RT', e); }
  }

  /* ── Load history ── */
  async function loadHistory() {
    const area = $('sfl-msgs');
    if (!area || !sessionId) return;
    try {
      const sb = await getSb();
      const { data, error } = await sb.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending:true });
      if (error) throw error;
      area.innerHTML = '';
      if (data && data.length) {
        isFirstMsg = false;
        let lastDate = '';
        data.forEach(function(m) {
          const d = new Date(m.created_at).toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' });
          if (d !== lastDate) { appendDateDiv(d); lastDate = d; }
          appendMsg(m, false);
        });
        scrollBottom();
      }
    } catch(e) { console.error('[SFL] history', e); }
  }

  /* ── Render message ── */
  function appendMsg(m, animate) {
    const area = $('sfl-msgs');
    if (!area) return;
    if (animate === undefined) animate = true;

    const wrap = document.createElement('div');
    wrap.className = 'sfl-msg ' + m.role;
    if (!animate) wrap.style.animation = 'none';

    const bub = document.createElement('div');

    if (m.image_url) {
      bub.className = 'sfl-bubble img-only';
      const img = document.createElement('img');
      img.className = 'sfl-chat-img';
      img.src = m.image_url;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('alt', 'Shared image');
      img.onclick = function() { window.open(m.image_url, '_blank'); };
      bub.appendChild(img);
      if (m.content && m.content !== '📷 Photo') {
        const cap = document.createElement('div');
        cap.className = 'sfl-img-caption';
        cap.textContent = m.content;
        bub.appendChild(cap);
      }
    } else {
      bub.className = 'sfl-bubble';
      bub.textContent = m.content;
    }
    wrap.appendChild(bub);

    const meta = document.createElement('div');
    meta.className = 'sfl-meta';
    if (m.role === 'agent') {
      const s = document.createElement('span');
      s.className = 'sfl-sender';
      s.textContent = m.visitor_name || 'Support Agent';
      meta.appendChild(s);
    }
    const t = document.createElement('span');
    t.className = 'sfl-time';
    t.textContent = fmtTime(m.created_at);
    meta.appendChild(t);
    wrap.appendChild(meta);

    area.appendChild(wrap);
    if (animate !== false) scrollBottom();
  }

  function appendDateDiv(label) {
    const div = document.createElement('div');
    div.className = 'sfl-date-div';
    div.innerHTML = '<span>' + label + '</span>';
    $('sfl-msgs').appendChild(div);
  }

  function scrollBottom() {
    const a = $('sfl-msgs');
    if (a) setTimeout(function(){ a.scrollTop = a.scrollHeight; }, 30);
  }

  function fmtTime(iso) {
    try { return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
    catch(_) { return ''; }
  }

  /* ── Badge ── */
  function updateBadge() {
    const b = $('sfl-badge');
    if (!b) return;
    b.textContent = unread > 9 ? '9+' : String(unread);
    b.classList.toggle('show', unread > 0);
  }
  function clearBadge() { unread = 0; updateBadge(); }

  /* ── Lazy Supabase client ── */
  function getSb() {
    return new Promise(function(res, rej) {
      if (sbClient) { res(sbClient); return; }
      function init() {
        if (window.supabase && window.supabase.createClient) {
          sbClient = window.supabase.createClient(SB_URL, SB_ANON);
          res(sbClient);
        } else { rej(new Error('Supabase unavailable')); }
      }
      if (window.supabase && window.supabase.createClient) { init(); return; }
      const existing = document.querySelector('script[src*="supabase"]');
      if (!existing) {
        const sc = document.createElement('script');
        sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        sc.onload = init;
        sc.onerror = function(){ rej(new Error('Failed to load Supabase CDN')); };
        document.head.appendChild(sc);
      } else {
        let n = 0;
        const iv = setInterval(function() {
          n++;
          if (window.supabase && window.supabase.createClient) { clearInterval(iv); init(); }
          else if (n > 50) { clearInterval(iv); rej(new Error('Supabase load timeout')); }
        }, 100);
      }
    });
  }

  function $(id) { return document.getElementById(id); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUI);
  else buildUI();

})();
