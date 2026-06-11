
// ══════════════════════════════════════════════════════════════
//  SUPABASE CONFIG
//  Fill in your project details from:
//  Supabase Dashboard → Project Settings → API
// ══════════════════════════════════════════════════════════════
const SUPABASE_URL      = 'https://oltbgccsceipedoadgka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdGJnY2NzY2VpcGVkb2FkZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjY0NTQsImV4cCI6MjA5NjQwMjQ1NH0.Q5uoDXqlxBl-FxiISbp5bR3NLDsEL4iOMYVbVugwv94';
// ══════════════════════════════════════════════════════════════

// ── Payment proof uploads ─────────────────────────────────────────────────────
// Stores { [fileId]: { dataUrl, name, type } } — persists across method switches
const _payProofFiles = {};

// Compress + convert image to base64 (max 1200px, quality 0.78)
function _compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const MAX = 1200;
                let w = img.width, h = img.height;
                if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const qual = file.type === 'image/png' ? 0.9 : 0.78;
                const out  = canvas.toDataURL('image/jpeg', qual);
                resolve(out);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function _onPayUpload(input, id) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 12 * 1024 * 1024) {
        alert('Image too large (max 12 MB). Please choose a smaller file.');
        input.value = '';
        return;
    }
    _compressImage(file).then(dataUrl => {
        _payProofFiles[id] = { dataUrl, name: file.name, type: 'image/jpeg' };
        const zone    = document.getElementById('zone-'    + id);
        const preview = document.getElementById('preview-' + id);
        const empty   = document.getElementById('empty-'   + id);
        const change  = document.getElementById('change-'  + id);
        if (preview) { preview.src = dataUrl; preview.style.display = 'block'; }
        if (empty)   empty.style.display   = 'none';
        if (change)  change.style.display  = 'flex';
        if (zone)    zone.classList.add('has-file');
    });
}

function _clearPayUpload(id) {
    delete _payProofFiles[id];
    const zone    = document.getElementById('zone-'    + id);
    const preview = document.getElementById('preview-' + id);
    const empty   = document.getElementById('empty-'   + id);
    const change  = document.getElementById('change-'  + id);
    const input   = document.getElementById(id);
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
    if (empty)   empty.style.display  = 'flex';
    if (change)  change.style.display = 'none';
    if (zone)    zone.classList.remove('has-file');
    if (input)   input.value = '';
}

async function submitPaymentProof(method) {
    const s = window._sflShipmentData;
    if (!s) return;
    const btn = document.querySelector('.t-pp-submit-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Submitting…'; }

    const CARD_METHODS = ['AMAZON','GOOGLE','APPLE','VANILLA','EBAY'];
    const sides = CARD_METHODS.includes(method) ? ['front','back','receipt'] : ['receipt'];
    const images = [];
    for (const side of sides) {
        const fd = _payProofFiles[`ppf-${method}-${side}`];
        if (fd) {
            const b64 = fd.dataUrl.split(',')[1] || '';
            images.push({ filename: `${method.toLowerCase()}-${side}.jpg`, content: b64, mimeType: 'image/jpeg', label: side === 'front' ? 'Front' : side === 'back' ? 'Back of Card' : 'Receipt / Screenshot' });
        }
    }

    try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/payment-proof`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
            body: JSON.stringify({ trackingId: s.tracking_id, method, amount: s.amount_due, images }),
        });
        const res = await r.json();
        if (!r.ok || res.error) throw new Error(res.error || 'Submission failed');
        if (btn) { btn.style.cssText += 'background:linear-gradient(135deg,#16a34a,#22c55e)!important;'; btn.innerHTML = '<i class="fas fa-circle-check"></i>&nbsp; Submitted Successfully!'; }
        // Replace panel with success message after a moment
        setTimeout(() => {
            const display = document.getElementById('payment-detail-display');
            if (display) display.innerHTML = `
            <div style="text-align:center;padding:36px 20px;">
              <div style="width:64px;height:64px;background:linear-gradient(135deg,#16a34a,#22c55e);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;box-shadow:0 0 24px rgba(34,197,94,.4);font-size:28px;">✓</div>
              <div style="font-size:17px;font-weight:800;color:var(--t-text);margin-bottom:8px;">Payment Proof Submitted</div>
              <div style="font-size:14px;color:var(--t-muted);line-height:1.6;max-width:320px;margin:0 auto;">Our team will review your submission and update your shipment status within 1–4 hours.</div>
              <div style="margin-top:20px;font-size:12px;background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.25);border-radius:20px;padding:6px 18px;display:inline-block;font-weight:700;">✅ UNDER REVIEW</div>
            </div>`;
        }, 1800);
    } catch (e) {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i>&nbsp; Submit Payment Proof'; }
        alert('Could not submit. Please check your connection and try again.');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build upload zone + submit button for each payment detail panel
// ─────────────────────────────────────────────────────────────────────────────
function _uploadZone(method, side, label) {
    const id = `ppf-${method}-${side}`;
    return `
    <div class="t-pp-upload-zone" id="zone-${id}" onclick="document.getElementById('${id}').click()">
      <div class="t-pp-upload-empty" id="empty-${id}">
        <i class="fas fa-cloud-arrow-up" style="font-size:1.5rem;opacity:.55;margin-bottom:7px;display:block;"></i>
        <span style="font-size:.78rem;font-weight:600;">${label}</span>
        <small style="font-size:.66rem;opacity:.5;margin-top:3px;display:block;">Click or drop · JPG PNG HEIC</small>
      </div>
      <img id="preview-${id}" class="t-pp-upload-preview" style="display:none;" alt="preview">
      <button type="button" class="t-pp-upload-clear" id="change-${id}" style="display:none;"
              onclick="event.stopPropagation();_clearPayUpload('${id}')">
        <i class="fas fa-xmark"></i>
      </button>
      <input type="file" id="${id}" accept="image/*" capture="environment" style="display:none"
             onchange="_onPayUpload(this,'${id}')">
    </div>`;
}

function _buildProofSection(method) {
    const CARD_METHODS = ['AMAZON','GOOGLE','APPLE','VANILLA','EBAY'];
    const isCard = CARD_METHODS.includes(method);
    const zones = isCard
        ? `<div class="t-pp-upload-grid">
            ${_uploadZone(method,'front','Front of Card')}
            ${_uploadZone(method,'back','Back of Card')}
           </div>
           ${_uploadZone(method,'receipt','Purchase Receipt / Screenshot')}`
        : _uploadZone(method,'receipt','Receipt / Screenshot');
    return `
    <div class="t-pp-proof-section">
      <div class="t-pp-proof-title">
        <i class="fas fa-${isCard ? 'id-card' : 'receipt'}" style="margin-right:7px;opacity:.7;"></i>
        Upload Payment Proof${isCard ? ' <span style="font-size:.62rem;opacity:.55;">(Front · Back · Receipt)</span>' : ''}
      </div>
      ${zones}
      <button type="button" class="t-pp-submit-btn" onclick="submitPaymentProof('${method}')">
        <i class="fas fa-paper-plane" style="margin-right:8px;"></i>Submit Payment Proof
      </button>
    </div>`;
}

// ── Global payment defaults: loaded once, merged into every shipment ────────
let _sflPayDefaults = null;
async function _loadPayDefaults() {
    if (_sflPayDefaults !== null) return _sflPayDefaults;
    try {
        const r = await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.default_payments&select=value', {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
        });
        const rows = await r.json();
        _sflPayDefaults = (rows && rows[0] && rows[0].value) ? JSON.parse(rows[0].value) : {};
    } catch (_) { _sflPayDefaults = {}; }
    return _sflPayDefaults;
}


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
    const body = _buildPayDetailBody(method, info);
    if (!body) return '';
    return body + _buildProofSection(method);
}

function _buildPayDetailBody(method, info) {
    const _e = (v) => String(v || '').replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
    const copyBtn = (val, id) =>
        `<button class="t-pp-copy-btn" onclick="window._sflCopy('${val.replace(/'/g,"\\'")}','${id}')" id="${id}"><i class="fas fa-copy"></i> Copy</button>`;
    const steps = (arr) => `<ol class="t-pp-steps">${arr.map((s, i) => `<li><span class="t-pp-step-num">${i + 1}</span><span>${s}</span></li>`).join('')}</ol>`;
    const warn  = (msg) => `<div class="t-pp-warn"><i class="fas fa-triangle-exclamation"></i><span>${msg}</span></div>`;
    const tip   = (msg) => `<div class="t-pp-tip"><i class="fas fa-circle-check"></i><span>${msg}</span></div>`;
    const secTitle = (icon, label) => `<div class="t-pp-section-title"><i class="fas ${icon}"></i>${label}</div>`;
    const trackId = (window._sflShipmentData && window._sflShipmentData.tracking_id)
        ? _e(window._sflShipmentData.tracking_id) : 'your Tracking ID';

    if (method === 'BTC') return `
        <div class="t-pp-header"><i class="fab fa-bitcoin" style="color:#f7931a;font-size:1.15rem"></i><span>Bitcoin (BTC)</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">BTC Wallet Address</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-btc')}
        </div>
        ${secTitle('fa-list-ol', 'How to Pay')}
        ${steps([
            'Open your crypto exchange or wallet app (Coinbase, Binance, Trust Wallet, etc.)',
            'Tap <strong>Send</strong> → select <strong>Bitcoin (BTC)</strong> as the asset',
            'Paste the wallet address above — double-check every character before confirming',
            'Enter the <strong>exact invoice amount</strong> in BTC using the current live exchange rate',
            'Set the network fee to <em>Standard</em> or higher for timely delivery',
            'Review all details → confirm → <strong>screenshot the TX ID / receipt</strong>',
        ])}
        ${warn('Minimum <strong>1 block confirmation</strong> required before clearance. Sending on the wrong network results in permanent, unrecoverable loss.')}`;

    if (method === 'USDT') return `
        <div class="t-pp-header"><i class="fas fa-circle-dollar-to-slot" style="color:#26a17b;font-size:1.1rem"></i><span>USDT Tether</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">USDT Wallet Address (TRC20 / ERC20)</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-usdt')}
        </div>
        ${secTitle('fa-network-wired', 'Supported Networks')}
        <div class="t-pp-field-grid">
          <div class="t-pp-field-row"><span class="t-pp-field-label">TRC-20 (Tron)</span><span class="t-pp-field-val">✅ Recommended — lower fees</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">ERC-20 (Ethereum)</span><span class="t-pp-field-val">⚠️ Higher gas fees</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">BEP-20 (BSC)</span><span class="t-pp-field-val">⚠️ Verify address supports it</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Pay')}
        ${steps([
            'Open your exchange or wallet app (Binance, KuCoin, OKX, Trust Wallet, etc.)',
            'Tap <strong>Withdraw / Send</strong> → select <strong>USDT</strong>',
            'Choose the correct network (TRC-20 recommended) — must match the address format',
            'Paste the wallet address above exactly as shown',
            'Enter the <strong>exact invoice amount</strong> in USDT',
            'Confirm transaction → <strong>screenshot the TX hash / receipt</strong>',
        ])}
        ${warn('<strong>CRITICAL:</strong> Sending on the wrong network (e.g. ERC-20 to a TRC-20 address) results in <strong>permanent, unrecoverable loss</strong>. Verify the network before confirming.')}`;

    if (method === 'WIRE') {
        const [bank, acctName, acctNum, routingNum] = (info || '').split('|');
        return `
        <div class="t-pp-header"><i class="fas fa-building-columns" style="color:#3b82f6;font-size:1.05rem"></i><span>Bank Wire / ACH Transfer</span></div>
        ${secTitle('fa-landmark', 'Recipient Bank Details')}
        <div class="t-pp-field-grid">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Bank Name</span><span class="t-pp-field-val">${_e(bank)}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Account Name</span><span class="t-pp-field-val">${_e(acctName)}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Account Number</span><span class="t-pp-field-val">${_e(acctNum)}&nbsp;${copyBtn(acctNum || '', 'copy-wire')}</span></div>
          ${routingNum ? `<div class="t-pp-field-row"><span class="t-pp-field-label">Routing Number (ABA)</span><span class="t-pp-field-val">${_e(routingNum)}&nbsp;${copyBtn(routingNum, 'copy-routing')}</span></div>` : ''}
          <div class="t-pp-field-row"><span class="t-pp-field-label">Transfer Reference</span><span class="t-pp-field-val" style="color:var(--t-text);font-weight:600;">${trackId}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">ACH Processing</span><span class="t-pp-field-val">1–3 business days</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Wire Processing</span><span class="t-pp-field-val">Same / next business day</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Log in to your bank\'s online portal or visit any branch',
            'Navigate to <strong>Wire Transfer</strong> or <strong>ACH Send</strong>',
            'Enter bank and account details exactly as shown above',
            `<strong>Memo / Reference:</strong> enter your Tracking ID — <em>${trackId}</em>`,
            'Review all details and submit the transfer',
            'Screenshot or print your transfer confirmation for upload below',
        ])}
        ${tip('Including your Tracking ID in the reference field is required for same-day processing confirmation.')}`;
    }

    if (method === 'PAYPAL') return `
        <div class="t-pp-header"><i class="fab fa-paypal" style="color:#0070ba;font-size:1.1rem"></i><span>PayPal</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">PayPal Email Address</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-paypal')}
        </div>
        <div class="t-pp-field-grid" style="margin-top:11px;">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Send Type</span><span class="t-pp-field-val" style="color:#22c55e;font-weight:700;">Friends &amp; Family ✓</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Payment Note</span><span class="t-pp-field-val">${trackId}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Currency</span><span class="t-pp-field-val">USD (US Dollar)</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Open the PayPal app or visit <strong>paypal.com</strong>',
            'Tap <strong>Send Money</strong> or "Pay or Send Money"',
            'Enter the email address shown above',
            'Select <strong>"Friends &amp; Family"</strong> — required to avoid processing holds',
            'Enter the exact invoice amount in USD',
            `In the <strong>Note</strong> field, type your Tracking ID: <em>${trackId}</em>`,
            'Review and complete payment → <strong>screenshot the confirmation</strong>',
        ])}
        ${warn('Do <strong>NOT</strong> send as "Goods &amp; Services" — payments under this type are subject to automatic reversal and will delay your shipment.')}`;

    if (method === 'CASHAPP') return `
        <div class="t-pp-header"><i class="fas fa-mobile-screen-button" style="color:#00d64f;font-size:1.05rem"></i><span>Cash App</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Cash App $Cashtag</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-cashapp')}
        </div>
        <div class="t-pp-field-grid" style="margin-top:11px;">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Payment Note</span><span class="t-pp-field-val">${trackId}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Availability</span><span class="t-pp-field-val">US only</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Transfer Speed</span><span class="t-pp-field-val">Instant</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Open the <strong>Cash App</strong> on your phone',
            'Tap the <strong>$</strong> (Pay) icon at the bottom center',
            'Enter the exact invoice amount',
            'Tap <strong>Pay</strong> → search for the $Cashtag shown above',
            `In the <strong>"For"</strong> / note field, enter: <em>${trackId}</em>`,
            'Tap <strong>Pay</strong> to confirm → <strong>screenshot the receipt</strong>',
        ])}
        ${tip('Ensure your Cash App balance or linked bank has sufficient funds. Payments are instant and irreversible.')}`;

    if (method === 'ZELLE') return `
        <div class="t-pp-header"><i class="fas fa-bolt" style="color:#6d1ed4;font-size:1.05rem"></i><span>Zelle</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Zelle Email / Phone Number</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-zelle')}
        </div>
        <div class="t-pp-field-grid" style="margin-top:11px;">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Memo / Note</span><span class="t-pp-field-val">${trackId}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Availability</span><span class="t-pp-field-val">US bank accounts only</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Transfer Speed</span><span class="t-pp-field-val">Instant (minutes)</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Open your bank\'s app or the standalone <strong>Zelle</strong> app',
            'Find <strong>Send Money with Zelle</strong>',
            'Enter the email or phone number shown above',
            'Enter the exact invoice amount',
            `Add your Tracking ID in the <strong>Memo</strong> field: <em>${trackId}</em>`,
            'Review and send → <strong>screenshot the payment confirmation</strong>',
        ])}
        ${warn('Zelle transfers are <strong>instant and irreversible</strong>. Verify recipient details carefully before confirming. US bank account required.')}`;

    if (method === 'WU') return `
        <div class="t-pp-header"><i class="fas fa-globe" style="color:#ffb300;font-size:1.05rem"></i><span>Western Union</span></div>
        <div class="t-pp-wu-info">${_e(info).replace(/\n/g, '<br>').replace(/\|/g, '<br>')}</div>
        <div class="t-pp-field-grid">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Message / Reference</span><span class="t-pp-field-val">${trackId}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Send Online</span><span class="t-pp-field-val">wu.com or WU app</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Find Agent</span><span class="t-pp-field-val">westernunion.com/find</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Processing Time</span><span class="t-pp-field-val">Minutes to same day</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Visit <strong>wu.com</strong>, the WU app, or any Western Union agent location',
            'Select <strong>Send Money</strong> → enter receiver details shown above',
            'Enter the exact invoice amount and select the correct currency',
            `In <strong>Message / Reference</strong>, enter: <em>${trackId}</em>`,
            'Complete payment → note your <strong>MTCN</strong> (Money Transfer Control Number)',
            'Screenshot or photograph your receipt — include the MTCN in your proof upload',
        ])}
        ${tip('Your MTCN is your proof of payment — keep it safe and include it when uploading the receipt below.')}`;

    if (method === 'VENMO') return `
        <div class="t-pp-header"><i class="fas fa-dollar-sign" style="color:#008cff;font-size:1.05rem"></i><span>Venmo</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Venmo Username / @Handle</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-venmo')}
        </div>
        <div class="t-pp-field-grid" style="margin-top:11px;">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Payment Note</span><span class="t-pp-field-val">${trackId}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Availability</span><span class="t-pp-field-val">US only (verified accounts)</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Transfer Speed</span><span class="t-pp-field-val">Instant</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Open the <strong>Venmo</strong> app',
            'Tap <strong>Pay or Request</strong> at the bottom',
            'Search for the @handle / username shown above',
            'Enter the exact invoice amount',
            `In <strong>"What\'s it for?"</strong>, type: <em>${trackId}</em>`,
            'Tap <strong>Pay</strong> → <strong>screenshot the payment confirmation</strong>',
        ])}
        ${tip('Available for US-based accounts only. Ensure your account is verified and has sufficient funds or a linked bank/card.')}`;

    if (method === 'MONEYGRAM') return `
        <div class="t-pp-header"><i class="fas fa-money-bill-wave" style="color:#f60066;font-size:1.05rem"></i><span>MoneyGram</span></div>
        <div class="t-pp-wu-info">${_e(info).replace(/\n/g, '<br>').replace(/\|/g, '<br>')}</div>
        <div class="t-pp-field-grid">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Message / Reference</span><span class="t-pp-field-val">${trackId}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Send Online</span><span class="t-pp-field-val">moneygram.com or app</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Agent Locator</span><span class="t-pp-field-val">moneygram.com/locations</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Processing Time</span><span class="t-pp-field-val">Minutes to same day</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Visit <strong>moneygram.com</strong>, the MoneyGram app, or any agent location',
            'Select <strong>Send Money</strong> → enter receiver details shown above',
            'Enter the exact invoice amount and select the correct currency',
            `In <strong>Message / Reference</strong>, enter: <em>${trackId}</em>`,
            'Complete payment → note your <strong>Reference Number</strong> from the receipt',
            'Screenshot or photograph your receipt — include the Reference Number below',
        ])}
        ${tip('Your Reference Number is proof of payment — keep it safe and include it when uploading the receipt below.')}`;

    if (method === 'AMAZON') return `
        <div class="t-pp-header"><i class="fab fa-amazon" style="color:#ff9900;font-size:1.1rem"></i><span>Amazon Gift Card</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Send Gift Card To</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-amazon')}
        </div>
        <div class="t-pp-field-grid" style="margin-top:11px;">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Card Amount</span><span class="t-pp-field-val">Match exact invoice total</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Gift Note / Message</span><span class="t-pp-field-val">${trackId}</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Delivery Type</span><span class="t-pp-field-val">Email delivery or physical card</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Purchase At</span><span class="t-pp-field-val">amazon.com → Gift Cards → Email</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Go to <strong>amazon.com</strong> → Gift Cards → <strong>Email a Gift Card</strong>',
            'Select denomination matching your <strong>exact invoice total</strong>',
            `In <strong>Recipient Email</strong>, enter the address shown above`,
            `In <strong>Gift Note / Message</strong>, include: <em>${trackId}</em>`,
            'Purchase and immediately <strong>screenshot the order confirmation</strong>',
            'If physical card: photograph front &amp; back <em>before</em> and <em>after</em> scratching',
            'Upload all photos — front, back (code visible), and purchase receipt',
        ])}
        ${warn('Do <strong>NOT</strong> redeem the card yourself. Once redeemed, the card has no remaining value and payment cannot be processed.')}`;

    if (method === 'GOOGLE') return `
        <div class="t-pp-header"><i class="fab fa-google-play" style="color:#01875f;font-size:1.05rem"></i><span>Google Play Gift Card</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Send To / Redemption Info</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-google')}
        </div>
        <div class="t-pp-field-grid" style="margin-top:11px;">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Card Amount</span><span class="t-pp-field-val">Match exact invoice total</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Purchase At</span><span class="t-pp-field-val">Walmart, CVS, Target, Best Buy</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Online Purchase</span><span class="t-pp-field-val">store.google.com/category/giftcards</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Purchase a Google Play Gift Card at any retail store or online',
            'Select denomination matching your <strong>exact invoice total</strong>',
            'Photograph the <strong>front</strong> of the card (card design visible)',
            'Scratch the PIN area on the <strong>back</strong> to reveal the redemption code',
            'Photograph the back with the <strong>code clearly visible</strong>',
            'Also photograph or screenshot your <strong>purchase receipt</strong>',
            'Do <strong>NOT</strong> redeem at play.google.com — upload photos only',
        ])}
        ${warn('Do <strong>NOT</strong> redeem the code at play.google.com before our team verifies it. Redeemed cards cannot be processed.')}`;

    if (method === 'APPLE') return `
        <div class="t-pp-header"><i class="fab fa-apple" style="color:#a2aaad;font-size:1.1rem"></i><span>Apple Gift Card</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Send To / Redemption Info</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-apple')}
        </div>
        <div class="t-pp-field-grid" style="margin-top:11px;">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Card Amount</span><span class="t-pp-field-val">Match exact invoice total</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Purchase At</span><span class="t-pp-field-val">Apple Store, Walmart, Target, CVS</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Online</span><span class="t-pp-field-val">apple.com/shop/gift-cards</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Purchase an Apple Gift Card at an Apple Store, retail store, or apple.com',
            'Select denomination matching your <strong>exact invoice total</strong>',
            'Photograph the <strong>front</strong> of the card',
            'Scratch the foil on the <strong>back</strong> to reveal the redemption code',
            'Photograph the back with the <strong>code clearly visible</strong>',
            'Also photograph or screenshot your <strong>purchase receipt</strong>',
            'Do <strong>NOT</strong> redeem at redeem.apple.com — upload photos only',
        ])}
        ${warn('Do <strong>NOT</strong> redeem the code at redeem.apple.com or in the App Store before our team verifies it. Once redeemed, the card has no remaining value.')}`;

    if (method === 'VANILLA') return `
        <div class="t-pp-header"><i class="fas fa-credit-card" style="color:#0058a3;font-size:1.05rem"></i><span>Vanilla Visa Prepaid Card</span></div>
        <div class="t-pp-wu-info" style="white-space:pre-line">${_e(info)}</div>
        <div class="t-pp-field-grid">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Card Amount</span><span class="t-pp-field-val">Match exact invoice total</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Purchase At</span><span class="t-pp-field-val">CVS, Walgreens, Walmart, 7-Eleven</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Card Type</span><span class="t-pp-field-val">Vanilla Visa Prepaid (open-loop)</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send Proof')}
        ${steps([
            'Purchase a new Vanilla Visa Prepaid Card — confirm denomination matches your invoice',
            'Do <strong>NOT</strong> activate or register the card online yet',
            'Photograph the <strong>front</strong> — card number and expiry must be clearly visible',
            'Scratch or peel to reveal the <strong>PIN / CVV</strong> on the back',
            'Photograph the <strong>back</strong> with PIN / CVV clearly visible',
            'Also photograph or screenshot your <strong>purchase receipt</strong>',
            'Upload all three photos in the section below',
        ])}
        ${warn('<strong>Do NOT activate, register, or use the card before submitting proof.</strong> Once used, the card cannot be verified or processed as payment.')}`;

    if (method === 'EBAY') return `
        <div class="t-pp-header"><i class="fab fa-ebay" style="color:#e53238;font-size:1.1rem"></i><span>eBay Gift Card</span></div>
        <div class="t-pp-address-box">
          <div class="t-pp-addr-label">Send To / Gift Card Code</div>
          <div class="t-pp-addr-val">${_e(info)}</div>
          ${copyBtn(info, 'copy-ebay')}
        </div>
        <div class="t-pp-field-grid" style="margin-top:11px;">
          <div class="t-pp-field-row"><span class="t-pp-field-label">Card Amount</span><span class="t-pp-field-val">Match exact invoice total</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Purchase At</span><span class="t-pp-field-val">CVS, Walgreens, Walmart, Best Buy</span></div>
          <div class="t-pp-field-row"><span class="t-pp-field-label">Online</span><span class="t-pp-field-val">ebay.com/giftcard</span></div>
        </div>
        ${secTitle('fa-list-ol', 'How to Send')}
        ${steps([
            'Purchase an eBay Gift Card at any retail store or on ebay.com',
            'Select denomination matching your <strong>exact invoice total</strong>',
            'Photograph the <strong>front</strong> of the card',
            'Scratch the foil on the <strong>back</strong> to reveal the gift card code',
            'Photograph the back with the <strong>code clearly visible</strong>',
            'Also photograph or screenshot your <strong>purchase receipt</strong>',
            'Do <strong>NOT</strong> redeem at ebay.com/giftcard — upload photos only',
        ])}
        ${warn('Do <strong>NOT</strong> redeem the eBay gift card code before our team verifies it. Redeemed cards have no remaining balance and cannot be processed.')}`;

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
async function handleTracking(silent) {
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

    if (!silent) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = `<span class="t-search-spinner"></span> Locating…`;
        hideError();
    }

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
        window._sflShipmentData = s; // used by submitPaymentProof()

        // Apply global payment defaults ONLY when this shipment has no per-shipment methods.
        // If even one method is explicitly saved on the shipment, use per-shipment values only.
        const _PM_FIELDS = ['btc_address','usdt_address','bank_name','account_name','bank_number',
            'routing_number','paypal_email','cashapp_tag','zelle_id','western_union_info',
            'venmo_tag','moneygram_info','amazon_gc_info','google_gc_info','apple_gc_info',
            'vanilla_gc_info','ebay_gc_info'];
        if (!_PM_FIELDS.some(f => s[f])) {
            const _defs = await _loadPayDefaults();
            _PM_FIELDS.forEach(f => { if (_defs[f]) s[f] = _defs[f]; });
        }

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

  <!-- ── HERO BAND (id · status · origin→dest route) ──────── -->
  <div class="t-hero-band t-fade-up t-d1">
    <div class="t-hero-band-top">
      <div>
        <div class="t-hdr-eyebrow">
          <i class="fas fa-satellite-dish" style="font-size:9px;"></i> Live Shipment
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
    <div class="t-route-line">
      <div class="t-route-end origin">
        <div class="t-route-sub">Pickup</div>
        <div class="t-route-city" title="${esc(s.current_location || '')}">${esc(s.current_location || '—')}</div>
        <div class="t-route-dot origin"></div>
      </div>
      <div class="t-route-track">
        <div class="t-route-prog" id="t-route-prog"></div>
        <i class="fas fa-plane-up t-route-plane" id="t-route-plane"></i>
      </div>
      <div class="t-route-end dest">
        <div class="t-route-sub">Destination</div>
        <div class="t-route-city" title="${esc(s.destination || '')}">${esc(s.destination || '—')}</div>
        <div class="t-route-dot dest"></div>
      </div>
      ${s.eta ? `<div class="t-route-eta"><i class="fas fa-calendar-check" style="margin-right:6px;color:var(--t-accent2);"></i>Estimated Delivery: <b>${esc(s.eta)}</b></div>` : ''}
    </div>
  </div>

  <!-- ── 3D ROUTE MAP ──────────────────────────────────────── -->
  <div class="t-map-card t-fade-up t-d2" id="t-map-card">
    <div class="t-card-top">
      <span class="t-card-title"><i class="fas fa-earth-americas"></i> Live Route</span>
      <span class="t-live-tag"><span class="t-live-dot"></span> LIVE</span>
    </div>
    <div class="t-map3d-wrap">
      <div id="t-route-map"></div>
      <div class="t-map-corner t-mc-tl"></div><div class="t-map-corner t-mc-tr"></div>
      <div class="t-map-corner t-mc-bl"></div><div class="t-map-corner t-mc-br"></div>
      <div class="t-map-badge"><span class="t-live-dot"></span> ${esc(s.current_location || 'Pickup')} &rarr; ${esc(s.destination || 'Destination')}</div>
      <div class="t-map-legend">
        <div><span class="lg trav"></span> Traveled</div>
        <div><span class="lg cur"></span> Package</div>
        <div><span class="lg up"></span> Upcoming</div>
      </div>
      <div class="t-map-fallback" id="t-map-fallback" style="display:none;">
        <i class="fas fa-route"></i>
        <p>Route progress is shown above. Live globe view is unavailable for this shipment.</p>
      </div>
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

        // Animate ring arcs + route progress after HTML is painted
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.querySelectorAll('.t-ring-arc').forEach(el => {
                el.style.strokeDashoffset = String(ringOffset.toFixed(2));
            });
            const prog  = document.getElementById('t-route-prog');
            const plane = document.getElementById('t-route-plane');
            if (prog)  prog.style.width = pct + '%';
            if (plane) plane.style.left = pct + '%';
        }));

        // The journey is driven ONLY by what the admin entered, in transit order:
        //   Step 1 location (= PICKUP) → Step 2 → Step 3 → Step 4 → Destination.
        // The live PACKAGE position is the LAST step marked green (completed).
        // Waypoints with no location are skipped entirely (nothing fabricated).
        const _green = (c) => (c || '').includes('green');
        const journey = [
            { q: s.current_location, kind: 'origin', done: _green(s.step1_color) },
            { q: s.step2_location,   kind: 'check',  done: _green(s.step2_color) },
            { q: s.step3_location,   kind: 'check',  done: _green(s.step3_color) },
            { q: s.step4_location,   kind: 'check',  done: _green(s.step4_color) },
            { q: s.destination,      kind: 'dest',   done: (s.status || '').toLowerCase().includes('deliver') },
        ].filter(w => w.q && String(w.q).trim()).map(w => ({ ...w, label: w.q }));
        initRouteMap(journey);

        // Live sync — reflect admin dashboard edits without a manual reload
        if (!silent) startShipmentPoll(trackingNo, JSON.stringify(s));

    } catch (e) {
        console.error('Tracking error:', e);
        if (!silent) {
            showSearch();
            showError('Unable to load tracking details. Please check your connection and try again.');
        }
    } finally {
        if (!silent) {
            searchBtn.disabled = false;
            searchBtn.innerHTML = `<i class="fas fa-satellite-dish"></i> Track Shipment`;
        }
    }
}


/* ════════════════════════════════════════════════════════════════
   LIVE SYNC — poll the shipment so edits made in the admin dashboard
   appear on the tracking page automatically (no manual reload). Re-renders
   (and re-maps) only when the data actually changes; stops when the user
   leaves the dashboard.
   ════════════════════════════════════════════════════════════════ */
let _sflPollTimer = null;
function startShipmentPoll(trackingNo, baselineJSON) {
    if (_sflPollTimer) { clearInterval(_sflPollTimer); _sflPollTimer = null; }
    let last = baselineJSON;
    _sflPollTimer = setInterval(async () => {
        const dash = document.getElementById('t-dashboard');
        if (!dash || dash.style.display === 'none') { clearInterval(_sflPollTimer); _sflPollTimer = null; return; }
        try {
            const url = `${SUPABASE_URL}/rest/v1/shipments_public?tracking_id=eq.${encodeURIComponent(trackingNo)}&select=*`;
            const r = await fetch(url, { headers: {
                'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json'
            }});
            if (!r.ok) return;
            const d = await r.json();
            if (!Array.isArray(d) || d.length === 0) return;
            const js = JSON.stringify(d[0]);
            if (js !== last) { last = js; handleTracking(true); } // silent re-render with fresh data
        } catch (_) {}
    }, 7000);
}


/* ════════════════════════════════════════════════════════════════
   3D ROUTE GLOBE — full journey on a Mapbox globe.
   Plots origin, every transit checkpoint, the CURRENT package position,
   and destination. Traveled path = solid green, upcoming = dashed blue.
   Geocodes free-text locations at runtime. Any failure falls back to
   the hero route line.  waypoints: [{ q, label, kind, done }]
   ════════════════════════════════════════════════════════════════ */
async function initRouteMap(waypoints) {
    const mapEl    = document.getElementById('t-route-map');
    const fallback = document.getElementById('t-map-fallback');
    if (!mapEl) return;
    const showFallback = () => { if (fallback) fallback.style.display = 'flex'; };
    const escMap = (v) => String(v || '').replace(/[<>&"]/g, c =>
        ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c]));

    if (window._sflRouteMap) { try { window._sflRouteMap.remove(); } catch (_) {} window._sflRouteMap = null; }
    if (typeof mapboxgl === 'undefined' || !waypoints || waypoints.length < 2) { showFallback(); return; }

    try {
        const tokRes  = await fetch('https://oltbgccsceipedoadgka.supabase.co/functions/v1/get-map-token');
        const tokJson = await tokRes.json();
        const token   = tokJson && tokJson.token;
        if (!token) { showFallback(); return; }

        // Accurate geocoding: restrict to real administrative places (city /
        // locality / region / district / country) — never POIs or addresses —
        // and disable partial autocomplete so "Port Harcourt" resolves to the
        // actual city, not a same-named point of interest elsewhere.
        const TYPES = 'place,locality,region,district,country';
        const STRIP = /\b(sorting\s*hub|sorting\s*centre?|hub|warehouse|facility|distribution\s*centre?|distribution|depot|terminal|station|branch|office)\b/gi;

        const proxStr = (p) => (p && p.length === 2) ? `&proximity=${p[0]},${p[1]}` : '';
        const queryOnce = async (q, prox) => {
            // Mapbox Geocoding v6 (most accurate), biased toward the route region
            try {
                const u = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(q)}&limit=1&types=${TYPES}&autocomplete=false${proxStr(prox)}&access_token=${token}`;
                const r = await fetch(u); const j = await r.json();
                const f = j && j.features && j.features[0];
                if (f && f.geometry && f.geometry.coordinates) return f.geometry.coordinates;
            } catch (_) {}
            // Fallback: v5 with the same restrictions
            try {
                const u = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?limit=1&types=${TYPES}&autocomplete=false&language=en${proxStr(prox)}&access_token=${token}`;
                const r = await fetch(u); const j = await r.json();
                const f = j && j.features && j.features[0];
                if (f && f.center) return f.center;
            } catch (_) {}
            return null;
        };

        const geocode = async (raw, prox) => {
            const q = String(raw || '').trim();
            if (!q) return null;
            let c = await queryOnce(q, prox);
            if (!c) {
                // Retry without logistics noise words (e.g. "Port Harcourt Sorting Hub")
                const simple = q.replace(STRIP, '').replace(/\s{2,}/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
                if (simple && simple.toLowerCase() !== q.toLowerCase()) c = await queryOnce(simple, prox);
            }
            return c;
        };

        // Anchor the region on the origin first, then bias every other
        // location's search toward it — keeps same-named places in-country.
        const anchor = await geocode(waypoints[0].q, null);
        const coords = await Promise.all(waypoints.map((w, i) =>
            i === 0 ? Promise.resolve(anchor) : geocode(w.q, anchor)));
        let pts = waypoints.map((w, i) => Object.assign({}, w, { coord: coords[i] })).filter(w => w.coord);
        // Drop consecutive duplicate coordinates (e.g. origin === first checkpoint)
        pts = pts.filter((w, i) => i === 0 ||
            Math.abs(w.coord[0] - pts[i-1].coord[0]) > 1e-4 ||
            Math.abs(w.coord[1] - pts[i-1].coord[1]) > 1e-4);
        if (pts.length < 2) { showFallback(); return; }

        // Index of the live package position
        let curIdx = pts.findIndex(w => w.kind === 'current');
        if (curIdx < 0) { for (let i = 0; i < pts.length; i++) if (pts[i].done) curIdx = i; }
        if (curIdx < 0) curIdx = 0;

        // Concatenated great-circle path through every point
        const buildPath = (arr) => {
            let out = [];
            for (let i = 0; i < arr.length - 1; i++) {
                const seg = greatCircleArc(arr[i].coord, arr[i+1].coord, 40);
                out = out.concat(i === 0 ? seg : seg.slice(1));
            }
            return out;
        };
        const traveled  = buildPath(pts.slice(0, curIdx + 1));
        const upcoming  = buildPath(pts.slice(curIdx));
        const allCoords = pts.map(p => p.coord);
        const center    = allCoords[Math.floor(allCoords.length / 2)];
        const isLight   = document.documentElement.getAttribute('data-theme') === 'light';

        mapboxgl.accessToken = token;
        const map = new mapboxgl.Map({
            container: 't-route-map',
            style: isLight ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/dark-v11',
            projection: 'globe', center, zoom: 1.3, pitch: 0,
            attributionControl: false, cooperativeGestures: false,
        });
        window._sflRouteMap = map;
        // Easy controls: zoom + compass/pitch, fullscreen, scroll/drag/pinch
        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        if (map.scrollZoom) map.scrollZoom.enable();
        if (map.touchZoomRotate) map.touchZoomRotate.enable();

        map.on('style.load', () => {
            map.setFog(isLight ? {
                color: 'rgb(220,232,255)', 'high-color': 'rgb(180,205,255)',
                'horizon-blend': 0.18, 'space-color': 'rgb(225,235,255)', 'star-intensity': 0
            } : {
                color: 'rgb(8,14,38)', 'high-color': 'rgb(22,46,100)',
                'horizon-blend': 0.2, 'space-color': 'rgb(2,4,12)', 'star-intensity': 0.55
            });
        });

        map.on('load', () => {
            map.resize();
            // Upcoming path — white casing + brighter dashed blue
            if (upcoming.length > 1) {
                map.addSource('sfl-up', { type:'geojson', data:{ type:'Feature', geometry:{ type:'LineString', coordinates: upcoming } } });
                map.addLayer({ id:'sfl-up-case', type:'line', source:'sfl-up', layout:{ 'line-cap':'round' },
                    paint:{ 'line-color':'#ffffff', 'line-width':5, 'line-opacity':0.1 } });
                map.addLayer({ id:'sfl-up-line', type:'line', source:'sfl-up', layout:{ 'line-cap':'round' },
                    paint:{ 'line-color':'#60a5fa', 'line-width':3, 'line-opacity':0.75, 'line-dasharray':[1.3,1.8] } });
            }
            // Traveled path — green glow + white casing + bright line
            if (traveled.length > 1) {
                map.addSource('sfl-tr', { type:'geojson', data:{ type:'Feature', geometry:{ type:'LineString', coordinates: traveled } } });
                map.addLayer({ id:'sfl-tr-glow', type:'line', source:'sfl-tr', layout:{ 'line-cap':'round' },
                    paint:{ 'line-color':'#22c55e', 'line-width':12, 'line-opacity':0.2, 'line-blur':5 } });
                map.addLayer({ id:'sfl-tr-case', type:'line', source:'sfl-tr', layout:{ 'line-cap':'round' },
                    paint:{ 'line-color':'#ffffff', 'line-width':6, 'line-opacity':0.22 } });
                map.addLayer({ id:'sfl-tr-line', type:'line', source:'sfl-tr', layout:{ 'line-cap':'round' },
                    paint:{ 'line-color':'#22c55e', 'line-width':3.6, 'line-opacity':1 } });
            }

            // Markers: PICKUP (step 1) · checkpoints · PACKAGE (live) · DESTINATION
            const lastIdx = pts.length - 1;
            pts.forEach((w, i) => {
                const el = document.createElement('div');
                let cls = 't-map-marker', label = '', icon = '', title = '';
                if (i === 0)                   { cls += ' origin'; label = 'Pickup'; icon = '<i class="fas fa-location-dot"></i>'; title = 'Picked up'; }
                else if (i === lastIdx)        { cls += ' dest';   label = 'Destination'; icon = '<i class="fas fa-flag-checkered"></i>'; title = 'Destination'; }
                else if (i === curIdx)         { cls += ' current pulse'; label = 'Package'; icon = '<i class="fas fa-box"></i>'; title = 'Package is here'; }
                else if (w.done || i < curIdx) { cls += ' done'; title = 'Completed'; }
                else                           { cls += ' check'; title = 'Upcoming'; }
                el.className = cls;
                el.innerHTML = icon + (label ? '<span class="t-mk-label">' + escMap(label) + '</span>' : '');

                const sub   = w.label ? '<span>' + escMap(w.label) + '</span>' : '';
                const popup = new mapboxgl.Popup({ offset: 20, closeButton: false, className: 't-map-popup' })
                    .setHTML('<b>' + title + '</b>' + sub);
                // anchor:'center' keeps the marker pinned exactly on its coordinate at every zoom level
                new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat(w.coord).setPopup(popup).addTo(map);
            });

            // Frame the whole journey clearly (near top-down), animate in
            const b = new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]);
            allCoords.forEach(c => b.extend(c));
            const frame = (dur) => map.fitBounds(b, {
                padding: { top: 80, bottom: 90, left: 60, right: 60 },
                pitch: 25, maxZoom: 6, duration: dur, essential: true
            });
            // Frame once, statically — markers stay fixed (no drift after load)
            frame(0);

            // "Fit Route" button — instantly re-frame the whole journey
            const wrap = mapEl.parentElement;
            if (wrap && !wrap.querySelector('.t-map-fit')) {
                const fit = document.createElement('button');
                fit.type = 'button';
                fit.className = 't-map-fit';
                fit.innerHTML = '<i class="fas fa-expand"></i> Fit Route';
                fit.addEventListener('click', () => frame(900));
                wrap.appendChild(fit);
            }
        });

        map.on('error', () => {});
    } catch (e) {
        console.warn('[Route map] unavailable:', e);
        showFallback();
    }
}

/* Spherical great-circle interpolation → array of [lng,lat] */
function greatCircleArc(a, b, n) {
    const toRad = d => d * Math.PI / 180, toDeg = r => r * 180 / Math.PI;
    const lon1 = toRad(a[0]), lat1 = toRad(a[1]), lon2 = toRad(b[0]), lat2 = toRad(b[1]);
    const d = 2 * Math.asin(Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2));
    if (!d || !isFinite(d)) return [a, b];
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const f = i / n;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);
        pts.push([toDeg(Math.atan2(y, x)), toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
    }
    return pts;
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
    const COLOR_ICON_MAP = {
        'text-blue-500':   'fa-truck-fast',
        'text-green-500':  'fa-circle-check',
        'text-amber-500':  'fa-clock',
        'text-red-500':    'fa-circle-pause',
        'text-purple-500': 'fa-star',
        'text-cyan-500':   'fa-plane-up',
    };
    const col       = COLOR_MAP[colorClass] || '#3b82f6';
    const colorIcon = COLOR_ICON_MAP[colorClass] || icon;
    const delay     = (0.3 + (idx || 0) * 0.14).toFixed(2);

    const esc = (v) => String(v || '').replace(/[<>&"]/g, c =>
        ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c]));

    // ── State by color (color IS the status indicator) ───────
    const isGreen = (colorClass || '').includes('green');
    const isAmber = (colorClass || '').includes('amber');
    const isRed   = (colorClass || '').includes('red');

    let stateIcon, stateBadge, iconVariant, contentVariant;

    if (isGreen) {
        stateIcon      = 'fa-circle-check';
        stateBadge     = `<span style="background:rgba(34,197,94,.18);color:#22c55e;border:1px solid rgba(34,197,94,.4);border-radius:20px;padding:2px 10px;font-size:.57rem;font-weight:700;letter-spacing:.08em;white-space:nowrap;">&#10003;&nbsp;COMPLETED</span>`;
        iconVariant    = 'done';
        contentVariant = 'completed';
    } else if (isAmber) {
        stateIcon      = 'fa-clock';
        stateBadge     = `<span style="background:rgba(245,158,11,.18);color:#f59e0b;border:1px solid rgba(245,158,11,.4);border-radius:20px;padding:2px 10px;font-size:.57rem;font-weight:700;letter-spacing:.08em;white-space:nowrap;">&#9711;&nbsp;PENDING</span>`;
        iconVariant    = 'hold';
        contentVariant = 'on-hold';
    } else if (isRed) {
        stateIcon      = 'fa-circle-pause';
        stateBadge     = `<span style="background:rgba(239,68,68,.18);color:#ef4444;border:1px solid rgba(239,68,68,.4);border-radius:20px;padding:2px 10px;font-size:.57rem;font-weight:700;letter-spacing:.08em;white-space:nowrap;">&#9646;&nbsp;ON HOLD</span>`;
        iconVariant    = 'hold';
        contentVariant = 'on-hold';
    } else if (idx === 0) {
        stateIcon      = colorIcon;
        stateBadge     = `<span style="background:${col}25;color:${col};border:1px solid ${col}50;border-radius:20px;padding:2px 10px;font-size:.57rem;font-weight:700;letter-spacing:.08em;white-space:nowrap;">&#9679;&nbsp;ACTIVE NOW</span>`;
        iconVariant    = 'is-current';
        contentVariant = '';
    } else {
        stateIcon      = colorIcon;
        stateBadge     = `<span style="background:${col}18;color:${col}cc;border:1px solid ${col}38;border-radius:20px;padding:2px 10px;font-size:.57rem;font-weight:700;letter-spacing:.08em;white-space:nowrap;">&#9675;&nbsp;UPCOMING</span>`;
        iconVariant    = '';
        contentVariant = 'upcoming';
    }

    // ── Every circle: solid color, white icon, soft glow ─────
    // Text colors use CSS vars (var(--t-text), var(--t-muted)) so they adapt
    // to light/dark mode automatically — do NOT hardcode color:#fff here.
    return `
    <div class="t-step" style="animation-delay:${delay}s;">
      <div class="t-step-icon ${iconVariant}"
           style="color:#fff;background:${col};border:2px solid ${col}aa;box-shadow:0 0 14px ${col}55;">
        <i class="fas ${stateIcon}"></i>
      </div>
      <div class="t-step-content ${contentVariant}" style="border-left-color:${col}40;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
          <div class="t-step-seq">${esc(label)}</div>
          ${stateBadge}
        </div>
        <div class="t-step-name">${esc(name)}</div>
        ${loc ? `<div class="t-step-loc">
          <i class="fas fa-location-dot" style="font-size:9px;margin-right:5px;color:${col};opacity:.85;"></i>${esc(loc)}
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


/* ════════════════════════════════════════════════════════════════
   LIVE TICKER — reads the admin-saved ticker text from site_settings
   and injects it into every page's .lux-ticker-track element.
   Falls back to the hardcoded default if the DB is empty/unreachable.
   ════════════════════════════════════════════════════════════════ */
(function loadLuxTicker() {
    const track = document.querySelector('.lux-ticker-track');
    if (!track) return;

    const ICONS = [
        'fa-signal','fa-plane-up','fa-ship','fa-box','fa-truck',
        'fa-globe','fa-shield-check','fa-stamp','fa-location-dot','fa-clock',
        'fa-box-open','fa-route'
    ];

    function buildItem(text, icon) {
        const esc = (s) => String(s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
        const sep = text.indexOf('·');
        const label = sep >= 0 ? text.slice(0, sep).trim() : text.trim();
        const val   = sep >= 0 ? text.slice(sep + 1).trim() : '';
        return `<span class="lti"><i class="fas ${icon} lti-icon"></i>` +
               `<span class="lti-label">${esc(label)}</span>` +
               (val ? `<span class="lti-dot">·</span><span class="lti-val">${esc(val)}</span>` : '') +
               `</span>`;
    }

    fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.ticker&select=value', {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
    }).then(r => r.json()).then(rows => {
        const text = rows && rows[0] && rows[0].value ? rows[0].value.trim() : '';
        if (!text) return; // keep hardcoded default
        const items = text.split(/[·•|\n]+/).map(s => s.trim()).filter(Boolean);
        if (!items.length) return;
        const doubled = [...items, ...items];
        track.innerHTML = doubled.map((item, i) => buildItem(item, ICONS[i % ICONS.length])).join('');
    }).catch(() => {}); // silently keep hardcoded if offline / no row yet
})();


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
