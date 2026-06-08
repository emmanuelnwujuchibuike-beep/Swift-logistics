/* ═══════════════════════════════════════════════════════════════
   SFL ADMIN — admin.js
   Credentials are stored in localStorage (entered once via Settings).
   Email is sent via a Supabase Edge Function — no server needed.
═══════════════════════════════════════════════════════════════ */

// ── State ────────────────────────────────────────────────────────
let supabase        = null;
let allShipments    = [];
let editingId       = null;
let confirmCallback = null;

const DEFAULT_PASSWORD = 'admin';
const TRACKING_BASE    = 'https://swiftfreightlogix.netlify.app/payment.html?id=';

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initColorDots();
    if (localStorage.getItem('sfl_authed') === '1') bootApp();
    document.getElementById('login-pw').addEventListener('keydown', e => {
        if (e.key === 'Enter') doLogin();
    });
});

// ── Auth ─────────────────────────────────────────────────────────
function doLogin() {
    const pw     = document.getElementById('login-pw').value;
    const stored = localStorage.getItem('sfl_admin_pw') || DEFAULT_PASSWORD;
    const errEl  = document.getElementById('login-err');
    if (pw === stored) {
        localStorage.setItem('sfl_authed', '1');
        errEl.style.display = 'none';
        bootApp();
    } else {
        errEl.textContent    = 'Incorrect password. Default is "admin" on first login.';
        errEl.style.display  = 'block';
    }
}

function doLogout() {
    localStorage.removeItem('sfl_authed');
    document.getElementById('admin-app').style.display    = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-pw').value = '';
}

function bootApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display    = 'block';
    initSupabase();
    loadShipments();
    prefillSettingsFields();
}

// ── Supabase ──────────────────────────────────────────────────────
function initSupabase() {
    const url = localStorage.getItem('sfl_supabase_url') || '';
    const key = localStorage.getItem('sfl_service_key')  || '';
    if (url && key) {
        supabase = window.supabase.createClient(url, key);
        setConnStatus(true);
    } else {
        setConnStatus(false);
        toast('No Supabase credentials. Go to Settings to configure.', 'info');
    }
}

function setConnStatus(connected) {
    document.getElementById('conn-dot').classList.toggle('connected', connected);
    document.getElementById('conn-label').textContent = connected ? 'Connected' : 'Not Connected';
}

// ── Settings ──────────────────────────────────────────────────────
function prefillSettingsFields() {
    const url  = localStorage.getItem('sfl_supabase_url') || '';
    const key  = localStorage.getItem('sfl_service_key')  || '';
    const anon = localStorage.getItem('sfl_anon_key')     || '';
    setVal('s-supabase-url', url);
    setVal('s-service-key',  key);
    setVal('s-pub-url',      url);
    setVal('s-anon-key',     anon);
}

function saveSupabaseConfig() {
    const url = document.getElementById('s-supabase-url').value.trim();
    const key = document.getElementById('s-service-key').value.trim();
    if (!url || !key) { toast('Enter both URL and Service Role Key.', 'error'); return; }
    localStorage.setItem('sfl_supabase_url', url);
    localStorage.setItem('sfl_service_key', key);
    setVal('s-pub-url', url);
    supabase = window.supabase.createClient(url, key);
    setConnStatus(true);
    toast('Supabase connected.', 'success');
    loadShipments();
}

function saveAnonKey() {
    const key = document.getElementById('s-anon-key').value.trim();
    if (!key) { toast('Enter the Anon key first.', 'error'); return; }
    localStorage.setItem('sfl_anon_key', key);
    toast('Anon key saved. Paste it into src/script.js at SUPABASE_ANON_KEY.', 'success');
}

async function testConnection() {
    const el = document.getElementById('conn-test-result');
    el.textContent = 'Testing…'; el.style.color = 'var(--muted)';
    if (!supabase) { el.textContent = '✗ Not configured — save credentials first.'; el.style.color = '#f87171'; return; }
    try {
        const { error } = await supabase.from('shipments').select('id').limit(1);
        if (error) throw error;
        el.textContent = '✓ Connection successful! Table "shipments" found.';
        el.style.color = '#4ade80';
        setConnStatus(true);
    } catch (e) {
        el.textContent = `✗ ${e.message}`; el.style.color = '#f87171';
        setConnStatus(false);
    }
}

function changePassword() {
    const np = document.getElementById('s-new-pw').value;
    const cp = document.getElementById('s-confirm-pw').value;
    if (!np || np.length < 4) { toast('Password must be at least 4 characters.', 'error'); return; }
    if (np !== cp) { toast('Passwords do not match.', 'error'); return; }
    localStorage.setItem('sfl_admin_pw', np);
    setVal('s-new-pw', ''); setVal('s-confirm-pw', '');
    toast('Password updated.', 'success');
}

// ── Data ──────────────────────────────────────────────────────────
async function loadShipments() {
    if (!supabase) { renderTable('ship-tbody', [], true, 9); renderTable('dash-tbody', [], true, 7); return; }
    try {
        const { data, error } = await supabase
            .from('shipments').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        allShipments = data || [];
        renderStats(allShipments);
        renderTable('ship-tbody', allShipments, false, 9);
        renderTable('dash-tbody', allShipments.slice(0, 8), false, 7);
        updateSidebarCount(allShipments.length);
        const cl = document.getElementById('ship-count-label');
        if (cl) cl.textContent = `${allShipments.length} shipment${allShipments.length !== 1 ? 's' : ''} total.`;
    } catch (e) {
        toast(`Load failed: ${e.message}`, 'error');
        renderTable('ship-tbody', [], true, 9, e.message);
        renderTable('dash-tbody', [], true, 7, e.message);
    }
}

function renderStats(s) {
    setText('stat-total',     s.length);
    setText('stat-pending',   s.filter(x => x.payment_status?.toLowerCase() !== 'confirmed').length);
    setText('stat-confirmed', s.filter(x => x.payment_status?.toLowerCase() === 'confirmed').length);
    setText('stat-transit',   s.filter(x => !['delivered','completed'].includes(x.status?.toLowerCase())).length);
}

function updateSidebarCount(n) {
    const el = document.getElementById('sidebar-count');
    if (el) el.textContent = n;
}

// ── Table Rendering ───────────────────────────────────────────────
function renderTable(tbodyId, shipments, isError = false, cols = 9, errMsg = '') {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    if (isError) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="${cols}"><i class="fas fa-exclamation-triangle" style="color:var(--amber);margin-right:8px;"></i>${errMsg || 'Could not load data'}</td></tr>`;
        return;
    }
    if (!shipments.length) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="${cols}"><i class="fas fa-inbox" style="color:var(--muted2);font-size:1.4rem;display:block;margin-bottom:6px;"></i>No shipments yet</td></tr>`;
        return;
    }
    const isDash = cols === 7;
    tbody.innerHTML = shipments.map(s => {
        const trackUrl = `${TRACKING_BASE}${encodeURIComponent(s.tracking_id)}`;
        const sBadge   = makeStatusBadge(s.status);
        const pBadge   = makePayBadge(s.payment_status);
        if (isDash) {
            return `<tr>
                <td>${esc(s.tracking_id)}</td>
                <td>${esc(s.name||'—')}</td>
                <td>${esc(s.destination||'—')}</td>
                <td>${sBadge}</td>
                <td>${pBadge}</td>
                <td>${esc(s.eta||'—')}</td>
                <td><button class="tbl-btn tbl-btn-edit" onclick="editShipment('${esc(s.tracking_id)}')"><i class="fas fa-pen"></i> Edit</button></td>
            </tr>`;
        }
        return `<tr>
            <td>${esc(s.tracking_id)}</td>
            <td>${esc(s.name||'—')}</td>
            <td>${esc(s.senders_name||'—')}</td>
            <td>${esc(s.destination||'—')}</td>
            <td>${sBadge}</td>
            <td>${pBadge}</td>
            <td style="font-family:'JetBrains Mono';font-size:.76rem;">${esc(s.amount_due||'—')}</td>
            <td>${esc(s.eta||'—')}</td>
            <td><div class="tbl-actions">
                <button class="tbl-btn tbl-btn-edit" onclick="editShipment('${esc(s.tracking_id)}')"><i class="fas fa-pen"></i></button>
                <a class="tbl-btn tbl-btn-view" href="${trackUrl}" target="_blank"><i class="fas fa-eye"></i></a>
                <button class="tbl-btn tbl-btn-del" onclick="deleteShipmentById('${esc(s.tracking_id)}')"><i class="fas fa-trash"></i></button>
            </div></td>
        </tr>`;
    }).join('');
}

function makeStatusBadge(s) {
    if (!s) return '<span class="badge badge-transit">—</span>';
    const l = s.toLowerCase();
    if (l.includes('deliver'))              return `<span class="badge badge-delivered">${esc(s)}</span>`;
    if (l.includes('held')||l.includes('hold')) return `<span class="badge badge-held">${esc(s)}</span>`;
    return `<span class="badge badge-transit">${esc(s)}</span>`;
}

function makePayBadge(s) {
    return (s||'').toLowerCase() === 'confirmed'
        ? `<span class="badge badge-confirmed">Confirmed</span>`
        : `<span class="badge badge-pending">Pending</span>`;
}

// ── Search / Filter ───────────────────────────────────────────────
function filterTable() {
    const q  = (document.getElementById('search-input')?.value  || '').toLowerCase();
    const sf = (document.getElementById('status-filter')?.value  || '').toLowerCase();
    const pf = (document.getElementById('payment-filter')?.value || '').toLowerCase();
    const filtered = allShipments.filter(s =>
        (!q  || [s.tracking_id, s.name, s.destination, s.senders_name].some(v => (v||'').toLowerCase().includes(q))) &&
        (!sf || (s.status||'').toLowerCase().includes(sf)) &&
        (!pf || (s.payment_status||'').toLowerCase() === pf)
    );
    renderTable('ship-tbody', filtered, false, 9);
    const cl = document.getElementById('ship-count-label');
    if (cl) cl.textContent = `${filtered.length} of ${allShipments.length} shown.`;
}

// ── Form ──────────────────────────────────────────────────────────
function openNewForm() {
    editingId = null;
    resetForm();
    setText('form-title',    'New Shipment');
    setText('form-subtitle', 'Fill in all fields to create a new shipment record.');
    document.getElementById('delete-form-btn').style.display    = 'none';
    document.getElementById('send-email-btn').disabled          = true;
    document.getElementById('tracking-link-display').style.display = 'none';
    switchView('form');
    generateTrackingId();
}

function editShipment(tid) {
    const s = allShipments.find(x => x.tracking_id === tid);
    if (!s) { toast('Shipment not found.', 'error'); return; }
    editingId = tid;
    resetForm();
    populateForm(s);
    setText('form-title',    'Edit Shipment');
    setText('form-subtitle', `Editing: ${tid}`);
    document.getElementById('delete-form-btn').style.display    = 'inline-flex';
    document.getElementById('send-email-btn').disabled          = false;
    const ld  = document.getElementById('tracking-link-display');
    const url = `${TRACKING_BASE}${encodeURIComponent(tid)}`;
    document.getElementById('tracking-link-text').textContent   = url;
    document.getElementById('tracking-link-open').href          = url;
    ld.style.display = 'flex';
    switchView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function populateForm(s) {
    const map = {
        'f-id': s.id, 'f-tracking-id': s.tracking_id, 'f-name': s.name,
        'f-senders-name': s.senders_name, 'f-status': s.status,
        'f-current-location': s.current_location, 'f-origin': s.origin,
        'f-destination': s.destination, 'f-pickup-date': s.pickup_date,
        'f-eta': s.eta, 'f-package-details': s.package_details,
        'f-service-type': s.service_type, 'f-priority': s.priority,
        'f-payment-status': s.payment_status, 'f-amount-due': s.amount_due,
        'f-btc-address': s.btc_address, 'f-usdt-address': s.usdt_address,
        'f-bank-name': s.bank_name, 'f-account-name': s.account_name,
        'f-bank-number': s.bank_number, 'f-step2-name': s.step2_name,
        'f-step2-location': s.step2_location, 'f-step3-name': s.step3_name,
        'f-step3-location': s.step3_location, 'f-step4-name': s.step4_name,
        'f-step4-location': s.step4_location,
    };
    Object.entries(map).forEach(([id, val]) => setVal(id, val));
    setColorDot('f-step1-color', s.step1_color || 'text-blue-500');
    setColorDot('f-step2-color', s.step2_color || 'text-blue-500');
    setColorDot('f-step3-color', s.step3_color || 'text-blue-500');
    setColorDot('f-step4-color', s.step4_color || 'text-green-500');
}

function resetForm() {
    document.getElementById('shipment-form').reset();
    setColorDot('f-step1-color', 'text-blue-500');
    setColorDot('f-step2-color', 'text-blue-500');
    setColorDot('f-step3-color', 'text-blue-500');
    setColorDot('f-step4-color', 'text-green-500');
}

// ── Save ──────────────────────────────────────────────────────────
async function saveShipment(e) {
    e.preventDefault();
    if (!supabase) { toast('Not connected to Supabase. Check Settings.', 'error'); return; }
    const btn = document.getElementById('save-btn');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
    const payload = buildPayload();
    try {
        const { error } = editingId
            ? await supabase.from('shipments').update(payload).eq('tracking_id', editingId)
            : await supabase.from('shipments').insert([payload]);
        if (error) throw error;
        toast(editingId ? 'Shipment updated.' : 'Shipment created.', 'success');
        await loadShipments();
        document.getElementById('send-email-btn').disabled = false;
        const tid = payload.tracking_id;
        const url = `${TRACKING_BASE}${encodeURIComponent(tid)}`;
        document.getElementById('tracking-link-text').textContent = url;
        document.getElementById('tracking-link-open').href        = url;
        document.getElementById('tracking-link-display').style.display = 'flex';
        if (!editingId) editingId = tid;
    } catch (err) {
        toast(`Save failed: ${err.message}`, 'error');
    } finally {
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Save Shipment';
    }
}

function buildPayload() {
    return {
        tracking_id: getVal('f-tracking-id').toUpperCase(),
        name: getVal('f-name'), senders_name: getVal('f-senders-name'),
        status: getVal('f-status'), current_location: getVal('f-current-location'),
        origin: getVal('f-origin'), destination: getVal('f-destination'),
        pickup_date: getVal('f-pickup-date'), eta: getVal('f-eta'),
        package_details: getVal('f-package-details'), service_type: getVal('f-service-type'),
        priority: getVal('f-priority'), payment_status: getVal('f-payment-status'),
        amount_due: getVal('f-amount-due'), btc_address: getVal('f-btc-address'),
        usdt_address: getVal('f-usdt-address'), bank_name: getVal('f-bank-name'),
        account_name: getVal('f-account-name'), bank_number: getVal('f-bank-number'),
        step1_color: getVal('f-step1-color') || 'text-blue-500',
        step2_name: getVal('f-step2-name'), step2_location: getVal('f-step2-location'),
        step2_color: getVal('f-step2-color') || 'text-blue-500',
        step3_name: getVal('f-step3-name'), step3_location: getVal('f-step3-location'),
        step3_color: getVal('f-step3-color') || 'text-blue-500',
        step4_name: getVal('f-step4-name'), step4_location: getVal('f-step4-location'),
        step4_color: getVal('f-step4-color') || 'text-green-500',
    };
}

// ── Delete ────────────────────────────────────────────────────────
function deleteShipmentById(tid) {
    showConfirm('Delete Shipment', `Permanently delete <strong style="color:var(--text)">${tid}</strong>? Cannot be undone.`,
        () => doDelete(tid));
}

function confirmDelete() {
    const tid = editingId || getVal('f-tracking-id');
    if (!tid) return;
    showConfirm('Delete Shipment', `Permanently delete <strong style="color:var(--text)">${tid}</strong>? Cannot be undone.`,
        async () => { await doDelete(tid); switchView('shipments'); });
}

async function doDelete(tid) {
    if (!supabase) { toast('Not connected.', 'error'); return; }
    try {
        const { error } = await supabase.from('shipments').delete().eq('tracking_id', tid);
        if (error) throw error;
        toast(`Deleted ${tid}.`, 'success');
        await loadShipments();
    } catch (e) { toast(`Delete failed: ${e.message}`, 'error'); }
}

// ── Email via Supabase Edge Function ──────────────────────────────
async function sendTrackingEmail() {
    const to          = getVal('f-email');
    const name        = getVal('f-name') || 'Valued Customer';
    const trackingId  = getVal('f-tracking-id') || editingId;

    if (!to)         { toast('Enter a customer email address.', 'error'); return; }
    if (!trackingId) { toast('Save the shipment first.', 'error'); return; }
    if (!supabase)   { toast('Not connected to Supabase.', 'error'); return; }

    const btn = document.getElementById('send-email-btn');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    try {
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: { to, recipientName: name, trackingId }
        });
        if (error) throw error;
        toast(`Email sent to ${to}.`, 'success');
    } catch (e) {
        toast(`Email error: ${e.message}`, 'error');
    } finally {
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Email';
    }
}

// ── View Switching ────────────────────────────────────────────────
function switchView(name) {
    document.querySelectorAll('.view').forEach(v  => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const view = document.getElementById(`view-${name}`);
    const nav  = document.querySelector(`.nav-item[data-view="${name}"]`);
    if (view) view.classList.add('active');
    if (nav)  nav.classList.add('active');
    document.getElementById('main-content').scrollTop = 0;
}

// ── Color Dots ────────────────────────────────────────────────────
function initColorDots() {
    document.querySelectorAll('.color-dots').forEach(group => {
        const tid = group.dataset.target;
        group.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                group.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
                const h = document.getElementById(tid);
                if (h) h.value = dot.dataset.value;
            });
        });
        const h = document.getElementById(tid);
        if (h) {
            const def = group.querySelector(`[data-value="${h.value}"]`);
            if (def) def.classList.add('selected');
        }
    });
}

function setColorDot(id, value) {
    const h = document.getElementById(id);
    if (!h) return;
    h.value = value;
    const group = document.querySelector(`.color-dots[data-target="${id}"]`);
    if (group) group.querySelectorAll('.color-dot').forEach(d =>
        d.classList.toggle('selected', d.dataset.value === value));
}

// ── Confirm Modal ─────────────────────────────────────────────────
function showConfirm(title, msg, onOk) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').innerHTML     = msg;
    confirmCallback = onOk;
    document.getElementById('confirm-modal').classList.add('open');
}
function closeConfirm()  { confirmCallback = null; document.getElementById('confirm-modal').classList.remove('open'); }
function confirmOk()     { if (confirmCallback) confirmCallback(); closeConfirm(); }

// ── Toast ─────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
    const c    = document.getElementById('toast');
    const item = document.createElement('div');
    item.className = `toast-item ${type}`;
    const icons  = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    const colors = { success: '#4ade80', error: '#f87171', info: '#60a5fa' };
    item.innerHTML = `<i class="fas ${icons[type]||icons.info}" style="color:${colors[type]};font-size:.95rem;"></i><span class="toast-msg">${msg}</span>`;
    c.appendChild(item);
    setTimeout(() => item.remove(), 4200);
}

// ── Utilities ─────────────────────────────────────────────────────
function generateTrackingId() {
    setVal('f-tracking-id', 'SFL-' + Math.floor(100000000 + Math.random() * 900000000));
}

function copyTrackingLink() {
    const tid = getVal('f-tracking-id') || editingId;
    if (!tid) return;
    navigator.clipboard.writeText(`${TRACKING_BASE}${encodeURIComponent(tid)}`)
        .then(() => toast('Link copied.', 'success'));
}

function copySql() {
    const block = document.getElementById('setup-sql');
    const btn   = block?.querySelector('.sql-copy-btn');
    const text  = (block?.textContent || '').replace(btn?.textContent || '', '').trim();
    navigator.clipboard.writeText(text).then(() => toast('SQL copied.', 'success'));
}

function getVal(id)      { const e = document.getElementById(id); return e ? e.value.trim() : ''; }
function setVal(id, val) { const e = document.getElementById(id); if (e) e.value = val ?? ''; }
function setText(id, v)  { const e = document.getElementById(id); if (e) e.textContent = v; }
function esc(s)          {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
