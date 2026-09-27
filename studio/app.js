'use strict';
/* Tuciwood Stüdyo — ürün hikâyesi ve gönderi görseli düzenleyici.
   Her şey tarayıcıda çalışır; tasarımlar ve fotoğraflar bu cihazda saklanır. */

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RAD = Math.PI / 180;

/* ---------- Sabitler ---------- */
const FORMATS = {
  story: { W: 1080, H: 1920, label: 'Hikâye', ratio: '9:16' },
  post: { W: 1080, H: 1350, label: 'Gönderi', ratio: '4:5' },
  tall: { W: 1080, H: 1440, label: 'Gönderi', ratio: '3:4' },
  square: { W: 1080, H: 1080, label: 'Kare', ratio: '1:1' },
};
const FONTS = ['Figtree', 'DM Sans', 'Manrope', 'Montserrat', 'Outfit', 'Playfair Display', 'Fraunces',
  'Cormorant Garamond', 'DM Serif Display', 'Lora', 'Caveat', 'Bebas Neue'];
const SERIF = new Set(['Playfair Display', 'Fraunces', 'Cormorant Garamond', 'DM Serif Display', 'Lora']);
const PAIRS = [
  { id: 'tuci', name: 'Tuciwood', head: 'Figtree', body: 'Figtree' },
  { id: 'zarif', name: 'Zarif', head: 'Cormorant Garamond', body: 'Figtree' },
  { id: 'klasik', name: 'Klasik', head: 'Playfair Display', body: 'DM Sans' },
  { id: 'sicak', name: 'Sıcak', head: 'Fraunces', body: 'Manrope' },
  { id: 'dergi', name: 'Dergi', head: 'DM Serif Display', body: 'Outfit' },
  { id: 'modern', name: 'Modern', head: 'Montserrat', body: 'Montserrat' },
  { id: 'poster', name: 'Poster', head: 'Bebas Neue', body: 'DM Sans' },
  { id: 'el', name: 'El yazısı', head: 'Caveat', body: 'DM Sans' },
];
const TOKEN_NAMES = { bg1: 'Zemin üst', bg2: 'Zemin alt', ink: 'Yazı', sub: 'Soluk yazı', accent: 'Vurgu', accent2: 'Vurgu 2', paper: 'Kâğıt', dark: 'Koyu', cream: 'Açık' };
const THEMES = [
  { id: 'keten', name: 'Keten', bg1: '#DDD3C9', bg2: '#CFC0B3', ink: '#2A2320', sub: '#5C514A', accent: '#A94F2E', accent2: '#D97757', paper: '#F6F1EA', dark: '#2A2320', dark2: '#1A1513', cream: '#F3ECE4' },
  { id: 'kum', name: 'Kum', bg1: '#ECE3D4', bg2: '#DFD0B9', ink: '#2B2621', sub: '#6B5E50', accent: '#8A5A2B', accent2: '#C99A5B', paper: '#FBF7F0', dark: '#2E2923', dark2: '#1D1915', cream: '#F7F0E4' },
  { id: 'zeytin', name: 'Zeytin', bg1: '#DEDFCF', bg2: '#CACCB6', ink: '#23261E', sub: '#545A48', accent: '#5F6B3A', accent2: '#A3AE72', paper: '#F4F3EA', dark: '#262A20', dark2: '#171A13', cream: '#EEF0E4' },
  { id: 'deniz', name: 'Gece mavisi', bg1: '#DADFE4', bg2: '#C6CDD5', ink: '#1F2630', sub: '#505B69', accent: '#2F4F75', accent2: '#7597C0', paper: '#F4F6F8', dark: '#1C2330', dark2: '#10151E', cream: '#E9EEF4' },
  { id: 'gul', name: 'Gül kurusu', bg1: '#EBDAD4', bg2: '#DDC5BD', ink: '#2E2224', sub: '#6A5256', accent: '#9C4A5A', accent2: '#D48C95', paper: '#FBF3F1', dark: '#2E2224', dark2: '#1C1415', cream: '#F7ECEA' },
  { id: 'ceviz', name: 'Ceviz', bg1: '#D6C8B8', bg2: '#C0AC97', ink: '#261C16', sub: '#5A4A3E', accent: '#6E3B1F', accent2: '#B77A4E', paper: '#F5EEE6', dark: '#2B1F18', dark2: '#1A120D', cream: '#F2E8DD' },
  { id: 'kul', name: 'Kül', bg1: '#E4E2DF', bg2: '#D2CFCA', ink: '#1F1E1D', sub: '#5D5A56', accent: '#1F1E1D', accent2: '#B9A58C', paper: '#FAF9F7', dark: '#1F1E1D', dark2: '#121211', cream: '#F2F0ED' },
  { id: 'hardal', name: 'Hardal', bg1: '#E8DCC2', bg2: '#D9C7A2', ink: '#2A2418', sub: '#65593F', accent: '#A8741A', accent2: '#D9A441', paper: '#FBF6EA', dark: '#2A2418', dark2: '#18140C', cream: '#F7EFDC' },
];
const TOKEN_LIST = ['Ad', 'Vurgu', 'Etiket', 'Marka', 'Ölçü', 'Çap', 'Genişlik', 'Derinlik', 'Yükseklik', 'Fiyat', 'EskiFiyat',
  'ÖzelFiyat', 'FiyatBaşlık', 'İndirim', 'Kargo', 'Sipariş', 'Malzeme', 'Yüzey', 'Üretim', 'Garanti',
  'Detay 1', 'Detay 1 alt', 'Detay 2', 'Detay 2 alt', 'Detay 3', 'Detay 3 alt', 'Detay 4', 'Detay 4 alt'];

const DEFAULT_FIELDS = {
  marka: 'tuciwood', ad: 'Cem', vurgu: 'sehpa', etiket: 'Masif kayın',
  olcuTip: 'yuvarlak', olcuStil: 'kisa', cap: '00', gen: '', der: '', yuk: '00', birim: 'cm', olcuSerbest: '',
  fiyat: '0.000 TL', eski: '', indirim: '', ozel: '', kargo: false, kargoMetin: 'Ücretsiz kargo',
  siparis: 'dm', dmMetin: 'Sipariş için DM →', web: '', wa: '', siparisOzel: '',
  malzeme: 'Masif kayın', yuzey: 'Doğal yağ', uretim: 'El işçiliği', garanti: '2 yıl garanti',
  d: [{ t: 'masif kayın', s: 'baştan sona ağaç' }, { t: 'doğal yağ', s: 'VOC içermez' }, { t: 'el işçiliği', s: '2 yıl garanti' }, { t: '', s: '' }],
};

/* ---------- Öğe üreticileri ---------- */
let uidN = 0;
const nid = () => 'e' + Date.now().toString(36) + (uidN++).toString(36);
const Tx = o => Object.assign({ id: nid(), type: 'text', name: 'Yazı', x: 0, y: 0, w: 400, rot: 0, op: 1, text: '', font: 'body', size: 32, weight: 400,
  italic: false, underline: false, strike: false, upper: false, ls: 0, lh: 1.2, align: 'left', color: 'ink', accent: 'accent',
  first: null, box: null, hug: false, fit: false, tshadow: false }, o);
const Rc = o => Object.assign({ id: nid(), type: 'rect', name: 'Şekil', x: 0, y: 0, w: 200, h: 200, rot: 0, op: 1, shape: 'rect', r: 0,
  fill: 'paper', stroke: '', sw: 2, shadow: false, showIf: '' }, o);
const Ph = o => Object.assign({ id: nid(), type: 'photo', name: 'Fotoğraf', x: 0, y: 0, w: 600, h: 600, rot: 0, op: 1, src: 'photo', follow: '',
  shape: 'rect', r: 0, zoom: 1, fx: 0.5, fy: 0.5, border: 0, bcolor: 'paper', shadow: false }, o);
const Ln = o => Object.assign({ id: nid(), type: 'line', name: 'Çizgi', x: 0, y: 0, x2: 200, y2: 0, op: 1, color: 'ink', lw: 2,
  cap1: 'none', cap2: 'none', label: '', lsize: 30, font: 'body' }, o);

function rotAbout(el, px, py, deg, h) {
  const hh = h ?? el.h ?? 0;
  const cx = el.x + el.w / 2, cy = el.y + hh / 2;
  const a = deg * RAD, dx = cx - px, dy = cy - py;
  const nx = px + dx * Math.cos(a) - dy * Math.sin(a), ny = py + dx * Math.sin(a) + dy * Math.cos(a);
  el.x += nx - cx; el.y += ny - cy; el.rot = (el.rot || 0) + deg;
  return el;
}
const rotPt = (x, y, px, py, deg) => { const a = deg * RAD, dx = x - px, dy = y - py; return [px + dx * Math.cos(a) - dy * Math.sin(a), py + dx * Math.sin(a) + dy * Math.cos(a)]; };

/* ---------- Şablonlar ---------- */
function lay(fmt) {
  const { W, H } = FORMATS[fmt]; const story = fmt === 'story';
  const top = story ? 250 : 84, bot = story ? 1670 : H - 84;
  return { W, H, story, top, bot, m: 72, A: bot - top, T: Math.max(0.64, Math.min(1, (bot - top) / 1420)) };
}
function fadePhoto(L, scale = 1) {
  const P = Math.min(1300, (L.A - 300) / 0.85) * scale;
  return Ph({ name: 'Fotoğraf', x: (L.W - P) / 2, y: L.top + 80 * (P / 1300), w: P, h: P, shape: 'fade' });
}
function badges(L, x, y, align) {
  const w = 520, bx = align === 'right' ? x - w : x;
  return [
    Tx({ name: 'İndirim rozeti', text: '{İndirim}', x: bx, y, w, align, hug: true, size: 28, weight: 700, color: 'cream', box: { fill: 'accent', px: 22, py: 10, r: 999, shadow: false } }),
    Tx({ name: 'Kargo rozeti', text: '{Kargo}', x: bx, y: y + 64, w, align, hug: true, size: 28, weight: 700, color: 'dark', box: { fill: 'paper', px: 22, py: 10, r: 999, shadow: false } }),
  ];
}
const PRICE_LINE = '{ÖzelFiyat} ~~{EskiFiyat}~~ **{Fiyat}**';

const TEMPLATES = [
  { id: 'isaret', name: 'İşaretli detay', bg: { type: 'linear', auto: true }, build(L) {
    const ph = fadePhoto(L), P = ph.w, k = P / 1300, f = (a, b) => [ph.x + a * P, ph.y + b * P];
    const els = [ph];
    const ts = Math.max(24, 32 * Math.min(1, k * 1.1));
    [[.515, .33, .515, .177, 'center'], [.765, .415, .823, .523, 'right'], [.269, .731, .177, .769, 'left']].forEach(([a, b, c, d, al], i) => {
      const n = i + 1, [dx, dy] = f(a, b), [lx, ly] = f(c, d), w = 420, above = ly < dy, hEst = ts * 1.25 * 2;
      const x = al === 'center' ? lx - w / 2 : al === 'right' ? Math.min(lx + 48, L.W - 60) - w : Math.max(lx - 48, 60);
      els.push(Ln({ name: 'İşaret ' + n, x: dx, y: dy, x2: lx, y2: ly, cap1: 'dot' }));
      els.push(Tx({ name: 'Detay ' + n, text: `{Detay ${n}}\n{Detay ${n} alt}`, x, y: above ? ly - 14 - hEst : ly + 14, w, align: al, size: ts, lh: 1.25, color: 'sub', first: { weight: 700, color: 'ink' } }));
    });
    const tS = 150 * L.T, infoY = L.bot - 72;
    els.push(Tx({ name: 'Üst etiket', text: '{Marka} · {Etiket}', x: L.m, y: L.top, w: 640, size: 28, weight: 700, upper: true, ls: 0.14, color: 'accent' }));
    els.push(...badges(L, L.W - L.m, L.top - 8, 'right'));
    els.push(Tx({ name: 'Başlık', text: '{Ad} [{Vurgu}]', font: 'head', x: L.m, y: infoY - 22 - tS, w: L.W - 2 * L.m, size: tS, lh: 1, ls: -0.04, fit: true }));
    els.push(Tx({ name: 'Bilgi satırı', text: '{Ölçü} | ' + PRICE_LINE, x: L.m, y: infoY, w: L.W - 2 * L.m, size: 34 * Math.max(.85, L.T) }));
    els.push(Tx({ name: 'Sipariş', text: '{Sipariş}', x: L.m, y: L.bot - 12, w: L.W - 2 * L.m, size: 28, weight: 700, color: 'accent' }));
    return els;
  } },
  { id: 'cikartma', name: 'Çıkartmalar', bg: { type: 'linear', auto: true }, build(L) {
    const ph = fadePhoto(L), P = ph.w, T = L.T, els = [ph];
    els.push(Tx({ name: 'Başlık etiketi', text: '{Etiket}\n{Ad} {Vurgu}', font: 'head', x: L.m, y: L.top + 10, w: 900, hug: true, size: 84 * T, weight: 800, ls: -0.02, lh: 1.05,
      color: 'cream', first: { size: 26 * T, weight: 700, upper: true, ls: 0.1, color: 'accent2', font: 'body' }, box: { fill: 'dark', px: 36, py: 22, r: 28, shadow: true }, rot: -3 }));
    [['{Malzeme}', 'right', .177, 4], ['{Ölçü}', 'left', .6, -5], ['{Yüzey}', 'right', .654, 3], ['{Garanti}', 'left', .77, 2]].forEach(([t, al, fy, r], i) => {
      const w = 640, x = al === 'right' ? L.W - 70 - w : (i === 3 ? 110 : 60);
      els.push(Tx({ name: 'Çıkartma ' + (i + 1), text: t, x, y: ph.y + fy * P, w, align: al, hug: true, size: 32 * Math.max(.85, T), weight: 700, color: 'dark', box: { fill: 'paper', px: 26, py: 14, r: 22, shadow: true }, rot: r }));
    });
    els.push(Tx({ name: 'Fiyat etiketi', text: '{FiyatBaşlık}  ~~{EskiFiyat}~~\n{Fiyat}', x: L.W - L.m - 760, y: L.bot - 215 * T, w: 760, align: 'right', hug: true, size: 84 * T, weight: 800, ls: -0.02, lh: 1.05,
      color: 'dark', first: { size: 26 * T, weight: 700, upper: true, ls: 0.08 }, box: { fill: 'accent2', px: 38, py: 22, r: 30, shadow: true }, rot: -4 }));
    els.push(...badges(L, L.m, L.bot - 200 * T - 70, 'left'));
    els.push(Tx({ name: 'Sipariş', text: '{Sipariş}', x: L.m, y: L.bot - 40, w: 620, size: 30, weight: 700 }));
    return els;
  } },
  { id: 'buyuk', name: 'Büyük harf', bg: { type: 'linear', auto: true }, build(L) {
    const ph = fadePhoto(L, 0.92), k = ph.w / 1300, T = L.T;
    const els = [ph,
      Tx({ name: 'Büyük yazı', text: '{Ad}', font: 'head', x: 40, y: ph.y + 20 * k, w: L.W - 80, align: 'center', size: 400 * k, weight: 800, upper: true, ls: -0.04, lh: 1, fit: true, color: 'accent', op: 0.85 }),
      Ph({ name: 'Dekupe ürün', src: 'cut', follow: ph.id, x: ph.x, y: ph.y, w: ph.w, h: ph.h }),
      Tx({ name: 'Marka', text: '{Marka}', x: 0, y: L.top, w: L.W, align: 'center', size: 30, weight: 800 }),
      ...badges(L, L.W - L.m, L.top - 8, 'right'),
      Tx({ name: 'Etiket', text: '{Etiket} {Vurgu}', x: 0, y: L.bot - 150 * Math.max(.8, T), w: L.W, align: 'center', size: 30, weight: 700, upper: true, ls: 0.3, color: 'accent' }),
      Tx({ name: 'Bilgi satırı', text: '{Ölçü} · {Yüzey} · ' + PRICE_LINE, x: 40, y: L.bot - 95 * Math.max(.8, T), w: L.W - 80, align: 'center', size: 34 * Math.max(.85, T) }),
      Tx({ name: 'Sipariş', text: '{Sipariş}', x: 0, y: L.bot - 36, w: L.W, align: 'center', size: 28, weight: 700, color: 'accent' }),
    ];
    return els;
  } },
  { id: 'polaroid', name: 'Polaroid', bg: { type: 'solid', auto: false }, build(L) {
    const k = Math.min(1, (L.A - 140) / 1300);
    const cw = 860 * k, pw = 780 * k, phh = 800 * k, pad = 40 * k, capS = 64 * k, subS = 28 * Math.max(.85, k);
    const x0 = (L.W - cw) / 2, y0 = L.top + 80 * k;
    const ch = pad + phh + 34 * k + capS + 14 * k + subS * 1.25 + 46 * k;
    const px = x0 + cw / 2, py = y0 + ch / 2;
    const card = Rc({ name: 'Polaroid kartı', x: x0, y: y0, w: cw, h: ch, fill: '#FFFFFF', shadow: true });
    const photo = Ph({ name: 'Fotoğraf', x: x0 + pad, y: y0 + pad, w: pw, h: phh, zoom: 1.25, fx: 0.5, fy: 0.52 });
    const cap = Tx({ name: 'Ürün adı', text: '{Ad} [{Vurgu}]', font: 'head', x: x0 + pad, y: y0 + pad + phh + 34 * k, w: pw, size: capS, lh: 1, ls: -0.02, color: 'dark', fit: true });
    const sub = Tx({ name: 'Alt yazı', text: '{Malzeme} · {Üretim} · {Yüzey}', x: x0 + pad, y: cap.y + capS + 14 * k, w: pw, size: subS, color: 'sub' });
    rotAbout(card, px, py, -3); rotAbout(photo, px, py, -3); rotAbout(cap, px, py, -3, capS); rotAbout(sub, px, py, -3, subS * 1.2);
    const tw = 430 * k, th = 330 * k;
    const tx = L.W - 56 - tw, ty = Math.min(y0 + ch - 40 * k, L.bot - th - 10);
    const tcx = tx + tw / 2, tcy = ty + th / 2;
    const tag = Rc({ name: 'Fiyat etiketi', x: tx, y: ty, w: tw, h: th, shape: 'tag', fill: 'accent2', shadow: true });
    const price = Tx({ name: 'Fiyat', text: '{FiyatBaşlık}  ~~{EskiFiyat}~~\n{Fiyat}', x: tx + 40 * k, y: ty + 62 * k, w: tw - 80 * k, size: 70 * k, weight: 800, ls: -0.02, lh: 1.1, color: 'dark', fit: true, first: { size: 24 * k, weight: 700, upper: true, ls: 0.12 } });
    const size = Tx({ name: 'Ölçü', text: '{Ölçü}', x: tx + 40 * k, y: ty + th - 72 * k, w: tw - 80 * k, size: 30 * k, weight: 600, color: 'dark', fit: true });
    rotAbout(tag, tcx, tcy, 7); rotAbout(price, tcx, tcy, 7, 110 * k); rotAbout(size, tcx, tcy, 7, 36 * k);
    const [hx, hy] = rotPt(tcx, ty + 27 * k, tcx, tcy, 7);
    const str = Ln({ name: 'İp', x: hx + 40 * k, y: hy - 150 * k, x2: hx, y2: hy, color: 'dark', lw: 3 });
    return [
      Tx({ name: 'Marka', text: '{Marka}', x: L.m, y: L.top - 10, w: 500, size: 30, weight: 800 }),
      card, photo, cap, sub, str, tag, price, size,
      ...badges(L, L.m, L.bot - 170, 'left'),
      Tx({ name: 'Sipariş', text: '{Sipariş}', x: L.m, y: L.bot - 36, w: 520, size: 28, weight: 700, color: 'accent' }),
    ];
  } },
  { id: 'kemer', name: 'Koyu kemer', bg: { type: 'radial', auto: false, c1: 'dark', c2: 'dark2' }, build(L) {
    const T = L.T, aw = L.W - 200, ah = Math.max(420, L.A - 90 - 330 * T);
    const arch = Ph({ name: 'Fotoğraf', x: 100, y: L.top + 90, w: aw, h: ah, shape: 'arch', r: 32, zoom: 1.25, fx: 0.5, fy: 0.406, shadow: true });
    const tS = 150 * T, ty = arch.y + ah + 40 * T;
    return [
      Tx({ name: 'Marka', text: '{Marka}', x: L.m, y: L.top, w: 500, size: 30, weight: 800, color: 'cream' }),
      Tx({ name: 'Etiket', text: '{Etiket}', x: L.W - L.m - 520, y: L.top + 4, w: 520, align: 'right', size: 24, weight: 700, upper: true, ls: 0.18, color: 'accent2' }),
      arch,
      ...badges(L, L.W - 120, arch.y + ah - 150, 'right'),
      Tx({ name: 'Başlık', text: '{Ad} [{Vurgu}]', font: 'head', x: L.m, y: ty, w: L.W - 2 * L.m, size: tS, lh: 1, ls: -0.04, fit: true, color: 'cream', accent: 'accent2' }),
      Tx({ name: 'Bilgi satırı', text: '{Malzeme} · {Ölçü} · ' + PRICE_LINE, x: L.m, y: ty + tS + 24 * T, w: L.W - 2 * L.m, size: 30 * Math.max(.85, T), color: 'cream', op: 0.88 }),
      Tx({ name: 'Sipariş', text: '{Sipariş}', x: L.m, y: ty + tS + 24 * T + 58, w: 620, size: 28, weight: 700, color: 'accent2' }),
    ];
  } },
  { id: 'doku', name: 'Yakın çekim', bg: { type: 'solid', auto: false, c1: 'paper' }, build(L) {
    const T = L.T, th = Math.round(L.H * 0.51), s = 440 * T;
    const tex = Ph({ name: 'Doku', x: 0, y: 0, w: L.W, h: th, zoom: 3.15, fx: 0.497, fy: 0.409 });
    const inset = Ph({ name: 'Fotoğraf', x: L.W - L.m - s, y: th - 220 * T, w: s, h: s, zoom: 1.15, fx: 0.5, fy: 0.52, border: 14, bcolor: 'paper', shadow: true });
    const hS = 92 * T, bS = 32 * Math.max(.85, T), iS = 34 * Math.max(.85, T);
    let y = inset.y + s + 50 * T;
    const head = Tx({ name: 'Başlık', text: 'Her lifi\ngerçek ahşap.', font: 'head', x: L.m, y, w: L.W - 2 * L.m, size: hS, lh: 1.04, ls: -0.03 });
    y += hS * 1.04 * 2 + 24 * T;
    const body = Tx({ name: 'Açıklama', text: '{Ad} {Vurgu} · {Malzeme} · {Üretim} · {Yüzey}', x: L.m, y, w: L.W - 2 * L.m, size: bS, color: 'sub' });
    y += bS * 1.3 + 22 * T;
    const info = Tx({ name: 'Bilgi satırı', text: '{Ölçü} | ' + PRICE_LINE, x: L.m, y, w: L.W - 2 * L.m, size: iS });
    y += iS * 1.3 + 14 * T;
    return [tex, inset,
      Tx({ name: 'Marka', text: '{Marka}', x: L.m, y: L.top, w: 500, size: 30, weight: 800, color: 'cream', tshadow: true }),
      ...badges(L, L.W - L.m, L.top - 8, 'right'),
      Tx({ name: 'Üst etiket', text: 'Yakından bakın', x: L.m, y: th + 56 * T, w: L.W - 2 * L.m - s - 40, size: 26, weight: 700, upper: true, ls: 0.14, color: 'accent' }),
      head, body, info,
      Tx({ name: 'Sipariş', text: '{Sipariş}', x: L.m, y, w: 620, size: 28, weight: 700, color: 'accent' }),
    ];
  } },
  { id: 'galeri', name: 'Galeri çerçevesi', bg: { type: 'linear', auto: true }, build(L) {
    const ph = fadePhoto(L, 0.9), T = L.T;
    const vS = 40 * T, vh = vS * 1.2, vw = Math.max(400, L.A - 380 * T), cx = 92 + vh / 2, cy = L.bot - 40 - vw / 2;
    const priceS = 72 * T, ctaY = L.bot - 36, priceY = ctaY - 22 - priceS * 1.05 - 26 * 1.3, detY = priceY - 14 - 28 * 1.5 * 2;
    return [ph,
      Rc({ name: 'Çerçeve', x: 48, y: L.top - 24, w: L.W - 96, h: L.bot - L.top + 48, fill: '', stroke: 'ink', sw: 2, op: 0.55 }),
      Tx({ name: 'Marka', text: '{Marka}', x: 92, y: L.top + 26, w: 460, size: 30, weight: 800 }),
      Tx({ name: 'Etiket', text: '{Etiket}', x: L.W - 92 - 460, y: L.top + 32, w: 460, align: 'right', size: 24, weight: 600, upper: true, ls: 0.14, color: 'sub' }),
      ...badges(L, L.W - 92, L.top + 86, 'right'),
      Tx({ name: 'Dikey ad', text: '{Ad} {Vurgu}', x: cx - vw / 2, y: cy - vh / 2, w: vw, size: vS, weight: 700, upper: true, ls: 0.5, rot: -90 }),
      Tx({ name: 'Özellikler', text: '{Üretim} · {Yüzey}\n{Ölçü}', x: L.W - 92 - 700, y: detY, w: 700, align: 'right', size: 28, lh: 1.5, color: 'sub' }),
      Tx({ name: 'Fiyat', text: '{ÖzelFiyat}  ~~{EskiFiyat}~~\n{Fiyat}', x: L.W - 92 - 700, y: priceY, w: 700, align: 'right', size: priceS, weight: 800, ls: -0.02, lh: 1.05, first: { size: 26, weight: 600, color: 'sub' } }),
      Tx({ name: 'Sipariş', text: '{Sipariş}', x: L.W - 92 - 700, y: ctaY, w: 700, align: 'right', size: 26, weight: 700, color: 'accent' }),
    ];
  } },
];
const tplById = id => TEMPLATES.find(t => t.id === id) || TEMPLATES[0];

/* ---------- Belge ---------- */
function newDoc(tplId = 'isaret', fmt = 'story', base) {
  const t = tplById(tplId);
  const d = {
    v: 1, tpl: t.id, fmt,
    theme: clone(base?.theme || THEMES[0]), fonts: clone(base?.fonts || { head: 'Figtree', body: 'Figtree' }),
    f: clone(base?.f || DEFAULT_FIELDS), photo: base?.photo || 'sample', cutTol: base?.cutTol ?? 60,
    auto: base?.auto || { c1: '#DDD3C9', c2: '#CFC0B3' },
    bg: Object.assign({ type: 'linear', auto: true, c1: 'bg1', c2: 'bg2' }, t.bg),
    els: t.build(lay(fmt)),
  };
  return d;
}

let doc = null;
let sel = [];
const ui = { tab: 'tpl', guides: true, safe: true, multi: false, crop: false };

/* ---------- Bilgiler → yazı parçaları ---------- */
const nm = v => String(v ?? '').trim();
function num(v) { const c = nm(v).replace(/\s|TL|₺/gi, ''); if (!/^\d[\d.]*(,\d+)?$/.test(c)) return NaN; return parseFloat(c.replace(/\./g, '').replace(',', '.')); }
function money(v) { const s = nm(v); if (!s) return ''; const n = num(s); if (!isNaN(n) && n > 0) return n.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' TL'; return s; }
function sizeText(f) {
  const u = nm(f.birim) || 'cm';
  if (f.olcuTip === 'serbest') return nm(f.olcuSerbest);
  let parts = f.olcuTip === 'yuvarlak' ? [[nm(f.cap), 'Ø', 'Çap'], [nm(f.yuk), 'Y', 'Yükseklik']]
    : [[nm(f.gen), 'G', 'Genişlik'], [nm(f.der), 'D', 'Derinlik'], [nm(f.yuk), 'Y', 'Yükseklik']];
  parts = parts.filter(p => p[0]);
  if (!parts.length) return '';
  if (f.olcuStil === 'acik') return parts.map(p => `${p[2]} ${p[0]} ${u}`).join(' · ');
  if (f.olcuStil === 'alt') return parts.map(p => `${p[2]} ${p[0]} ${u}`).join('\n');
  return parts.map(p => `${p[1]} ${p[0]}`).join(' × ') + ' ' + u;
}
function tokens(f) {
  const u = nm(f.birim) || 'cm', one = (v, pre = '') => nm(v) ? `${pre}${nm(v)} ${u}` : '';
  const price = money(f.fiyat), old = money(f.eski);
  let disc = nm(f.indirim);
  if (disc && /^%?\s*\d+([.,]\d+)?\s*%?$/.test(disc)) disc = '%' + disc.replace(/[%\s]/g, '') + ' indirim';
  if (!disc) { const a = num(f.eski), b = num(f.fiyat); if (a > 0 && b > 0 && a > b) disc = '%' + Math.round((1 - b / a) * 100) + ' indirim'; }
  const order = { dm: nm(f.dmMetin) || 'Sipariş için DM →', web: nm(f.web) ? `Sipariş: ${nm(f.web)} →` : '', wa: nm(f.wa) ? `WhatsApp: ${nm(f.wa)}` : '', ozel: nm(f.siparisOzel), yok: '' }[f.siparis] ?? '';
  const t = {
    Ad: nm(f.ad), Vurgu: nm(f.vurgu), Etiket: nm(f.etiket), Marka: nm(f.marka), Ölçü: sizeText(f),
    Çap: nm(f.cap) ? `Ø ${nm(f.cap)} ${u}` : '', Genişlik: one(f.gen), Derinlik: one(f.der), Yükseklik: one(f.yuk),
    Fiyat: price, EskiFiyat: old, ÖzelFiyat: nm(f.ozel), FiyatBaşlık: nm(f.ozel) || 'Fiyat', İndirim: disc,
    Kargo: f.kargo ? (nm(f.kargoMetin) || 'Ücretsiz kargo') : '', Sipariş: order,
    Malzeme: nm(f.malzeme), Yüzey: nm(f.yuzey), Üretim: nm(f.uretim), Garanti: nm(f.garanti),
  };
  (f.d || []).forEach((d, i) => { t[`Detay ${i + 1}`] = nm(d.t); t[`Detay ${i + 1} alt`] = nm(d.s); });
  for (let i = 1; i <= 4; i++) { t[`Detay ${i}`] ??= ''; t[`Detay ${i} alt`] ??= ''; }
  return t;
}
const stripMk = s => s.replace(/\*\*|~~|\[|\]/g, '');
function cleanSep(s) {
  const parts = s.split(/(\s+[·|]\s+)/), out = []; let sep = null;
  parts.forEach((p, i) => { if (i % 2) { sep = p; return; } if (stripMk(p).trim()) { if (out.length) out.push(sep); out.push(p); } });
  return out.join('');
}
/* Satırları çözümler; her satır özgün sırasını (i) korur, boş kalan bilgi satırları düşer. */
function resolveLines(text, TK) {
  const res = [];
  String(text).split('\n').forEach((line, i) => {
    const had = /\{[^{}]+\}/.test(line);
    let s = line.replace(/\{([^{}]+)\}/g, (m, k) => (k in TK ? TK[k] : m));
    s.split('\n').forEach(part => {
      let p = cleanSep(part).replace(/~~\s*~~/g, '').replace(/\*\*\s*\*\*/g, '').replace(/\[\s*\]/g, '').replace(/[ \t]{2,}/g, ' ').trim();
      if (had && !stripMk(p).trim()) return;
      res.push({ i, s: p });
    });
  });
  return res;
}
function parseRuns(line) {
  const runs = []; let b = false, a = false, st = false, buf = '';
  const push = () => { if (buf) { runs.push({ t: buf, b, a, st }); buf = ''; } };
  for (let i = 0; i < line.length; i++) {
    const two = line.substr(i, 2);
    if (two === '**') { push(); b = !b; i++; continue; }
    if (two === '~~') { push(); st = !st; i++; continue; }
    const c = line[i];
    if (c === '[') { push(); a = true; continue; }
    if (c === ']') { push(); a = false; continue; }
    buf += c;
  }
  push();
  return runs;
}

/* ---------- Renk ve yazı tipi ---------- */
function colorOf(d, key) {
  if (!key) return null;
  if (key[0] === '#' || key.startsWith('rgb')) return key;
  if (d.bg.auto && (key === 'bg1' || key === 'bg2')) return key === 'bg1' ? d.auto.c1 : d.auto.c2;
  return d.theme[key] || key;
}
const famOf = (d, f) => f === 'head' ? d.fonts.head : f === 'body' ? d.fonts.body : (f || d.fonts.body);
const cssFam = fam => `"${fam}", ${SERIF.has(fam) ? 'Georgia, serif' : '"Segoe UI", Arial, sans-serif'}`;
const fontStr = (fam, w, sz, it) => `${it ? 'italic ' : ''}${w} ${Math.max(1, sz).toFixed(2)}px ${cssFam(fam)}`;
const pendingFonts = new Set();
function needFont(fam, w, it) {
  const s = `${it ? 'italic ' : ''}${w} 40px "${fam}"`;
  if (pendingFonts.has(s)) return;
  try { if (document.fonts.check(s)) return; } catch (e) { return; }
  pendingFonts.add(s);
  document.fonts.load(s).then(() => { requestRender(); }).catch(() => {});
}

/* ---------- Yazı yerleşimi ---------- */
const mctx = document.createElement('canvas').getContext('2d');
function measure(t, font, lsPx) {
  mctx.font = font;
  if (!lsPx) return mctx.measureText(t).width;
  let w = 0; for (const ch of t) w += mctx.measureText(ch).width + lsPx;
  return w - lsPx;
}
function styleFor(d, el, i) {
  const F = (i === 0 && el.first) ? Object.assign({}, el, el.first) : el;
  return { fam: famOf(d, F.font), size: F.size, weight: F.weight, italic: F.italic, upper: F.upper, ls: F.ls, color: F.color, lh: F.lh ?? el.lh };
}
function layoutText(d, el, TK) {
  const lines = resolveLines(el.text, TK);
  if (!lines.length || !lines.some(l => stripMk(l.s).trim())) return null;
  const box = el.box, px = box ? box.px : 0, py = box ? box.py : 0;
  const maxW = Math.max(20, el.w - 2 * px);
  const build = scale => {
    const out = [];
    for (const L of lines) {
      const st = styleFor(d, el, L.i), size = st.size * scale, lsPx = (st.ls || 0) * size;
      needFont(st.fam, st.weight, st.italic);
      const runs = parseRuns(st.upper ? L.s.toLocaleUpperCase('tr') : L.s);
      const pieces = [];
      for (const r of runs) {
        const w = r.b ? Math.max(700, Math.min(800, st.weight + 300)) : st.weight;
        if (r.b) needFont(st.fam, w, st.italic);
        const font = fontStr(st.fam, w, size, st.italic);
        r.t.split(/(\s+)/).forEach(t => { if (t) pieces.push({ t, font, a: r.a, st: r.st, sp: /^\s+$/.test(t), w: measure(t, font, lsPx), lsPx }); });
      }
      let cur = { pieces: [], w: 0, size, lh: st.lh, st };
      const pushLine = () => { while (cur.pieces.length && cur.pieces[cur.pieces.length - 1].sp) { cur.w -= cur.pieces.pop().w; } out.push(cur); };
      for (const p of pieces) {
        if (!el.fit && cur.pieces.length && !p.sp && cur.w + p.w > maxW + 0.5) { pushLine(); cur = { pieces: [], w: 0, size, lh: st.lh, st }; }
        if (p.sp && !cur.pieces.length) continue;
        cur.pieces.push(p); cur.w += p.w;
      }
      pushLine();
    }
    return out;
  };
  let out = build(1);
  if (el.fit) { const wid = Math.max(...out.map(l => l.w)); if (wid > maxW) out = build(maxW / wid); }
  const contentW = Math.max(...out.map(l => l.w), 1);
  const contentH = out.reduce((s, l) => s + l.size * l.lh, 0);
  const bw = el.hug ? Math.min(el.w, contentW + 2 * px) : el.w, bh = contentH + 2 * py;
  const bx = el.hug ? (el.align === 'right' ? el.x + el.w - bw : el.align === 'center' ? el.x + (el.w - bw) / 2 : el.x) : el.x;
  return { lines: out, x: bx, y: el.y, w: bw, h: bh, px, py };
}

/* ---------- Çizim ---------- */
let photoImg = null, cutCanvas = null, photoVer = 0;
const fadeCache = new Map();

function shapePath(c, shape, x, y, w, h, r) {
  c.beginPath();
  if (shape === 'circle') { c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); return; }
  if (shape === 'arch') {
    const tr = Math.min(w / 2, h), br = Math.min(r || 0, w / 2, h / 2);
    c.moveTo(x, y + tr); c.arc(x + w / 2, y + tr, w / 2, Math.PI, 0);
    c.lineTo(x + w, y + h - br); c.arcTo(x + w, y + h, x + w - br, y + h, br);
    c.lineTo(x + br, y + h); c.arcTo(x, y + h, x, y + h - br, br); c.closePath(); return;
  }
  if (shape === 'tag') {
    c.moveTo(x + w * .18, y); c.lineTo(x + w * .82, y); c.lineTo(x + w, y + h * .14); c.lineTo(x + w, y + h);
    c.lineTo(x, y + h); c.lineTo(x, y + h * .14); c.closePath();
    const hr = Math.min(w, h) * 0.035 + 4; c.moveTo(x + w / 2 + hr, y + h * .08); c.arc(x + w / 2, y + h * .08, hr, 0, Math.PI * 2);
    return;
  }
  const rr = Math.min(r || 0, w / 2, h / 2);
  if (rr > 0) { c.moveTo(x + rr, y); c.arcTo(x + w, y, x + w, y + h, rr); c.arcTo(x + w, y + h, x, y + h, rr); c.arcTo(x, y + h, x, y, rr); c.arcTo(x, y, x + w, y, rr); c.closePath(); }
  else c.rect(x, y, w, h);
}
function withRot(c, cx, cy, deg, fn) {
  c.save();
  if (deg) { c.translate(cx, cy); c.rotate(deg * RAD); c.translate(-cx, -cy); }
  fn(); c.restore();
}
function shadowOn(c, on, dark) { if (on) { c.shadowColor = dark ? 'rgba(0,0,0,.35)' : 'rgba(42,35,32,.2)'; c.shadowBlur = 36; c.shadowOffsetY = 14; } }
function shadowOff(c) { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; }

function geomOf(d, el) { if (el.follow) { const g = d.els.find(e => e.id === el.follow); return g || el; } return el; }
function drawPhoto(c, d, el) {
  const g = geomOf(d, el);
  const img = el.src === 'cut' ? cutCanvas : photoImg;
  if (!img) return;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const { x, y, w, h } = g; const s = Math.max(w / iw, h / ih) * g.zoom; const dw = iw * s, dh = ih * s;
  const dx = x + w / 2 - g.fx * dw, dy = y + h / 2 - g.fy * dh;
  withRot(c, x + w / 2, y + h / 2, g.rot, () => {
    if (el.src === 'cut') { c.drawImage(img, dx, dy, dw, dh); return; }
    if (g.shape === 'fade') {
      const key = [w, h, g.zoom, g.fx, g.fy, photoVer].map(v => typeof v === 'number' ? v.toFixed(2) : v).join('|');
      let hit = fadeCache.get(el.id);
      if (!hit || hit.key !== key) {
        const o = document.createElement('canvas'); o.width = Math.max(1, Math.round(w)); o.height = Math.max(1, Math.round(h));
        const oc = o.getContext('2d'); oc.drawImage(img, dx - x, dy - y, dw, dh);
        oc.globalCompositeOperation = 'destination-in';
        const m = oc.createLinearGradient(0, 0, 0, o.height);
        m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(.12, '#000'); m.addColorStop(.8, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
        oc.fillStyle = m; oc.fillRect(0, 0, o.width, o.height);
        hit = { key, o }; fadeCache.set(el.id, hit);
      }
      c.drawImage(hit.o, x, y, w, h); return;
    }
    const b = g.border || 0;
    if (b > 0 || g.shadow) {
      shadowOn(c, g.shadow, d.bg.type === 'radial');
      shapePath(c, g.shape, x - b, y - b, w + 2 * b, h + 2 * b, (g.r || 0) + b);
      c.fillStyle = b > 0 ? colorOf(d, g.bcolor) : d.auto.c1; c.fill(); shadowOff(c);
    }
    shapePath(c, g.shape, x, y, w, h, g.r); c.clip();
    c.drawImage(img, dx, dy, dw, dh);
  });
}
function drawRect(c, d, el, TK) {
  if (el.showIf && !nm(TK[el.showIf])) return;
  withRot(c, el.x + el.w / 2, el.y + el.h / 2, el.rot, () => {
    shapePath(c, el.shape, el.x, el.y, el.w, el.h, el.r);
    if (el.fill) { shadowOn(c, el.shadow, d.bg.type === 'radial'); c.fillStyle = colorOf(d, el.fill); c.fill(el.shape === 'tag' ? 'evenodd' : 'nonzero'); shadowOff(c); }
    if (el.stroke && el.sw > 0) { c.lineWidth = el.sw; c.strokeStyle = colorOf(d, el.stroke); c.stroke(); }
  });
}
function drawText(c, d, el, TK) {
  const Lo = layoutText(d, el, TK); el._b = Lo ? { x: Lo.x, y: Lo.y, w: Lo.w, h: Lo.h } : null;
  if (!Lo) return;
  withRot(c, Lo.x + Lo.w / 2, Lo.y + Lo.h / 2, el.rot, () => {
    if (el.box && el.box.fill) {
      shadowOn(c, el.box.shadow, d.bg.type === 'radial');
      shapePath(c, 'rect', Lo.x, Lo.y, Lo.w, Lo.h, el.box.r); c.fillStyle = colorOf(d, el.box.fill); c.fill(); shadowOff(c);
    }
    if (el.tshadow) { c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 14; c.shadowOffsetY = 2; }
    let y = Lo.y + Lo.py;
    c.textBaseline = 'middle';
    for (const line of Lo.lines) {
      const lhPx = line.size * line.lh, my = y + lhPx / 2;
      const innerW = Lo.w - 2 * Lo.px;
      let x = Lo.x + Lo.px + (el.align === 'center' ? (innerW - line.w) / 2 : el.align === 'right' ? innerW - line.w : 0);
      for (const p of line.pieces) {
        const col = colorOf(d, p.a ? el.accent : line.st.color);
        c.fillStyle = col; c.font = p.font;
        if (p.lsPx) { let cx = x; for (const ch of p.t) { c.fillText(ch, cx, my); cx += c.measureText(ch).width + p.lsPx; } }
        else c.fillText(p.t, x, my);
        const lw = Math.max(1.5, line.size * 0.06);
        if (el.underline && !p.sp) { c.fillRect(x, my + line.size * 0.4, p.w, lw); }
        if ((p.st || el.strike)) { c.fillRect(x, my + line.size * 0.04 - lw / 2, p.w + (p.sp ? 0 : 0), lw); }
        x += p.w + (p.lsPx || 0);
      }
      y += lhPx;
    }
  });
}
function drawLine(c, d, el, TK) {
  const col = colorOf(d, el.color);
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = el.lw; c.lineCap = 'round';
  c.beginPath(); c.moveTo(el.x, el.y); c.lineTo(el.x2, el.y2); c.stroke();
  const ang = Math.atan2(el.y2 - el.y, el.x2 - el.x);
  const cap = (x, y, type) => {
    if (type === 'dot') { c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); c.fillStyle = colorOf(d, 'paper'); c.fill(); c.lineWidth = 3; c.stroke(); c.lineWidth = el.lw; c.fillStyle = col; }
    if (type === 'tick') { const a = ang + Math.PI / 2, l = 14; c.beginPath(); c.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  };
  cap(el.x, el.y, el.cap1); cap(el.x2, el.y2, el.cap2);
  if (el.label) {
    const lines = resolveLines(el.label, TK); const t = lines.map(l => stripMk(l.s)).join(' ');
    if (t.trim()) {
      const fam = famOf(d, el.font); needFont(fam, 700, false);
      c.font = fontStr(fam, 700, el.lsize, false); c.textAlign = 'center'; c.textBaseline = 'middle';
      const mx = (el.x + el.x2) / 2, my = (el.y + el.y2) / 2, vertical = Math.abs(el.y2 - el.y) > Math.abs(el.x2 - el.x);
      c.save(); c.translate(mx, my);
      if (vertical) { c.rotate(-Math.PI / 2); c.fillText(t, 0, -el.lsize * 0.9); } else c.fillText(t, 0, -el.lsize * 0.9);
      c.restore(); c.textAlign = 'left';
    }
  }
}
function drawBg(c, d, W, H) {
  const c1 = colorOf(d, d.bg.c1 || 'bg1'), c2 = colorOf(d, d.bg.c2 || 'bg2');
  if (d.bg.type === 'solid') c.fillStyle = c1;
  else if (d.bg.type === 'radial') { const g = c.createRadialGradient(W / 2, H * .35, 0, W / 2, H * .35, Math.max(W, H) * .75); g.addColorStop(0, c1); g.addColorStop(.75, c2); c.fillStyle = g; }
  else { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(.2, c1); g.addColorStop(.8, c2); c.fillStyle = g; }
  c.fillRect(0, 0, W, H);
}
function draw(c, d, opt = {}) {
  const { W, H } = FORMATS[d.fmt];
  const TK = tokens(d.f);
  c.save(); c.textAlign = 'left';
  drawBg(c, d, W, H);
  for (const el of d.els) {
    if (el.hidden) { if (el.type === 'text') el._b = layoutText(d, el, TK); continue; }
    c.save(); c.globalAlpha = el.op ?? 1;
    if (el.type === 'photo') drawPhoto(c, d, el);
    else if (el.type === 'rect') drawRect(c, d, el, TK);
    else if (el.type === 'text') drawText(c, d, el, TK);
    else if (el.type === 'line') drawLine(c, d, el, TK);
    c.restore();
  }
  c.restore();
  if (opt.preview) drawOverlay(c, d, W, H);
}

/* ---------- Seçim kutuları ---------- */
function boxOf(el) {
  if (el.type === 'text') return el._b ? { ...el._b, rot: el.rot || 0 } : null;
  if (el.type === 'line') { const x = Math.min(el.x, el.x2), y = Math.min(el.y, el.y2); return { x, y, w: Math.abs(el.x2 - el.x), h: Math.abs(el.y2 - el.y), rot: 0 }; }
  return { x: el.x, y: el.y, w: el.w, h: el.h, rot: el.rot || 0 };
}
function aabb(el) {
  const b = boxOf(el); if (!b) return null;
  if (!b.rot) return b;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const pts = [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].map(([x, y]) => rotPt(x, y, cx, cy, b.rot));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
let guides = [];
const K = () => FORMATS[doc.fmt].W / cv.getBoundingClientRect().width;
function drawOverlay(c, d, W, H) {
  const k = K();
  if (ui.safe && d.fmt === 'story') { c.fillStyle = 'rgba(30,30,30,.16)'; c.fillRect(0, 0, W, 230); c.fillRect(0, H - 230, W, 230); }
  c.lineWidth = 1.5 * k; c.strokeStyle = '#E0359B';
  for (const g of guides) { c.beginPath(); if (g.x != null) { c.moveTo(g.x, 0); c.lineTo(g.x, H); } else { c.moveTo(0, g.y); c.lineTo(W, g.y); } c.stroke(); }
  const selEls = sel.map(id => d.els.find(e => e.id === id)).filter(Boolean);
  for (const el of selEls) {
    c.strokeStyle = '#2F6FEB'; c.lineWidth = 2 * k;
    if (el.type === 'line') {
      c.setLineDash([6 * k, 5 * k]); c.beginPath(); c.moveTo(el.x, el.y); c.lineTo(el.x2, el.y2); c.stroke(); c.setLineDash([]);
      if (selEls.length === 1) for (const [x, y] of [[el.x, el.y], [el.x2, el.y2]]) handleDot(c, x, y, k, true);
      continue;
    }
    const g = el.follow ? geomOf(d, el) : el; const b = boxOf(g); if (!b) continue;
    withRot(c, b.x + b.w / 2, b.y + b.h / 2, b.rot, () => {
      c.strokeRect(b.x, b.y, b.w, b.h);
      if (selEls.length !== 1 || el.locked) return;
      if (el.type === 'text') { handleSq(c, b.x + b.w, b.y + b.h, k); handleSq(c, b.x + b.w, b.y + b.h / 2, k, true); }
      else for (const [x, y] of [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]]) handleSq(c, x, y, k);
      const rx = b.x + b.w / 2, ry = b.y - 34 * k;
      c.beginPath(); c.moveTo(rx, b.y); c.lineTo(rx, ry); c.stroke(); handleDot(c, rx, ry, k, false);
    });
  }
}
function handleSq(c, x, y, k, small) { const s = (small ? 9 : 12) * k; c.fillStyle = '#fff'; c.fillRect(x - s / 2, y - s / 2, s, s); c.lineWidth = 2 * k; c.strokeStyle = '#2F6FEB'; c.strokeRect(x - s / 2, y - s / 2, s, s); }
function handleDot(c, x, y, k, big) { c.beginPath(); c.arc(x, y, (big ? 9 : 7) * k, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2 * k; c.strokeStyle = '#2F6FEB'; c.stroke(); }

/* ---------- Ekran ---------- */
const cv = $('#cv'), ctx = cv.getContext('2d');
let rq = 0;
function requestRender() { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; draw(ctx, doc, { preview: true }); }); }
function fitCanvas() {
  const { W, H } = FORMATS[doc.fmt];
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const st = $('#stage'), cs = getComputedStyle(st);
  const aw = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ah = st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const s = Math.min(aw / W, ah / H);
  cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px';
  $('#zoomnote').textContent = `${FORMATS[doc.fmt].label} ${FORMATS[doc.fmt].ratio} · ${W}×${H} · %${Math.round(s * 100)}`;
  requestRender();
}
addEventListener('resize', fitCanvas);

/* ---------- Geçmiş (geri al / yinele) ---------- */
const hist = { stack: [], i: -1 };
const snap = () => JSON.stringify(doc, (k, v) => k[0] === '_' ? undefined : v);
function commit() {
  clearTimeout(commitT);
  const s = snap();
  if (hist.stack[hist.i] === s) return;
  hist.stack = hist.stack.slice(0, hist.i + 1); hist.stack.push(s);
  if (hist.stack.length > 120) hist.stack.shift();
  hist.i = hist.stack.length - 1;
  persist(); updUndo();
}
let commitT = 0;
function commitSoon() { clearTimeout(commitT); commitT = setTimeout(commit, 450); }
function restore(s) {
  const prevPhoto = doc.photo, prevTol = doc.cutTol;
  doc = JSON.parse(s); fadeCache.clear();
  sel = sel.filter(id => doc.els.some(e => e.id === id));
  if (doc.photo !== prevPhoto) loadPhoto(); else if (doc.cutTol !== prevTol) makeCutSoon();
  persist(); updUndo(); fitCanvas(); renderPanels();
}
function undo() { clearTimeout(commitT); if (snap() !== hist.stack[hist.i]) commit(); if (hist.i > 0) { hist.i--; restore(hist.stack[hist.i]); } }
function redo() { if (hist.i < hist.stack.length - 1) { hist.i++; restore(hist.stack[hist.i]); } }
function updUndo() { $('#bUndo').disabled = hist.i <= 0; $('#bRedo').disabled = hist.i >= hist.stack.length - 1; }

/* ---------- Saklama ---------- */
const LS = 'tstudio-doc-v1';
function persist() { try { localStorage.setItem(LS, snap()); } catch (e) {} }
let dbp = null;
function idb() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open('tuciwood-studio', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('photos', { keyPath: 'id' }); r.result.createObjectStore('designs', { keyPath: 'id' }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function dbOp(store, mode, fn) {
  const db = await idb();
  return new Promise((res, rej) => { const tx = db.transaction(store, mode); const r = fn(tx.objectStore(store)); tx.oncomplete = () => res(r?.result); tx.onerror = () => rej(tx.error); });
}
const dbGet = (s, k) => dbOp(s, 'readonly', st => st.get(k));
const dbPut = (s, v) => dbOp(s, 'readwrite', st => st.put(v));
const dbDel = (s, k) => dbOp(s, 'readwrite', st => st.delete(k));
const dbAll = s => dbOp(s, 'readonly', st => st.getAll());

/* ---------- Fotoğraf ve dekupe ---------- */
async function loadPhoto() {
  const id = doc.photo; let src = 'sample.jpg';
  if (id !== 'sample') { try { const r = await dbGet('photos', id); if (r) src = URL.createObjectURL(r.blob); } catch (e) {} }
  const img = new Image();
  img.onload = () => { if (doc.photo !== id) return; photoImg = img; photoVer++; fadeCache.clear(); makeCut(); requestRender(); renderPanelsSoft(); };
  img.src = src;
}
function sampleEdges(img) {
  const s = document.createElement('canvas'); s.width = 40; s.height = 40;
  const x = s.getContext('2d'); x.drawImage(img, 0, 0, 40, 40);
  const avg = (y0, y1) => { const p = x.getImageData(0, y0, 40, y1 - y0).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < p.length; i += 4) { r += p[i]; g += p[i + 1]; b += p[i + 2]; n++; } const h = v => Math.round(v / n).toString(16).padStart(2, '0'); return '#' + h(r) + h(g) + h(b); };
  return { c1: avg(0, 3), c2: avg(37, 40) };
}
let cutT = 0;
function makeCutSoon() { clearTimeout(cutT); cutT = setTimeout(makeCut, 120); }
function makeCut() {
  if (!photoImg) return;
  const iw = photoImg.naturalWidth, ih = photoImg.naturalHeight, k = Math.min(1, 1400 / Math.max(iw, ih));
  const w = Math.round(iw * k), h = Math.round(ih * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(photoImg, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h), p = d.data;
  const rowAvg = y => { let r = 0, g = 0, b = 0, n = 0; for (let X = 0; X < w; X += 3) { const i = (y * w + X) * 4; r += p[i]; g += p[i + 1]; b += p[i + 2]; n++; } return [r / n, g / n, b / n]; };
  const colAvg = (X, y0, y1) => { let r = 0, g = 0, b = 0, n = 0; for (let y = y0; y < y1; y++) { const i = (y * w + X) * 4; r += p[i]; g += p[i + 1]; b += p[i + 2]; n++; } return [r / n, g / n, b / n]; };
  const top = rowAvg(2), bot = rowAvg(h - 3);
  const bands = 8, side = [];
  for (let s = 0; s < bands; s++) { const y0 = Math.floor(s * h / bands), y1 = Math.floor((s + 1) * h / bands); const a = colAvg(2, y0, y1), b = colAvg(w - 3, y0, y1); side.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]); }
  const tol = doc.cutTol, soft = 16;
  const al = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1), band = side[Math.min(bands - 1, Math.floor(t * bands))];
    const br = (top[0] * (1 - t) + bot[0] * t + band[0]) / 2, bg = (top[1] * (1 - t) + bot[1] * t + band[1]) / 2, bb = (top[2] * (1 - t) + bot[2] * t + band[2]) / 2;
    for (let X = 0; X < w; X++) {
      const i = (y * w + X) * 4, dr = p[i] - br, dg = p[i + 1] - bg, db = p[i + 2] - bb;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      al[y * w + X] = clamp((dist - (tol - soft)) / (2 * soft), 0, 1);
    }
  }
  for (let y = 1; y < h - 1; y++) for (let X = 1; X < w - 1; X++) {
    let s = 0; for (let j = -1; j <= 1; j++) for (let q = -1; q <= 1; q++) s += al[(y + j) * w + X + q];
    p[(y * w + X) * 4 + 3] = Math.round(s / 9 * 255);
  }
  for (let X = 0; X < w; X++) { p[X * 4 + 3] = 0; p[((h - 1) * w + X) * 4 + 3] = 0; }
  for (let y = 0; y < h; y++) { p[(y * w) * 4 + 3] = 0; p[(y * w + w - 1) * 4 + 3] = 0; }
  x.putImageData(d, 0, 0);
  cutCanvas = c; requestRender();
}
async function onPhotoFile(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const t = new Image();
  t.onload = async () => {
    const k = Math.min(1, 1800 / Math.max(t.naturalWidth, t.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(t.naturalWidth * k); c.height = Math.round(t.naturalHeight * k);
    c.getContext('2d').drawImage(t, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
    const id = 'p' + Date.now().toString(36);
    try { await dbPut('photos', { id, blob }); } catch (e) { toast('Fotoğraf bu cihazda saklanamadı'); }
    doc.photo = id; doc.auto = sampleEdges(c);
    loadPhoto(); commit(); renderPanels(); toast('Fotoğraf eklendi');
  };
  t.onerror = () => toast('Bu dosya açılamadı. JPG ya da PNG deneyin.');
  t.src = url;
}
$('#fPhoto').addEventListener('change', e => { onPhotoFile(e.target.files[0]); e.target.value = ''; });

/* ---------- Seçim, sürükleme, kılavuzlar ---------- */
const getEl = id => doc.els.find(e => e.id === id);
function toCanvas(e) { const r = cv.getBoundingClientRect(), { W, H } = FORMATS[doc.fmt]; return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
function local(p, b) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; const [x, y] = rotPt(p.x, p.y, cx, cy, -(b.rot || 0)); return { x, y }; }
function hitTest(p) {
  const k = K(), pad = 8 * k;
  for (let i = doc.els.length - 1; i >= 0; i--) {
    const el = doc.els[i]; if (el.hidden || el.follow) continue;
    if (el.type === 'line') {
      const vx = el.x2 - el.x, vy = el.y2 - el.y, l2 = vx * vx + vy * vy || 1;
      const t = clamp(((p.x - el.x) * vx + (p.y - el.y) * vy) / l2, 0, 1);
      if (Math.hypot(p.x - (el.x + t * vx), p.y - (el.y + t * vy)) < 16 * k) return el;
      continue;
    }
    if (el.type === 'rect' && !el.fill && el.stroke) {
      const b = boxOf(el), q = local(p, b), tol = 14 * k;
      const inO = q.x > b.x - tol && q.x < b.x + b.w + tol && q.y > b.y - tol && q.y < b.y + b.h + tol;
      const inI = q.x > b.x + tol && q.x < b.x + b.w - tol && q.y > b.y + tol && q.y < b.y + b.h - tol;
      if (inO && !inI) return el; continue;
    }
    const b = boxOf(el); if (!b) continue;
    const q = local(p, b);
    if (q.x >= b.x - pad && q.x <= b.x + b.w + pad && q.y >= b.y - pad && q.y <= b.y + b.h + pad) return el;
  }
  return null;
}
function hitHandle(el, p) {
  const k = K(), r = 16 * k;
  if (el.locked) return null;
  if (el.type === 'line') {
    if (Math.hypot(p.x - el.x, p.y - el.y) < r) return { h: 'p1' };
    if (Math.hypot(p.x - el.x2, p.y - el.y2) < r) return { h: 'p2' };
    return null;
  }
  const b = boxOf(el); if (!b) return null;
  const q = local(p, b);
  if (Math.hypot(q.x - (b.x + b.w / 2), q.y - (b.y - 34 * k)) < r) return { h: 'rot' };
  if (el.type === 'text') {
    if (Math.hypot(q.x - (b.x + b.w), q.y - (b.y + b.h)) < r) return { h: 'scale' };
    if (Math.hypot(q.x - (b.x + b.w), q.y - (b.y + b.h / 2)) < r) return { h: 'width' };
    return null;
  }
  const cs = [['nw', b.x, b.y], ['ne', b.x + b.w, b.y], ['sw', b.x, b.y + b.h], ['se', b.x + b.w, b.y + b.h]];
  for (const [n, x, y] of cs) if (Math.hypot(q.x - x, q.y - y) < r) return { h: n };
  return null;
}

let drag = null;
cv.addEventListener('pointerdown', e => {
  if (e.button > 0) return;
  const p = toCanvas(e);
  cv.setPointerCapture(e.pointerId);
  if (sel.length === 1) {
    const el = getEl(sel[0]);
    const h = el && hitHandle(el, p);
    if (h) { drag = { mode: h.h, id: el.id, p0: p, o: clone(el), b0: boxOf(el), moved: false }; return; }
  }
  const hit = hitTest(p);
  if (!hit) { if (!ui.multi && !e.shiftKey) sel = []; drag = null; renderElPanel(); requestRender(); return; }
  if (ui.multi || e.shiftKey) { sel = sel.includes(hit.id) ? sel.filter(i => i !== hit.id) : [...sel, hit.id]; }
  else if (!sel.includes(hit.id)) sel = [hit.id];
  const mode = (ui.crop && hit.type === 'photo' && sel.length === 1) ? 'crop' : 'move';
  drag = { mode, id: hit.id, p0: p, o: sel.map(id => clone(getEl(id))), boxes: sel.map(id => aabb(getEl(id))), moved: false };
  renderElPanel(); requestRender();
});
cv.addEventListener('pointermove', e => {
  if (!drag) return;
  const p = toCanvas(e), k = K();
  let dx = p.x - drag.p0.x, dy = p.y - drag.p0.y;
  if (!drag.moved && Math.hypot(dx, dy) < 4 * k) return;
  drag.moved = true;
  const { W, H } = FORMATS[doc.fmt];
  if (drag.mode === 'move') {
    guides = [];
    if (ui.guides && !e.altKey) { const s = snapMove(drag, dx, dy, W, H, k); dx = s.dx; dy = s.dy; guides = s.guides; }
    drag.o.forEach(o => {
      const el = getEl(o.id); if (!el || el.locked) return;
      el.x = o.x + dx; el.y = o.y + dy;
      if (el.type === 'line') { el.x2 = o.x2 + dx; el.y2 = o.y2 + dy; }
    });
  } else if (drag.mode === 'crop') {
    const el = getEl(drag.id), o = drag.o[0];
    const img = el.src === 'cut' ? cutCanvas : photoImg; if (!img) return;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, s = Math.max(el.w / iw, el.h / ih) * el.zoom;
    const [lx, ly] = rotPt(dx, dy, 0, 0, -(el.rot || 0));
    el.fx = clamp(o.fx - lx / (iw * s), -0.5, 1.5); el.fy = clamp(o.fy - ly / (ih * s), -0.5, 1.5);
  } else {
    resizeDrag(getEl(drag.id), drag, p, e, k);
  }
  requestRender();
});
function endDrag() {
  if (!drag) return;
  const moved = drag.moved; drag = null; guides = [];
  if (moved) { commit(); renderElPanel(); }
  requestRender();
}
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);
cv.addEventListener('dblclick', e => {
  const hit = hitTest(toCanvas(e)); if (!hit) return;
  sel = [hit.id]; setTab('el');
  setTimeout(() => { const t = $('#elText'); if (t) { t.focus(); t.select(); } }, 30);
});

function snapMove(dr, dx, dy, W, H, k) {
  const th = 10 * k, L = lay(doc.fmt);
  const u = dr.boxes.filter(Boolean).reduce((a, b) => a ? { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), r: Math.max(a.r, b.x + b.w), bt: Math.max(a.bt, b.y + b.h) } : { x: b.x, y: b.y, r: b.x + b.w, bt: b.y + b.h }, null);
  if (!u) return { dx, dy, guides: [] };
  const xs = [0, L.m, W / 2, W - L.m, W], ys = [0, H / 2, H];
  if (doc.fmt === 'story') ys.push(250, 1670); else ys.push(L.m, H - L.m);
  for (const el of doc.els) {
    if (sel.includes(el.id) || el.hidden || el.follow) continue;
    const b = aabb(el); if (!b || b.w > W * 0.95) continue;
    xs.push(b.x, b.x + b.w / 2, b.x + b.w); ys.push(b.y, b.y + b.h / 2, b.y + b.h);
  }
  const g = [];
  const best = (vals, cands) => { let m = null; for (const v of vals) for (const c of cands) { const d = c - v; if (Math.abs(d) < th && (!m || Math.abs(d) < Math.abs(m.d))) m = { d, c }; } return m; };
  const nx = [u.x + dx, (u.x + u.r) / 2 + dx, u.r + dx], ny = [u.y + dy, (u.y + u.bt) / 2 + dy, u.bt + dy];
  const bx = best(nx, xs), by = best(ny, ys);
  if (bx) { dx += bx.d; g.push({ x: bx.c }); }
  if (by) { dy += by.d; g.push({ y: by.c }); }
  return { dx, dy, guides: g };
}
function resizeDrag(el, dr, p, e, k) {
  const o = dr.o, b = dr.b0;
  if (dr.mode === 'p1' || dr.mode === 'p2') {
    let x = p.x, y = p.y;
    if (ui.guides && !e.altKey) { const s = snapPoint(x, y, k); x = s.x; y = s.y; }
    if (e.shiftKey) { const ax = dr.mode === 'p1' ? o.x2 : o.x, ay = dr.mode === 'p1' ? o.y2 : o.y; if (Math.abs(x - ax) > Math.abs(y - ay)) y = ay; else x = ax; }
    if (dr.mode === 'p1') { el.x = x; el.y = y; } else { el.x2 = x; el.y2 = y; }
    return;
  }
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  if (dr.mode === 'rot') {
    let a = Math.atan2(p.y - cy, p.x - cx) / RAD + 90;
    a = ((a + 180) % 360 + 360) % 360 - 180;
    if (!e.altKey) for (const s of [-180, -135, -90, -45, 0, 45, 90, 135, 180]) if (Math.abs(a - s) < 4) a = s;
    el.rot = Math.round(a * 10) / 10;
    return;
  }
  if (el.type === 'text') {
    const q = local(p, b);
    if (dr.mode === 'width') { el.w = Math.max(40, q.x - b.x + (el.hug ? (o.w - b.w) : 0)); return; }
    const f = clamp((q.x - b.x) / Math.max(1, b.w), 0.1, 10);
    el.size = Math.max(6, o.size * f); el.w = Math.max(40, o.w * f);
    if (o.first && o.first.size) el.first = Object.assign({}, o.first, { size: o.first.size * f });
    if (o.box) el.box = Object.assign({}, o.box, { px: o.box.px * f, py: o.box.py * f, r: o.box.r >= 999 ? 999 : o.box.r * f });
    if (el.hug) { if (el.align === 'right') el.x = o.x + o.w - el.w; else if (el.align === 'center') el.x = o.x + (o.w - el.w) / 2; }
    return;
  }
  const sx = dr.mode.includes('e') ? 1 : -1, sy = dr.mode.includes('s') ? 1 : -1;
  const [fx, fy] = rotPt(cx - sx * b.w / 2, cy - sy * b.h / 2, cx, cy, b.rot || 0);
  const [vx, vy] = rotPt(p.x - fx, p.y - fy, 0, 0, -(b.rot || 0));
  let w = Math.max(20, vx * sx), h = Math.max(20, vy * sy);
  if (e.shiftKey) { const r = b.w / b.h; if (w / h > r) h = w / r; else w = h * r; }
  const [rx, ry] = rotPt(sx * w / 2, sy * h / 2, 0, 0, b.rot || 0);
  el.w = w; el.h = h; el.x = fx + rx - w / 2; el.y = fy + ry - h / 2;
}
function snapPoint(x, y, k) {
  const th = 10 * k, { W, H } = FORMATS[doc.fmt]; guides = [];
  const xs = [W / 2, 72, W - 72], ys = [H / 2];
  for (const c of xs) if (Math.abs(x - c) < th) { x = c; guides.push({ x: c }); break; }
  for (const c of ys) if (Math.abs(y - c) < th) { y = c; guides.push({ y: c }); break; }
  return { x, y };
}

/* ---------- Klavye ---------- */
addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); return; }
  if (typing) return;
  if (mod && e.key.toLowerCase() === 'd' && sel.length) { e.preventDefault(); duplicate(); return; }
  if ((e.key === 'Delete' || e.key === 'Backspace') && sel.length) { e.preventDefault(); removeSel(); return; }
  if (e.key === 'Escape') { sel = []; renderElPanel(); requestRender(); return; }
  const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (arrows[e.key] && sel.length) {
    e.preventDefault(); const s = e.shiftKey ? 10 : 1, [ax, ay] = arrows[e.key];
    sel.forEach(id => { const el = getEl(id); if (!el || el.locked) return; el.x += ax * s; el.y += ay * s; if (el.type === 'line') { el.x2 += ax * s; el.y2 += ay * s; } });
    requestRender(); commitSoon();
  }
});

/* ---------- Öğe işlemleri ---------- */
function duplicate() {
  const add = [];
  sel.forEach(id => { const el = getEl(id); if (!el || el.follow) return; const c = clone(el); c.id = nid(); c.name = el.name + ' kopya'; c.x += 30; c.y += 30; if (c.type === 'line') { c.x2 += 30; c.y2 += 30; } add.push(c); const i = doc.els.indexOf(el); doc.els.splice(i + 1, 0, c); });
  sel = add.map(a => a.id); commit(); renderElPanel(); requestRender();
}
function removeSel() {
  const ids = new Set(sel);
  doc.els = doc.els.filter(e => !ids.has(e.id) && !ids.has(e.follow));
  sel = []; commit(); renderElPanel(); requestRender(); toast('Silindi. Geri almak için ↶');
}
function moveLayer(dir) {
  if (sel.length !== 1) return;
  const i = doc.els.findIndex(e => e.id === sel[0]); if (i < 0) return;
  const el = doc.els.splice(i, 1)[0];
  let j = dir === 'top' ? doc.els.length : dir === 'bottom' ? 0 : clamp(i + (dir === 'up' ? 1 : -1), 0, doc.els.length);
  doc.els.splice(j, 0, el); commit(); renderElPanel(); requestRender();
}
function alignSel(how) {
  const { W, H } = FORMATS[doc.fmt], L = lay(doc.fmt);
  const els = sel.map(getEl).filter(e => e && !e.locked); if (!els.length) return;
  let ref;
  if (els.length > 1) { const bs = els.map(aabb).filter(Boolean); ref = { x: Math.min(...bs.map(b => b.x)), y: Math.min(...bs.map(b => b.y)), r: Math.max(...bs.map(b => b.x + b.w)), b: Math.max(...bs.map(b => b.y + b.h)) }; }
  else ref = { x: L.m, y: L.top, r: W - L.m, b: L.bot };
  if (els.length === 1 && (how === 'cx' || how === 'cy')) ref = { x: 0, y: 0, r: W, b: H };
  for (const el of els) {
    const b = aabb(el); if (!b) continue; let dx = 0, dy = 0;
    if (how === 'l') dx = ref.x - b.x; if (how === 'r') dx = ref.r - (b.x + b.w); if (how === 'cx') dx = (ref.x + ref.r) / 2 - (b.x + b.w / 2);
    if (how === 't') dy = ref.y - b.y; if (how === 'b') dy = ref.b - (b.y + b.h); if (how === 'cy') dy = (ref.y + ref.b) / 2 - (b.y + b.h / 2);
    el.x += dx; el.y += dy; if (el.type === 'line') { el.x2 += dx; el.y2 += dy; }
  }
  commit(); requestRender();
}
function addElement(kind) {
  const { W, H } = FORMATS[doc.fmt], cx = W / 2, cy = H / 2;
  let el;
  if (kind === 'text') el = Tx({ name: 'Yazı', text: 'Yeni yazı', x: cx - 300, y: cy - 30, w: 600, align: 'center', size: 56, weight: 700 });
  if (kind === 'pill') el = Tx({ name: 'Etiket', text: 'Yeni etiket', x: cx - 300, y: cy - 30, w: 600, align: 'center', hug: true, size: 32, weight: 700, color: 'dark', box: { fill: 'paper', px: 26, py: 14, r: 22, shadow: true } });
  if (kind === 'kargo') el = Tx({ name: 'Kargo rozeti', text: '{Kargo}', x: cx - 300, y: cy, w: 600, align: 'center', hug: true, size: 30, weight: 700, color: 'dark', box: { fill: 'paper', px: 24, py: 12, r: 999 } });
  if (kind === 'indirim') el = Tx({ name: 'İndirim rozeti', text: '{İndirim}', x: cx - 300, y: cy, w: 600, align: 'center', hug: true, size: 30, weight: 700, color: 'cream', box: { fill: 'accent', px: 24, py: 12, r: 999 } });
  if (kind === 'fiyat') el = Tx({ name: 'Fiyat', text: '{FiyatBaşlık}  ~~{EskiFiyat}~~\n{Fiyat}', x: cx - 350, y: cy, w: 700, align: 'center', hug: true, size: 76, weight: 800, lh: 1.05, color: 'dark', first: { size: 26, weight: 700, upper: true, ls: 0.1 }, box: { fill: 'accent2', px: 36, py: 20, r: 28, shadow: true } });
  if (kind === 'siparis') el = Tx({ name: 'Sipariş', text: '{Sipariş}', x: cx - 300, y: cy, w: 600, align: 'center', size: 30, weight: 700, color: 'accent' });
  if (kind === 'olcu') el = Tx({ name: 'Ölçüler', text: '{Ölçü}', x: cx - 350, y: cy, w: 700, align: 'center', size: 34 });
  if (kind === 'rect') el = Rc({ name: 'Şekil', x: cx - 200, y: cy - 150, w: 400, h: 300, r: 24, fill: 'paper', shadow: true });
  if (kind === 'circle') el = Rc({ name: 'Daire', x: cx - 130, y: cy - 130, w: 260, h: 260, shape: 'circle', fill: 'accent' });
  if (kind === 'frame') el = Rc({ name: 'Çerçeve', x: 48, y: 48, w: W - 96, h: H - 96, fill: '', stroke: 'ink', sw: 2 });
  if (kind === 'line') el = Ln({ name: 'Çizgi', x: cx - 200, y: cy, x2: cx + 200, y2: cy });
  if (kind === 'callout') {
    const l = Ln({ name: 'İşaret', x: cx, y: cy, x2: cx + 160, y2: cy - 160, cap1: 'dot' });
    const t = Tx({ name: 'İşaret yazısı', text: 'başlık\nalt satır', x: cx + 160 - 24, y: cy - 160 - 14 - 80, w: 400, size: 32, lh: 1.25, color: 'sub', first: { weight: 700, color: 'ink' } });
    doc.els.push(l, t); sel = [t.id]; commit(); setTab('el'); requestRender(); return;
  }
  if (kind === 'dimW') el = Ln({ name: 'Genişlik çizgisi', x: cx - 260, y: cy, x2: cx + 260, y2: cy, cap1: 'tick', cap2: 'tick', label: doc.f.olcuTip === 'yuvarlak' ? '{Çap}' : '{Genişlik}' });
  if (kind === 'dimH') el = Ln({ name: 'Yükseklik çizgisi', x: cx + 300, y: cy - 260, x2: cx + 300, y2: cy + 260, cap1: 'tick', cap2: 'tick', label: '{Yükseklik}' });
  if (kind === 'dimD') el = Ln({ name: 'Derinlik çizgisi', x: cx - 200, y: cy + 300, x2: cx + 100, y2: cy + 400, cap1: 'tick', cap2: 'tick', label: '{Derinlik}' });
  if (kind === 'photo') el = Ph({ name: 'Fotoğraf', x: cx - 250, y: cy - 250, w: 500, h: 500, r: 24, shadow: true });
  if (!el) return;
  doc.els.push(el); sel = [el.id]; commit(); setTab('el'); requestRender();
}

/* ---------- Menü ve araç çubuğu ---------- */
function openMenu(anchor, items) {
  closeMenu();
  const m = document.createElement('div'); m.className = 'menu'; m.id = 'menu';
  m.innerHTML = items.map(it => it === '-' ? '<hr>' : `<button data-k="${it[0]}">${esc(it[1])}</button>`).join('');
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 10) + 'px'; m.style.top = (r.bottom + 6 + scrollY) + 'px';
  m.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; closeMenu(); addElement(b.dataset.k); });
  setTimeout(() => addEventListener('pointerdown', outside), 0);
  function outside(e) { if (!m.contains(e.target)) { closeMenu(); } }
  m._out = outside;
}
function closeMenu() { const m = $('#menu'); if (m) { removeEventListener('pointerdown', m._out); m.remove(); } }
$('#bAdd').addEventListener('click', e => openMenu(e.currentTarget, [
  ['text', 'Yazı'], ['pill', 'Etiket (kutulu yazı)'], ['callout', 'İşaret (nokta + yazı)'], '-',
  ['fiyat', 'Fiyat etiketi'], ['indirim', 'İndirim rozeti'], ['kargo', 'Ücretsiz kargo rozeti'], ['siparis', 'Sipariş yönlendirmesi'], ['olcu', 'Ölçü yazısı'], '-',
  ['dimW', 'Ölçü çizgisi: genişlik / çap'], ['dimH', 'Ölçü çizgisi: yükseklik'], ['dimD', 'Ölçü çizgisi: derinlik'], '-',
  ['rect', 'Kutu'], ['circle', 'Daire'], ['frame', 'Çerçeve'], ['line', 'Çizgi'], ['photo', 'Fotoğraf kopyası'],
]));
$('#bUndo').addEventListener('click', undo);
$('#bRedo').addEventListener('click', redo);
$('#bGuides').addEventListener('click', e => { ui.guides = !ui.guides; e.currentTarget.classList.toggle('on', ui.guides); });
$('#bSafe').addEventListener('click', e => { ui.safe = !ui.safe; e.currentTarget.classList.toggle('on', ui.safe); requestRender(); });
$('#bMulti').addEventListener('click', e => { ui.multi = !ui.multi; e.currentTarget.classList.toggle('on', ui.multi); toast(ui.multi ? 'Çoklu seçim açık: öğelere tek tek dokunun' : 'Çoklu seçim kapalı'); });

let toastT = 0;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }

/* ---------- Dışa aktarma ---------- */
function fileName() {
  const base = `${doc.f.ad} ${doc.f.vurgu}`.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tasarim';
  return `${nm(doc.f.marka).toLocaleLowerCase('tr').replace(/[^a-z0-9]+/g, '') || 'tuciwood'}-${base}-${doc.fmt === 'story' ? 'hikaye' : doc.fmt === 'square' ? 'kare' : 'gonderi'}.png`;
}
async function renderBlob() {
  await document.fonts.ready;
  const { W, H } = FORMATS[doc.fmt];
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  draw(c.getContext('2d'), doc, { preview: false });
  if (pendingFonts.size) { await Promise.allSettled([...pendingFonts].map(s => document.fonts.load(s))); draw(c.getContext('2d'), doc, { preview: false }); }
  return new Promise(r => c.toBlob(r, 'image/png'));
}
$('#bDownload').addEventListener('click', async () => {
  const blob = await renderBlob(); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = fileName(); document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Görsel indirildi');
});
if (navigator.canShare) {
  try { if (navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/png' })], 'a.png', { type: 'image/png' })] })) $('#bShare').hidden = false; } catch (e) {}
}
$('#bShare').addEventListener('click', async () => {
  const blob = await renderBlob(); const file = new File([blob], fileName(), { type: 'image/png' });
  try { await navigator.share({ files: [file] }); } catch (e) { if (e.name !== 'AbortError') toast('Paylaşılamadı, İndir düğmesini kullanın'); }
});

/* ---------- Paneller ---------- */
document.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTab(b.dataset.tab); });
function setTab(t) {
  ui.tab = t;
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  document.querySelectorAll('.panel').forEach(p => p.hidden = p.id !== 'p-' + t);
  renderPanels();
}
function renderPanels() {
  if (ui.tab === 'tpl') renderTplPanel();
  if (ui.tab === 'info') renderInfoPanel();
  if (ui.tab === 'theme') renderThemePanel();
  if (ui.tab === 'el') renderElPanel();
  if (ui.tab === 'saved') renderSavedPanel();
}
let softT = 0;
function renderPanelsSoft() { clearTimeout(softT); softT = setTimeout(() => { if (ui.tab === 'tpl') renderTplPanel(); if (ui.tab === 'info') updInfoBits(); }, 200); }

const seg = (key, val, opts) => `<div class="seg" data-seg="${key}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" class="${String(v) === String(val) ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>`;
const inp = (key, label, val, ph = '') => `<label class="f">${esc(label)}<input type="text" data-f="${key}" value="${esc(val)}" placeholder="${esc(ph)}"></label>`;

/* Şablon */
function renderTplPanel() {
  const p = $('#p-tpl');
  p.innerHTML = `<h3>Format</h3>${seg('fmt', doc.fmt, Object.entries(FORMATS).map(([k, v]) => [k, `${v.label} ${v.ratio}`]))}
    <p class="note">Format değişince seçili şablon yeni ölçüye göre yeniden yerleşir. Beğenmezseniz geri alabilirsiniz.</p>
    <h3>Şablon</h3><div class="tpls">${TEMPLATES.map(t => `<button class="tpl ${t.id === doc.tpl ? 'on' : ''}" data-tpl="${t.id}"><canvas data-th="${t.id}"></canvas>${esc(t.name)}</button>`).join('')}</div>
    <div class="stack" style="margin-top:14px"><button class="btn" id="bRelayout">Yerleşimi şablona sıfırla</button>
    <p class="note">Bilgileriniz, renkleriniz ve fotoğrafınız korunur; yalnızca öğelerin yeri ve ayarları şablondaki hâline döner.</p></div>`;
  p.querySelector('[data-seg=fmt]').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.dataset.v === doc.fmt) return; applyTemplate(doc.tpl, b.dataset.v); });
  p.querySelectorAll('[data-tpl]').forEach(b => b.addEventListener('click', () => applyTemplate(b.dataset.tpl, doc.fmt)));
  $('#bRelayout').addEventListener('click', () => applyTemplate(doc.tpl, doc.fmt));
  requestAnimationFrame(drawThumbs);
}
function drawThumbs() {
  document.querySelectorAll('canvas[data-th]').forEach(c => {
    const t = tplById(c.dataset.th), { W, H } = FORMATS[doc.fmt], tw = 180;
    c.width = tw; c.height = Math.round(tw * H / W);
    const d = Object.assign({}, doc, { tpl: t.id, bg: Object.assign({ type: 'linear', auto: true, c1: 'bg1', c2: 'bg2' }, t.bg), els: t.build(lay(doc.fmt)) });
    const x = c.getContext('2d'); x.scale(tw / W, tw / W); draw(x, d, { preview: false });
    d.els.forEach(e => fadeCache.delete(e.id));
  });
}
function applyTemplate(id, fmt) {
  const t = tplById(id);
  doc.tpl = t.id; doc.fmt = fmt;
  doc.bg = Object.assign({ type: 'linear', auto: true, c1: 'bg1', c2: 'bg2' }, t.bg);
  doc.els = t.build(lay(fmt)); sel = []; fadeCache.clear();
  commit(); fitCanvas(); renderPanels();
}

/* Bilgiler */
function renderInfoPanel() {
  const f = doc.f, p = $('#p-info');
  const round = f.olcuTip === 'yuvarlak', free = f.olcuTip === 'serbest';
  p.innerHTML = `
  <h3>Fotoğraf</h3>
  <div class="row"><button class="btn pri" id="bPickPhoto">Fotoğraf seç</button><span class="note" id="photoNote">${doc.photo === 'sample' ? 'Örnek fotoğraf' : 'Kendi fotoğrafınız'}</span></div>
  <div class="rng" style="margin-top:10px"><span>Dekupe</span><input type="range" id="cutTol" min="20" max="120" step="1" value="${doc.cutTol}"><output>${doc.cutTol}</output></div>
  <p class="note">Düz zeminli fotoğraflarda en iyi sonucu verir. Arka plan rengi fotoğrafın kenarlarından alınır. Dekupe ayarı "Büyük harf" şablonunda ürünün harflerin önünde durması içindir; ürünün kenarları silik çıkıyorsa azaltın, zemin görünüyorsa artırın.</p>

  <h3>Ürün</h3>
  <div class="stack">
    <div class="g2">${inp('ad', 'Ürün adı', f.ad)}${inp('vurgu', 'Vurgulu kelime', f.vurgu, 'sehpa')}</div>
    <div class="g2">${inp('etiket', 'Etiket', f.etiket, 'Masif kayın')}${inp('marka', 'Marka', f.marka)}</div>
  </div>

  <h3>Ölçüler</h3>
  <div class="stack">
    ${seg('olcuTip', f.olcuTip, [['yuvarlak', 'Yuvarlak'], ['koseli', 'Köşeli'], ['serbest', 'Serbest yazı']])}
    ${free ? inp('olcuSerbest', 'Ölçü yazısı', f.olcuSerbest, 'ör. 3 boy: 40, 45, 50 cm') : `
    <div class="${round ? 'g3' : 'g3'}">
      ${round ? inp('cap', 'Çap (Ø)', f.cap) : inp('gen', 'Genişlik (G)', f.gen)}
      ${round ? '' : inp('der', 'Derinlik (D)', f.der)}
      ${inp('yuk', 'Yükseklik (Y)', f.yuk)}
      ${round ? `<label class="f">Birim<select data-f="birim">${['cm', 'mm', 'm'].map(u => `<option ${u === f.birim ? 'selected' : ''}>${u}</option>`).join('')}</select></label>` : ''}
    </div>
    ${round ? '' : `<label class="f" style="max-width:120px">Birim<select data-f="birim">${['cm', 'mm', 'm'].map(u => `<option ${u === f.birim ? 'selected' : ''}>${u}</option>`).join('')}</select></label>`}
    <div><div class="note" style="margin-bottom:6px">Yazım şekli</div>${seg('olcuStil', f.olcuStil, [['kisa', round ? 'Ø 45 × Y 50' : 'G × D × Y'], ['acik', 'Açık yazı'], ['alt', 'Alt alta']])}</div>`}
    <div class="out" id="olcuOut"></div>
  </div>

  <h3>Fiyat ve kampanya</h3>
  <div class="stack">
    <div class="g2">${inp('fiyat', 'Fiyat', f.fiyat, '4500')}${inp('eski', 'Eski fiyat (üstü çizili)', f.eski, 'boş bırakılabilir')}</div>
    <div class="g2">${inp('indirim', 'İndirim', f.indirim, 'boşsa otomatik')}${inp('ozel', 'Özel fiyat yazısı', f.ozel, 'ör. Hikâyeye özel')}</div>
    <label class="chk"><input type="checkbox" data-f="kargo" ${f.kargo ? 'checked' : ''}> Ücretsiz kargo rozeti</label>
    ${f.kargo ? inp('kargoMetin', 'Kargo yazısı', f.kargoMetin) : ''}
    <div class="out" id="fiyatOut"></div>
  </div>

  <h3>Sipariş yönlendirmesi</h3>
  <div class="stack">
    ${seg('siparis', f.siparis, [['dm', 'DM'], ['web', 'Web'], ['wa', 'WhatsApp'], ['ozel', 'Özel'], ['yok', 'Yok']])}
    ${f.siparis === 'dm' ? inp('dmMetin', 'Yazı', f.dmMetin) : ''}
    ${f.siparis === 'web' ? inp('web', 'Web adresi', f.web, 'tuciwood.com') : ''}
    ${f.siparis === 'wa' ? inp('wa', 'WhatsApp numarası', f.wa, '0 5xx xxx xx xx') : ''}
    ${f.siparis === 'ozel' ? inp('siparisOzel', 'Yazı', f.siparisOzel, 'ör. Profildeki bağlantıya dokunun') : ''}
    <p class="note">Instagram hikâyesinde tıklanabilir bağlantı için paylaşırken "Bağlantı" çıkartmasını ekleyin; buradaki yazı yönlendirme içindir.</p>
  </div>

  <h3>Özellikler</h3>
  <div class="g2">${inp('malzeme', 'Malzeme', f.malzeme)}${inp('yuzey', 'Yüzey', f.yuzey)}${inp('uretim', 'Üretim', f.uretim)}${inp('garanti', 'Garanti', f.garanti)}</div>

  <h3>İşaretli detaylar</h3>
  <div class="stack">${f.d.map((d, i) => `<div class="g2">${inp(`d.${i}.t`, `Detay ${i + 1}`, d.t)}${inp(`d.${i}.s`, 'Alt satır', d.s)}</div>`).join('')}</div>
  <p class="note">Bu bilgiler şablonlardaki yazılara otomatik yerleşir. Boş bıraktığınız bilgi görselde görünmez.</p>`;
  $('#bPickPhoto').addEventListener('click', () => $('#fPhoto').click());
  const tol = $('#cutTol');
  tol.addEventListener('input', () => { doc.cutTol = +tol.value; tol.nextElementSibling.textContent = tol.value; makeCutSoon(); commitSoon(); });
  p.querySelectorAll('[data-f]').forEach(inpEl => {
    const ev = inpEl.type === 'checkbox' || inpEl.tagName === 'SELECT' ? 'change' : 'input';
    inpEl.addEventListener(ev, () => {
      const k = inpEl.dataset.f, v = inpEl.type === 'checkbox' ? inpEl.checked : inpEl.value;
      if (k.startsWith('d.')) { const [, i, s] = k.split('.'); doc.f.d[+i][s] = v; } else doc.f[k] = v;
      requestRender(); updInfoBits(); commitSoon();
      if (k === 'kargo') renderInfoPanel();
    });
  });
  p.querySelectorAll('[data-seg]').forEach(s => s.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    doc.f[s.dataset.seg] = b.dataset.v; commit(); requestRender(); renderInfoPanel();
  }));
  updInfoBits();
}
function updInfoBits() {
  const TK = tokens(doc.f);
  const o = $('#olcuOut'); if (o) o.textContent = TK['Ölçü'] ? 'Görselde: ' + TK['Ölçü'] : 'Ölçü girilmedi, görselde görünmez.';
  const fo = $('#fiyatOut'); if (fo) fo.textContent = [TK.ÖzelFiyat, TK.EskiFiyat && `eski ${TK.EskiFiyat}`, TK.Fiyat, TK.İndirim, TK.Kargo].filter(Boolean).join(' · ') || 'Fiyat girilmedi.';
  const pn = $('#photoNote'); if (pn) pn.textContent = doc.photo === 'sample' ? 'Örnek fotoğraf' : 'Kendi fotoğrafınız';
}

/* Renk ve yazı */
function renderThemePanel() {
  const p = $('#p-theme'), th = doc.theme;
  p.innerHTML = `
  <h3>Hazır renkler</h3>
  <div class="themes">${THEMES.map(t => `<button class="theme ${t.id === th.id ? 'on' : ''}" data-theme="${t.id}"><i>${['bg1', 'accent', 'accent2', 'ink', 'paper'].map(k => `<b style="background:${t[k]}"></b>`).join('')}</i>${esc(t.name)}</button>`).join('')}</div>
  <h3>Zemin</h3>
  <div class="stack">
    ${seg('bgType', doc.bg.type, [['linear', 'Geçişli'], ['solid', 'Düz'], ['radial', 'Işıklı']])}
    <label class="chk"><input type="checkbox" id="bgAuto" ${doc.bg.auto ? 'checked' : ''}> Zemin rengini fotoğraftan al</label>
    <p class="note">Açıkken fotoğrafın kenar rengi kullanılır; fotoğraf zemine dikişsiz karışır. Kenarı solan fotoğraflarda açık kalması önerilir.</p>
    <div class="g2">
      <label class="f">Zemin 1<select id="bgC1">${Object.keys(TOKEN_NAMES).concat(['dark2']).map(k => `<option value="${k}" ${k === (doc.bg.c1 || 'bg1') ? 'selected' : ''}>${esc(TOKEN_NAMES[k] || 'Koyu 2')}</option>`).join('')}</select></label>
      <label class="f">Zemin 2<select id="bgC2">${Object.keys(TOKEN_NAMES).concat(['dark2']).map(k => `<option value="${k}" ${k === (doc.bg.c2 || 'bg2') ? 'selected' : ''}>${esc(TOKEN_NAMES[k] || 'Koyu 2')}</option>`).join('')}</select></label>
    </div>
  </div>
  <h3>Tema renklerini düzenle</h3>
  <div class="colors">${Object.keys(TOKEN_NAMES).concat(['dark2']).map(k => `<label><input type="color" data-tk="${k}" value="${th[k]}">${esc(TOKEN_NAMES[k] || 'Koyu 2')}</label>`).join('')}</div>
  <h3>Yazı tipi eşleşmeleri</h3>
  <div class="pairs">${PAIRS.map(pr => `<button class="pair ${pr.head === doc.fonts.head && pr.body === doc.fonts.body ? 'on' : ''}" data-pair="${pr.id}"><span class="s1" style="font-family:${esc(cssFam(pr.head))}">Cem sehpa</span><span class="s2" style="font-family:${esc(cssFam(pr.body))}">${esc(pr.name)} · ${esc(pr.head)}</span></button>`).join('')}</div>
  <div class="g2" style="margin-top:12px">
    <label class="f">Başlık yazı tipi<select id="fHead">${FONTS.map(fn => `<option ${fn === doc.fonts.head ? 'selected' : ''}>${fn}</option>`).join('')}</select></label>
    <label class="f">Metin yazı tipi<select id="fBody">${FONTS.map(fn => `<option ${fn === doc.fonts.body ? 'selected' : ''}>${fn}</option>`).join('')}</select></label>
  </div>
  <p class="note">Tek bir yazının yazı tipini değiştirmek için o yazıyı seçip Öğe sekmesini kullanın.</p>`;
  p.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => { doc.theme = clone(THEMES.find(t => t.id === b.dataset.theme)); commit(); requestRender(); renderThemePanel(); }));
  p.querySelector('[data-seg=bgType]').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; doc.bg.type = b.dataset.v; commit(); requestRender(); renderThemePanel(); });
  $('#bgAuto').addEventListener('change', e => { doc.bg.auto = e.target.checked; if (doc.bg.auto && photoImg) doc.auto = sampleEdges(photoImg); commit(); requestRender(); });
  $('#bgC1').addEventListener('change', e => { doc.bg.c1 = e.target.value; commit(); requestRender(); });
  $('#bgC2').addEventListener('change', e => { doc.bg.c2 = e.target.value; commit(); requestRender(); });
  p.querySelectorAll('[data-tk]').forEach(i => i.addEventListener('input', () => { doc.theme[i.dataset.tk] = i.value; doc.theme.id = 'ozel'; requestRender(); commitSoon(); }));
  p.querySelectorAll('[data-pair]').forEach(b => b.addEventListener('click', () => { const pr = PAIRS.find(x => x.id === b.dataset.pair); doc.fonts = { head: pr.head, body: pr.body }; commit(); requestRender(); renderThemePanel(); }));
  $('#fHead').addEventListener('change', e => { doc.fonts.head = e.target.value; commit(); requestRender(); renderThemePanel(); });
  $('#fBody').addEventListener('change', e => { doc.fonts.body = e.target.value; commit(); requestRender(); renderThemePanel(); });
}

/* Öğe */
const TYPE_NAMES = { text: 'Yazı', rect: 'Şekil', photo: 'Fotoğraf', line: 'Çizgi' };
function swatches(prop, val, allowNone) {
  const keys = ['ink', 'sub', 'accent', 'accent2', 'paper', 'dark', 'cream', 'bg1', 'bg2'];
  const isHex = val && val[0] === '#';
  return `<div class="sw" data-sw="${prop}">${allowNone ? `<button class="none ${!val ? 'on' : ''}" data-c="" title="Yok"></button>` : ''}${keys.map(k => `<button data-c="${k}" class="${val === k ? 'on' : ''}" title="${esc(TOKEN_NAMES[k])}" style="background:${colorOf(doc, k)}"></button>`).join('')}<input type="color" data-cc="${prop}" value="${isHex ? val : '#888888'}" title="Özel renk"></div>`;
}
const rng = (key, label, val, min, max, step, fmt = v => v) => `<div class="rng"><span>${esc(label)}</span><input type="range" data-r="${key}" min="${min}" max="${max}" step="${step}" value="${val}"><output>${fmt(val)}</output></div>`;
function getPath(o, path) { return path.split('.').reduce((a, k) => a?.[k], o); }
function setPath(o, path, v) { const ks = path.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => (a[k] ??= {}), o); t[last] = v; }

function renderElPanel() {
  const p = $('#p-el'); if (ui.tab !== 'el') return;
  const els = sel.map(getEl).filter(Boolean);
  const alignRow = `<div class="tools" data-align>
    <button data-a="l" title="Sola hizala">⇤</button><button data-a="cx" title="Yatayda ortala">↔</button><button data-a="r" title="Sağa hizala">⇥</button>
    <button data-a="t" title="Üste hizala">⤒</button><button data-a="cy" title="Dikeyde ortala">↕</button><button data-a="b" title="Alta hizala">⤓</button></div>
    <p class="note">${els.length > 1 ? 'Seçili öğeler birbirine göre hizalanır.' : 'Tek öğe kenar boşluklarına (ortalamada sayfaya) göre hizalanır.'}</p>`;
  if (!els.length) {
    p.innerHTML = `<p class="note" style="margin-top:0">Düzenlemek için görselde bir öğeye dokunun. Sürükleyerek taşıyın; köşelerden boyutlandırın, üstteki yuvarlak tutamaçla döndürün. Çift tıklayınca yazıyı düzenlersiniz.</p>
      <h3>Katmanlar</h3><div class="layers">${[...doc.els].reverse().map(el => layerRow(el)).join('')}</div>
      <p class="note">Üstteki katman önde görünür. Göz simgesi öğeyi gizler.</p>`;
    bindLayers(p); return;
  }
  if (els.length > 1) {
    p.innerHTML = `<h3>${els.length} öğe seçili</h3>${alignRow}
      <div class="row" style="margin-top:12px"><button class="btn" data-act="dup">Çoğalt</button><button class="btn warn" data-act="del">Sil</button><button class="btn" data-act="none">Seçimi kaldır</button></div>
      <h3>Katmanlar</h3><div class="layers">${[...doc.els].reverse().map(el => layerRow(el)).join('')}</div>`;
    bindCommon(p); bindLayers(p); return;
  }
  const el = els[0];
  let h = `<div class="row" style="justify-content:space-between"><h3 style="margin:4px 0">${esc(el.name || TYPE_NAMES[el.type])}</h3><button class="btn" data-act="none">Kapat</button></div>`;
  if (el.follow) {
    h += `<p class="note">Bu, ürünün fotoğraftan kesilmiş hâli. Konumu ve boyutu ana fotoğrafı izler; ana fotoğrafı taşıyınca birlikte hareket eder. Kesim ayarı Bilgiler sekmesinde.</p>`;
  }
  if (el.type === 'text') h += textInspector(el);
  if (el.type === 'photo' && !el.follow) h += photoInspector(el);
  if (el.type === 'rect') h += rectInspector(el);
  if (el.type === 'line') h += lineInspector(el);
  h += `<h3>Konum</h3>${alignRow}`;
  if (el.type !== 'line') h += rng('rot', 'Döndür', el.rot || 0, -180, 180, 0.5, v => Math.round(v) + '°');
  h += rng('op', 'Saydamlık', el.op ?? 1, 0.05, 1, 0.01, v => Math.round(v * 100) + '%');
  h += `<h3>Katman</h3><div class="tools"><button data-act="top">En öne</button><button data-act="up">Öne</button><button data-act="down">Arkaya</button><button data-act="bottom">En arkaya</button></div>
    <div class="row" style="margin-top:12px"><button class="btn" data-act="dup">Çoğalt</button><button class="btn" data-act="lock">${el.locked ? 'Kilidi aç' : 'Kilitle'}</button><button class="btn" data-act="hide">Gizle</button><button class="btn warn" data-act="del">Sil</button></div>
    <label class="f" style="margin-top:12px">Öğe adı<input type="text" id="elName" value="${esc(el.name)}"></label>`;
  p.innerHTML = h;
  bindInspector(p, el); bindCommon(p);
}
function layerRow(el) {
  const TK = tokens(doc.f);
  let sub = TYPE_NAMES[el.type];
  if (el.type === 'text') { const t = resolveLines(el.text, TK).map(l => stripMk(l.s)).join(' '); sub = t ? t.slice(0, 40) : '(boş bilgi, görünmüyor)'; }
  return `<div class="layer ${sel.includes(el.id) ? 'on' : ''} ${el.hidden ? 'off' : ''}"><button class="nm" data-pick="${el.id}">${esc(el.name || TYPE_NAMES[el.type])} <small>· ${esc(sub)}</small></button>
    <button class="mini" data-eye="${el.id}" title="${el.hidden ? 'Göster' : 'Gizle'}">${el.hidden ? '◌' : '◉'}</button>${el.locked ? '<span title="Kilitli">🔒</span>' : ''}</div>`;
}
function bindLayers(p) {
  p.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { sel = [b.dataset.pick]; renderElPanel(); requestRender(); }));
  p.querySelectorAll('[data-eye]').forEach(b => b.addEventListener('click', () => { const el = getEl(b.dataset.eye); el.hidden = !el.hidden; commit(); renderElPanel(); requestRender(); }));
}
function bindCommon(p) {
  p.querySelectorAll('[data-align] button').forEach(b => b.addEventListener('click', () => alignSel(b.dataset.a)));
  p.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.act, el = getEl(sel[0]);
    if (a === 'dup') duplicate(); if (a === 'del') removeSel(); if (a === 'none') { sel = []; renderElPanel(); requestRender(); }
    if (['top', 'up', 'down', 'bottom'].includes(a)) moveLayer(a);
    if (a === 'lock' && el) { el.locked = !el.locked; commit(); renderElPanel(); requestRender(); }
    if (a === 'hide' && el) { el.hidden = true; sel = []; commit(); renderElPanel(); requestRender(); toast('Gizlendi. Katmanlar listesinden geri açabilirsiniz'); }
  }));
}
function textInspector(el) {
  const fontOpts = [['head', `Başlık yazı tipi (${doc.fonts.head})`], ['body', `Metin yazı tipi (${doc.fonts.body})`], ...FONTS.map(f => [f, f])];
  return `<label class="f">Yazı<textarea id="elText">${esc(el.text)}</textarea></label>
  <div class="chips" style="margin:8px 0 4px">${['Ad', 'Vurgu', 'Etiket', 'Ölçü', 'Fiyat', 'EskiFiyat', 'ÖzelFiyat', 'İndirim', 'Kargo', 'Sipariş', 'Malzeme', 'Yüzey', 'Üretim', 'Garanti', 'Marka'].map(t => `<button data-tok="${t}">${t}</button>`).join('')}<button data-tokmore>+ diğer</button></div>
  <p class="note">{Fiyat} gibi süslü parantezli alanlar Bilgiler sekmesinden dolar. <b>**kalın**</b>, <b>[vurgu rengi]</b>, <b>~~üstü çizili~~</b> yazabilirsiniz.</p>
  <h3>Yazı stili</h3>
  <label class="f">Yazı tipi<select id="elFont">${fontOpts.map(([v, l]) => `<option value="${esc(v)}" ${v === el.font ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
  <div style="margin-top:10px">${rng('size', 'Boyut', Math.round(el.size), 10, 420, 1, v => Math.round(v))}</div>
  <div class="tools" style="margin:8px 0">
    <button data-tg="bold" class="${el.weight >= 700 ? 'on' : ''}" title="Kalın"><b>K</b></button>
    <button data-tg="italic" class="${el.italic ? 'on' : ''}" title="İtalik"><i>İ</i></button>
    <button data-tg="underline" class="${el.underline ? 'on' : ''}" title="Altı çizili"><u>A</u></button>
    <button data-tg="strike" class="${el.strike ? 'on' : ''}" title="Üstü çizili"><s>Ü</s></button>
    <button data-tg="upper" class="${el.upper ? 'on' : ''}" title="BÜYÜK HARF">AA</button>
    <button data-tg="tshadow" class="${el.tshadow ? 'on' : ''}" title="Yazı gölgesi">G</button>
  </div>
  <label class="f">Kalınlık<select id="elWeight">${[[400, 'Normal'], [500, 'Orta'], [600, 'Yarı kalın'], [700, 'Kalın'], [800, 'Çok kalın']].map(([v, l]) => `<option value="${v}" ${v === el.weight ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
  <div style="margin-top:10px">${seg('align', el.align, [['left', 'Sola'], ['center', 'Ortaya'], ['right', 'Sağa']])}</div>
  <div style="margin-top:8px">${rng('ls', 'Harf aralığı', el.ls, -0.1, 0.6, 0.01, v => (+v).toFixed(2))}${rng('lh', 'Satır aralığı', el.lh, 0.8, 2.2, 0.01, v => (+v).toFixed(2))}</div>
  <label class="chk" style="margin-top:8px"><input type="checkbox" data-ck="fit" ${el.fit ? 'checked' : ''}> Tek satıra sığdır (uzun ad küçülür)</label>
  <h3>Renk</h3>${swatches('color', el.color)}
  <div class="note" style="margin:10px 0 6px">[Köşeli parantez] içi renk</div>${swatches('accent', el.accent)}
  <h3>İlk satır</h3>
  <label class="chk"><input type="checkbox" data-ck="firstOn" ${el.first ? 'checked' : ''}> İlk satır farklı görünsün</label>
  ${el.first ? `<div style="margin-top:8px">${rng('first.size', 'Boyut', Math.round(el.first.size ?? el.size), 10, 300, 1, v => Math.round(v))}</div>
    <div class="tools" style="margin:8px 0"><button data-ftg="bold" class="${(el.first.weight ?? el.weight) >= 700 ? 'on' : ''}"><b>K</b></button><button data-ftg="upper" class="${el.first.upper ?? el.upper ? 'on' : ''}">AA</button><button data-ftg="italic" class="${el.first.italic ?? el.italic ? 'on' : ''}"><i>İ</i></button></div>
    ${swatches('first.color', el.first.color ?? el.color)}` : ''}
  <h3>Kutu (arka plan)</h3>
  <label class="chk"><input type="checkbox" data-ck="boxOn" ${el.box ? 'checked' : ''}> Yazının arkasına kutu koy</label>
  ${el.box ? `<div style="margin-top:10px">${swatches('box.fill', el.box.fill)}</div><div style="margin-top:8px">
    ${rng('box.px', 'Yatay boşluk', el.box.px, 0, 80, 1, v => Math.round(v))}${rng('box.py', 'Dikey boşluk', el.box.py, 0, 60, 1, v => Math.round(v))}${rng('box.r', 'Köşe', Math.min(el.box.r, 120), 0, 120, 1, v => Math.round(v))}</div>
    <label class="chk"><input type="checkbox" data-ck="box.shadow" ${el.box.shadow ? 'checked' : ''}> Gölge</label>
    <label class="chk" style="margin-top:6px"><input type="checkbox" data-ck="hug" ${el.hug ? 'checked' : ''}> Kutu yazıya göre daralsın</label>` : ''}`;
}
function photoInspector(el) {
  return `<h3>Fotoğraf</h3>
  <div class="row"><button class="btn" id="bPick2">Fotoğrafı değiştir</button><button class="btn ${ui.crop ? 'pri' : ''}" id="bCrop">${ui.crop ? 'Kaydırma açık' : 'Çerçevede kaydır'}</button></div>
  <p class="note">"Çerçevede kaydır" açıkken sürüklemek fotoğrafı çerçeve içinde oynatır; kapalıyken çerçeveyi taşır.</p>
  <div style="margin-top:8px">${seg('shape', el.shape, [['rect', 'Köşeli'], ['arch', 'Kemer'], ['circle', 'Daire'], ['fade', 'Kenarı solan']])}</div>
  <div style="margin-top:8px">
  ${rng('zoom', 'Yakınlaştır', el.zoom, 0.3, 5, 0.01, v => (+v).toFixed(2) + '×')}
  ${rng('fx', 'Yatay odak', el.fx, -0.5, 1.5, 0.005, v => Math.round(v * 100))}
  ${rng('fy', 'Dikey odak', el.fy, -0.5, 1.5, 0.005, v => Math.round(v * 100))}
  ${el.shape === 'rect' || el.shape === 'arch' ? rng('r', 'Köşe', el.r || 0, 0, 200, 1, v => Math.round(v)) : ''}
  ${el.shape !== 'fade' ? rng('border', 'Kenarlık', el.border || 0, 0, 60, 1, v => Math.round(v)) : ''}</div>
  ${el.shape !== 'fade' && el.border ? swatches('bcolor', el.bcolor) : ''}
  ${el.shape !== 'fade' ? `<label class="chk" style="margin-top:8px"><input type="checkbox" data-ck="shadow" ${el.shadow ? 'checked' : ''}> Gölge</label>` : ''}`;
}
function rectInspector(el) {
  return `<h3>Şekil</h3>${seg('shape', el.shape, [['rect', 'Kutu'], ['arch', 'Kemer'], ['circle', 'Daire'], ['tag', 'Etiket']])}
  <div style="margin-top:8px">${el.shape === 'rect' || el.shape === 'arch' ? rng('r', 'Köşe', el.r || 0, 0, 200, 1, v => Math.round(v)) : ''}</div>
  <h3>Dolgu</h3>${swatches('fill', el.fill, true)}
  <h3>Kenar çizgisi</h3>${swatches('stroke', el.stroke, true)}
  <div style="margin-top:8px">${rng('sw', 'Kalınlık', el.sw || 0, 0, 20, 0.5, v => (+v).toFixed(1))}</div>
  <label class="chk" style="margin-top:8px"><input type="checkbox" data-ck="shadow" ${el.shadow ? 'checked' : ''}> Gölge</label>`;
}
function lineInspector(el) {
  const caps = [['none', 'Yok'], ['dot', 'Nokta'], ['tick', 'Çentik']];
  return `<h3>Çizgi</h3>${swatches('color', el.color)}
  <div style="margin-top:8px">${rng('lw', 'Kalınlık', el.lw, 1, 16, 0.5, v => (+v).toFixed(1))}</div>
  <div class="note" style="margin:8px 0 6px">Başlangıç ucu</div>${seg('cap1', el.cap1, caps)}
  <div class="note" style="margin:8px 0 6px">Bitiş ucu</div>${seg('cap2', el.cap2, caps)}
  <h3>Çizgi üstü yazı</h3>
  <label class="f">Yazı<input type="text" id="elLabel" value="${esc(el.label)}" placeholder="ör. {Genişlik}"></label>
  <div class="chips" style="margin:8px 0">${['Çap', 'Genişlik', 'Derinlik', 'Yükseklik'].map(t => `<button data-ltok="${t}">${t}</button>`).join('')}</div>
  ${rng('lsize', 'Yazı boyutu', el.lsize, 14, 80, 1, v => Math.round(v))}
  <p class="note">Uçları sürükleyerek yerleştirin. Shift ile düz tutar.</p>`;
}
function bindInspector(p, el) {
  const upd = (full) => { requestRender(); commitSoon(); if (full) renderElPanel(); };
  const ta = $('#elText');
  if (ta) {
    ta.addEventListener('input', () => { el.text = ta.value; upd(); });
    p.querySelectorAll('[data-tok]').forEach(b => b.addEventListener('click', () => insertTok(ta, b.dataset.tok, v => { el.text = v; upd(); })));
    const more = p.querySelector('[data-tokmore]');
    if (more) more.addEventListener('click', () => { more.parentElement.innerHTML = TOKEN_LIST.map(t => `<button data-tok2="${t}">${t}</button>`).join(''); p.querySelectorAll('[data-tok2]').forEach(b => b.addEventListener('click', () => insertTok(ta, b.dataset.tok2, v => { el.text = v; upd(); }))); });
  }
  const lb = $('#elLabel');
  if (lb) {
    lb.addEventListener('input', () => { el.label = lb.value; upd(); });
    p.querySelectorAll('[data-ltok]').forEach(b => b.addEventListener('click', () => { el.label = `{${b.dataset.ltok}}`; lb.value = el.label; upd(); }));
  }
  const nmI = $('#elName'); if (nmI) nmI.addEventListener('input', () => { el.name = nmI.value; commitSoon(); });
  const fs = $('#elFont'); if (fs) fs.addEventListener('change', () => { el.font = fs.value; upd(); });
  const ws = $('#elWeight'); if (ws) ws.addEventListener('change', () => { el.weight = +ws.value; upd(true); });
  p.querySelectorAll('[data-r]').forEach(r => r.addEventListener('input', () => {
    let v = +r.value; const k = r.dataset.r;
    if (k === 'first.size' && !el.first) el.first = {};
    if (k === 'rot' || k === 'op') { el[k] = v; } else setPath(el, k, v);
    r.nextElementSibling.textContent = r.parentElement.querySelector('output') ? fmtR(k, v) : '';
    upd();
  }));
  p.querySelectorAll('[data-tg]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.tg;
    if (k === 'bold') el.weight = el.weight >= 700 ? 400 : 700; else el[k] = !el[k];
    upd(true);
  }));
  p.querySelectorAll('[data-ftg]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.ftg; el.first ??= {};
    if (k === 'bold') el.first.weight = (el.first.weight ?? el.weight) >= 700 ? 400 : 700; else el.first[k] = !(el.first[k] ?? el[k]);
    upd(true);
  }));
  p.querySelectorAll('[data-ck]').forEach(c => c.addEventListener('change', () => {
    const k = c.dataset.ck;
    if (k === 'firstOn') el.first = c.checked ? { size: Math.round(el.size * 0.4), weight: 700, upper: true, ls: 0.1 } : null;
    else if (k === 'boxOn') el.box = c.checked ? { fill: 'paper', px: 26, py: 14, r: 22, shadow: false } : null;
    else setPath(el, k, c.checked);
    upd(true);
  }));
  p.querySelectorAll('[data-sw]').forEach(s => {
    s.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (s.dataset.sw.startsWith('first.')) el.first ??= {}; setPath(el, s.dataset.sw, b.dataset.c); upd(true); });
    const cc = s.querySelector('input[type=color]');
    cc.addEventListener('input', () => { setPath(el, cc.dataset.cc, cc.value); requestRender(); commitSoon(); });
    cc.addEventListener('change', () => renderElPanel());
  });
  p.querySelectorAll('[data-seg]').forEach(s => s.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; el[s.dataset.seg] = b.dataset.v;
    if (s.dataset.seg === 'shape') fadeCache.delete(el.id);
    upd(true);
  }));
  const b2 = $('#bPick2'); if (b2) b2.addEventListener('click', () => $('#fPhoto').click());
  const bc = $('#bCrop'); if (bc) bc.addEventListener('click', () => { ui.crop = !ui.crop; renderElPanel(); toast(ui.crop ? 'Sürükleyince fotoğraf çerçevede kayar' : 'Sürükleyince çerçeve taşınır'); });
}
function fmtR(k, v) {
  if (k === 'rot') return Math.round(v) + '°'; if (k === 'op') return Math.round(v * 100) + '%';
  if (k === 'zoom') return v.toFixed(2) + '×'; if (k === 'fx' || k === 'fy') return Math.round(v * 100);
  if (k === 'ls' || k === 'lh') return v.toFixed(2); if (k === 'lw' || k === 'sw') return v.toFixed(1);
  return Math.round(v);
}
function insertTok(ta, tok, set) {
  const s = ta.selectionStart ?? ta.value.length, e = ta.selectionEnd ?? s, ins = `{${tok}}`;
  ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e); ta.focus(); ta.selectionStart = ta.selectionEnd = s + ins.length; set(ta.value);
}

/* Tasarımlar */
async function renderSavedPanel() {
  const p = $('#p-saved');
  const name = `${doc.f.ad} ${doc.f.vurgu}`.trim();
  p.innerHTML = `<h3>Bu tasarımı kaydet</h3>
    <div class="stack"><label class="f">Ad<input type="text" id="saveName" value="${esc(name)}"></label>
    <div class="row"><button class="btn pri" id="bSave">Kaydet</button>${doc._savedId ? `<button class="btn" id="bSaveOver">Üzerine kaydet</button>` : ''}</div>
    <p class="note">Tasarımlar, fotoğraflarıyla birlikte bu cihazda saklanır. Aynı tasarımı başka ürün için kullanmak için açıp bilgileri ve fotoğrafı değiştirmeniz yeterli.</p></div>
    <h3>Kayıtlı tasarımlar</h3><div class="designs" id="dList"><div class="empty">Yükleniyor…</div></div>
    <h3>Yeni</h3><button class="btn" id="bNew">Örnek tasarımla yeniden başla</button>
    <p class="note">Kayıtlı tasarımlarınız silinmez; yalnızca açık olan çalışma sıfırlanır. Geri almak için ↶.</p>`;
  $('#bSave').addEventListener('click', () => saveDesign(false));
  $('#bSaveOver')?.addEventListener('click', () => saveDesign(true));
  $('#bNew').addEventListener('click', () => { const keep = { theme: doc.theme, fonts: doc.fonts }; doc = newDoc('isaret', doc.fmt, keep); sel = []; loadPhoto(); commit(); fitCanvas(); setTab('tpl'); toast('Örnek tasarım açıldı'); });
  let list = [];
  try { list = (await dbAll('designs')).sort((a, b) => b.updated - a.updated); } catch (e) {}
  const box = $('#dList'); if (!box) return;
  box.innerHTML = list.length ? list.map(d => `<div class="design"><img src="${d.thumb}" alt=""><b>${esc(d.name)}</b><small>${new Date(d.updated).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} · ${esc(FORMATS[d.doc.fmt]?.label || '')} ${esc(FORMATS[d.doc.fmt]?.ratio || '')}</small>
    <div class="row"><button class="btn" data-open="${d.id}">Aç</button><button class="btn warn" data-del="${d.id}">Sil</button></div></div>`).join('')
    : '<div class="empty" style="grid-column:1/-1">Henüz kayıtlı tasarım yok.</div>';
  box.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', async () => {
    const d = list.find(x => x.id === b.dataset.open); if (!d) return;
    doc = clone(d.doc); doc._savedId = d.id; sel = []; fadeCache.clear(); loadPhoto(); commit(); fitCanvas(); setTab('tpl'); toast(`"${d.name}" açıldı`);
  }));
  box.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Emin misiniz?'; setTimeout(() => { if (b.isConnected) { b.dataset.sure = ''; b.textContent = 'Sil'; } }, 3000); return; }
    await dbDel('designs', b.dataset.del); toast('Tasarım silindi'); renderSavedPanel();
  }));
}
async function saveDesign(over) {
  const name = nm($('#saveName').value) || 'Tasarım';
  const { W, H } = FORMATS[doc.fmt], tw = 300;
  const c = document.createElement('canvas'); c.width = tw; c.height = Math.round(tw * H / W);
  const x = c.getContext('2d'); x.scale(tw / W, tw / W); draw(x, doc, { preview: false });
  const id = over && doc._savedId ? doc._savedId : 'd' + Date.now().toString(36);
  const d = clone(JSON.parse(snap())); delete d._savedId;
  try { await dbPut('designs', { id, name, updated: Date.now(), doc: d, thumb: c.toDataURL('image/jpeg', 0.8) }); doc._savedId = id; toast('Kaydedildi'); }
  catch (e) { toast('Kaydedilemedi: cihazda yer kalmamış olabilir'); }
  renderSavedPanel();
}

/* ---------- Erişim anahtarı ----------
   Uygulama yalnızca gizli bağlantıyla açılır. Anahtarın kendisi burada yok, yalnızca özeti (SHA-256) var. */
const KEY_HASH = 'f6f69ad0ddfb02358865744671ea09efda3951d1fb022a1a881a152d2fc733ff';
const KEY_LS = 'tstudio-key';
async function sha256(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
const keyFrom = v => { const m = String(v || '').match(/[#&?]k=([A-Za-z0-9]+)/); return m ? m[1] : String(v || '').trim(); };
async function keyOk(k) { try { return !!k && (await sha256(k)) === KEY_HASH; } catch (e) { return false; } }
async function gate() {
  let stored = null; try { stored = localStorage.getItem(KEY_LS); } catch (e) {}
  const fromUrl = keyFrom(location.hash);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  for (const k of [fromUrl, stored]) {
    if (await keyOk(k)) { try { localStorage.setItem(KEY_LS, k); } catch (e) {} start(); return; }
  }
  $('#appRoot').hidden = true; $('#lock').hidden = false;
  let opened = false;
  const tryOpen = async k => {
    if (opened || !(await keyOk(k))) return false;
    opened = true; try { localStorage.setItem(KEY_LS, k); } catch (er) {}
    $('#lock').hidden = true; start(); return true;
  };
  $('#lockForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!(await tryOpen(keyFrom($('#lockKey').value)))) $('#lockErr').textContent = 'Bu anahtar geçerli değil.';
  });
  addEventListener('hashchange', async () => {
    const k = keyFrom(location.hash); history.replaceState(null, '', location.pathname + location.search); await tryOpen(k);
  });
}

/* ---------- Başlat ---------- */
function start() {
  $('#appRoot').hidden = false;
  let saved = null; try { saved = localStorage.getItem(LS); } catch (e) {}
  try { doc = saved ? JSON.parse(saved) : null; } catch (e) { doc = null; }
  if (!doc || !doc.els || !FORMATS[doc.fmt]) doc = newDoc();
  doc.f = Object.assign(clone(DEFAULT_FIELDS), doc.f);
  hist.stack = [snap()]; hist.i = 0; updUndo();
  loadPhoto(); fitCanvas(); setTab('tpl');
  document.fonts.ready.then(() => { requestRender(); if (ui.tab === 'tpl') drawThumbs(); });
  new ResizeObserver(fitCanvas).observe($('#stage'));
}
gate();

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
