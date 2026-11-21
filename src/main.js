import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Camera, MediaTypeSelection } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { FileOpener } from '@capacitor-community/file-opener';

const NATIVE = Capacitor.isNativePlatform();
const VERSION = '1.2.0';
const PRIVACY_URL = 'https://hwanggoo.github.io/gisa-note/privacy.html';

/* ============ small helpers ============ */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const p2 = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
const parseYmd = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const todayStr = () => ymd(new Date());
const won = n => (Math.round(Number(n) || 0)).toLocaleString('ko-KR');
const man = n => { const v = (Number(n) || 0) / 10000; const r = Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10; return r.toLocaleString('ko-KR'); };
const digits = s => Number(String(s || '').replace(/[^\d]/g, '')) || 0;
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const dayLabel = s => { const d = parseYmd(s); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + WD[d.getDay()] + '요일'; };
const shortDay = s => { const d = parseYmd(s); return (d.getMonth() + 1) + '/' + d.getDate() + ' (' + WD[d.getDay()] + ')'; };
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const app = $('#app');

const I = {
  gear: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  pen: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  plus: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  back: '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2L2 10l8 8"/></svg>',
  next: '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2l8 8-8 8"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 8 14" fill="none" stroke="#C7C7CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>',
  down: '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 4l4 4 4-4"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  wrench: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg>',
  check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cam: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  up: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  dn: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  people: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.2c2.8.2 5 2.6 5 5.8"/></svg>',
  pdf: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6M9 14l3-3 3 3"/></svg>',
  send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
};
const TABI = {
  home: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8.5 3v4M15.5 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/>',
  rec: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8.5 3v4M15.5 3v4"/>',
  man: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 12h5"/>',
  led: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  talk: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/>',
};

/* ============ toast / dialogs ============ */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }
let closeTop = null;
function modal(html, bind) {
  return new Promise(res => {
    const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = '<div class="box">' + html + '</div>';
    const done = v => { m.remove(); closeTop = null; res(v); };
    closeTop = () => done(null);
    bind(m, done);
    document.body.appendChild(m);
    const inp = m.querySelector('input'); if (inp) setTimeout(() => inp.focus(), 50);
  });
}
function ask(msg, ok, danger) {
  return modal('<p>' + esc(msg) + '</p><div class="acts"><button data-a="0">취소</button><button data-a="1" class="' + (danger ? 'danger' : '') + '">' + esc(ok) + '</button></div>',
    (m, done) => m.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) done(b.dataset.a === '1'); }));
}
function promptText(msg, value, opts = {}) {
  return modal('<p>' + esc(msg) + '</p><input ' + (opts.numeric ? 'inputmode="numeric"' : '') + ' value="' + esc(value || '') + '" placeholder="' + esc(opts.ph || '') + '"><div class="acts"><button data-a="0">취소</button><button data-a="1">확인</button></div>',
    (m, done) => {
      const get = () => m.querySelector('input').value.trim();
      m.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) done(b.dataset.a === '1' ? get() : null); });
      m.querySelector('input').addEventListener('keydown', e => { if (e.key === 'Enter') done(get()); });
    });
}
function sheet(options, header) {
  return new Promise(res => {
    const m = document.createElement('div'); m.className = 'sheet';
    m.innerHTML = '<div class="in"><div class="grp">' + (header ? '<div class="hd">' + esc(header) + '</div>' : '') + options.map((o, i) => '<button data-i="' + i + '">' + esc(o) + '</button>').join('') + '</div><div class="grp c"><button data-i="-1">취소</button></div></div>';
    const done = v => { m.remove(); closeTop = null; res(v); };
    m.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) done(+b.dataset.i); else if (e.target === m) done(-1); });
    closeTop = () => done(-1);
    document.body.appendChild(m);
  });
}

/* ============ storage (IndexedDB, this phone only) ============ */
const STORES = ['notes', 'photos', 'schedules', 'txs', 'manuals', 'files', 'kv'];
let dbp = null;
function idb() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open('gisa-note', 2);
    r.onupgradeneeded = () => { const d = r.result; STORES.forEach(s => { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: s === 'kv' ? 'k' : 'id' }); }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const d = await idb();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode); const s = t.objectStore(store);
    let out; const r = fn(s); if (r) r.onsuccess = () => { out = r.result; };
    t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  });
}
const db = {
  all: s => tx(s, 'readonly', st => st.getAll()),
  get: (s, id) => tx(s, 'readonly', st => st.get(id)),
  put: (s, o) => tx(s, 'readwrite', st => st.put(o)),
  del: (s, id) => tx(s, 'readwrite', st => st.delete(id)),
};
const D = { notes: [], schedules: [], txs: [], manuals: [], settings: { taxType: 'general', rate: 0.3, mode: 'personal', perms: { share: true, manual: true, techLedger: false } }, team: null, messages: [], requests: [], pin: '' };
async function load() {
  for (const s of ['notes', 'schedules', 'txs', 'manuals']) { try { D[s] = (await db.all(s)) || []; } catch (e) { D[s] = []; } }
  try { for (const r of (await db.all('kv')) || []) D[r.k] = r.v; } catch (e) { }
  D.settings = Object.assign({ taxType: 'general', rate: 0.3, mode: 'personal', perms: { share: true, manual: true, techLedger: false } }, D.settings || {});
  if (!D.team) D.settings.mode = 'personal';
  D.messages = D.messages || []; D.requests = D.requests || [];
}
const saveKV = k => db.put('kv', { k, v: D[k] }).catch(() => toast('저장하지 못했어요'));
async function putItem(store, o) { await db.put(store, o); const a = D[store]; const i = a.findIndex(x => x.id === o.id); if (i >= 0) a[i] = o; else a.push(o); }
async function delItem(store, id) { await db.del(store, id); D[store] = D[store].filter(x => x.id !== id); }

/* photos */
const urlCache = new Map();
async function photoURL(pid) {
  if (!pid) return ''; if (urlCache.has(pid)) return urlCache.get(pid);
  const rec = await db.get('photos', pid).catch(() => null); if (!rec || !rec.blob) return '';
  const u = URL.createObjectURL(rec.blob); urlCache.set(pid, u); return u;
}
function hydrate() { app.querySelectorAll('img[data-pid]').forEach(async img => { const u = await photoURL(img.dataset.pid); if (u) img.src = u; }); }
async function delPhotos(pids) { for (const p of pids || []) { if (!p) continue; try { await db.del('photos', p); } catch (e) { } const u = urlCache.get(p); if (u) { URL.revokeObjectURL(u); urlCache.delete(p); } } }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function shrink(blob, max = 1600, q = 0.8) {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImg(url); const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return (await new Promise(r => c.toBlob(r, 'image/jpeg', q))) || blob;
  } finally { URL.revokeObjectURL(url); }
}
async function storePhoto(blob) { const pid = 'p' + newId(); await db.put('photos', { id: pid, blob: await shrink(blob) }); return pid; }
let fileInputCb = null;
function pickFiles(accept, multiple, cb) {
  let inp = $('#filepick');
  if (!inp) { inp = document.createElement('input'); inp.type = 'file'; inp.id = 'filepick'; inp.style.display = 'none'; document.body.appendChild(inp); inp.addEventListener('change', () => { const f = Array.from(inp.files || []); inp.value = ''; if (fileInputCb) fileInputCb(f); }); }
  inp.accept = accept; inp.multiple = !!multiple; fileInputCb = cb; inp.click();
}
async function getPhotoBlobs(multi) {
  if (!NATIVE) return new Promise(res => pickFiles('image/*', multi, files => res(files)));
  const i = await sheet(['사진 찍기', '앨범에서 고르기']);
  try {
    if (i === 0) { const r = await Camera.takePhoto({ quality: 85 }); return r && r.webPath ? [await (await fetch(r.webPath)).blob()] : []; }
    if (i === 1) { const { results } = await Camera.chooseFromGallery({ mediaType: MediaTypeSelection.Photo, allowMultipleSelection: !!multi, limit: multi ? 8 : 1 }); const out = []; for (const r of results || []) if (r.webPath) out.push(await (await fetch(r.webPath)).blob()); return out; }
  } catch (e) { if (!/cancel|취소/i.test(String(e && e.message))) toast('사진을 가져오지 못했어요. 카메라 권한을 확인해 주세요'); }
  return [];
}
function showPhoto(pid) {
  photoURL(pid).then(u => {
    if (!u) return; const o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = '<img alt="사진">'; o.querySelector('img').src = u;
    const close = () => { o.remove(); closeTop = null; }; o.onclick = close; closeTop = close; document.body.appendChild(o);
  });
}

/* ============ team helpers ============ */
const COLORS = ['#C2410C', '#2563EB', '#7C3AED', '#0F766E', '#BE185D', '#4D7C0F', '#A16207'];
const teamOn = () => D.settings.mode === 'team' && !!D.team;
function members() { return D.team ? D.team.members : [{ id: 'me', name: '나', role: 'owner', color: COLORS[0] }]; }
function mem(id) { return members().find(m => m.id === id) || { id, name: id === 'me' ? '나' : '알 수 없음', color: '#8E8E93', role: 'tech' }; }
const av = (id, size) => { const m = mem(id); return '<span class="av" style="background:' + m.color + (size ? ';width:' + size + 'px;height:' + size + 'px;border-radius:' + size / 2 + 'px;font-size:' + Math.round(size * 0.42) + 'px' : '') + '">' + esc((m.name || '?').slice(0, 1)) + '</span>'; };
const newReqCount = () => D.requests.filter(r => r.status === 'new').length;

/* ============ tax ============ */
const PROOFS = ['세금계산서', '카드', '현금영수증', '없음'];
const hasProof = t => t.proof && t.proof !== '없음';
function vatPeriod(refDate) {
  const d = parseYmd(refDate || todayStr()); const y = d.getFullYear();
  if (D.settings.taxType === 'simple') return { name: y + '년 (1~12월)', start: y + '-01-01', end: y + '-12-31', due: (y + 1) + '-01-25' };
  return d.getMonth() < 6 ? { name: y + '년 1기 (1~6월)', start: y + '-01-01', end: y + '-06-30', due: y + '-07-25' } : { name: y + '년 2기 (7~12월)', start: y + '-07-01', end: y + '-12-31', due: (y + 1) + '-01-25' };
}
function calcVat(p) {
  const inP = D.txs.filter(t => t.date >= p.start && t.date <= p.end);
  const sales = inP.filter(t => t.type === 'sale'), buys = inP.filter(t => t.type === 'buy' && hasProof(t));
  const saleTotal = sales.reduce((a, t) => a + t.total, 0), buyTotal = buys.reduce((a, t) => a + t.total, 0);
  if (D.settings.taxType === 'simple') {
    const out = Math.round(saleTotal * D.settings.rate * 0.1), ded = Math.round(buyTotal * 0.005);
    return { simple: true, saleTotal, buyTotal, out, ded, pay: Math.max(0, out - ded), exempt: saleTotal < 48000000 };
  }
  const out = sales.reduce((a, t) => a + t.vat, 0), ded = buys.reduce((a, t) => a + t.vat, 0);
  return { simple: false, saleTotal, buyTotal, out, ded, pay: out - ded };
}
function dday(due) { const n = Math.round((parseYmd(due) - parseYmd(todayStr())) / 86400000); return n > 0 ? 'D-' + n : n === 0 ? 'D-DAY' : '기한 지남'; }
function splitAmt(amount, incl) { amount = Math.round(amount || 0); if (incl) { const supply = Math.round(amount / 1.1); return { total: amount, supply, vat: amount - supply }; } const vat = Math.round(amount * 0.1); return { total: amount + vat, supply: amount, vat }; }
const RATES = [['그 밖의 서비스업 (수리 등)', 0.3], ['건설업', 0.3], ['제조업', 0.2], ['소매업', 0.15]];

/* ============ similar records ============ */
const STOP = new Set(['그리고', '그래서', '그냥', '있음', '없음', '했음', '안됨', '됐음', '해서', '했고', '있고', '없고', '현장', '고객', '장비']);
function toks(s) { return (s || '').toLowerCase().replace(/[^\p{L}\p{N}\s\-]/gu, ' ').split(/\s+/).map(w => w.length > 2 ? w.replace(/(에서|으로|에게|까지|부터|하고|이랑|은|는|이|가|을|를|에|로|도|만|과|와|의)$/, '') : w).filter(w => w.length >= 2 && !STOP.has(w)); }
function overlap(a, b) { const B = new Set(b); let n = 0; new Set(a).forEach(w => { if (B.has(w)) n++; }); return n; }
function similar(note) {
  const e = toks(note.equip), s = toks(note.symptom), o = toks([note.cause, note.action, note.memo].join(' ')); const models = e.filter(w => /\d/.test(w));
  return D.notes.filter(n => n.id !== note.id).map(n => {
    const ne = toks(n.equip), ns = toks(n.symptom), no = toks([n.cause, n.action, n.memo].join(' '));
    let sc = overlap(e, ne) * 3 + overlap(s, ns) * 3 + overlap(s, no) + overlap(o, ns) + Math.min(overlap(o, no), 4) * 0.5;
    if (models.length && models.some(m => ne.includes(m))) sc += 4; return { n, sc };
  }).filter(x => x.sc >= 3).sort((a, b) => b.sc - a.sc).slice(0, 3).map(x => x.n);
}

/* ============ router ============ */
const ROOTS = { home: 'home', records: 'rec', man: 'man', ledger: 'led', tledger: 'led', talk: 'talk' };
let V = { name: 'home', p: {}, stack: [] };
let dirty = false;
function go(name, p = {}, opts = {}) {
  if (opts.root) V.stack = []; else if (!opts.replace) V.stack.push({ name: V.name, p: V.p });
  V.name = name; V.p = p; dirty = false; window.scrollTo(0, 0); render();
}
async function back() {
  if (dirty && !(await ask('저장하지 않고 나갈까요?', '나가기', true))) return;
  dirty = false;
  if (V.p && V.p.d && V.p.d._new && V.p.d._new.length) { delPhotos(V.p.d._new); V.p.d._new = []; }
  if (V.stack.length) { const s = V.stack.pop(); V.name = s.name; V.p = s.p; render(); }
  else go('home', {}, { root: true });
}
function render() {
  const fn = VIEWS[V.name] || VIEWS.home;
  app.innerHTML = fn(V.p);
  hydrate();
  renderTabbar();
  const after = AFTER[V.name]; if (after) after(V.p);
}
function ctaFor() {
  switch (V.name) {
    case 'home': { const sel = V.p.sel || todayStr(); return [(sel === todayStr() ? '오늘' : shortDay(sel)) + ' 일정·기록·거래 추가', 'addOnDay']; }
    case 'records': return ['새 고장 기록', 'newNote'];
    case 'man': return ['매뉴얼 올리기', 'addManual'];
    case 'ledger': case 'tledger': return ['거래 추가', 'newTx'];
    case 'talk': return V.p.tab === 'req' ? ['구매 요청', 'newReq'] : null;
  }
  return null;
}
function renderTabbar() {
  const bar = $('#tabbar'); const cur = ROOTS[V.name];
  const cta = ctaFor(); let c = $('#cta');
  if (!c) { c = document.createElement('button'); c.id = 'cta'; c.className = 'cta'; document.body.appendChild(c); }
  if (cta && cur) { c.style.display = 'flex'; c.dataset.act = cta[1]; c.dataset.v = cta[2] || ''; c.innerHTML = I.plus + '<span>' + esc(cta[0]) + '</span>'; } else c.style.display = 'none';
  if (!cur) { bar.style.display = 'none'; document.body.style.paddingBottom = '40px'; return; }
  bar.style.display = 'grid'; document.body.style.paddingBottom = (V.name === 'talk' && V.p.tab !== 'req') ? '150px' : '170px';
  const tabs = teamOn() ? [['home', '홈', 'home'], ['records', '기록', 'rec'], ['man', '매뉴얼', 'man'], ['tledger', '장부', 'led'], ['talk', '소통', 'talk']] : [['home', '홈', 'home'], ['records', '기록', 'rec'], ['man', '매뉴얼', 'man'], ['ledger', '장부', 'led']];
  bar.style.gridTemplateColumns = 'repeat(' + tabs.length + ',minmax(0,1fr))';
  bar.innerHTML = tabs.map(([v, l, ic]) => '<button data-act="tab" data-v="' + v + '" class="' + (ic === cur ? 'on' : '') + '"' + (ic === cur ? ' aria-current="page"' : '') + ' style="position:relative"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (ic === cur ? 2.1 : 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TABI[ic] + '</svg>' + (v === 'talk' && newReqCount() ? '<b class="bd">' + newReqCount() + '</b>' : '') + '<span>' + l + '</span></button>').join('');
}

/* ============ shared view pieces ============ */
const navBack = (label, right) => '<div class="nav"><div class="l"><button class="navbtn" data-act="back">' + I.back + '<span>' + esc(label || '뒤로') + '</span></button></div><div class="r">' + (right || '') + '</div></div>';
const sheetNav = (title, saveLabel, saveAct) => '<div class="sheetnav"><button class="navbtn" data-act="back">취소</button><span class="navtitle">' + esc(title) + '</span><button class="navbtn b" data-act="' + saveAct + '">' + esc(saveLabel) + '</button></div>';
const sec = (t, cls) => '<p class="sec' + (cls ? ' ' + cls : '') + '">' + t + '</p>';
const foot = t => '<p class="foot">' + t + '</p>';
const spaceChip = () => '<button class="space" data-act="space"><i>' + esc((D.team && D.team.name || '팀').slice(0, 1)) + '</i>' + esc(D.team ? D.team.name : '') + ' ' + I.down + '</button>';
const sw = (on, act, label) => '<button class="sw' + (on ? ' on' : '') + '" data-act="' + act + '" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + esc(label) + '"></button>';
function seg(opts, cur, act, cols) { return '<div class="seg" style="grid-template-columns:repeat(' + (cols || opts.length) + ',minmax(0,1fr))">' + opts.map(([v, l, cls]) => '<button data-act="' + act + '" data-v="' + v + '" class="' + (v === cur ? 'on ' + (cls || '') : '') + '">' + l + '</button>').join('') + '</div>'; }
function noteRow(n, withAv) {
  const st = n.resolved ? 'done' : 'open';
  return '<button class="row" data-act="openNote" data-id="' + esc(n.id) + '">' + (withAv ? av(n.who || 'me') : '<span class="sq ' + st + '">' + (n.resolved ? I.check : I.wrench) + '</span>') +
    '<span class="main"><span class="t">' + esc(n.equip || '장비 미입력') + '</span><span class="s">' + (withAv ? esc(mem(n.who || 'me').name) + ' · ' : '') + esc(n.symptom || n.memo || '') + (n.action ? ' → ' + esc(n.action) : '') + '</span></span>' +
    '<span class="side"><span>' + esc(relTime(n.createdAt)) + '</span><span class="badge ' + st + '">' + (n.resolved ? '해결' : '미해결') + '</span></span>' + I.chev + '</button>';
}
function relTime(ts) {
  if (!ts) return ''; const d = new Date(ts), now = new Date(); const hm = p2(d.getHours()) + ':' + p2(d.getMinutes());
  if (d.toDateString() === now.toDateString()) return hm;
  const y = new Date(now); y.setDate(now.getDate() - 1); if (d.toDateString() === y.toDateString()) return '어제';
  if ((now - d) < 6 * 86400000) return WD[d.getDay()] + '요일';
  return (d.getMonth() + 1) + '/' + d.getDate();
}
function groupByDate(list) {
  const now = new Date(); const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const g = { '오늘': [], '어제': [], '이번 주': [], '이번 달': [], '이전': [] };
  list.forEach(n => { const t = n.createdAt || 0; if (t >= t0) g['오늘'].push(n); else if (t >= t0 - 86400000) g['어제'].push(n); else if (t >= t0 - 6 * 86400000) g['이번 주'].push(n); else if (new Date(t).getMonth() === now.getMonth() && new Date(t).getFullYear() === now.getFullYear()) g['이번 달'].push(n); else g['이전'].push(n); });
  return g;
}
const monthKey = s => s.slice(0, 7);
function monthStats(ym, who) {
  const list = D.txs.filter(t => monthKey(t.date) === ym && (!who || (t.who || 'me') === who));
  const sale = list.filter(t => t.type === 'sale').reduce((a, t) => a + t.total, 0), buy = list.filter(t => t.type === 'buy').reduce((a, t) => a + t.total, 0);
  return { sale, buy, net: sale - buy, list };
}
const stColor = s => s === '완료' ? 'var(--green-dot)' : s === '자재 대기' ? '#B45309' : 'var(--orange)';
const stClass = s => s === '완료' ? 'done' : s === '자재 대기' ? 'wait' : 'open';
function schedRow(s, showWho) {
  return '<button class="row" data-act="openSched" data-id="' + esc(s.id) + '"><span class="time"><b>' + esc(s.start || '--:--') + '</b><span>' + esc(durText(s)) + '</span></span><span class="sbar" style="background:' + stColor(s.status) + '"></span>' +
    '<span class="main"><span class="t">' + esc(s.title || '제목 없음') + '</span><span class="s">' + (showWho && s.who ? esc(mem(s.who).name) + ' · ' : '') + esc(s.client || '') + (s.amount ? ' · ' + won(s.amount) + '원' : '') + '</span></span><span class="badge ' + stClass(s.status) + '">' + esc(s.status) + '</span></button>';
}
function durText(s) { if (!s.start || !s.end) return ''; const [a, b] = s.start.split(':').map(Number), [c, d] = s.end.split(':').map(Number); const m = (c * 60 + d) - (a * 60 + b); if (m <= 0) return ''; return (m >= 60 ? Math.floor(m / 60) + '시간 ' : '') + (m % 60 ? (m % 60) + '분' : '').trim(); }

/* ============ VIEWS ============ */
const VIEWS = {}, AFTER = {};

/* --- 기록 목록 --- */
VIEWS.records = p => {
  let list = D.notes.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const q = (p.q || '').trim().toLowerCase();
  if (p.onlyOpen) list = list.filter(n => !n.resolved);
  if (q) { const qt = q.split(/\s+/); list = list.filter(n => { const h = [n.equip, n.symptom, n.cause, n.action, n.site, n.memo].join(' ').toLowerCase(); return qt.every(t => h.includes(t)); }); }
  const open = D.notes.filter(n => !n.resolved).length;
  return topBar() +
    '<div class="title"><h1>고장 기록</h1><p class="sub">전체 ' + D.notes.length + '건 · 미해결 ' + open + '건</p></div>' +
    '<div class="search"><label>' + I.search + '<span class="sr">기록 검색</span><input id="q" type="search" placeholder="장비, 모델명, 증상 검색" value="' + esc(p.q || '') + '" autocomplete="off"></label></div>' +
    '<div class="chips" style="margin-top:10px"><button class="chip' + (!p.onlyOpen ? ' on' : '') + '" data-act="recFilter" data-v="0">전체</button><button class="chip' + (p.onlyOpen ? ' on' : '') + '" data-act="recFilter" data-v="1">미해결만</button></div>' +
    '<div id="list">' + homeList(list, q, teamOn()) + '</div>';
};
function tile(act, color, icon, num, label) {
  return '<button class="tile" data-act="' + act + '"><span class="top"><span class="ic" style="background:' + color + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icon + '</svg></span><span class="num">' + num + '</span></span><span class="lb">' + label + '</span></button>';
}
function homeList(list, q, withAv) {
  if (!D.notes.length) return '<div class="empty"><h2>첫 기록을 남겨보세요</h2>아래 주황색 버튼을 눌러<br>장비, 증상, 원인, 조치를 적으면<br>다음에 같은 고장을 바로 찾을 수 있어요.</div>';
  if (!list.length) return '<div class="empty">' + (q ? '"' + esc(q) + '"에 맞는 기록이 없어요' : '해당하는 기록이 없어요') + '</div>';
  if (q) return sec(list.length + '건 찾음') + '<div class="group">' + list.map(n => noteRow(n, withAv)).join('') + '</div>';
  const g = groupByDate(list);
  return Object.entries(g).filter(([, a]) => a.length).map(([k, a]) => sec(k) + '<div class="group">' + a.map(n => noteRow(n, withAv)).join('') + '</div>').join('');
}
AFTER.records = p => {
  const q = $('#q'); if (!q) return;
  q.addEventListener('input', () => { V.p.q = q.value; const n = D.notes.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).filter(x => !V.p.onlyOpen || !x.resolved); const qq = q.value.trim().toLowerCase(); const list = qq ? n.filter(x => { const h = [x.equip, x.symptom, x.cause, x.action, x.site, x.memo].join(' ').toLowerCase(); return qq.split(/\s+/).every(t => h.includes(t)); }) : n; $('#list').innerHTML = homeList(list, qq, teamOn()); });
};
const topBar = () => teamOn() ? '<div class="chipbar">' + spaceChip() + '<button class="navbtn" data-act="go" data-v="settings" aria-label="설정">' + I.gear + '</button></div>' : '<div class="nav"><div class="l"></div><div class="r"><button class="navbtn" data-act="go" data-v="settings" aria-label="설정">' + I.gear + '</button></div></div>';

/* --- 기록 상세 --- */
VIEWS.note = p => {
  const n = D.notes.find(x => x.id === p.id); if (!n) return '<div class="empty">기록이 없어요</div>';
  const kv = (k, v) => '<div class="kv"><p class="k">' + k + '</p><p class="v' + (v ? '' : ' none') + '">' + (v ? esc(v) : '없음') + '</p></div>';
  const sims = similar(n);
  return navBack('목록', '<button class="navbtn" data-act="editNote" data-id="' + esc(n.id) + '">편집</button>') +
    '<div class="title"><h1 style="font-size:27px">' + esc(n.equip || '장비 미입력') + '</h1><p class="sub">' + esc(new Date(n.createdAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })) + (n.site ? ' · ' + esc(n.site) : '') + (teamOn() ? ' · ' + esc(mem(n.who || 'me').name) : '') + '</p></div>' +
    '<div style="margin-top:14px">' + seg([['0', '<span class="dot" style="background:var(--orange)"></span>미해결', 'o'], ['1', '해결', 'g']], n.resolved ? '1' : '0', 'noteStatus') + '</div>' +
    '<div class="group mt">' + kv('증상', n.symptom) + kv('원인', n.cause) + kv('조치', n.action) + '</div>' +
    (n.photos && n.photos.length ? sec('사진 ' + n.photos.length) + '<div class="phrow">' + n.photos.map(pid => '<button class="ph" data-act="viewPhoto" data-id="' + esc(pid) + '"><img alt="현장 사진" data-pid="' + esc(pid) + '"></button>').join('') + '</div>' : '') +
    sec('비슷한 고장') + '<div class="group">' + (sims.length ? sims.map(s => '<button class="row" data-act="openNote" data-id="' + esc(s.id) + '"><span class="main"><span class="t">' + esc(s.equip || '장비 미입력') + ' · ' + esc(new Date(s.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })) + '</span><span class="s">' + esc(s.symptom || '') + (s.action ? ' → ' + esc(s.action) : '') + '</span></span>' + I.chev + '</button>').join('') : '<div class="row"><span class="s" style="color:var(--muted);font-size:14px">아직 비슷한 기록이 없어요. 기록이 쌓이면 여기에 나와요.</span></div>') + '</div>' +
    (n.memo ? sec('메모') + '<div class="group"><div class="kv"><p class="v">' + esc(n.memo) + '</p></div></div>' : '') +
    '<div class="group" style="margin-top:22px"><button class="btn red" data-act="delNote" data-id="' + esc(n.id) + '">기록 삭제</button></div>';
};

/* --- 기록 편집 --- */
VIEWS.noteEdit = p => {
  const d = p.d;
  const fr = (k, l, ph) => '<label class="frow"><span class="k">' + l + '</span><input data-in="' + k + '" value="' + esc(d[k]) + '" placeholder="' + esc(ph) + '" autocomplete="off"></label>';
  const ta = (k, l, ph) => '<label class="frow top"><span class="k">' + l + '</span><textarea data-in="' + k + '" rows="2" placeholder="' + esc(ph) + '">' + esc(d[k]) + '</textarea></label>';
  return sheetNav(d.id ? '기록 편집' : '새 기록', '저장', 'saveNote') +
    '<div class="group mt">' + fr('equip', '장비', '예) 시스템 에어컨 실외기') + fr('site', '현장', '건물, 층, 고객 이름') + '</div>' +
    sec('고장 내용') + '<div class="group">' + ta('symptom', '증상', '어떤 문제가 있었나요?') + ta('cause', '원인', '원인이 뭐였나요?') + ta('action', '조치', '어떻게 해결했나요?') + '</div>' +
    sec('상태') + seg([['0', '<span class="dot" style="background:var(--orange)"></span>미해결', 'o'], ['1', '해결', 'g']], d.resolved ? '1' : '0', 'draftResolved') +
    (teamOn() ? sec('작성자') + '<div class="group"><button class="row" data-act="pickWho"><span class="main"><span class="t">' + esc(mem(d.who || 'me').name) + '</span></span><span class="val">바꾸기</span>' + I.chev + '</button></div>' : '') +
    sec('사진') + '<div class="photos" id="photos">' + photosHtml(d.photos) + '</div>' +
    '<div class="group" style="margin-top:22px">' + ta('memo', '메모', '그 밖에 남길 내용 (선택)') + '</div>' +
    foot('말로 입력하려면 키보드의 마이크 버튼을 누르세요.');
};
function photosHtml(list) { return (list || []).map((pid, i) => '<div class="ph"><img alt="사진" data-pid="' + esc(pid) + '"><button class="x" data-act="rmPhoto" data-i="' + i + '" aria-label="사진 빼기">×</button></div>').join('') + '<button class="addph" data-act="addPhoto">' + I.cam + '사진 추가</button>'; }

/* --- 홈: 한눈에 + 달력 --- */
VIEWS.home = p => {
  const sel = p.sel || todayStr(); const ym = p.ym || sel.slice(0, 7);
  const [Y, M] = ym.split('-').map(Number); const first = new Date(Y, M - 1, 1); const days = new Date(Y, M, 0).getDate();
  let cells = ''; for (let i = 0; i < first.getDay(); i++) cells += '<span></span>';
  for (let d = 1; d <= days; d++) {
    const ds = Y + '-' + p2(M) + '-' + p2(d); const list = D.schedules.filter(s => s.date === ds);
    const cls = ['d', (first.getDay() + d - 1) % 7 === 0 ? 'sun' : '', ds === todayStr() ? 'today' : '', ds === sel ? 'sel' : ''].join(' ');
    const other = D.notes.some(n => n.createdAt && ymd(new Date(n.createdAt)) === ds) || D.txs.some(t => t.date === ds);
    cells += '<button class="' + cls + '" data-act="selDay" data-v="' + ds + '" aria-label="' + M + '월 ' + d + '일' + (list.length ? ', 일정 ' + list.length + '개' : '') + '"><span class="n">' + d + '</span><span class="dots">' + list.slice(0, 3).map(s => '<i style="background:' + stColor(s.status) + '"></i>').join('') + (other ? '<i style="background:#8E8E93"></i>' : '') + '</span></button>';
  }
  const list = D.schedules.filter(s => s.date === sel).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
  const ms = monthStats(todayStr().slice(0, 7));
  return topBar() +
    '<div class="title"><h1>' + (teamOn() ? esc(D.team.name) : '기사의 노트') + '</h1><p class="sub">' + dayLabel(todayStr()) + (teamOn() ? ' · 팀원 ' + D.team.members.length + '명' : '') + '</p></div>' +
    '<div class="tiles">' +
    tile('selDay" data-v="' + todayStr(), '#2563EB', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', D.schedules.filter(s => s.date === todayStr()).length, teamOn() ? '오늘 출동' : '오늘 일정') +
    tile('openOnly', '#EA580C', '<path d="M12 7v6M12 17h.01"/>', D.notes.filter(n => !n.resolved).length, '미해결') +
    tile('tab" data-v="' + (teamOn() ? 'tledger' : 'ledger'), '#15803D', '<path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.6 0-4.3 1.3-4.3 3.2 0 4.6 9 2.6 9 7.1 0 2-1.9 3.4-4.7 3.4-2.2 0-4-.9-4.9-2.3"/>', man(ms.sale) + '<small>만</small>', (new Date().getMonth() + 1) + '월 매출') +
    '</div>' +
    '<div class="titlerow" style="margin-top:18px"><b style="font-size:22px;letter-spacing:-.3px">' + Y + '년 ' + M + '월</b><span style="display:flex"><button class="navbtn" data-act="calMove" data-v="-1" aria-label="이전 달">' + I.back + '</button><button class="navbtn" data-act="calMove" data-v="1" aria-label="다음 달">' + I.next + '</button></span></div>' +
    '<div class="cal" style="margin-top:4px"><div class="wk">' + WD.map(w => '<span>' + w + '</span>').join('') + '</div><div class="grid">' + cells + '</div></div>' +
    '<div class="legend"><span><span class="dot" style="background:var(--orange)"></span>예정·진행</span><span><span class="dot" style="background:#B45309"></span>자재 대기</span><span><span class="dot" style="background:var(--green-dot)"></span>완료</span><span><span class="dot" style="background:#8E8E93"></span>기록·거래</span></div>' +
    '<div id="day">' + dayBlock(sel, list, teamOn()) + '</div>';
};
function teamDay(day) {
  const un = day.filter(s => !s.who);
  return un.map(s => '<div class="reqcard" style="background:var(--tint-bg);display:flex;align-items:center;gap:12px;margin-top:10px"><button class="main" data-act="openSched" data-id="' + esc(s.id) + '" style="flex:1;text-align:left;display:flex;flex-direction:column;gap:2px"><span style="font-size:13px;font-weight:700;color:var(--tint-dark)">배정 안 됨 · ' + esc(s.start || '') + '</span><span style="font-size:15px;font-weight:600">' + esc(s.title) + (s.client ? ' · ' + esc(s.client) : '') + '</span></button><button class="chip on" data-act="assign" data-id="' + esc(s.id) + '">기사 배정</button></div>').join('') +
    members().map(m => { const l = day.filter(s => s.who === m.id); return '<div style="display:flex;align-items:center;gap:8px;margin:16px 0 6px;padding:0 28px">' + av(m.id, 24) + '<b style="font-size:14px">' + esc(m.name) + (m.role === 'owner' ? ' (사장)' : '') + '</b><span style="font-size:13px;color:var(--muted)">' + l.length + '건</span></div><div class="group">' + (l.length ? l.map(s => schedRow(s, false)).join('') : '<div class="row"><span class="s" style="color:var(--muted);font-size:14px">일정 없음</span></div>') + '</div>'; }).join('');
}
function dayBlock(sel, scheds, showWho) {
  const notes = D.notes.filter(n => n.createdAt && ymd(new Date(n.createdAt)) === sel).sort((a, b) => b.createdAt - a.createdAt);
  const txs = D.txs.filter(t => t.date === sel).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const sale = txs.filter(t => t.type === 'sale').reduce((a, t) => a + t.total, 0), buy = txs.filter(t => t.type === 'buy').reduce((a, t) => a + t.total, 0);
  const sum = [scheds.length ? '일정 ' + scheds.length : '', notes.length ? '기록 ' + notes.length : '', sale ? '매출 ' + won(sale) + '원' : '', buy ? '매입 ' + won(buy) + '원' : ''].filter(Boolean).join(' · ');
  return '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:8px;margin:22px 0 0;padding:0 20px 0 32px"><div><p style="margin:0;font-size:17px;font-weight:800">' + dayLabel(sel) + (sel === todayStr() ? ' · 오늘' : '') + '</p><p style="margin:2px 0 0;font-size:13px;color:var(--muted)">' + (sum || '이날은 아직 아무것도 없어요') + '</p></div></div>' +
    (teamOn() ? teamDay(scheds) : sec('일정 ' + scheds.length) + '<div class="group">' + (scheds.length ? scheds.map(s => schedRow(s, false)).join('') : '<button class="row" data-act="addOnDay"><span class="main"><span class="s">일정이 없어요. 아래 주황 버튼으로 추가하세요.</span></span></button>') + '</div>') +
    (notes.length ? sec('고장 기록 ' + notes.length) + '<div class="group">' + notes.map(n => noteRow(n, teamOn())).join('') + '</div>' : '') +
    (txs.length ? sec('거래 ' + txs.length + (sale ? ' · 매출 +' + won(sale) : '') + (buy ? ' · 매입 −' + won(buy) : '')) + '<div class="group">' + txs.map(txRow).join('') + '</div>' : '');
}

/* --- 일정 편집 --- */
VIEWS.schedEdit = p => {
  const d = p.d; const sale = d.saleTxId ? D.txs.find(t => t.id === d.saleTxId) : null; const note = d.noteId ? D.notes.find(n => n.id === d.noteId) : null;
  return sheetNav(d.id ? '일정' : '새 일정', '저장', 'saveSched') +
    '<div class="group mt"><label class="frow"><span class="k">작업</span><input data-in="title" value="' + esc(d.title) + '" placeholder="예) 에어컨 실외기 수리"></label><label class="frow"><span class="k">고객</span><input data-in="client" value="' + esc(d.client) + '" placeholder="현장, 담당자 이름"></label></div>' +
    sec('날짜와 시간') + '<div class="group"><label class="frow"><span class="k" style="flex:1">날짜</span><input type="date" data-in="date" value="' + esc(d.date) + '"></label><label class="frow"><span class="k" style="flex:1">시작</span><input type="time" data-in="start" value="' + esc(d.start) + '"></label><label class="frow"><span class="k" style="flex:1">끝</span><input type="time" data-in="end" value="' + esc(d.end) + '"></label></div>' +
    sec('상태') + seg([['예정', '예정'], ['진행 중', '진행 중', 'o'], ['자재 대기', '자재 대기', 'o'], ['완료', '완료', 'g']], d.status, 'schedStatus') +
    (teamOn() ? sec('담당 기사') + '<div class="group"><button class="row" data-act="pickAssignee"><span class="main"><span class="t">' + (d.who ? esc(mem(d.who).name) : '배정 안 됨') + '</span></span><span class="val">바꾸기</span>' + I.chev + '</button></div>' : '') +
    sec('금액') + '<div class="group"><label class="frow"><span class="k">받을 돈</span><input class="r" inputmode="numeric" data-in="amount" data-num="1" value="' + (d.amount ? won(d.amount) : '') + '" placeholder="0"><span class="unit">원</span></label><div class="frow"><span style="flex:1">완료하면 매출로 기록</span>' + sw(d.autoSale, 'tglAutoSale', '완료하면 매출로 기록') + '</div></div>' +
    foot(sale ? '장부에 매출 ' + won(sale.total) + '원으로 기록돼 있어요.' : '상태를 완료로 저장하면 받을 돈이 장부의 매출로 바로 들어가요.') +
    '<div class="group" style="margin-top:22px"><button class="row" data-act="pickNote"><span class="main"><span class="t" style="font-weight:500">고장 기록 연결</span></span><span class="val">' + esc(note ? (note.equip || '기록') : '없음') + '</span>' + I.chev + '</button></div>' +
    (d.id ? '<div class="group" style="margin-top:22px"><button class="btn red" data-act="delSched">일정 삭제</button></div>' : '');
};

/* --- 장부 (개인) --- */
VIEWS.ledger = p => ledgerView(p, false);
function ledgerView(p, team) {
  const ym = p.ym || todayStr().slice(0, 7); const [Y, M] = ym.split('-').map(Number);
  const ms = monthStats(ym); const per = vatPeriod(ym + '-01'); const v = calcVat(per);
  const list = ms.list.slice().sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  let vat;
  if (v.simple) vat = '<div class="vatline"><span>매출 ' + man(v.saleTotal) + '만 × 업종 ' + Math.round(D.settings.rate * 100) + '% × 10%</span><span>' + won(v.out) + '</span></div><div class="vatline"><span>매입 공제 (증빙 매입 ' + man(v.buyTotal) + '만 × 0.5%)</span><span>' + (v.ded ? '−' + won(v.ded) : '0') + '</span></div>' + (v.exempt ? '<div class="vatline"><span style="color:var(--green)">올해 매출 4,800만 원 미만이면 납부 면제 (신고는 해야 해요)</span></div>' : '');
  else vat = '<div class="vatline"><span>매출세액 (매출 ' + man(v.saleTotal) + '만 중 부가세)</span><span>' + won(v.out) + '</span></div><div class="vatline"><span>매입세액 (증빙 매입 ' + man(v.buyTotal) + '만 중)</span><span>' + (v.ded ? '−' + won(v.ded) : '0') + '</span></div>';
  const dueD = parseYmd(per.due);
  const head = team ? topBar() + '<div class="titlerow"><div class="title" style="padding:0"><h1>팀 장부</h1></div><span class="lock">' + I.lock + '사장님만 보기</span></div>'
    : topBar() + '<div class="titlerow"><div class="title" style="padding:0"><h1>장부</h1></div>' + monthNav(M) + '</div>';
  const memberBlock = team ? memberStats(ym) : '';
  return head + (team ? '<div style="display:flex;justify-content:flex-end;padding:8px 12px 0">' + monthNav(M) + '</div>' : '') +
    '<div class="card"><p style="margin:0 0 10px;font-size:13px;font-weight:600;color:var(--muted)">' + Y + '년 ' + M + '월 · 거래 ' + ms.list.length + '건</p><div class="stats"><div><span>매출</span><b style="color:var(--blue)">' + man(ms.sale) + '만</b></div><div><span>매입</span><b>' + man(ms.buy) + '만</b></div><div><span>남은 돈</span><b style="color:var(--green)">' + man(ms.net) + '만</b></div></div></div>' +
    memberBlock +
    '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="font-size:15px;font-weight:700">예상 부가세 · ' + esc(per.name) + '</span><button class="tag" data-act="go" data-v="settings">' + (D.settings.taxType === 'simple' ? '간이과세자' : '일반과세자') + '</button></div>' +
    '<div style="margin:6px 0 10px;font-size:30px;font-weight:800;letter-spacing:-.5px">' + (v.pay < 0 ? '환급 ' + won(-v.pay) : won(v.pay)) + '<span style="font-size:18px">원</span></div>' + vat +
    '<div class="due"><span>신고·납부 ' + dueD.getFullYear() + '년 ' + (dueD.getMonth() + 1) + '월 ' + dueD.getDate() + '일(' + WD[dueD.getDay()] + ')까지</span><b>' + dday(per.due) + '</b></div></div>' +
    sec(M + '월 거래') + '<div class="group">' + (list.length ? list.map(txRow).join('') : '<button class="row" data-act="newTx"><span class="main"><span class="s">거래가 없어요. 눌러서 추가하세요.</span></span>' + I.chev + '</button>') + '</div>' +
    foot('참고용 계산이에요. 기한이 주말·공휴일이면 다음 영업일까지예요. 실제 신고 금액은 홈택스나 세무사와 꼭 확인하세요.');
}
const monthNav = M => '<span style="display:flex;align-items:center"><button class="navbtn" data-act="ledMove" data-v="-1" aria-label="이전 달">' + I.back + '</button><span class="monthbtn">' + M + '월</span><button class="navbtn" data-act="ledMove" data-v="1" aria-label="다음 달">' + I.next + '</button></span>';
function txRow(t) {
  const sale = t.type === 'sale';
  return '<button class="row" data-act="openTx" data-id="' + esc(t.id) + '"><span class="circ" style="background:' + (sale ? 'var(--blue-bg)' : 'var(--fill2)') + ';color:' + (sale ? 'var(--blue)' : 'var(--ink2)') + '">' + (sale ? I.up : I.dn) + '</span>' +
    '<span class="main"><span class="t" style="font-size:15px">' + esc(t.memo || (sale ? '매출' : '매입')) + (t.party ? ' · ' + esc(t.party) : '') + '</span><span class="s" style="font-size:13px">' + esc(shortDay(t.date)) + (sale ? '' : ' · ' + esc(t.proof || '없음')) + (teamOn() && t.who ? ' · ' + esc(mem(t.who).name) : '') + '</span></span>' +
    '<span style="font-size:16px;font-weight:700;color:' + (sale ? 'var(--blue)' : 'var(--ink)') + '">' + (sale ? '+' : '−') + won(t.total) + '</span></button>';
}
function memberStats(ym) {
  const ms = members().map(m => { const l = D.txs.filter(t => monthKey(t.date) === ym && t.type === 'sale' && (t.who || 'me') === m.id); return { m, sum: l.reduce((a, t) => a + t.total, 0), n: l.length }; });
  const max = Math.max(1, ...ms.map(x => x.sum));
  return sec('기사별 매출') + '<div class="group">' + ms.map(x => '<div class="row">' + av(x.m.id) + '<span class="main" style="gap:6px"><span style="display:flex;justify-content:space-between;font-size:15px"><span style="font-weight:600">' + esc(x.m.name) + ' <span style="font-weight:400;color:var(--muted);font-size:13px">' + x.n + '건</span></span><b>' + man(x.sum) + '만</b></span><span class="bar"><i style="width:' + Math.round(x.sum / max * 100) + '%;background:' + x.m.color + '"></i></span></span></div>').join('') + '</div>';
}

/* --- 거래 편집 --- */
VIEWS.txEdit = p => {
  const d = p.d; const s = splitAmt(d.amount, d.vatIncl); const sale = d.type === 'sale';
  return sheetNav(d.id ? '거래' : '거래 추가', '저장', 'saveTx') +
    '<div style="margin-top:14px">' + seg([['sale', '매출 (받은 돈)', 'bl'], ['buy', '매입 (쓴 돈)']], d.type, 'txType') + '</div>' +
    '<div class="card" style="padding:16px"><label class="bigamt"><span class="sr">금액</span><input inputmode="numeric" data-in="amount" data-num="1" value="' + (d.amount ? won(d.amount) : '') + '" placeholder="0"><span>원</span></label>' +
    '<p id="split" style="margin:6px 0 0;text-align:center;font-size:14px;color:var(--muted)">' + splitText(s) + '</p>' +
    '<div style="height:1px;background:var(--line);margin:14px 0 0"></div><div style="display:flex;align-items:center;gap:12px;padding-top:12px"><span style="flex:1">부가세 포함 금액</span>' + sw(d.vatIncl, 'tglVatIncl', '부가세 포함 금액') + '</div></div>' +
    '<div class="group mt"><label class="frow"><span class="k" style="flex:1">날짜</span><input type="date" data-in="date" value="' + esc(d.date) + '"></label><label class="frow"><span class="k">거래처</span><input data-in="party" value="' + esc(d.party) + '" placeholder="' + (sale ? '고객, 현장' : '구매처') + '"></label><label class="frow"><span class="k">내용</span><input data-in="memo" value="' + esc(d.memo) + '" placeholder="' + (sale ? '예) 에어컨 수리' : '예) 팬 모터 부품') + '"></label></div>' +
    (sale ? '' : sec('증빙') + '<div class="chips">' + PROOFS.map(x => '<button class="chip' + (d.proof === x ? ' on' : '') + '" data-act="txProof" data-v="' + x + '">' + x + '</button>').join('') + '</div>' + foot('매입은 세금계산서·카드·현금영수증이 있어야 부가세 공제에 들어가요.')) +
    (teamOn() ? sec('담당') + '<div class="group"><button class="row" data-act="pickWho"><span class="main"><span class="t">' + esc(mem(d.who || 'me').name) + '</span></span><span class="val">바꾸기</span>' + I.chev + '</button></div>' : '') +
    sec('영수증 사진') + '<div class="photos" id="photos">' + photosHtml(d.photos) + '</div>' +
    (d.schedId ? foot('일정을 완료해서 자동으로 기록된 거래예요.') : '') +
    (d.id ? '<div class="group" style="margin-top:22px"><button class="btn red" data-act="delTx">거래 삭제</button></div>' : '');
};
const splitText = s => s.total ? '공급가액 ' + won(s.supply) + '원 · 부가세 ' + won(s.vat) + '원 · 합계 ' + won(s.total) + '원' : '부가세 포함 여부를 아래에서 고르세요';

/* --- 매뉴얼 --- */
VIEWS.man = () => {
  const list = D.manuals.slice().sort((a, b) => b.created - a.created);
  return topBar() +
    '<div class="title"><h1>매뉴얼</h1><p class="sub">영어·일본어 매뉴얼을 한곳에 보관해요</p></div>' +
    '<div class="note">한국어 설치 순서로 정리해주는 AI 기능은 서버를 붙인 다음 버전에서 열려요. 지금은 매뉴얼을 모아두고 바로 꺼내볼 수 있어요.</div>' +
    sec('내 매뉴얼' + (list.length ? ' ' + list.length : '')) + '<div class="group">' + (list.length ? list.map(m => '<button class="row" data-act="openMan" data-id="' + esc(m.id) + '"><span class="doc">' + esc(m.lang || 'EN') + '</span><span class="main"><span class="t" style="font-size:15px">' + esc(m.name) + '</span><span class="s" style="font-size:13px">' + (m.kind === 'pdf' ? 'PDF · ' + (m.size / 1048576).toFixed(1) + 'MB' : '사진 ' + m.files.length + '장') + ' · ' + esc(relTime(m.created)) + '</span></span>' + I.chev + '</button>').join('') : '<div class="row"><span class="s" style="color:var(--muted);font-size:14px">아직 올린 매뉴얼이 없어요.</span></div>') + '</div>';
};
VIEWS.manDetail = p => {
  const m = D.manuals.find(x => x.id === p.id); if (!m) return '<div class="empty">매뉴얼이 없어요</div>';
  return navBack('매뉴얼') + '<div class="title"><h1 style="font-size:26px">' + esc(m.name) + '</h1><p class="sub">' + (m.kind === 'pdf' ? 'PDF · ' + (m.size / 1048576).toFixed(1) + 'MB' : '사진 ' + m.files.length + '장') + ' · ' + esc(new Date(m.created).toLocaleDateString('ko-KR')) + '</p></div>' +
    '<div class="group mt"><button class="row" data-act="openManFile"><span class="main"><span class="t" style="color:var(--tint)">원본 열기</span></span>' + I.chev + '</button><button class="row" data-act="renameMan"><span class="main"><span class="t" style="font-weight:500">이름 바꾸기</span></span>' + I.chev + '</button><button class="row" data-act="langMan"><span class="main"><span class="t" style="font-weight:500">언어</span></span><span class="val">' + esc(m.lang || 'EN') + '</span>' + I.chev + '</button></div>' +
    '<div class="card" style="opacity:.75"><p style="margin:0;font-size:15px;font-weight:700">한국어 설치 순서</p><p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:var(--muted)">AI가 이 매뉴얼을 읽고 설치 순서를 한국어로 정리하고, 단계마다 원문 쪽수를 붙여주는 기능이에요. 서버를 붙인 다음 버전에서 열려요.</p></div>' +
    '<div class="group" style="margin-top:22px"><button class="btn red" data-act="delMan">매뉴얼 삭제</button></div>';
};
VIEWS.manPhotos = p => {
  const m = D.manuals.find(x => x.id === p.id); if (!m) return '';
  return navBack(m.name) + '<div style="display:flex;flex-direction:column;gap:12px;padding:12px 16px">' + m.files.map((f, i) => '<img alt="' + (i + 1) + '쪽" data-pid="' + esc(f) + '" style="width:100%;border-radius:10px;background:#D1D1D6;min-height:200px">').join('') + '</div>';
};

/* --- 설정 --- */
VIEWS.settings = () => {
  const s = D.settings; const rateName = (RATES.find(r => r[1] === s.rate) || RATES[0])[0];
  const item = (act, color, icon, label, val) => '<button class="row" data-act="' + act + '"><span class="ico30" style="background:' + color + '">' + icon + '</span><span class="main"><span class="t" style="font-weight:500;font-size:17px">' + label + '</span></span>' + (val ? '<span class="val">' + esc(val) + '</span>' : '') + I.chev + '</button>';
  const sv = p => '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  return navBack('뒤로') + '<div class="title"><h1>설정</h1></div>' +
    '<div class="group mt">' + (D.team ? item('teamManage', '#2563EB', sv('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>'), '팀 관리', D.team.name) + item('space', '#0F766E', sv('<path d="M4 7h16M4 12h16M4 17h16"/>'), '공간 바꾸기', teamOn() ? '팀' : '개인') : item('createTeam', '#2563EB', sv('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>'), '팀 만들기 (체험)', '기록은 그대로')) + '</div>' +
    (D.team ? '' : foot('지금 버전의 팀 기능은 이 폰 안에서만 체험할 수 있어요. 여러 폰에서 같이 쓰려면 서버가 필요해요.')) +
    sec('사업자') + '<div class="group">' + item('taxType', '#15803D', sv('<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>'), '과세 유형', s.taxType === 'simple' ? '간이과세자' : '일반과세자') + (s.taxType === 'simple' ? item('taxRate', '#4D7C0F', sv('<path d="M5 19L19 5M7 7h.01M17 17h.01"/>'), '업종', rateName + ' ' + Math.round(s.rate * 100) + '%') : '') + '</div>' +
    foot(s.taxType === 'simple' ? '간이과세자는 1년에 한 번(다음 해 1월 25일까지) 신고해요. 업종별 부가가치율로 계산해요.' : '일반과세자는 1월과 7월, 1년에 두 번 신고해요.') +
    sec('백업') + '<div class="group">' + item('exportBackup', '#EA580C', sv('<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'), '백업 내보내기', '') + item('importBackup', '#2563EB', sv('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'), '백업 불러오기', '') + '</div>' +
    foot('기록·일정·장부·사진은 이 폰에만 저장돼요. 폰을 바꾸거나 앱을 지우기 전에 백업 파일을 카톡이나 드라이브로 보내두세요. 매뉴얼 파일은 백업에 들어가지 않아요.') +
    sec('정보') + '<div class="group"><a class="row" href="' + PRIVACY_URL + '" target="_blank" rel="noopener"><span class="ico30" style="background:#636366">' + sv('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>') + '</span><span class="main"><span class="t" style="font-weight:500;font-size:17px">개인정보처리방침</span></span>' + I.chev + '</a><div class="row"><span class="ico30" style="background:#C2410C">' + sv('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>') + '</span><span class="main"><span class="t" style="font-weight:500;font-size:17px">버전</span></span><span class="val">' + VERSION + '</span></div></div>';
};

VIEWS.tledger = p => ledgerView(p, true);
function dayExtra(sel) {
  const notes = D.notes.filter(n => n.createdAt && ymd(new Date(n.createdAt)) === sel).sort((a, b) => b.createdAt - a.createdAt);
  const txs = D.txs.filter(t => t.date === sel);
  return (notes.length ? sec('이날 고장 기록 ' + notes.length) + '<div class="group">' + notes.map(n => noteRow(n, true)).join('') + '</div>' : '') +
    (txs.length ? sec('이날 거래 ' + txs.length) + '<div class="group">' + txs.map(txRow).join('') + '</div>' : '');
}

/* --- 소통 --- */
VIEWS.talk = p => {
  const tabReq = p.tab === 'req'; const nreq = newReqCount();
  let body;
  if (!tabReq) {
    body = '<button class="pin" data-act="editPin" style="display:block;width:calc(100% - 32px);text-align:left"><b>공지</b> · ' + (D.pin ? esc(D.pin) : '눌러서 팀 공지를 적어보세요') + '</button>' +
      (D.messages.length ? D.messages.slice(-40).map(m => m.by === 'me' ? '<div class="msg me"><div class="col"><div class="who">' + esc(relTime(m.at)) + '</div><div class="bub">' + esc(m.text) + '</div></div></div>' : '<div class="msg">' + av(m.by, 30) + '<div><div class="who">' + esc(mem(m.by).name) + ' · ' + esc(relTime(m.at)) + '</div><div class="bub">' + esc(m.text) + '</div></div></div>').join('') : '<div class="empty">아직 대화가 없어요.</div>') +
      '<div class="composer"><button class="plus" data-act="newReq" aria-label="구매 요청 만들기">' + I.plus + '</button><label><span class="sr">메시지</span><input id="msgIn" placeholder="' + (V.sender && V.sender !== 'me' ? esc(mem(V.sender).name) + '(으)로 보내기 (체험)' : '팀에게 메시지') + '"><button class="send" data-act="sendMsg" aria-label="보내기">' + I.send + '</button></label></div>' +
      '<div style="padding:10px 16px 0"><button class="tag" data-act="pickSender">보내는 사람: ' + esc(mem(V.sender || 'me').name) + ' ▾ (체험용)</button></div>';
  } else {
    const order = { new: 0, approved: 1, held: 2, done: 3 };
    const list = D.requests.slice().sort((a, b) => order[a.status] - order[b.status] || b.created - a.created);
    body = (list.length ? list.map(reqCard).join('') : '<div class="empty">요청이 없어요.<br>팀원이 "부품 없어요"라고 보내면 여기로 와요.</div>') + foot('요청함은 사장님과 요청한 기사 본인만 볼 수 있어요.') +
      '<div style="padding:12px 16px 0"><button class="btn gray" data-act="newReq">구매 요청 만들어보기 (기사 입장 체험)</button></div>';
  }
  return '<div class="chipbar">' + spaceChip() + '<button class="navbtn" data-act="teamManage" aria-label="팀 관리">' + I.people + '</button></div>' +
    '<div style="margin-top:6px">' + seg([['talk', '팀 대화'], ['req', I.lock + '요청함' + (nreq ? ' <b style="background:var(--red);color:#fff;border-radius:9px;padding:0 6px;font-size:11px">' + nreq + '</b>' : '')]], tabReq ? 'req' : 'talk', 'talkTab') + '</div>' + body;
};
AFTER.talk = p => { if (p.tab !== 'req') { window.scrollTo(0, document.body.scrollHeight); const i = $('#msgIn'); if (i) i.addEventListener('keydown', e => { if (e.key === 'Enter') ACT.sendMsg(); }); } };
function reqCard(r) {
  const pill = { new: ['새 요청', '#FFEDD5', '#9A3412'], approved: ['승인됨', '#DBEAFE', '#1D4ED8'], held: ['보류', '#E4E4E9', '#3A3A3C'], done: ['구매 완료', '#DCFCE7', '#15803D'] }[r.status];
  const sched = r.schedId ? D.schedules.find(s => s.id === r.schedId) : null;
  const when = r.when === 'today' ? '<span class="pill2" style="background:#FEE2E2;color:#B91C1C">오늘 필요</span>' : r.when === 'week' ? '<span class="pill2" style="background:var(--fill2);color:var(--ink2)">이번 주</span>' : '';
  let acts = '';
  if (r.status === 'new' || r.status === 'held') acts = '<div class="btn2"><button style="background:var(--fill2)" data-act="reqHold" data-id="' + r.id + '">' + (r.status === 'held' ? '보류 중' : '보류') + '</button><button style="background:var(--tint);color:#fff" data-act="reqApprove" data-id="' + r.id + '">승인</button></div>';
  else if (r.status === 'approved') acts = '<button class="btn1" style="width:100%;margin-top:12px;background:var(--fill2)" data-act="reqDone" data-id="' + r.id + '">구매 완료 → 장부 매입에 기록</button>';
  return '<div class="reqcard"><div class="reqhead">' + av(r.by, 28) + '<b style="font-size:14px">' + esc(mem(r.by).name) + '</b><span style="font-size:13px;color:var(--muted)">' + esc(relTime(r.created)) + '</span><span style="flex:1"></span><span class="pill2" style="background:' + pill[1] + ';color:' + pill[2] + '">' + pill[0] + '</span>' + when + '</div>' +
    '<div style="display:flex;gap:12px;margin-top:10px"><div style="flex:1;min-width:0"><p style="margin:0;font-size:17px;font-weight:700">' + esc(r.item) + (r.qty ? ' ' + esc(r.qty) : '') + '</p>' + (r.memo ? '<p style="margin:4px 0 0;font-size:14px;color:var(--ink2);line-height:1.4">' + esc(r.memo) + '</p>' : '') +
    '<p style="margin:6px 0 0;font-size:13px;color:var(--muted)">' + esc(r.kind) + (sched ? ' · ' + esc(sched.title) + (r.hold ? ' (자재 대기)' : '') : '') + (r.status === 'done' && r.amount ? ' · ' + won(r.amount) + '원 장부 기록됨' : '') + '</p></div>' +
    (r.photo ? '<button class="ph" style="width:64px;height:64px" data-act="viewPhoto" data-id="' + esc(r.photo) + '"><img alt="첨부 사진" data-pid="' + esc(r.photo) + '"></button>' : '') + '</div>' + acts + '</div>';
}
VIEWS.reqNew = p => {
  const d = p.d; const sched = d.schedId ? D.schedules.find(s => s.id === d.schedId) : null;
  return sheetNav('구매 요청', '보내기', 'sendReq') +
    '<div class="note" style="display:flex;align-items:center;gap:8px;font-weight:600">' + I.lock + '사장님에게만 보내져요. 팀 대화에는 안 보여요.</div>' +
    sec('요청하는 사람 (체험용)') + '<div class="group"><button class="row" data-act="pickBy">' + av(d.by) + '<span class="main"><span class="t">' + esc(mem(d.by).name) + '</span></span><span class="val">바꾸기</span>' + I.chev + '</button></div>' +
    sec('종류') + '<div class="chips">' + ['자재·부품', '공구', '장비', '기타'].map(k => '<button class="chip' + (d.kind === k ? ' on' : '') + '" data-act="reqKind" data-v="' + k + '">' + k + '</button>').join('') + '</div>' +
    '<div class="group mt"><label class="frow"><span class="k">품목</span><input data-in="item" value="' + esc(d.item) + '" placeholder="예) 실외기 팬 모터"></label><label class="frow"><span class="k">수량</span><input data-in="qty" value="' + esc(d.qty) + '" placeholder="예) 1개"></label><button class="row" data-act="pickReqSched"><span class="k" style="width:64px;font-size:16px;font-weight:600">현장</span><span class="main"><span class="t" style="font-weight:400">' + (sched ? esc(sched.title) + ' · ' + esc(shortDay(sched.date)) : '<span style="color:#8E8E93">일정에서 고르기 (선택)</span>') + '</span></span>' + I.chev + '</button></div>' +
    sec('언제 필요해요?') + seg([['today', '오늘'], ['week', '이번 주'], ['later', '여유 있음']], d.when, 'reqWhen') +
    '<div class="group mt"><div class="frow"><span style="flex:1">자재가 없어 작업 보류</span>' + sw(d.hold, 'tglHold', '작업 보류로 표시') + '</div><label class="frow top"><span class="k">메모</span><textarea data-in="memo" rows="2" placeholder="예) 같은 모델로 부탁드려요">' + esc(d.memo) + '</textarea></label></div>' +
    foot('작업 보류를 켜고 현장 일정을 고르면, 그 일정이 "자재 대기"로 바뀌어 사장님이 바로 알 수 있어요.') +
    sec('사진') + '<div class="photos" id="photos">' + photosHtml(d.photos) + '</div>';
};

/* --- 팀 관리 --- */
VIEWS.teamManage = () => {
  const t = D.team; if (!t) return '';
  return navBack('뒤로') + '<div class="title"><h1>팀 관리</h1></div>' +
    '<div class="card"><p style="margin:0;font-size:13px;font-weight:600;color:var(--muted)">팀 이름</p><button data-act="renameTeam" style="font-size:22px;font-weight:800;margin-top:2px">' + esc(t.name) + ' <span style="font-size:14px;color:var(--tint);font-weight:600">바꾸기</span></button>' +
    '<p style="margin:12px 0 0;font-size:13px;font-weight:600;color:var(--muted)">초대 코드</p><div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px"><span style="font-size:22px;font-weight:800;letter-spacing:1px">' + esc(t.code) + '</span><button class="chip on" data-act="invite">카톡으로 초대</button></div>' +
    '<p style="margin:10px 0 0;font-size:13px;color:var(--muted)">팀 요금 예시 · ' + t.members.length + '명 × 9,900원 = 월 ' + won(t.members.length * 9900) + '원</p></div>' +
    sec('팀원 ' + t.members.length) + '<div class="group">' + t.members.map(m => '<button class="row" data-act="memberMenu" data-id="' + esc(m.id) + '">' + av(m.id) + '<span class="main"><span class="t">' + esc(m.name) + '</span><span class="s">' + (m.role === 'owner' ? '사장 · 장부 전체 보기' : '기사') + '</span></span>' + (m.id === 'me' ? '<span class="val">나</span>' : I.chev) + '</button>').join('') + '<button class="row" data-act="addMember"><span class="main"><span class="t" style="color:var(--tint)">+ 팀원 추가 (체험)</span></span></button></div>' +
    foot('지금은 이 폰 안에서만 팀원을 만들어 체험할 수 있어요.') +
    sec('권한') + '<div class="group">' + [['share', '기사끼리 고장 기록 공유'], ['manual', '매뉴얼 팀 공유'], ['techLedger', '기사도 팀 장부 보기']].map(([k, l]) => '<div class="frow"><span style="flex:1">' + l + '</span>' + sw(D.settings.perms[k], 'perm" data-v="' + k, l) + '</div>').join('') + '</div>' +
    '<div class="group" style="margin-top:22px"><button class="btn" style="color:var(--tint)" data-act="toPersonal">개인 공간으로 돌아가기</button></div>' +
    '<div class="group" style="margin-top:12px"><button class="btn red" data-act="deleteTeam">팀 해제</button></div>';
};

/* ============ ACTIONS ============ */
const ACT = {};
ACT.tab = el => go(el.dataset.v, {}, { root: true });
ACT.go = el => go(el.dataset.v);
ACT.back = () => back();
ACT.toggleOpen = () => { V.p.onlyOpen = !V.p.onlyOpen; render(); };
ACT.viewPhoto = el => showPhoto(el.dataset.id);

/* notes */
ACT.newNote = el => { const dt = el && el.dataset && el.dataset.v; const c = dt && dt !== todayStr() ? parseYmd(dt).getTime() + 12 * 3600000 : null; go('noteEdit', { d: { equip: '', site: '', symptom: '', cause: '', action: '', memo: '', resolved: false, photos: [], who: 'me', _new: [], createdAt: c || undefined } }); };
ACT.openNote = el => go('note', { id: el.dataset.id });
ACT.editNote = el => { const n = D.notes.find(x => x.id === el.dataset.id); go('noteEdit', { d: Object.assign(JSON.parse(JSON.stringify(n)), { _new: [], _orig: [...(n.photos || [])] }) }); };
ACT.draftResolved = el => { V.p.d.resolved = el.dataset.v === '1'; dirty = true; render(); };
ACT.noteStatus = async el => { const n = D.notes.find(x => x.id === V.p.id); n.resolved = el.dataset.v === '1'; n.updatedAt = Date.now(); await putItem('notes', n); render(); toast(n.resolved ? '해결로 바꿨어요' : '미해결로 바꿨어요'); };
ACT.saveNote = async () => {
  const d = V.p.d; const has = ['equip', 'symptom', 'cause', 'action', 'memo'].some(k => (d[k] || '').trim()) || d.photos.length;
  if (!has) { toast('내용을 하나는 적어주세요'); return; }
  const now = Date.now(); const n = { id: d.id || newId(), createdAt: d.createdAt || now, updatedAt: now, who: d.who || 'me' };
  ['equip', 'site', 'symptom', 'cause', 'action', 'memo'].forEach(k => n[k] = (d[k] || '').trim()); n.resolved = !!d.resolved; n.photos = [...d.photos];
  await putItem('notes', n);
  await delPhotos([...(d._orig || []), ...(d._new || [])].filter(p => !n.photos.includes(p)));
  const wasEdit = !!d.id; d._new = []; dirty = false; toast('저장했어요'); if (wasEdit) V.stack.pop(); go('note', { id: n.id }, { replace: true });
};
ACT.delNote = async el => { if (!(await ask('이 기록을 삭제할까요? 사진도 함께 지워져요.', '삭제', true))) return; const n = D.notes.find(x => x.id === el.dataset.id); await delItem('notes', n.id); await delPhotos(n.photos); toast('삭제했어요'); back(); };
ACT.addPhoto = async () => {
  const d = V.p.d; const blobs = await getPhotoBlobs(true); if (!blobs.length) return;
  if (V.name === 'txEdit') blobs.splice(1);
  for (const b of blobs) { try { const pid = await storePhoto(b); d.photos.push(pid); (d._new = d._new || []).push(pid); } catch (e) { toast('사진을 저장하지 못했어요'); } }
  if (V.name === 'txEdit' && d.photos.length > 1) d.photos = d.photos.slice(-1);
  dirty = true; $('#photos').innerHTML = photosHtml(d.photos); hydrate();
};
ACT.rmPhoto = el => { V.p.d.photos.splice(+el.dataset.i, 1); dirty = true; $('#photos').innerHTML = photosHtml(V.p.d.photos); hydrate(); };
ACT.pickWho = async () => { const ms = members(); const i = await sheet(ms.map(m => m.name)); if (i >= 0) { V.p.d.who = ms[i].id; dirty = true; render(); } };

/* schedules */
function schedDraft(s) { return s ? JSON.parse(JSON.stringify(s)) : { title: '', client: '', date: V.name === 'home' && V.p.sel ? V.p.sel : todayStr(), start: '09:00', end: '10:00', status: '예정', amount: 0, autoSale: true, who: teamOn() ? null : 'me', noteId: null, saleTxId: null }; }
ACT.newSched = () => go('schedEdit', { d: schedDraft() });
ACT.openSched = el => go('schedEdit', { d: schedDraft(D.schedules.find(s => s.id === el.dataset.id)) });
ACT.selDay = el => {
  const v = el.dataset.v; if (V.name !== 'home') { go('home', { sel: v }, { root: true }); return; }
  if (V.p.sel === v || (!V.p.sel && v === todayStr() && el.classList.contains('d'))) { ACT.addOnDay(); return; }
  V.p.sel = v; V.p.ym = v.slice(0, 7); render();
};
ACT.addOnDay = async () => {
  const sel = V.p.sel || todayStr();
  const i = await sheet(['일정 추가', '고장 기록 추가', '거래 추가 (매출·매입)'], (sel === todayStr() ? '오늘' : shortDay(sel)) + '에 추가');
  const fake = { dataset: { v: sel } };
  if (i === 0) ACT.newSched(); else if (i === 1) ACT.newNote(fake); else if (i === 2) ACT.newTx(fake);
};
ACT.openOnly = () => go('records', { onlyOpen: true }, { root: true });
ACT.recFilter = el => { V.p.onlyOpen = el.dataset.v === '1'; render(); };
ACT.addManual = async () => { const i = await sheet(['PDF 파일 올리기', '종이 매뉴얼 사진 찍기']); if (i === 0) ACT.addPdf(); else if (i === 1) ACT.addManPhotos(); };
ACT.calMove = el => { const [Y, M] = (V.p.ym || (V.p.sel || todayStr()).slice(0, 7)).split('-').map(Number); const d = new Date(Y, M - 1 + Number(el.dataset.v), 1); V.p.ym = ymd(d).slice(0, 7); V.p.sel = V.p.ym === todayStr().slice(0, 7) ? todayStr() : V.p.ym + '-01'; render(); };
ACT.schedStatus = el => { V.p.d.status = el.dataset.v; dirty = true; render(); };
ACT.tglAutoSale = () => { V.p.d.autoSale = !V.p.d.autoSale; dirty = true; render(); };
ACT.pickAssignee = async () => { const ms = members(); const i = await sheet(['배정 안 함', ...ms.map(m => m.name)], '담당 기사'); if (i >= 0) { V.p.d.who = i === 0 ? null : ms[i - 1].id; dirty = true; render(); } };
ACT.pickNote = async () => { const list = D.notes.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8); const i = await sheet(['연결 안 함', ...list.map(n => (n.equip || '장비 미입력') + ' · ' + relTime(n.createdAt))], '고장 기록 연결'); if (i >= 0) { V.p.d.noteId = i === 0 ? null : list[i - 1].id; dirty = true; render(); } };
ACT.saveSched = async () => {
  const d = V.p.d; if (!(d.title || '').trim()) { toast('작업 이름을 적어주세요'); return; }
  const s = Object.assign({}, d, { id: d.id || newId(), title: d.title.trim(), client: (d.client || '').trim(), updatedAt: Date.now() }); if (!s.createdAt) s.createdAt = Date.now();
  let msg = '저장했어요';
  if (s.status === '완료' && s.autoSale && s.amount > 0) {
    const sp = splitAmt(s.amount, true); const existing = s.saleTxId ? D.txs.find(t => t.id === s.saleTxId) : null;
    const t = Object.assign(existing || { id: newId(), createdAt: Date.now(), type: 'sale', proof: '', photos: [] }, { total: sp.total, supply: sp.supply, vat: sp.vat, vatIncl: true, date: s.date, party: s.client, memo: s.title, schedId: s.id, who: s.who || 'me' });
    await putItem('txs', t); s.saleTxId = t.id; msg = existing ? '저장했어요. 장부 금액도 맞췄어요' : '완료! 장부에 매출 ' + won(t.total) + '원 기록했어요';
  }
  await putItem('schedules', s); dirty = false; toast(msg); back();
};
ACT.delSched = async () => {
  const d = V.p.d; const sale = d.saleTxId && D.txs.find(t => t.id === d.saleTxId);
  if (!(await ask(sale ? '일정을 삭제할까요? 장부에 기록된 매출은 그대로 남아요.' : '이 일정을 삭제할까요?', '삭제', true))) return;
  await delItem('schedules', d.id); dirty = false; toast('삭제했어요'); back();
};
ACT.tSel = el => { V.p.sel = el.dataset.v; render(); };
ACT.tWeek = el => { const d = parseYmd(V.p.sel || todayStr()); d.setDate(d.getDate() + Number(el.dataset.v)); V.p.sel = ymd(d); render(); };
ACT.assign = async el => { const ms = members(); const i = await sheet(ms.map(m => m.name), '누구에게 배정할까요?'); if (i < 0) return; const s = D.schedules.find(x => x.id === el.dataset.id); s.who = ms[i].id; await putItem('schedules', s); toast(ms[i].name + '에게 배정했어요'); render(); };

/* ledger */
function txDraft(t, type) { if (t) { const c = JSON.parse(JSON.stringify(t)); c.amount = c.vatIncl ? c.total : c.supply; c.photos = c.photos || []; c._orig = [...c.photos]; c._new = []; return c; } return { type: type || 'sale', amount: 0, vatIncl: true, date: todayStr(), party: '', memo: '', proof: '카드', who: 'me', photos: [], _new: [] }; }
ACT.newTx = el => { const d = txDraft(null); const dt = el && el.dataset && el.dataset.v; if (dt && /^\d{4}-/.test(dt)) d.date = dt; go('txEdit', { d }); };
ACT.openTx = el => go('txEdit', { d: txDraft(D.txs.find(t => t.id === el.dataset.id)) });
ACT.ledMove = el => { const [Y, M] = (V.p.ym || todayStr().slice(0, 7)).split('-').map(Number); V.p.ym = ymd(new Date(Y, M - 1 + Number(el.dataset.v), 1)).slice(0, 7); render(); };
ACT.txType = el => { V.p.d.type = el.dataset.v; dirty = true; render(); };
ACT.tglVatIncl = () => { V.p.d.vatIncl = !V.p.d.vatIncl; dirty = true; render(); };
ACT.txProof = el => { V.p.d.proof = el.dataset.v; dirty = true; render(); };
ACT.saveTx = async () => {
  const d = V.p.d; if (!d.amount) { toast('금액을 적어주세요'); return; }
  const sp = splitAmt(d.amount, d.vatIncl);
  const t = { id: d.id || newId(), createdAt: d.createdAt || Date.now(), type: d.type, total: sp.total, supply: sp.supply, vat: sp.vat, vatIncl: !!d.vatIncl, date: d.date || todayStr(), party: (d.party || '').trim(), memo: (d.memo || '').trim(), proof: d.type === 'buy' ? d.proof : '', who: d.who || 'me', schedId: d.schedId || null, photos: d.photos || [] };
  await putItem('txs', t); await delPhotos([...(d._orig || []), ...(d._new || [])].filter(p => !t.photos.includes(p)));
  d._new = []; dirty = false; toast('저장했어요'); back();
};
ACT.delTx = async () => { if (!(await ask('이 거래를 삭제할까요?', '삭제', true))) return; const d = V.p.d; await delItem('txs', d.id); await delPhotos(d.photos); D.schedules.filter(s => s.saleTxId === d.id).forEach(s => { s.saleTxId = null; db.put('schedules', s); }); dirty = false; toast('삭제했어요'); back(); };

/* manuals */
ACT.addPdf = () => pickFiles('application/pdf,.pdf', false, async files => {
  const f = files[0]; if (!f) return; if (f.size > 150 * 1048576) { toast('150MB 이하 파일만 올릴 수 있어요'); return; }
  try { const fid = 'f' + newId(); await db.put('files', { id: fid, blob: f }); const m = { id: newId(), name: f.name.replace(/\.pdf$/i, ''), lang: /[ぁ-んァ-ン]/.test(f.name) ? 'JP' : 'EN', kind: 'pdf', size: f.size, files: [fid], created: Date.now() }; await putItem('manuals', m); toast('매뉴얼을 올렸어요'); render(); }
  catch (e) { toast(e && e.name === 'QuotaExceededError' ? '폰 저장 공간이 부족해요' : '파일을 저장하지 못했어요'); }
});
ACT.addManPhotos = async () => {
  const blobs = await getPhotoBlobs(true); if (!blobs.length) return;
  const name = await promptText('매뉴얼 이름', '', { ph: '예) 펌프 설치 매뉴얼' }); if (name == null) return;
  const ids = []; for (const b of blobs) ids.push(await storePhoto(b));
  await putItem('manuals', { id: newId(), name: name || '사진 매뉴얼', lang: 'EN', kind: 'images', size: 0, files: ids, created: Date.now() }); toast('매뉴얼을 저장했어요'); render();
};
ACT.openMan = el => go('manDetail', { id: el.dataset.id });
ACT.openManFile = async () => {
  const m = D.manuals.find(x => x.id === V.p.id); if (!m) return;
  if (m.kind === 'images') { go('manPhotos', { id: m.id }); return; }
  const rec = await db.get('files', m.files[0]).catch(() => null); if (!rec) { toast('파일을 찾을 수 없어요'); return; }
  if (!NATIVE) { window.open(URL.createObjectURL(rec.blob), '_blank'); return; }
  try {
    toast('여는 중…'); const b64 = await blobToBase64(rec.blob);
    const w = await Filesystem.writeFile({ path: 'manual_' + m.id + '.pdf', data: b64, directory: Directory.Cache });
    await FileOpener.open({ filePath: w.uri, contentType: 'application/pdf', openWithDefault: true });
  } catch (e) { toast('PDF를 열 앱이 없어요. PDF 뷰어를 설치해 주세요'); }
};
function blobToBase64(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(b); }); }
function blobToDataURL(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); }); }
ACT.renameMan = async () => { const m = D.manuals.find(x => x.id === V.p.id); const n = await promptText('매뉴얼 이름', m.name); if (n) { m.name = n; await putItem('manuals', m); render(); } };
ACT.langMan = async () => { const L = ['EN', 'JP', 'CN', 'KO', '기타']; const i = await sheet(['영어 (EN)', '일본어 (JP)', '중국어 (CN)', '한국어 (KO)', '기타']); if (i >= 0) { const m = D.manuals.find(x => x.id === V.p.id); m.lang = L[i]; await putItem('manuals', m); render(); } };
ACT.delMan = async () => {
  if (!(await ask('이 매뉴얼을 삭제할까요?', '삭제', true))) return; const m = D.manuals.find(x => x.id === V.p.id);
  for (const f of m.files) { try { await db.del(m.kind === 'pdf' ? 'files' : 'photos', f); } catch (e) { } }
  await delItem('manuals', m.id); toast('삭제했어요'); back();
};

/* settings */
ACT.taxType = async () => { const i = await sheet(['일반과세자', '간이과세자'], '과세 유형'); if (i < 0) return; D.settings.taxType = i === 1 ? 'simple' : 'general'; await saveKV('settings'); render(); };
ACT.taxRate = async () => { const i = await sheet(RATES.map(r => r[0] + ' ' + Math.round(r[1] * 100) + '%'), '간이과세 업종별 부가가치율'); if (i < 0) return; D.settings.rate = RATES[i][1]; await saveKV('settings'); render(); };
ACT.exportBackup = async () => {
  toast('백업 파일을 만드는 중…');
  const pids = new Set(); D.notes.forEach(n => (n.photos || []).forEach(p => pids.add(p))); D.txs.forEach(t => (t.photos || []).forEach(p => pids.add(p))); D.requests.forEach(r => r.photo && pids.add(r.photo));
  const photos = {}; for (const p of pids) { const r = await db.get('photos', p).catch(() => null); if (r && r.blob) photos[p] = await blobToDataURL(r.blob); }
  const json = JSON.stringify({ app: 'gisa-note', version: 2, exportedAt: Date.now(), notes: D.notes, schedules: D.schedules, txs: D.txs, kv: { settings: D.settings, team: D.team, messages: D.messages, requests: D.requests, pin: D.pin }, photos });
  const d = new Date(); const name = '기사의노트_백업_' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '.json';
  if (NATIVE) { try { const w = await Filesystem.writeFile({ path: name, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 }); await Share.share({ title: '기사의 노트 백업', files: [w.uri], dialogTitle: '백업 파일 저장할 곳 선택' }); } catch (e) { if (!/cancel/i.test(String(e && e.message))) toast('백업 파일을 공유하지 못했어요'); } }
  else { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = name; a.click(); }
};
ACT.importBackup = () => pickFiles('application/json,.json', false, async files => {
  const f = files[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text()); if (!data || data.app !== 'gisa-note') throw 0;
    for (const [p, du] of Object.entries(data.photos || {})) { if (!(await db.get('photos', p))) await db.put('photos', { id: p, blob: await (await fetch(du)).blob() }); }
    let n = 0; for (const s of ['notes', 'schedules', 'txs']) for (const o of data[s] || []) { if (o && o.id && !D[s].some(x => x.id === o.id)) { await putItem(s, o); n++; } }
    const kv = data.kv || {}; if (kv.team && !D.team) { D.team = kv.team; await saveKV('team'); }
    for (const k of ['messages', 'requests']) for (const o of kv[k] || []) if (!D[k].some(x => x.id === o.id)) D[k].push(o);
    await saveKV('messages'); await saveKV('requests');
    toast(n ? n + '건을 불러왔어요' : '새로 불러올 기록이 없어요'); render();
  } catch (e) { toast('백업 파일을 읽지 못했어요'); }
});

/* team */
ACT.createTeam = async () => {
  const name = await promptText('팀(업체) 이름', '', { ph: '예) 도경설비' }); if (!name) return;
  const me = await promptText('내 이름', '', { ph: '예) 황도경' }); if (me == null) return;
  D.team = { name, code: 'GISA-' + Math.random().toString(36).slice(2, 6).toUpperCase(), members: [{ id: 'me', name: me || '나', role: 'owner', color: COLORS[0] }] };
  D.settings.mode = 'team'; await saveKV('team'); await saveKV('settings');
  toast('팀을 만들었어요. 팀원을 추가해 보세요'); go('teamManage', {}, { root: true });
};
ACT.teamManage = () => go('teamManage');
ACT.space = async () => {
  if (!D.team) return; const i = await sheet(['개인 공간', D.team.name + ' 팀'], '공간 바꾸기'); if (i < 0) return;
  D.settings.mode = i === 1 ? 'team' : 'personal'; await saveKV('settings'); go('home', {}, { root: true });
};
ACT.toPersonal = async () => { D.settings.mode = 'personal'; await saveKV('settings'); go('home', {}, { root: true }); };
ACT.renameTeam = async () => { const n = await promptText('팀 이름', D.team.name); if (n) { D.team.name = n; await saveKV('team'); render(); } };
ACT.invite = () => toast('실제 초대는 서버를 붙인 다음 버전에서 돼요');
ACT.addMember = async () => {
  const n = await promptText('팀원 이름', '', { ph: '예) 김민수' }); if (!n) return;
  D.team.members.push({ id: 'm' + newId(), name: n, role: 'tech', color: COLORS[D.team.members.length % COLORS.length] }); await saveKV('team'); render();
};
ACT.memberMenu = async el => {
  const m = D.team.members.find(x => x.id === el.dataset.id); if (!m || m.id === 'me') { if (m) { const n = await promptText('내 이름', m.name); if (n) { m.name = n; await saveKV('team'); render(); } } return; }
  const i = await sheet(['이름 바꾸기', '팀에서 빼기'], m.name); if (i === 0) { const n = await promptText('이름', m.name); if (n) { m.name = n; await saveKV('team'); render(); } }
  else if (i === 1 && await ask(m.name + '님을 팀에서 뺄까요? 배정된 일정은 "배정 안 됨"이 돼요.', '빼기', true)) {
    D.team.members = D.team.members.filter(x => x.id !== m.id); for (const s of D.schedules.filter(s => s.who === m.id)) { s.who = null; await putItem('schedules', s); } await saveKV('team'); render();
  }
};
ACT.perm = async el => { const k = el.dataset.v; D.settings.perms[k] = !D.settings.perms[k]; await saveKV('settings'); render(); };
ACT.deleteTeam = async () => {
  if (!(await ask('팀을 해제할까요? 기록·일정·장부는 개인 공간에 그대로 남아요.', '해제', true))) return;
  D.team = null; D.settings.mode = 'personal'; D.messages = []; D.requests = []; await saveKV('team'); await saveKV('settings'); await saveKV('messages'); await saveKV('requests');
  for (const s of D.schedules.filter(s => s.who !== 'me')) { s.who = 'me'; await putItem('schedules', s); }
  toast('팀을 해제했어요'); go('home', {}, { root: true });
};

/* talk */
ACT.talkTab = el => { V.p.tab = el.dataset.v; render(); };
ACT.editPin = async () => { const t = await promptText('팀 공지', D.pin, { ph: '예) 내일 7시 현장 집결' }); if (t == null) return; D.pin = t; await saveKV('pin'); render(); };
ACT.pickSender = async () => { const ms = members(); const i = await sheet(ms.map(m => m.name + (m.id === 'me' ? ' (나)' : '')), '누구로 보낼까요? (체험용)'); if (i >= 0) { V.sender = ms[i].id; render(); } };
ACT.sendMsg = async () => { const i = $('#msgIn'); const t = (i && i.value || '').trim(); if (!t) return; D.messages.push({ id: newId(), by: V.sender || 'me', text: t, at: Date.now() }); await saveKV('messages'); render(); };
ACT.newReq = () => { const ms = members(); const by = (ms.find(m => m.id !== 'me') || ms[0]).id; go('reqNew', { d: { by, kind: '자재·부품', item: '', qty: '', schedId: null, when: 'today', hold: true, memo: '', photos: [], _new: [] } }); };
ACT.pickBy = async () => { const ms = members(); const i = await sheet(ms.map(m => m.name)); if (i >= 0) { V.p.d.by = ms[i].id; render(); } };
ACT.reqKind = el => { V.p.d.kind = el.dataset.v; render(); };
ACT.reqWhen = el => { V.p.d.when = el.dataset.v; render(); };
ACT.tglHold = () => { V.p.d.hold = !V.p.d.hold; render(); };
ACT.pickReqSched = async () => { const list = D.schedules.filter(s => s.status !== '완료').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8); if (!list.length) { toast('고를 일정이 없어요'); return; } const i = await sheet(['선택 안 함', ...list.map(s => s.title + ' · ' + shortDay(s.date))], '현장 일정'); if (i >= 0) { V.p.d.schedId = i === 0 ? null : list[i - 1].id; render(); } };
ACT.sendReq = async () => {
  const d = V.p.d; if (!(d.item || '').trim()) { toast('품목을 적어주세요'); return; }
  const r = { id: newId(), by: d.by, kind: d.kind, item: d.item.trim(), qty: (d.qty || '').trim(), schedId: d.schedId, when: d.when, hold: !!d.hold, memo: (d.memo || '').trim(), photo: d.photos[0] || null, status: 'new', created: Date.now() };
  D.requests.push(r); await saveKV('requests');
  if (r.hold && r.schedId) { const s = D.schedules.find(x => x.id === r.schedId); if (s) { s.status = '자재 대기'; await putItem('schedules', s); } }
  D.messages.push({ id: newId(), by: d.by, text: '구매 요청을 보냈어요: ' + r.item + (r.qty ? ' ' + r.qty : ''), at: Date.now() }); await saveKV('messages');
  d._new = []; dirty = false; toast('사장님에게 요청을 보냈어요'); V.stack.pop(); go('talk', { tab: 'req' }, { replace: true });
};
async function setReq(id, f) { const r = D.requests.find(x => x.id === id); f(r); await saveKV('requests'); render(); }
ACT.reqHold = el => setReq(el.dataset.id, r => { r.status = 'held'; });
ACT.reqApprove = el => setReq(el.dataset.id, r => { r.status = 'approved'; toast('승인했어요. 사면 "구매 완료"를 눌러주세요'); });
ACT.reqDone = async el => {
  const r = D.requests.find(x => x.id === el.dataset.id); const v = await promptText('실제로 산 금액 (부가세 포함)', '', { numeric: true, ph: '예) 88000' }); if (v == null) return;
  const amt = digits(v); if (!amt) { toast('금액을 적어주세요'); return; }
  const sp = splitAmt(amt, true); const t = { id: newId(), createdAt: Date.now(), type: 'buy', total: sp.total, supply: sp.supply, vat: sp.vat, vatIncl: true, date: todayStr(), party: '', memo: r.item + (r.qty ? ' ' + r.qty : ''), proof: '카드', who: 'me', photos: [] };
  await putItem('txs', t); r.status = 'done'; r.amount = amt; r.txId = t.id; await saveKV('requests');
  if (r.schedId) { const s = D.schedules.find(x => x.id === r.schedId); if (s && s.status === '자재 대기') { s.status = '예정'; await putItem('schedules', s); } }
  toast('장부에 매입 ' + won(amt) + '원 기록했어요 (증빙: 카드)'); render();
};

/* ============ events ============ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const f = ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el, e); }
});
app.addEventListener('input', e => {
  const el = e.target; const k = el.dataset && el.dataset.in; if (!k || !V.p.d) return;
  if (el.dataset.num) { const n = digits(el.value); V.p.d[k] = n; const pos = el.value.length; el.value = n ? won(n) : ''; try { el.setSelectionRange(el.value.length, el.value.length); } catch (_) { } if (V.name === 'txEdit') { const sp = $('#split'); if (sp) sp.textContent = splitText(splitAmt(n, V.p.d.vatIncl)); } }
  else V.p.d[k] = el.value;
  dirty = true;
});
async function onBack() {
  if (closeTop) { closeTop(); return; }
  if (V.stack.length || !ROOTS[V.name]) { back(); return; }
  if (V.name !== 'home') { go('home', {}, { root: true }); return; }
  if (NATIVE) App.minimizeApp().catch(() => App.exitApp());
}

/* ============ boot ============ */
(async function boot() {
  app.innerHTML = '<div class="empty">불러오는 중…</div>';
  await load();
  V = { name: 'home', p: {}, stack: [] };
  render();
  if (NATIVE) App.addListener('backButton', onBack);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
})();
window.__gisa = { D, ACT, V: () => V };
