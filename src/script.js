
// ══════════════════════════════════════════════════════════════
//  SUPABASE CONFIG
//  Fill in your project details from:
//  Supabase Dashboard → Project Settings → API
// ══════════════════════════════════════════════════════════════
const SUPABASE_URL      = 'https://oltbgccsceipedoadgka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdGJnY2NzY2VpcGVkb2FkZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY0NTQsImV4cCI6MjA5NjQwMjQ1NH0.Q5uoDXqlxBl-FxiISbp5bR3NLDsEL4iOMYVbVugwv94';
// ══════════════════════════════════════════════════════════════


function switchPayment(method, info) {
    document.querySelectorAll('.t-pm-card').forEach(c => c.classList.remove('active'));
    const card = document.querySelector(`.t-pm-card[data-method="${method}"]`);
    if (card) card.classList.add('active');

    const display = document.getElementById('payment-detail-display');
    if (!display) return;
    display.classList.add('t-pp-fade');
    setTimeout(() => {
        display.innerHTML = _buildPayDetail(method, info);
        display.classList.remove('t-pp-fade');
    }, 180);
}

function _buildPayDetail(method, info) {
    const _e = (v) => String(v || '').replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
    const copyBtn = (val, id) =>
        `<button class="t-pp-copy-btn" onclick="window._sflCopy('${val.replace(/'/g,"\\'")}','${id}')" id="${id}"><i class="fas fa-copy"></i> Copy</button>`;

    if (method === 'BTC') return `
        <div class="t-pp-header"><i class="fab fa-bitcoin" style="color:#f7931a;font-size:1.15rem"></i><span>Bitcoin (BTC)</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Wallet Address</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-btc')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Send the exact invoice amount in BTC. A minimum of 1 block confirmation is required before clearance.</div>`;

    if (method === 'USDT') return `
        <div class="t-pp-header"><i class="fas fa-circle-dollar-to-slot" style="color:#26a17b;font-size:1.1rem"></i><span>USDT Tether</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Wallet Address (TRC20 / ERC20)</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-usdt')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Verify the correct network (TRC20 or ERC20) before sending. Cross-network transfers are unrecoverable.</div>`;

    if (method === 'WIRE') {
        const [bank, acctName, acctNum, routingNum] = (info || '').split('|');
        return `
        <div class="t-pp-header"><i class="fas fa-building-columns" style="color:#3b82f6;font-size:1.05rem"></i><span>Bank Wire / ACH Transfer</span></div>
        <div class="t-pp-bank-grid">
          <div class="t-pp-bank-row"><span class="t-pp-bk-label">Bank Name</span><span class="t-pp-bk-val">${_e(bank)}</span></div>
          <div class="t-pp-bank-row"><span class="t-pp-bk-label">Account Name</span><span class="t-pp-bk-val">${_e(acctName)}</span></div>
          <div class="t-pp-bank-row"><span class="t-pp-bk-label">Account Number</span><span class="t-pp-bk-val">${_e(acctNum)}&nbsp;&nbsp;${copyBtn(acctNum||'','copy-wire')}</span></div>
          ${routingNum ? `<div class="t-pp-bank-row"><span class="t-pp-bk-label">Routing Number (ABA)</span><span class="t-pp-bk-val">${_e(routingNum)}&nbsp;&nbsp;${copyBtn(routingNum,'copy-routing')}</span></div>` : ''}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Include your tracking ID in the wire transfer reference/memo for same-day processing.</div>`;
    }

    if (method === 'PAYPAL') return `
        <div class="t-pp-header"><i class="fab fa-paypal" style="color:#0070ba;font-size:1.1rem"></i><span>PayPal</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">PayPal Email Address</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-paypal')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Send as "Friends &amp; Family" to avoid fees. Include your tracking ID in the payment note.</div>`;

    if (method === 'CASHAPP') return `
        <div class="t-pp-header"><i class="fas fa-mobile-screen-button" style="color:#00d64f;font-size:1.05rem"></i><span>Cash App</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">$Cashtag</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-cashapp')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Open Cash App → tap Pay → enter the $Cashtag above. Add your tracking ID in the note field.</div>`;

    if (method === 'ZELLE') return `
        <div class="t-pp-header"><i class="fas fa-bolt" style="color:#6d1ed4;font-size:1.05rem"></i><span>Zelle</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Email / Phone Number</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-zelle')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Open your bank app or the Zelle app, search the address above, and add your tracking ID in the memo.</div>`;

    if (method === 'WU') return `
        <div class="t-pp-header"><i class="fas fa-globe" style="color:#ffb300;font-size:1.05rem"></i><span>Western Union</span></div>
        <div class="t-pp-wu-info">${_e(info).replace(/\n/g,'<br>')}</div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Visit any Western Union agent, or use wu.com / the app. Include your tracking ID as the reference.</div>`;

    if (method === 'AMAZON') return `
        <div class="t-pp-header"><i class="fab fa-amazon" style="color:#ff9900;font-size:1.1rem"></i><span>Amazon Gift Card</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Claim Code</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-amazon')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Copy the code and redeem at <strong>amazon.com/gc/redeem</strong>. Include your tracking ID in the gift message for verification.</div>`;

    if (method === 'GOOGLE') return `
        <div class="t-pp-header"><i class="fab fa-google-play" style="color:#01875f;font-size:1.05rem"></i><span>Google Play Gift Card</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Redemption Code</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-google')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Redeem at <strong>play.google.com/redeem</strong> or in the Play Store app. Send screenshot of successful redemption as proof.</div>`;

    if (method === 'APPLE') return `
        <div class="t-pp-header"><i class="fab fa-apple" style="color:#a2aaad;font-size:1.1rem"></i><span>Apple Gift Card</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Redemption Code</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-apple')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Redeem at <strong>redeem.apple.com</strong> or in the App Store. Send screenshot of successful redemption as proof.</div>`;

    if (method === 'VANILLA') return `
        <div class="t-pp-header"><i class="fas fa-credit-card" style="color:#0058a3;font-size:1.05rem"></i><span>Vanilla Visa Prepaid</span></div>
        <div class="t-pp-wu-info" style="white-space:pre-line">${_e(info)}</div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Use the card number and PIN to pay online as a standard Visa card. Do not redeem in-store — enter the details above at checkout.</div>`;

    if (method === 'EBAY') return `
        <div class="t-pp-header"><i class="fab fa-ebay" style="color:#e53238;font-size:1.1rem"></i><span>eBay Gift Card</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Gift Card Code</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-ebay')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Redeem at <strong>ebay.com/giftcard</strong>. Send screenshot of successful redemption as proof of payment.</div>`;

    if (method === 'VENMO') return `
        <div class="t-pp-header"><i class="fas fa-dollar-sign" style="color:#008cff;font-size:1.05rem"></i><span>Venmo</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Venmo Username / @Handle</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info,'copy-venmo')}
        </div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Open Venmo → tap Pay or Request → search the handle above. Add your tracking ID in the note field. US only.</div>`;

    if (method === 'MONEYGRAM') return `
        <div class="t-pp-header"><i class="fas fa-money-bill-wave" style="color:#f60066;font-size:1.05rem"></i><span>MoneyGram</span></div>
        <div class="t-pp-wu-info">${_e(info).replace(/\n/g,'<br>')}</div>
        <div class="t-pp-note"><i class="fas fa-info-circle"></i>Visit any MoneyGram agent location or use moneygram.com / the app. Include your tracking ID as the reference number.</div>`;

    return '';
}

function _buildMethodCard(method, icon, name, sub, color, value) {
    return `<button class="t-pm-card" data-method="${method}" onclick="switchPayment('${method}','${value.replace(/'/g,"\\'")}')">
        <div class="t-pm-icon" style="--pm-clr:${color}"><i class="${icon}"></i></div>
        <div class="t-pm-name">${name}</div>
        <div class="t-pm-sub">${sub}</div>
        <div class="t-pm-check"><i class="fas fa-circle-check"></i></div>
    </button>`;
}


// ── MAIN TRACKING ENGINE ──────────────────────────────────────
async function handleTracking() {
    const trackingInput = document.getElementById('trackingInput');
    const dashboard     = document.getElementById('dashboard-target');
    const searchGate    = document.getElementById('search-gate');
    const dashSection   = document.getElementById('t-dashboard');
    const searchBtn     = document.getElementById('search-btn');
    const errorMsg      = document.getElementById('error-msg');

    if (!trackingInput || !dashboard || !searchGate || !searchBtn || !errorMsg) return;

    const trackingNo = trackingInput.value.trim().toUpperCase();

    // Escape for safe HTML insertion
    const esc = (v) => String(v || '').replace(/[<>&"']/g, c =>
        ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c]));

    const showError = (msg) => {
        errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right:8px;"></i>${msg}`;
        errorMsg.classList.remove('hidden');
    };
    const hideError = () => {
        errorMsg.textContent = '';
        errorMsg.classList.add('hidden');
    };
    const showSearch = () => {
        searchGate.style.display = '';
        if (dashSection) dashSection.style.display = 'none';
    };

    if (!trackingNo) {
        dashboard.innerHTML = '';
        showError('Please enter your shipment tracking code.');
        return;
    }

    if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
        showError('Tracking system is not yet configured. Please contact support.');
        return;
    }

    searchBtn.disabled = true;
    searchBtn.innerHTML = `<span class="t-search-spinner"></span> Locating…`;
    hideError();

    try {
        const url = `${SUPABASE_URL}/rest/v1/shipments_public?tracking_id=eq.${encodeURIComponent(trackingNo)}&select=*`;
        const response = await fetch(url, {
            headers: {
                'apikey':        SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type':  'application/json',
            }
        });

        if (!response.ok) throw new Error(`${response.status}`);

        const resData = await response.json();

        if (!Array.isArray(resData) || resData.length === 0) {
            showSearch();
            showError('No shipment found for that tracking ID. Please verify and try again.');
            return;
        }

        const s      = resData[0];
        const isPaid = (s.payment_status || '').toLowerCase() === 'confirmed';

        // ── Status badge color ──────────────────────────────────
        const statusStr = s.status || 'In Transit';
        const sl        = statusStr.toLowerCase();
        const statusColor = sl.includes('deliver') ? 'green'
            : (sl.includes('held') || sl.includes('hold') || sl.includes('customs') || sl.includes('clearance')) ? 'amber'
            : (sl === 'pending' || sl.includes('pickup')) ? 'gray'
            : 'blue';

        // ── Status color hex for analytics strip ────────────────
        const statusColorHex = statusColor === 'green'  ? '#22c55e'
            : statusColor === 'amber' ? '#f59e0b'
            : statusColor === 'gray'  ? '#94a3b8'
            : '#3b82f6';

        // ── Journey / progress calculations ────────────────────
        const stepList = [
            { name: s.status,     color: s.step1_color, label: 'Current Status' },
            s.step2_name ? { name: s.step2_name, color: s.step2_color, label: s.step2_name } : null,
            s.step3_name ? { name: s.step3_name, color: s.step3_color, label: s.step3_name } : null,
            s.step4_name ? { name: s.step4_name, color: s.step4_color, label: s.step4_name } : null,
        ].filter(Boolean);
        const totalSteps = stepList.length;
        const doneSteps  = stepList.filter(st => (st.color || '').includes('green')).length;
        const pct        = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
        const progColor  = pct >= 100 ? '#22c55e' : pct > 60 ? '#3b82f6' : '#f59e0b';

        // ── SVG ring calculations (r=44, viewBox 100x100) ───────
        const CIRC = 2 * Math.PI * 44;           // ≈ 276.46
        const ringOffset = CIRC * (1 - pct / 100);
        const [ringC1, ringC2] = pct >= 100 ? ['#22c55e','#4ade80']
            : pct > 60 ? ['#3b82f6','#06b6d4']
            : pct > 0  ? ['#f59e0b','#fb923c']
            : ['#475569','#64748b'];

        // ── Step dots row ────────────────────────────────────────
        const ringDots = stepList.map((st, i) => {
            const isDone   = (st.color || '').includes('green');
            const isActive = !isDone && i === doneSteps;
            const cls      = isDone ? 'done' : isActive ? 'active' : 'pending';
            const connector = i < stepList.length - 1
                ? `<div class="t-ring-connector${isDone ? ' done' : ''}"></div>` : '';
            return `<div class="t-ring-dot ${cls}"></div>${connector}`;
        }).join('');

        // ── Short status / payment for metrics ───────────────────
        const shortStatus  = statusStr.length > 12 ? statusStr.slice(0, 11) + '…' : statusStr;
        const payColorHex  = isPaid ? '#22c55e' : '#f59e0b';

        // ── Info row helper — with icon prefix ──────────────────
        const ICONS = {
            'Recipient':    'fa-user',
            'Sender':       'fa-user-tag',
            'Destination':  'fa-location-dot',
            'Origin':       'fa-map-pin',
            'Pickup':       'fa-calendar',
            'Est. Delivery':'fa-calendar-check',
            'Package':      'fa-box',
            'Service':      'fa-truck',
        };
        const ir = (key, val, cls = '') => val ? `
          <li class="t-info-row">
            <span class="t-info-key"><i class="fas ${ICONS[key] || 'fa-circle-dot'}" style="width:12px;margin-right:6px;color:rgba(59,130,246,.5);font-size:10px;"></i>${key}</span>
            <span class="t-info-val ${cls}">${esc(val)}</span>
          </li>` : '';

        const payDelay = isPaid ? 6 : 6;

        // ── Safe inline-onclick values (no single-quotes in addr) ─
        const btcSafe     = esc(s.btc_address         || '').replace(/'/g, '&#39;');
        const usdtSafe    = esc(s.usdt_address        || '').replace(/'/g, '&#39;');
        const wireSafe    = [s.bank_name, s.account_name, s.bank_number, s.routing_number]
            .map(v => esc(v || '').replace(/'/g, '&#39;')).join('|');
        const paypalSafe  = esc(s.paypal_email        || '').replace(/'/g, '&#39;');
        const cashappSafe = esc(s.cashapp_tag         || '').replace(/'/g, '&#39;');
        const zelleSafe   = esc(s.zelle_id            || '').replace(/'/g, '&#39;');
        const wuSafe      = esc(s.western_union_info  || '').replace(/'/g, '&#39;');
        const venmoSafe   = esc(s.venmo_tag           || '').replace(/'/g, '&#39;');
        const monegramSafe= esc(s.moneygram_info      || '').replace(/'/g, '&#39;');
        const amazonSafe  = esc(s.amazon_gc_info      || '').replace(/'/g, '&#39;');
        const googleSafe  = esc(s.google_gc_info      || '').replace(/'/g, '&#39;');
        const appleSafe   = esc(s.apple_gc_info       || '').replace(/'/g, '&#39;');
        const vanillaSafe = esc(s.vanilla_gc_info     || '').replace(/'/g, '&#39;');
        const ebaySafe    = esc(s.ebay_gc_info        || '').replace(/'/g, '&#39;');

        // ── Copy-to-clipboard helper (injected into page scope) ──
        window._sflCopy = (val, btnId) => {
            navigator.clipboard.writeText(val).then(() => {
                const btn = document.getElementById(btnId);
                if (!btn) return;
                const orig = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.color = '#22c55e';
                setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1800);
            }).catch(() => {});
        };

        // ── Show dashboard, hide search ─────────────────────────
        searchGate.style.display = 'none';
        if (dashSection) dashSection.style.display = 'block';

        dashboard.innerHTML = `
<div class="t-dash-inner">

  <!-- ── HEADER CARD ──────────────────────────────────────── -->
  <div class="t-hdr-card t-fade-up t-d1">
    <div>
      <div class="t-hdr-eyebrow">
        <i class="fas fa-satellite-dish" style="font-size:9px;"></i> Shipment Profile
      </div>
      <div class="t-tracking-id">${esc(trackingNo)}</div>
      <div class="t-hdr-meta">
        ${s.service_type ? `<span class="t-hdr-chip">${esc(s.service_type)}</span>` : ''}
        ${s.priority     ? `<span class="t-hdr-chip">${esc(s.priority)}</span>`     : ''}
      </div>
    </div>
    <div class="t-hdr-right">
      <div class="t-status-pill ${statusColor}">
        <span class="t-sdot${statusColor === 'blue' ? ' pulse' : ''}"></span>
        ${esc(statusStr)}
      </div>
      <button class="t-back-btn" onclick="window.location.href='payment.html'">
        <i class="fas fa-arrow-left"></i> New Search
      </button>
    </div>
  </div>

  <!-- ── CINEMATIC RING ANALYTICS ─────────────────────── -->
  <div class="t-ring-wrap t-fade-up t-d2">
    <div class="t-ring-eyebrow">
      <span><i class="fas fa-chart-line" style="font-size:9px;margin-right:7px;"></i>Shipment Analysis</span>
      <span class="t-live-tag"><span class="t-live-dot"></span> LIVE</span>
    </div>
    <div class="t-ring-body">
      <div class="t-ring-left">
        <svg viewBox="0 0 100 100" class="t-ring-svg" aria-hidden="true">
          <defs>
            <linearGradient id="sflRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${ringC1}"/>
              <stop offset="100%" stop-color="${ringC2}"/>
            </linearGradient>
            <filter id="sflRingGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.055)" stroke-width="7"/>
          <circle cx="50" cy="50" r="44" fill="none" stroke="${ringC1}" stroke-width="5" opacity="0.3"
                  stroke-dasharray="${CIRC.toFixed(2)}" stroke-dashoffset="${CIRC.toFixed(2)}"
                  stroke-linecap="round" transform="rotate(-90 50 50)"
                  filter="url(#sflRingGlow)" class="t-ring-arc" style="transition:none;"/>
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#sflRingGrad)" stroke-width="7"
                  stroke-dasharray="${CIRC.toFixed(2)}" stroke-dashoffset="${CIRC.toFixed(2)}"
                  stroke-linecap="round" transform="rotate(-90 50 50)"
                  class="t-ring-arc" id="sflRingArc"/>
          <text x="50" y="45" text-anchor="middle" dominant-baseline="middle"
                fill="${progColor}" font-size="20" font-weight="700"
                font-family="'JetBrains Mono',monospace">${pct}%</text>
          <text x="50" y="61" text-anchor="middle"
                fill="rgba(232,240,254,.28)" font-size="7.5"
                font-family="'DM Sans',sans-serif" letter-spacing="2.5">COMPLETE</text>
        </svg>
        <div class="t-ring-dots">${ringDots}</div>
      </div>
      <div class="t-ring-right">
        <div class="t-ring-metric">
          <div class="t-ring-metric-lbl">Journey Complete</div>
          <div class="t-ring-metric-val" style="color:${progColor};">${pct}%</div>
        </div>
        <div class="t-ring-metric">
          <div class="t-ring-metric-lbl">Checkpoints</div>
          <div class="t-ring-metric-val">${doneSteps}<span style="font-size:.78rem;color:var(--t-muted2);"> / ${totalSteps}</span></div>
        </div>
        <div class="t-ring-metric">
          <div class="t-ring-metric-lbl">Payment</div>
          <div class="t-ring-metric-val" style="color:${payColorHex};">${isPaid ? 'Cleared' : 'Required'}</div>
        </div>
        <div class="t-ring-metric">
          <div class="t-ring-metric-lbl">Status</div>
          <div class="t-ring-metric-val" style="color:${statusColorHex};">${esc(shortStatus)}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── MAIN GRID ─────────────────────────────────────────── -->
  <div class="t-grid">

    <!-- LEFT: Timeline -->
    <div class="t-card t-fade-up t-d4">
      <div class="t-card-top">
        <span class="t-card-title"><i class="fas fa-route"></i> Transit Timeline</span>
        <span class="t-live-tag"><span class="t-live-dot"></span> LIVE</span>
      </div>
      <div class="t-card-body">
        <div class="t-timeline">
          <div class="t-tl-line"></div>
          ${renderEliteStep(s.status,     s.current_location, 'Current Status', 'fa-box',      s.step1_color, 0)}
          ${renderEliteStep(s.step2_name, s.step2_location,   s.step2_name || 'Step 2',  'fa-truck',    s.step2_color, 1)}
          ${renderEliteStep(s.step3_name, s.step3_location,   s.step3_name || 'Step 3',  'fa-plane',    s.step3_color, 2)}
          ${renderEliteStep(s.step4_name, s.step4_location,   s.step4_name || 'Arrival', 'fa-box-open', s.step4_color, 3)}
        </div>
      </div>
    </div>

    <!-- RIGHT column -->
    <div class="t-right-col">

      <!-- Shipment Details -->
      <div class="t-card t-fade-up t-d5">
        <div class="t-card-top">
          <span class="t-card-title"><i class="fas fa-file-invoice"></i> Shipment Details</span>
        </div>
        <div class="t-card-body">
          <ul class="t-info-list">
            ${ir('Recipient',     s.name)}
            ${ir('Sender',        s.senders_name)}
            ${ir('Destination',   s.destination)}
            ${ir('Origin',        s.origin)}
            ${ir('Pickup',        s.pickup_date)}
            ${ir('Est. Delivery', s.eta, 'accent')}
            ${ir('Package',       s.package_details)}
            ${ir('Service',       s.service_type)}
          </ul>
        </div>
      </div>

      ${isPaid ? `
      <!-- Paid banner -->
      <div class="t-paid-banner t-fade-up t-d5">
        <div class="t-paid-icon"><i class="fas fa-circle-check"></i></div>
        <div>
          <div class="t-paid-title">Payment Confirmed</div>
          <div class="t-paid-sub">Shipment cleared and proceeding on schedule.</div>
        </div>
      </div>` : ''}

      <!-- Payment card (ultra-premium) -->
      <div class="t-card t-fade-up t-d${payDelay}">
        <div class="t-card-top">
          <span class="t-card-title"><i class="fas fa-shield-halved"></i> Secure Payment</span>
          <span class="t-pay-badge ${isPaid ? 'confirmed' : 'pending'}">${isPaid ? '✓ Cleared' : 'Required'}</span>
        </div>
        <div class="t-card-body">
          ${isPaid
            ? `<div class="t-pay-confirmed-banner">
                 <div class="t-pcb-icon"><i class="fas fa-circle-check"></i></div>
                 <div>
                   <div class="t-pcb-title">Payment Verified</div>
                   <div class="t-pcb-sub">Your shipment is fully cleared and proceeding on schedule.</div>
                 </div>
               </div>`
            : `<div class="t-pay-invoice">
                 <div>
                   <div class="t-pay-invoice-label">Invoice Total</div>
                   <div class="t-pay-invoice-amount">${esc(s.amount_due || '$0.00')}</div>
                 </div>
                 <div class="t-pay-invoice-info">
                   <div class="t-pay-invoice-info-item"><i class="fas fa-lock"></i> SSL Secured</div>
                   <div class="t-pay-invoice-info-item"><i class="fas fa-clock"></i> 24h Processing</div>
                 </div>
               </div>
               <div class="t-pay-divider"><span>Select Payment Method</span></div>
               <div class="t-pay-method-grid">
                 ${s.btc_address            ? _buildMethodCard('BTC',    'fab fa-bitcoin',              'Bitcoin',       'BTC',       '#f7931a', btcSafe)     : ''}
                 ${s.usdt_address           ? _buildMethodCard('USDT',   'fas fa-circle-dollar-to-slot','USDT',          'Tether',    '#26a17b', usdtSafe)    : ''}
                 ${(s.bank_name||s.bank_number) ? _buildMethodCard('WIRE','fas fa-building-columns',   'Wire',          'Bank',      '#3b82f6', wireSafe)    : ''}
                 ${s.paypal_email           ? _buildMethodCard('PAYPAL', 'fab fa-paypal',               'PayPal',        'Online',    '#0070ba', paypalSafe)  : ''}
                 ${s.cashapp_tag            ? _buildMethodCard('CASHAPP','fas fa-mobile-screen-button', 'Cash App',      'Instant',   '#00d64f', cashappSafe) : ''}
                 ${s.zelle_id               ? _buildMethodCard('ZELLE',  'fas fa-bolt',                 'Zelle',         'Bank',      '#6d1ed4', zelleSafe)   : ''}
                 ${s.western_union_info     ? _buildMethodCard('WU',       'fas fa-globe',         'Western Union', 'Global',    '#ffb300', wuSafe)       : ''}
                 ${s.venmo_tag             ? _buildMethodCard('VENMO',    'fas fa-dollar-sign',    'Venmo',         'US Only',   '#008cff', venmoSafe)    : ''}
                 ${s.moneygram_info        ? _buildMethodCard('MONEYGRAM','fas fa-money-bill-wave', 'MoneyGram',     'Global',    '#f60066', monegramSafe) : ''}
                 ${s.amazon_gc_info         ? _buildMethodCard('AMAZON', 'fab fa-amazon',               'Amazon',        'Gift Card', '#ff9900', amazonSafe)  : ''}
                 ${s.google_gc_info         ? _buildMethodCard('GOOGLE', 'fab fa-google-play',          'Google Play',   'Gift Card', '#01875f', googleSafe)  : ''}
                 ${s.apple_gc_info          ? _buildMethodCard('APPLE',  'fab fa-apple',                'Apple',         'Gift Card', '#a2aaad', appleSafe)   : ''}
                 ${s.vanilla_gc_info        ? _buildMethodCard('VANILLA','fas fa-credit-card',          'Vanilla Visa',  'Prepaid',   '#0058a3', vanillaSafe) : ''}
                 ${s.ebay_gc_info           ? _buildMethodCard('EBAY',   'fab fa-ebay',                 'eBay',          'Gift Card', '#e53238', ebaySafe)    : ''}
               </div>
               <div id="payment-detail-display" class="t-pay-panel">
                 <div class="t-pay-panel-empty"><i class="fas fa-hand-pointer"></i><span>Select a payment method above to view details</span></div>
               </div>
               <div class="t-pay-security-bar">
                 <span><i class="fas fa-lock"></i> 256-bit SSL</span>
                 <span><i class="fas fa-shield-check"></i> Verified</span>
                 <span><i class="fas fa-clock"></i> 24h Processing</span>
                 <span><i class="fas fa-headset"></i> 24/7 Support</span>
               </div>`
          }
        </div>
      </div>

    </div><!-- /t-right-col -->
  </div><!-- /t-grid -->
</div><!-- /t-dash-inner -->
        `;

        // Animate ring arcs after HTML is painted
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.querySelectorAll('.t-ring-arc').forEach(el => {
                el.style.strokeDashoffset = String(ringOffset.toFixed(2));
            });
        }));

    } catch (e) {
        console.error('Tracking error:', e);
        showSearch();
        showError('Unable to load tracking details. Please check your connection and try again.');
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = `<i class="fas fa-satellite-dish"></i> Track Shipment`;
    }
}


function renderEliteStep(name, loc, label, icon, colorClass, idx) {
    if (!name) return '';

    const COLOR_MAP = {
        'text-blue-500':   '#3b82f6',
        'text-green-500':  '#22c55e',
        'text-amber-500':  '#f59e0b',
        'text-red-500':    '#ef4444',
        'text-purple-500': '#a855f7',
        'text-cyan-500':   '#06b6d4',
    };
    const col   = COLOR_MAP[colorClass] || '#3b82f6';
    const delay = (0.3 + (idx || 0) * 0.14).toFixed(2);

    // Sanitise displayed text
    const esc = (v) => String(v || '').replace(/[<>&"]/g, c =>
        ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c]));

    // ── Determine step state ─────────────────────────────────
    const isGreen = (colorClass || '').includes('green');
    const isHold  = (colorClass || '').includes('amber') || (colorClass || '').includes('red');
    let state, stateIcon, stateLabel, contentVariant, iconVariant;

    if (isGreen) {
        state          = 'completed';
        stateIcon      = 'fa-circle-check';
        stateLabel     = `<span class="t-step-state-label" style="color:#22c55e;">&#10003; Completed</span>`;
        contentVariant = 'completed';
        iconVariant    = 'done';
    } else if (isHold) {
        state          = 'on-hold';
        stateIcon      = 'fa-triangle-exclamation';
        stateLabel     = `<span class="t-step-state-label" style="color:#f59e0b;">&#9888; On Hold</span>`;
        contentVariant = 'on-hold';
        iconVariant    = 'hold';
    } else if (idx === 0) {
        state          = 'active';
        stateIcon      = icon;
        stateLabel     = `<span class="t-step-state-label" style="color:#3b82f6;">&#9679; Active Now</span>`;
        contentVariant = '';
        iconVariant    = 'is-current';
    } else {
        state          = 'upcoming';
        stateIcon      = 'fa-circle-dot';
        stateLabel     = `<span class="t-step-state-label" style="color:rgba(232,240,254,.3);">&#9675; Upcoming</span>`;
        contentVariant = 'upcoming';
        iconVariant    = '';
    }

    // ── Icon color / style per state ─────────────────────────
    const iconColor  = isGreen ? '#22c55e' : isHold ? '#f59e0b' : state === 'upcoming' ? 'rgba(232,240,254,.2)' : col;
    const iconBg     = isGreen ? 'rgba(34,197,94,.12)'   : isHold ? 'rgba(245,158,11,.12)'  : state === 'upcoming' ? 'rgba(255,255,255,.03)' : `${col}20`;
    const iconBorder = isGreen ? 'rgba(34,197,94,.3)'    : isHold ? 'rgba(245,158,11,.28)'  : state === 'upcoming' ? 'rgba(255,255,255,.07)' : `${col}60`;

    return `
    <div class="t-step" style="animation-delay:${delay}s;">
      <div class="t-step-icon ${iconVariant}"
           style="color:${iconColor};background:${iconBg};border:1.5px solid ${iconBorder};">
        <i class="fas ${stateIcon}"></i>
      </div>
      <div class="t-step-content ${contentVariant}" style="border-left-color:${isGreen ? 'rgba(34,197,94,.25)' : isHold ? 'rgba(245,158,11,.22)' : state === 'upcoming' ? 'rgba(255,255,255,.04)' : `${col}40`};">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
          <div class="t-step-seq" style="color:${iconColor};">${esc(label)}</div>
          ${stateLabel}
        </div>
        <div class="t-step-name" style="${state === 'upcoming' ? 'opacity:.5;' : ''}">${esc(name)}</div>
        ${loc ? `<div class="t-step-loc">
          <i class="fas fa-location-dot" style="font-size:9px;margin-right:5px;opacity:.5;"></i>${esc(loc)}
        </div>` : ''}
      </div>
    </div>`;
}


function initializeRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal-init, .reveal-from-left, .reveal-from-right, .reveal-from-bottom');
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('reveal-active');
            obs.unobserve(el);
        });
    }, { root: null, rootMargin: '0px 0px -120px 0px', threshold: 0.15 });

    revealElements.forEach(el => {
        const delay = el.dataset.revealDelay;
        if (delay) {
            const d = delay.toString().trim();
            el.style.transitionDelay = d.endsWith('s') ? d : `${d}s`;
        }
        observer.observe(el);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // Auto-fill tracking ID from ?id= query param and trigger search
    const params = new URLSearchParams(window.location.search);
    const prefilledId = params.get('id');
    if (prefilledId) {
        const input = document.getElementById('trackingInput');
        if (input) {
            input.value = prefilledId.toUpperCase();
            handleTracking();
        }
    }

    // Hide old "back to top" links, inject premium button
    const topLinks = Array.from(document.body.querySelectorAll('a[href="#Top"]'));
    topLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase().includes('back to top')) {
            const parent = link.closest('div, section, footer');
            if (parent) parent.style.display = 'none';
        }
    });

    const premiumBtn = document.createElement('button');
    premiumBtn.id        = 'premium-back-to-top';
    premiumBtn.type      = 'button';
    premiumBtn.className = 'premium-back-to-top';
    premiumBtn.innerHTML = '<span class="back-to-top-icon">↑</span><span class="back-to-top-text"></span>';
    premiumBtn.style.display = 'none';
    premiumBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(premiumBtn);

    let triggerElement = null;
    try {
        const sections = Array.from(document.querySelectorAll('section'));
        const divs     = Array.from(document.querySelectorAll('div'));
        if (sections.length > 1)     triggerElement = sections[1];
        else if (divs.length > 1)    triggerElement = divs[1];
        else                         triggerElement = document.querySelector('section, div');
    } catch (err) {
        triggerElement = document.querySelector('section, div');
    }

    if (!triggerElement) {
        premiumBtn.style.display = 'flex';
        return;
    }

    const updateBtn = () => {
        const threshold = triggerElement.getBoundingClientRect().bottom + window.scrollY;
        premiumBtn.style.display = window.scrollY > threshold ? 'flex' : 'none';
    };
    window.addEventListener('scroll', updateBtn, { passive: true });
    window.addEventListener('resize', updateBtn, { passive: true });
    setTimeout(updateBtn, 120);

});


window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const run = () => {
        if (loader) {
            loader.style.transition = 'opacity .5s ease';
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            setTimeout(() => { loader.style.display = 'none'; }, 520);
        }
        initializeRevealAnimations();
    };
    if (loader) setTimeout(run, 1400);
    else run();
});
