import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Camera, MediaTypeSelection } from '@capacitor/camera';
import { SpeechRecognition as SR } from '@capacitor-community/speech-recognition';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const NATIVE = Capacitor.isNativePlatform();
const VERSION = '1.0.0';
const PRIVACY_URL = 'https://hwanggoo.github.io/gisa-note/privacy.html';

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');

const ICON = {
  mic: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  stop: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  kbd: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>',
  back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  cam: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  photo: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg>',
  split: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M4 12h10M4 18h13"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
};

/* ---------------- state ---------------- */
const state = { notes: [], loaded: false, view: 'list', filter: 'all', q: '', detailId: null, draft: null, dirty: false };
const FIELDS = [['equip', '장비 · 모델'], ['symptom', '증상'], ['cause', '원인'], ['action', '조치'], ['site', '현장 · 고객']];

/* ---------------- toast / dialogs ---------------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
let closeTop = null; // closes the topmost overlay (for Android back button)
function ask(msg, okLabel, danger) {
  return new Promise(res => {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = '<div class="box"><p></p><div class="row"><button class="btn" data-a="0">취소</button><button class="btn ' + (danger ? 'accent' : 'primary') + '" data-a="1"></button></div></div>';
    m.querySelector('p').textContent = msg; m.querySelector('[data-a="1"]').textContent = okLabel;
    const done = v => { m.remove(); closeTop = null; res(v); };
    m.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) done(b.dataset.a === '1'); else if (e.target === m) done(false); });
    closeTop = () => done(false);
    document.body.appendChild(m);
  });
}
function sheet(options) {
  return new Promise(res => {
    const m = document.createElement('div'); m.className = 'sheet';
    m.innerHTML = '<div class="box">' + options.map((o, i) => '<button class="btn' + (i === 0 ? ' primary' : '') + '" data-i="' + i + '">' + esc(o) + '</button>').join('') + '<button class="btn" data-i="-1">취소</button></div>';
    const done = v => { m.remove(); closeTop = null; res(v); };
    m.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) done(+b.dataset.i); else if (e.target === m) done(-1); });
    closeTop = () => done(-1);
    document.body.appendChild(m);
  });
}

/* ---------------- IndexedDB storage (on this phone only) ---------------- */
let dbp = null;
function idb() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open('gisa-note', 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('notes')) d.createObjectStore('notes', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos', { keyPath: 'id' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
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
const store = {
  all: () => tx('notes', 'readonly', s => s.getAll()),
  put: n => tx('notes', 'readwrite', s => s.put(n)),
  del: id => tx('notes', 'readwrite', s => s.delete(id)),
  photoPut: (id, blob) => tx('photos', 'readwrite', s => s.put({ id, blob })),
  photoGet: id => tx('photos', 'readonly', s => s.get(id)),
  photoDel: id => tx('photos', 'readwrite', s => s.delete(id)),
};
async function loadNotes() {
  try { state.notes = (await store.all()) || []; } catch (e) { state.notes = []; toast('기록을 불러오지 못했어요'); }
  sortNotes(); state.loaded = true;
}
function sortNotes() { state.notes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); }
function upsertState(n) { const i = state.notes.findIndex(x => x.id === n.id); if (i >= 0) state.notes[i] = n; else state.notes.push(n); sortNotes(); }

const urlCache = new Map();
async function photoURL(pid) {
  if (urlCache.has(pid)) return urlCache.get(pid);
  const rec = await store.photoGet(pid).catch(() => null);
  if (!rec || !rec.blob) return '';
  const u = URL.createObjectURL(rec.blob); urlCache.set(pid, u); return u;
}
function hydrate(root) {
  (root || document).querySelectorAll('img[data-pid]').forEach(async img => {
    const u = await photoURL(img.dataset.pid); if (u) img.src = u;
  });
}
async function deletePhotos(pids) { for (const p of pids) { try { await store.photoDel(p); } catch (e) { } const u = urlCache.get(p); if (u) { URL.revokeObjectURL(u); urlCache.delete(p); } } }

/* ---------------- draft persistence (crash safety) ---------------- */
const DKEY = 'gisa-draft-v1';
function saveDraftLocal() { try { if (state.draft && !state.draft.id) localStorage.setItem(DKEY, JSON.stringify({ ...state.draft, newPids: undefined })); } catch (e) { } }
function readDraftLocal() { try { return JSON.parse(localStorage.getItem(DKEY) || 'null'); } catch (e) { return null; } }
function clearDraftLocal() { try { localStorage.removeItem(DKEY); } catch (e) { } }

/* ---------------- speech (native Android recognizer) ---------------- */
const sr = { avail: false, denied: false, want: false, active: false, partial: '', lastEvt: 0, restarts: 0 };
async function initSpeech() {
  if (!NATIVE) return;
  try { sr.avail = !!(await SR.available()).available; } catch (e) { sr.avail = false; }
  if (!sr.avail) return;
  SR.addListener('partialResults', d => {
    const t = d && d.matches && d.matches[0];
    if (t) { sr.partial = t; sr.lastEvt = Date.now(); sr.restarts = 0; const p = $('#interim'); if (p) p.textContent = t; }
  });
  SR.addListener('listeningState', d => { sr.lastEvt = Date.now(); if (d && d.status === 'stopped') onSpeechEnded(); });
  setInterval(async () => {
    if (!sr.active) return;
    try { const r = await SR.isListening(); if (r && !r.listening && Date.now() - sr.lastEvt > 1500) onSpeechEnded(); } catch (e) { }
  }, 1500);
}
function commitPartial() {
  const t = (sr.partial || '').trim(); sr.partial = '';
  const p = $('#interim'); if (p) p.textContent = '';
  if (!t) return;
  const ta = $('#memo');
  if (ta) { ta.value = (ta.value.trim() ? ta.value.trim() + ' ' : '') + t; onDraftInput('memo', ta.value); autosize(ta); }
}
async function speechStart() {
  commitPartial();
  sr.active = true; sr.lastEvt = Date.now(); refreshMic();
  try { await SR.start({ language: 'ko-KR', maxResults: 1, partialResults: true, popup: false }); }
  catch (e) { sr.active = false; sr.want = false; refreshMic(); toast('음성 인식을 시작하지 못했어요. 다시 눌러주세요'); }
}
function onSpeechEnded() {
  if (!sr.active) return;
  sr.active = false;
  setTimeout(() => {
    commitPartial();
    // 사용자가 멈추지 않았으면 이어서 듣기 (말 없이 5번 끊기면 멈춤)
    if (sr.want && state.view === 'edit' && sr.restarts < 5) { sr.restarts++; speechStart(); }
    else { sr.want = false; refreshMic(); }
  }, 700);
}
async function speechStop() {
  sr.want = false;
  try { await SR.stop(); } catch (e) { }
  setTimeout(() => { commitPartial(); sr.active = false; refreshMic(); }, 700);
}
function micMode() { return (NATIVE && sr.avail && !sr.denied) ? 'voice' : 'kbd'; }
function refreshMic() {
  const b = $('#micbtn'); if (!b) return;
  const mode = micMode(), rec = sr.want || sr.active;
  b.className = 'mic' + (mode === 'kbd' ? ' kbd' : '') + (rec && mode === 'voice' ? ' rec' : '');
  b.innerHTML = mode === 'kbd' ? ICON.kbd : (rec ? ICON.stop : ICON.mic);
  b.setAttribute('aria-label', rec ? '녹음 멈추기' : '말하기');
  const t = $('#mictext');
  if (t) t.innerHTML = mode === 'kbd'
    ? '<b>키보드 마이크로 말하기</b><span>메모 칸을 누르고 키보드의 마이크 버튼을 누르세요</span>'
    : (rec ? '<b>듣고 있어요…</b><span>다 말했으면 다시 누르세요</span>' : '<b>눌러서 말하기</b><span>장비, 증상, 원인, 조치 순서로 말하면 잘 나뉘어요</span>');
}
async function onMic() {
  if (micMode() === 'kbd') { const ta = $('#memo'); if (ta) ta.focus(); return; }
  if (sr.want || sr.active) { speechStop(); return; }
  try {
    let p = await SR.checkPermissions();
    if (p.speechRecognition !== 'granted') p = await SR.requestPermissions();
    if (p.speechRecognition !== 'granted') { sr.denied = true; refreshMic(); toast('마이크 권한이 없어 키보드 입력으로 바꿨어요. 설정에서 권한을 켤 수 있어요'); return; }
  } catch (e) { }
  sr.want = true; sr.restarts = 0; speechStart();
}

/* ---------------- keyword split (no AI, 0원) ---------------- */
function keywordSplit(t) {
  const re = /(장비|모델|기종|증상|원인|조치|현장|고객)\s*(?:은|는|이|가|을|를|:)?\s*/g;
  const map = { '장비': 'equip', '모델': 'equip', '기종': 'equip', '증상': 'symptom', '원인': 'cause', '조치': 'action', '현장': 'site', '고객': 'site' };
  const hits = []; let m; while ((m = re.exec(t))) hits.push({ k: map[m[1]], s: m.index, e: re.lastIndex });
  if (!hits.length) return null;
  const out = {};
  hits.forEach((h, i) => {
    const seg = t.slice(h.e, i + 1 < hits.length ? hits[i + 1].s : t.length).replace(/^[\s,.:]+|[\s,.]+$/g, '');
    if (seg) out[h.k] = out[h.k] ? out[h.k] + ' / ' + seg : seg;
  });
  return out;
}
function onSplit() {
  const memo = ($('#memo').value || '').trim();
  if (!memo) { toast('먼저 메모를 말하거나 적어주세요'); return; }
  const r = keywordSplit(memo);
  if (!r) { toast('"증상은 …, 원인은 …"처럼 말하면 칸으로 나눌 수 있어요'); return; }
  FIELDS.forEach(([k]) => { const v = (r[k] || '').trim(); if (v) { const el = $('#f-' + k); if (el) { el.value = v; autosize(el); } onDraftInput(k, v); } });
  if (/해결\s*(됨|됐|완료|했)|정상\s*(작동|확인|동작)/.test(memo)) { state.draft.resolved = true; renderSeg(); }
  toast('칸을 채웠어요. 확인해 주세요');
}

/* ---------------- photos ---------------- */
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function shrinkBlob(blob, max, q) {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImg(url);
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(r => c.toBlob(r, 'image/jpeg', q));
  } finally { URL.revokeObjectURL(url); }
}
function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
async function addPhotoBlob(blob) {
  const d = state.draft; if (!d) return;
  const pid = 'p' + newId();
  d.photos.push(pid); d.newPids.push(pid); d.loading = (d.loading || 0) + 1; renderPhotos();
  try {
    const small = (await shrinkBlob(blob, 1600, 0.8)) || blob;
    await store.photoPut(pid, small);
    state.dirty = true;
  } catch (e) {
    d.photos = d.photos.filter(x => x !== pid); toast(e && e.name === 'QuotaExceededError' ? '폰 저장 공간이 부족해요' : '사진을 저장하지 못했어요');
  }
  d.loading--; renderPhotos(); saveDraftLocal();
}
async function onAddPhoto() {
  if (!NATIVE) { const inp = $('#phin'); if (inp) inp.click(); return; }
  const i = await sheet(['사진 찍기', '앨범에서 고르기']);
  try {
    if (i === 0) {
      const r = await Camera.takePhoto({ quality: 85 });
      if (r && r.webPath) addPhotoBlob(await (await fetch(r.webPath)).blob());
    } else if (i === 1) {
      const { results } = await Camera.chooseFromGallery({ mediaType: MediaTypeSelection.Photo, allowMultipleSelection: true, limit: 6 });
      for (const r of results || []) if (r.webPath) await addPhotoBlob(await (await fetch(r.webPath)).blob());
    }
  } catch (e) {
    const msg = String((e && e.message) || '').toLowerCase();
    if (!/cancel|취소/.test(msg)) toast('사진을 가져오지 못했어요. 카메라 권한을 확인해 주세요');
  }
}
function renderPhotos() {
  const box = $('#photos'); if (!box || !state.draft) return;
  const d = state.draft;
  box.innerHTML = d.photos.map((p, i) => '<div class="ph"><img alt="현장 사진" data-pid="' + esc(p) + '"><button class="x" data-del="' + i + '" aria-label="사진 빼기">×</button></div>').join('') +
    (d.loading ? '<div class="ph loading"></div>' : '') +
    '<button class="addph" id="addph">' + ICON.cam + '<span>사진 추가</span></button>' +
    (NATIVE ? '' : '<input type="file" accept="image/*" multiple id="phin" style="display:none">');
  hydrate(box);
  box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { d.photos.splice(+b.dataset.del, 1); state.dirty = true; renderPhotos(); saveDraftLocal(); });
  $('#addph').onclick = onAddPhoto;
  const inp = $('#phin'); if (inp) inp.onchange = async e => { for (const f of Array.from(e.target.files || [])) await addPhotoBlob(f); e.target.value = ''; };
}
function showPhoto(pid) {
  photoURL(pid).then(u => {
    if (!u) return;
    const o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = '<img alt="현장 사진">'; o.querySelector('img').src = u;
    const close = () => { o.remove(); closeTop = null; };
    o.onclick = close; closeTop = close; document.body.appendChild(o);
  });
}

/* ---------------- similar faults (on-device, 0원) ---------------- */
const STOP = new Set(['그리고', '그래서', '그냥', '있음', '없음', '했음', '안됨', '됐음', '해서', '했고', '있고', '없고', '현장', '고객', '장비']);
function toks(s) {
  return (s || '').toLowerCase().replace(/[^\p{L}\p{N}\s\-]/gu, ' ').split(/\s+/)
    .map(w => w.length > 2 ? w.replace(/(에서|으로|에게|까지|부터|하고|이랑|은|는|이|가|을|를|에|로|도|만|과|와|의)$/, '') : w)
    .filter(w => w.length >= 2 && !STOP.has(w));
}
function overlap(a, b) { const B = new Set(b); let n = 0; new Set(a).forEach(w => { if (B.has(w)) n++; }); return n; }
function similar(note, k) {
  const e = toks(note.equip), s = toks(note.symptom), o = toks([note.cause, note.action, note.memo].join(' '));
  const models = e.filter(w => /\d/.test(w));
  return state.notes.filter(n => n.id !== note.id).map(n => {
    const ne = toks(n.equip), ns = toks(n.symptom), no = toks([n.cause, n.action, n.memo].join(' '));
    let sc = overlap(e, ne) * 3 + overlap(s, ns) * 3 + overlap(s, no) + overlap(o, ns) + Math.min(overlap(o, no), 4) * 0.5;
    if (models.length && models.some(m => ne.includes(m))) sc += 4;
    return { n, sc };
  }).filter(x => x.sc >= 3).sort((a, b) => b.sc - a.sc).slice(0, k || 3).map(x => x.n);
}

/* ---------------- backup ---------------- */
function blobToDataURL(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); }); }
async function exportBackup() {
  if (!state.notes.length) { toast('내보낼 기록이 없어요'); return; }
  toast('백업 파일을 만드는 중…');
  const photos = {};
  for (const n of state.notes) for (const p of n.photos || []) { const r = await store.photoGet(p).catch(() => null); if (r && r.blob) photos[p] = await blobToDataURL(r.blob); }
  const json = JSON.stringify({ app: 'gisa-note', version: 1, exportedAt: Date.now(), notes: state.notes, photos });
  const d = new Date(); const name = '기사의노트_백업_' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '.json';
  if (NATIVE) {
    try {
      const w = await Filesystem.writeFile({ path: name, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ title: '기사의 노트 백업', files: [w.uri], dialogTitle: '백업 파일 저장할 곳 선택' });
    } catch (e) { if (!/cancel/i.test(String(e && e.message))) toast('백업 파일을 공유하지 못했어요'); }
  } else {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = name; a.click();
  }
}
async function importBackup(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || data.app !== 'gisa-note' || !Array.isArray(data.notes)) throw new Error('bad');
    let added = 0;
    for (const n of data.notes) {
      if (!n || !n.id || state.notes.some(x => x.id === n.id)) continue;
      for (const p of n.photos || []) { const du = data.photos && data.photos[p]; if (du) await store.photoPut(p, await (await fetch(du)).blob()); }
      await store.put(n); upsertState(n); added++;
    }
    toast(added ? added + '건을 불러왔어요' : '새로 불러올 기록이 없어요');
  } catch (e) { toast('백업 파일을 읽지 못했어요'); }
}

/* ---------------- helpers ---------------- */
function fmt(ts) {
  if (!ts) return ''; const d = new Date(ts), now = new Date();
  const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  if (d.toDateString() === now.toDateString()) return '오늘 ' + hm;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return '어제 ' + hm;
  return (d.getFullYear() !== now.getFullYear() ? d.getFullYear() + '.' : '') + (d.getMonth() + 1) + '.' + d.getDate() + ' ' + hm;
}
function autosize(el) { if (!el || el.tagName !== 'TEXTAREA') return; el.style.height = 'auto'; el.style.height = (el.scrollHeight + 2) + 'px'; }
function titleOf(n) { return (n.equip || '').trim() || '장비 미입력'; }
function onDraftInput(k, v) { if (!state.draft) return; state.draft[k] = v; state.dirty = true; saveDraftLocal(); }

/* ---------------- navigation ---------------- */
let leaveEdit = null;
function rerender() { if (state.view === 'list') viewList(); else if (state.view === 'detail') viewDetail(); else if (state.view === 'settings') viewSettings(); }
function go(view, id) {
  if (state.view === 'edit' && (sr.want || sr.active)) speechStop();
  state.view = view; state.detailId = id || null; window.scrollTo(0, 0);
  if (view === 'edit') viewEdit(id); else rerender();
}
async function onBack() {
  if (closeTop) { closeTop(); return; }
  if (state.view === 'edit' && leaveEdit) { leaveEdit(); return; }
  if (state.view === 'detail' || state.view === 'settings') { go('list'); return; }
  if (state.q) { state.q = ''; viewList(); return; }
  if (NATIVE) App.minimizeApp().catch(() => App.exitApp());
}

/* ---------------- views ---------------- */
function renderFab() {
  let f = $('#fab');
  if (state.view !== 'list') { if (f) f.remove(); return; }
  if (!f) { f = document.createElement('button'); f.id = 'fab'; f.className = 'fab'; f.innerHTML = ICON.plus + '새 기록'; f.onclick = () => go('edit'); document.body.appendChild(f); }
}
function viewList() {
  renderFab();
  const open = state.notes.filter(n => !n.resolved).length, done = state.notes.length - open;
  app.innerHTML = '<div class="search"><input id="q" type="search" placeholder="장비, 모델명, 증상으로 찾기" value="' + esc(state.q) + '" autocomplete="off">' +
    '<div class="chips">' + [['all', '전체', state.notes.length], ['open', '미해결', open], ['done', '해결', done]].map(([k, l, n]) => '<button class="chip' + (state.filter === k ? ' on' : '') + '" data-f="' + k + '">' + l + '<span class="n">' + n + '</span></button>').join('') + '</div></div>' +
    '<div id="items"></div>';
  $('#q').oninput = e => { state.q = e.target.value; renderItems(); };
  app.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { state.filter = b.dataset.f; viewList(); });
  renderItems();
}
function renderItems() {
  const box = $('#items'); if (!box) return;
  if (!state.loaded) { box.innerHTML = '<div class="empty">기록을 불러오는 중…</div>'; return; }
  if (!state.notes.length) {
    box.innerHTML = '<div class="empty"><h2>첫 기록을 남겨보세요</h2>현장에서 말로 남기면 다음에 같은 고장을 바로 찾을 수 있어요.' +
      '<div class="steps"><ol><li><b>+ 새 기록</b>을 누르고</li><li>마이크를 눌러 장비·증상·원인·조치를 말하고</li><li>사진을 찍은 뒤 <b>칸으로 나누기</b> → <b>저장</b></li></ol></div></div>';
    return;
  }
  let items = state.notes.filter(n => state.filter === 'all' || (state.filter === 'open' ? !n.resolved : !!n.resolved));
  const q = state.q.trim().toLowerCase();
  if (q) { const qt = q.split(/\s+/); items = items.filter(n => { const h = [n.equip, n.symptom, n.cause, n.action, n.site, n.memo].join(' ').toLowerCase(); return qt.every(t => h.includes(t)); }); }
  if (!items.length) { box.innerHTML = '<div class="empty">' + (q ? '"' + esc(state.q) + '"에 맞는 기록이 없어요' : '해당하는 기록이 없어요') + '</div>'; return; }
  box.innerHTML = (q ? '<div class="count">' + items.length + '건 찾음</div>' : '') + items.map(n =>
    '<button class="card' + (n.resolved ? ' done' : '') + '" data-id="' + esc(n.id) + '"><h3>' + esc(titleOf(n)) + '</h3>' +
    '<div class="sym">' + esc(n.symptom || n.memo || '') + '</div>' +
    '<div class="meta"><span class="pill ' + (n.resolved ? 'done">해결' : 'open">미해결') + '</span><span>' + esc(fmt(n.createdAt)) + '</span>' +
    (n.site ? '<span>' + esc(n.site.length > 16 ? n.site.slice(0, 16) + '…' : n.site) + '</span>' : '') +
    ((n.photos && n.photos.length) ? '<span class="ico">' + ICON.photo + n.photos.length + '</span>' : '') + '</div></button>').join('');
  box.querySelectorAll('[data-id]').forEach(b => b.onclick = () => go('detail', b.dataset.id));
}

function viewDetail() {
  renderFab();
  const n = state.notes.find(x => x.id === state.detailId);
  if (!n) { go('list'); return; }
  const sims = similar(n, 3);
  const dd = v => v && String(v).trim() ? '<dd>' + esc(v) + '</dd>' : '<dd class="none">없음</dd>';
  app.innerHTML = '<div class="bar"><button class="back" id="bk">' + ICON.back + '목록</button><span class="grow"></span><button class="btn" id="ed" style="height:40px">수정</button></div>' +
    '<div class="section"><h1 class="dtitle">' + esc(titleOf(n)) + '</h1>' +
    '<div class="meta" style="margin:0 0 12px"><span>' + esc(fmt(n.createdAt)) + '</span>' + (n.updatedAt && n.updatedAt - n.createdAt > 60000 ? '<span>수정 ' + esc(fmt(n.updatedAt)) + '</span>' : '') + '</div>' +
    '<div class="seg" id="seg"></div>' +
    '<dl class="dl" style="margin-top:14px"><dt>증상</dt>' + dd(n.symptom) + '<dt>원인</dt>' + dd(n.cause) + '<dt>조치</dt>' + dd(n.action) + '<dt>현장 · 고객</dt>' + dd(n.site) + '</dl>' +
    ((n.photos && n.photos.length) ? '<div class="photos">' + n.photos.map(p => '<button class="ph" data-open="' + esc(p) + '"><img alt="현장 사진" data-pid="' + esc(p) + '"></button>').join('') + '</div>' : '') +
    '</div>' +
    '<div class="section"><p class="label">비슷한 고장 기록</p>' + (sims.length ? sims.map(s => '<button class="sim" data-id="' + esc(s.id) + '"><b>' + esc(titleOf(s)) + '</b><span>' + esc((s.symptom || '').slice(0, 40)) + (s.action ? ' → ' + esc(s.action.slice(0, 40)) : '') + '</span></button>').join('') : '<div class="hint" style="margin:0">아직 비슷한 기록이 없어요. 기록이 쌓이면 여기에 나와요.</div>') + '</div>' +
    (n.memo ? '<div class="section"><details><summary>말한 원문 보기</summary><div class="raw" style="margin-top:8px">' + esc(n.memo) + '</div></details></div>' : '') +
    '<button class="btn danger block" id="dl">기록 삭제</button>';
  hydrate(app);
  const seg = $('#seg');
  const drawSeg = () => {
    seg.innerHTML = '<button class="open' + (!n.resolved ? ' on' : '') + '" data-r="0">미해결</button><button class="done' + (n.resolved ? ' on' : '') + '" data-r="1">해결</button>';
    seg.querySelectorAll('[data-r]').forEach(b => b.onclick = async () => {
      const r = b.dataset.r === '1'; if (r === !!n.resolved) return;
      const upd = { ...n, resolved: r, updatedAt: Date.now() };
      try { await store.put(upd); Object.assign(n, upd); upsertState(n); drawSeg(); toast(r ? '해결로 바꿨어요' : '미해결로 바꿨어요'); } catch (e) { toast('저장하지 못했어요'); }
    });
  };
  drawSeg();
  $('#bk').onclick = () => go('list');
  $('#ed').onclick = () => go('edit', n.id);
  app.querySelectorAll('[data-open]').forEach(b => b.onclick = () => showPhoto(b.dataset.open));
  app.querySelectorAll('.sim[data-id]').forEach(b => b.onclick = () => go('detail', b.dataset.id));
  $('#dl').onclick = async () => {
    if (!(await ask('이 기록을 삭제할까요? 사진도 함께 지워지고 되돌릴 수 없어요.', '삭제', true))) return;
    try { await store.del(n.id); await deletePhotos(n.photos || []); state.notes = state.notes.filter(x => x.id !== n.id); toast('삭제했어요'); go('list'); } catch (e) { toast('삭제하지 못했어요'); }
  };
}

function viewEdit(id) {
  renderFab();
  const existing = id ? state.notes.find(n => n.id === id) : null;
  let restored = false;
  if (existing) state.draft = JSON.parse(JSON.stringify(existing));
  else {
    const saved = readDraftLocal();
    if (saved && ((saved.memo || '').trim() || FIELDS.some(([k]) => (saved[k] || '').trim()) || (saved.photos || []).length)) { state.draft = saved; restored = true; }
    else state.draft = { memo: '', equip: '', symptom: '', cause: '', action: '', site: '', resolved: false, photos: [] };
  }
  const d = state.draft; d.photos = d.photos || []; d.newPids = restored ? [...d.photos] : []; d.loading = 0;
  const originalPids = existing ? [...(existing.photos || [])] : [];
  state.dirty = restored;
  app.innerHTML = '<div class="bar"><button class="back" id="bk">' + ICON.back + (existing ? '기록' : '목록') + '</button><span class="grow"></span><b>' + (existing ? '기록 수정' : '새 기록') + '</b><span class="grow"></span><span style="width:60px"></span></div>' +
    '<div class="section"><div class="microw"><button class="mic" id="micbtn" aria-label="말하기"></button><div class="mictext" id="mictext"></div></div>' +
    '<textarea id="memo" placeholder="현장에서 본 것, 한 것을 그대로 남기세요.\n예) 장비는 오티스 엘리베이터 GEN2, 증상은 3층에서 문이 안 닫힘, 원인은 도어 센서 오염, 조치는 센서 청소 후 정상">' + esc(d.memo) + '</textarea>' +
    '<div class="interim" id="interim"></div>' +
    '<div class="photos" id="photos"></div></div>' +
    '<div class="section"><button class="btn accent block" id="splitbtn">' + ICON.split + ' 메모를 칸으로 나누기</button><div class="hint">"장비는 …, 증상은 …, 원인은 …, 조치는 …"처럼 말하면 아래 칸이 채워져요.</div></div>' +
    '<div class="section">' + FIELDS.map(([k, l]) => '<div class="field"><p class="label">' + l + '</p>' + (k === 'equip' || k === 'site' ? '<input id="f-' + k + '" value="' + esc(d[k]) + '" autocomplete="off">' : '<textarea id="f-' + k + '" rows="1">' + esc(d[k]) + '</textarea>') + '</div>').join('') +
    '<div class="field"><p class="label">상태</p><div class="seg" id="seg"></div></div></div>' +
    '<div class="savebar"><div class="in"><button class="btn" id="cancel">취소</button><button class="btn primary" id="save">저장</button></div></div>';
  $('#memo').oninput = e => { onDraftInput('memo', e.target.value); autosize(e.target); };
  FIELDS.forEach(([k]) => { const el = $('#f-' + k); el.oninput = e => { onDraftInput(k, e.target.value); autosize(e.target); }; autosize(el); });
  autosize($('#memo'));
  $('#micbtn').onclick = onMic; refreshMic();
  $('#splitbtn').onclick = onSplit;
  renderPhotos(); renderSeg();
  leaveEdit = async () => {
    if (d.loading) { toast('사진을 저장하는 중이에요'); return; }
    if (state.dirty && !(await ask('저장하지 않고 나갈까요? 작성한 내용이 사라져요.', '나가기', true))) return;
    await deletePhotos(d.newPids);
    if (!existing) clearDraftLocal();
    state.draft = null; leaveEdit = null; go(existing ? 'detail' : 'list', existing ? existing.id : null);
  };
  $('#bk').onclick = leaveEdit; $('#cancel').onclick = leaveEdit;
  $('#save').onclick = () => onSave(originalPids);
  if (restored) toast('작성 중이던 메모를 불러왔어요');
}
function renderSeg() {
  const seg = $('#seg'); if (!seg || !state.draft) return; const r = !!state.draft.resolved;
  seg.innerHTML = '<button class="open' + (!r ? ' on' : '') + '" data-r="0">미해결</button><button class="done' + (r ? ' on' : '') + '" data-r="1">해결</button>';
  seg.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { state.draft.resolved = b.dataset.r === '1'; state.dirty = true; saveDraftLocal(); renderSeg(); });
}
async function onSave(originalPids) {
  const d = state.draft;
  if (d.loading) { toast('사진을 저장하는 중이에요. 잠시만요'); return; }
  if (sr.want || sr.active) { await speechStop(); await new Promise(r => setTimeout(r, 800)); d.memo = ($('#memo') || {}).value || d.memo; }
  const has = (d.memo || '').trim() || FIELDS.some(([k]) => (d[k] || '').trim()) || d.photos.length;
  if (!has) { toast('메모나 사진을 하나는 남겨주세요'); return; }
  const now = Date.now();
  const note = { id: d.id || newId(), memo: (d.memo || '').trim(), resolved: !!d.resolved, photos: [...d.photos], createdAt: d.createdAt || now, updatedAt: now };
  FIELDS.forEach(([k]) => note[k] = (d[k] || '').trim());
  if (!note.equip && !note.symptom && note.memo) note.symptom = note.memo.slice(0, 80);
  const b = $('#save'); b.disabled = true; b.innerHTML = '<span class="spin"></span> 저장 중';
  try {
    await store.put(note);
    await deletePhotos(originalPids.concat(d.newPids || []).filter(p => !note.photos.includes(p)));
    upsertState(note);
    if (!d.id) clearDraftLocal();
    state.draft = null; state.dirty = false; leaveEdit = null; toast('저장했어요'); go('detail', note.id);
  } catch (e) {
    b.disabled = false; b.textContent = '저장';
    toast(e && e.name === 'QuotaExceededError' ? '폰 저장 공간이 부족해요' : '저장하지 못했어요. 다시 눌러주세요');
  }
}

function viewSettings() {
  renderFab();
  app.innerHTML = '<div class="bar"><button class="back" id="bk">' + ICON.back + '목록</button></div>' +
    '<div class="banner">기록과 사진은 <b>이 폰 안에만</b> 저장돼요. 앱을 지우거나 폰을 바꾸기 전에 꼭 백업해 주세요.</div>' +
    '<button class="set-item" id="exp"><div><b>백업 내보내기</b><span>기록 ' + state.notes.length + '건과 사진을 파일 하나로 저장 (카톡·드라이브로 보내기)</span></div></button>' +
    '<label class="set-item"><div><b>백업 불러오기</b><span>내보낸 백업 파일에서 기록 가져오기</span></div><input type="file" accept="application/json,.json" id="imp"></label>' +
    '<a class="set-item" href="' + PRIVACY_URL + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none"><div><b>개인정보처리방침</b><span>수집하는 정보가 없어요</span></div></a>' +
    '<div class="ver">기사의 노트 ' + VERSION + '</div>';
  $('#bk').onclick = () => go('list');
  $('#exp').onclick = exportBackup;
  $('#imp').onchange = async e => { const f = e.target.files && e.target.files[0]; if (f) await importBackup(f); e.target.value = ''; viewSettings(); };
}

/* ---------------- boot ---------------- */
async function boot() {
  $('#gear').onclick = () => { if (state.view !== 'edit') go('settings'); };
  viewList();
  await loadNotes();
  rerender();
  initSpeech().then(refreshMic);
  if (NATIVE) App.addListener('backButton', onBack);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
}
boot();
