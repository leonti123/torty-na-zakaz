const byId = id => document.getElementById(id);
const LEAD_URL = "https://script.google.com/macros/s/AKfycby3_mdaCfx-Kv0MWD1RiwXnmTO47GtAS9zrH0WZsPcyeEGYHIRrXQjAU_EtMCfIypOW/exec";
const KG = 2700;
const fmt = n => n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';

const PRODUCTS = [
  {id:'berry', t:'cake', img:'p029.jpg', title:'Ягодный венок', badge:'Хит', text:'Светлый торт с короной из малины, голубики и ежевики. Нежный крем и много свежих ягод.', list:['Вес от 1,5 кг','Любая начинка','Ягоды по сезону'], price:2700, from:true, unit:'/кг'},
  {id:'drip', t:'cake', img:'p020.jpg', title:'Шоколадные подтёки', text:'Белый торт с шоколадными подтёками, ягодами и макаронс сверху.', list:['Вес от 1,5 кг','Подтёки из бельгийского шоколада','Цвет макаронс на выбор'], price:2700, from:true, unit:'/кг'},
  {id:'macaron', t:'cake', img:'p017.jpg', title:'Торт с макаронс', badge:'Яркий', text:'Бирюзовый торт с макаронс, безе и посыпкой. Цвет крема подберём под праздник.', list:['Вес от 2 кг','Макаронс и безе ручной работы','Любой цвет крема'], price:2700, from:true, unit:'/кг'},
  {id:'number', t:'cake', img:'p028.jpg', title:'Торт с надписью', text:'Шоколадный декор, ягоды и надпись или цифра на верхушке. Подходит на юбилей.', list:['Вес от 1,5 кг','Надпись, имя или цифра','Шоколадные плитки и ягоды'], price:2700, from:true, unit:'/кг'},
  {id:'choco', t:'cake', img:'p030.jpg', title:'Шоколадный с ягодами', badge:'Новинка', text:'Шоколадные коржи, крем и карамельная прослойка, сверху глазурь и ягоды.', list:['Вес от 1,5 кг','Шоколадные коржи','Голубика, малина, ежевика'], price:2700, from:true, unit:'/кг'},
  {id:'cup-berry', t:'cup', img:'p023.jpg', title:'Капкейки с ягодами', text:'Капкейки с малиновой шапкой крема, свежими ягодами и печеньем.', list:['Коробка 6, 9 или 12 шт','Шапка из крема','Ягоды и печенье'], price:1500, from:true, unit:'за 6 шт'},
  {id:'cup-bright', t:'cup', img:'p025.jpg', title:'Капкейки с надписями', badge:'Подарок', text:'Яркие капкейки с шоколадными табличками: «С днём рождения», «Мы вас любим».', list:['Коробка 9 или 12 шт','Надписи на шоколаде','Яркие цвета крема'], price:1700, from:true, unit:'за 6 шт'},
  {id:'cup-red', t:'cup', img:'p046.jpg', title:'Красный бархат', text:'Капкейк красный бархат с кремом внутри и клубникой сверху.', list:['Коробка 6, 9 или 12 шт','Крем-чиз внутри','Клубника сверху'], price:1600, from:true, unit:'за 6 шт'},
  {id:'cup-oreo', t:'cup', img:'p044.jpg', title:'Капкейки в коробке', text:'Капкейки с ягодами, малиновым кремом и золотой посыпкой в подарочной коробке.', list:['Коробка 6, 9 или 12 шт','Подарочная упаковка','Можно разные вкусы'], price:1600, from:true, unit:'за 6 шт'}
];

const FILLINGS = [
  {name:'Красный бархат', tag:'Классика', text:'Мелкопористые какао-коржи на кефире и сливочный крем. Мягкий, бархатный, узнаваемый вкус.', c:['#a3172f','#f6ece4','#b81c37','#f6ece4','#a3172f']},
  {name:'Сникерс', tag:'Сладко-солёный', text:'Шоколадные коржи, домашняя карамель, солёный арахис и крем на творожном сыре со сливками.', c:['#4a2a20','#f3e6d4','#c07a2d','#4a2a20','#e8c58e']},
  {name:'Медовик', tag:'Для всех', text:'Тонкие медовые коржи и нежный крем с карамельными и медовыми нотами.', c:['#c98a3d','#fbf0de','#c98a3d','#fbf0de','#b9772f']},
  {name:'Клубничный пломбир', tag:'Летний', text:'Ванильные коржи, воздушный сливочный крем, клубничный крем и конфи из натуральной клубники.', c:['#f2d8a7','#fff8ef','#e44867','#fff8ef','#f2d8a7']},
  {name:'Орео', tag:'Детский любимый', text:'Шоколадный бисквит, сливочный крем и хрустящие кусочки печенья Орео.', c:['#2b1d1a','#f8f4ee','#2b1d1a','#f8f4ee','#2b1d1a']},
  {name:'Шоколадная вишня', tag:'Насыщенный', text:'Пышные шоколадные коржи на сметане, сливочный крем и вишня, по желанию на коньяке.', c:['#3c1e19','#f4dde2','#8e1330','#3c1e19','#f4dde2']}
];

/* gallery */
const galleryPhotos = [
  {img:'cupcakes-strawberries.webp', title:'Подарочный набор капкейков с клубникой'},
  {img:'berry-cake.webp', title:'Торт со свежими ягодами и кремовым бортиком'},
  {img:'chocolate-cake.webp', title:'Шоколадный торт с глазурью и розетками крема'},
  {img:'cupcakes-raspberries.webp', title:'Шесть капкейков со светлым кремом и ягодами'},
  ...['choco', 'macaron', 'berry', 'cup-bright', 'number', 'cup-berry', 'cup-red', 'cup-oreo', 'drip']
    .map(id => { const {img, title} = PRODUCTS.find(p => p.id === id); return {img, title}; })
];
const all = selector => [...document.querySelectorAll(selector)];
const staticTexts = all('[data-tk]');
const textDefaults = new Map(staticTexts.map(el => [el.dataset.tk, el.textContent]));
const imageDefaults = new Map(all('img[data-ik]').map(el => [el.dataset.ik, el.getAttribute('src')]));
const contactSelectors = {phone:'tel:', group:'https://vk.ru/', vk:'https://vk.me/', max:'https://max.ru/'};
const contactLinks = Object.fromEntries(Object.entries(contactSelectors).map(([key, prefix]) =>
  [key, all('a[href^="' + prefix + '"]')]));
const contactDefaults = Object.fromEntries(Object.entries(contactLinks).map(([key, links]) =>
  [key, key === 'phone' ? document.querySelector('[data-phone]').textContent : links[0].href]));
const deliveryIcons = all('.dgrid svg').map(el => el.outerHTML);
const defaults = {
  cat: PRODUCTS, fmt: FILLINGS, gallery: galleryPhotos, kg: KG, contacts: contactDefaults, reviews: [],
  faq: all('.faq details').map(el => ({title: el.querySelector('summary').textContent, text: el.querySelector('p').textContent})),
  delivery: all('.dgrid .d').map((el, icon) => ({icon, title: el.querySelector('h3').textContent, list: [...el.querySelectorAll('li')].map(li => li.textContent)}))
};
const publishedKey = 'saburovo-published', authKey = 'saburovo-login', draftKey = 'saburovo-draft';
function readStored(storage, key) {
  try { return JSON.parse(window[storage].getItem(key)); } catch { return null; }
}
const published = window.SITE_DATA || {};
const ownVersion = readStored('sessionStorage', publishedKey);
const awaitingPages = ownVersion?.data?.rev > (published.rev || 0);
let siteData = awaitingPages ? ownVersion.data : published;
if (ownVersion && !awaitingPages) sessionStorage.removeItem(publishedKey);
const listData = key => siteData[key] ?? defaults[key];
const previews = new Map();
let photoDB;
function openPhotoDB() {
  if (!photoDB) photoDB = new Promise((resolve, reject) => {
    const req = indexedDB.open('saburovo-photos', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('photos');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return photoDB;
}
async function restorePhotos(paths) {
  if (!paths?.length) return;
  const db = await openPhotoDB();
  await Promise.all(paths.filter(path => !previews.has(path)).map(path => new Promise((resolve, reject) => {
    const req = db.transaction('photos').objectStore('photos').get(path);
    req.onsuccess = () => { if (req.result) previews.set(path, URL.createObjectURL(req.result)); resolve(); };
    req.onerror = () => reject(req.error);
  })));
}
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const photoSrc = path => previews.get(path) || (String(path).startsWith('img/') ? path : 'img/' + path);
function priceParts(item) {
  if (item.price == null || item.price === '') return '';
  const unit = item.unit || '';
  return (item.from ? 'от ' : '') + fmt(Number(item.price)) + (unit.startsWith('/') || !unit ? '' : ' ') + unit;
}
function renderContent() {
  for (const el of staticTexts) {
    const text = siteData.tx?.[el.dataset.tk] ?? textDefaults.get(el.dataset.tk);
    if (el.textContent !== text) el.textContent = text;
  }
  for (const el of all('img[data-ik^="hero-"]')) {
    const src = photoSrc(siteData.im?.[el.dataset.ik] || imageDefaults.get(el.dataset.ik));
    if (el.getAttribute('src') !== src) el.src = src;
  }
  const contacts = {...contactDefaults, ...siteData.contacts};
  for (const [key, links] of Object.entries(contactLinks)) {
    let href = contacts[key];
    if (key === 'phone') {
      let digits = href.replace(/\D/g, '');
      if (digits.length === 10) digits = '7' + digits;
      if (digits.length === 11 && digits[0] === '8') digits = '7' + digits.slice(1);
      href = 'tel:+' + digits;
    } else if (!/^https:\/\//i.test(href)) href = contactDefaults[key];
    links.forEach(link => link.setAttribute('href', href));
  }
  all('[data-phone]').forEach(el => el.textContent = contacts.phone);
  all('[data-group]').forEach(el => el.textContent = contacts.group.replace(/^https:\/\//, ''));
  all('[data-kg]').forEach(el => el.textContent = fmt(listData('kg')));
  for (const el of all('[data-placeholder]')) el.placeholder = siteData.placeholders?.[el.id] ?? el.dataset.placeholder;

  const products = listData('cat'), fillings = listData('fmt');
  cards.innerHTML = products.map((p, i) => p.hidden ? '' : `<button class="card" data-t="${esc(p.t)}" data-id="${esc(p.id)}" data-item="cat" data-index="${i}">
    <div class="ph"><img data-ik="cat-${i}" src="${esc(photoSrc(p.img))}" alt="${esc(p.title)}" loading="lazy">${p.badge ? `<span class="badge${p.t === 'cup' ? '' : ' r'}">${esc(p.badge)}</span>` : ''}</div>
    <div class="bd"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><div class="row"><span class="price">${esc(priceParts({...p, unit:''}))}<small>${p.unit?.startsWith('/') ? '' : ' '}${esc(p.unit)}</small></span><span class="more">+</span></div></div></button>`).join('');
  filterCards();
  byId('fgrid').innerHTML = fillings.map((f, i) => f.hidden ? '' : `<article class="f" data-item="fmt" data-index="${i}"><div class="layers">${f.img ? `<img data-ik="fmt-${i}" src="${esc(photoSrc(f.img))}" alt="${esc(f.name)}" loading="lazy">` : (f.c || []).filter(c => /^#[0-9a-f]{6}$/i.test(c)).map(c => `<i style="background:${c}"></i>`).join('')}</div>
    ${f.tag ? `<span class="tag">${esc(f.tag)}</span>` : ''}<h3>${esc(f.name)}</h3><p>${esc(f.text)}</p>${priceParts(f) ? `<span class="price">${esc(priceParts(f))}</span>` : ''}</article>`).join('');
  gal.innerHTML = listData('gallery').map((p, i) => `<button data-item="gallery" data-index="${i}" aria-label="Открыть фото: ${esc(p.title)}"><img data-ik="gallery-${i}" src="${esc(photoSrc(p.img))}" alt="${esc(p.title)}" loading="lazy"></button>`).join('');
  if (siteData.faq || document.querySelector('.faq [data-item]')) {
    document.querySelector('.faq').innerHTML = listData('faq').map((q, i) => `<details data-item="faq" data-index="${i}"><summary>${esc(q.title)}</summary><p>${esc(q.text)}</p></details>`).join('');
  }
  if (siteData.delivery || document.querySelector('.dgrid [data-item]')) {
    document.querySelector('.dgrid').innerHTML = listData('delivery').map((d, i) => `<div class="d" data-item="delivery" data-index="${i}">${deliveryIcons[d.icon] || ''}<h3>${esc(d.title)}</h3><ul>${d.list.map(line => `<li>${esc(line)}</li>`).join('')}</ul></div>`).join('');
  }
  const reviews = listData('reviews');
  byId('reviewList').hidden = !reviews.length;
  byId('reviewList').innerHTML = reviews.map((r, i) => `<article class="rev-box" data-item="reviews" data-index="${i}"><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join('');
  const oldProduct = fields.product.value, oldFilling = fields.filling.value;
  const titles = products.filter(p => !p.hidden).map(p => p.title);
  fields.product.replaceChildren(...['Торт по расчёту', ...titles, 'Другое'].map(x => new Option(x, x)));
  fields.product.value = [...fields.product.options].some(o => o.value === oldProduct) ? oldProduct : titles[0] || 'Другое';
  fields.filling.length = 1;
  fillings.filter(f => !f.hidden).forEach(f => fields.filling.add(new Option(f.name, f.name)));
  if ([...fields.filling.options].some(o => o.value === oldFilling)) fields.filling.value = oldFilling;
  calc();
}
const cards = byId('cards'), gal = byId('gal'), dlg = byId('dlg');
let current = null;
function filterCards() {
  const filter = document.querySelector('.filters .on').dataset.f;
  cards.querySelectorAll('.card').forEach(c => c.hidden = filter !== 'all' && c.dataset.t !== filter);
}
document.querySelector('.filters').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  all('.filters button').forEach(x => x.classList.toggle('on', x === b));
  filterCards();
});
cards.addEventListener('click', e => {
  const c = e.target.closest('.card'); if (!c) return;
  const p = current = listData('cat')[Number(c.dataset.index)];
  byId('dImg').src = photoSrc(p.img); byId('dImg').alt = p.title;
  byId('dImg').dataset.ik = 'cat-' + c.dataset.index;
  byId('dBadge').textContent = p.t === 'cup' ? 'Капкейки' : 'Торт';
  byId('dTitle').textContent = p.title; byId('dText').textContent = p.text;
  byId('dList').innerHTML = (p.list || []).map(x => `<li>${esc(x)}</li>`).join('');
  byId('dPrice').textContent = priceParts(p);
  dlg.showModal();
});
byId('dlgX').onclick = () => dlg.close();
byId('dOrder').onclick = () => { dlg.close(); fields.product.value = current.title; allowNext(); byId('order').scrollIntoView(); };
[dlg, byId('lb')].forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

gal.addEventListener('click', event => {
  const image = event.target.closest('button')?.querySelector('img');
  if (!image) return;
  byId('lbImg').src = image.src;
  byId('lbImg').alt = image.alt;
  byId('lbImg').dataset.ik = image.dataset.ik;
  byId('lb').showModal();
});
byId('lbX').onclick = () => byId('lb').close();

/* slicer */
const svg = byId('cakeSvg');
let portion = 0.15;
function drawCake(n) {
  const cx = 200, cy = 200, R = 178, r = 150;
  let s = `<defs><radialGradient id="cg" cx="45%" cy="40%"><stop offset="0" stop-color="#fff7ef"/><stop offset="1" stop-color="#f6dcd2"/></radialGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${R+12}" fill="#efe3da"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#3a1f1a"/>
  <circle cx="${cx}" cy="${cy}" r="${r+14}" fill="url(#cg)"/>`;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 - Math.PI / 2;
    s += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * (r + 14)).toFixed(1)}" y2="${(cy + Math.sin(a) * (r + 14)).toFixed(1)}" stroke="#d7285a" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>`;
    const b = a + Math.PI / n, rr = r - 6;
    const col = i % 3 === 0 ? '#2bb5ae' : (i % 3 === 1 ? '#d7285a' : '#3b3f8f');
    s += `<circle cx="${(cx + Math.cos(b) * rr).toFixed(1)}" cy="${(cy + Math.sin(b) * rr).toFixed(1)}" r="${n > 28 ? 6 : 9}" fill="${col}"/>`;
  }
  for (let i = 0; i < 36; i++) {
    const a = i / 36 * Math.PI * 2;
    s += `<circle cx="${(cx + Math.cos(a) * (R - 7)).toFixed(1)}" cy="${(cy + Math.sin(a) * (R - 7)).toFixed(1)}" r="4" fill="#fff7ef" opacity=".85"/>`;
  }
  svg.innerHTML = s;
}
function calc() {
  const g = +byId('guests').value;
  const w = Math.max(1, Math.ceil(g * portion * 2) / 2);
  const tiers = w <= 3.5 ? '1 ярус' : (w <= 6 ? '2 яруса' : '3 яруса');
  byId('gOut').textContent = g; byId('slN').textContent = g;
  byId('rW').textContent = String(w).replace('.', ',') + ' кг';
  byId('rT').textContent = tiers;
  byId('rP').textContent = 'от ' + fmt(Math.round(w * (siteData.kg ?? KG) / 100) * 100);
  drawCake(g);
  return {g, w, tiers};
}
byId('guests').addEventListener('input', calc);
document.querySelector('.seg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b));
  portion = +b.dataset.p; calc();
});
byId('calcOrder').addEventListener('click', () => {
  const r = calc();
  fields.product.value = 'Торт по расчёту';
  fields.guests.value = r.g;
  if (!fields.comment.value) fields.comment.value = `Торт ${String(r.w).replace('.', ',')} кг, ${r.tiers}`;
  allowNext();
});

/* menu */
const burger = byId('burger'), mnav = byId('mnav');
function toggleMenu(open) { mnav.hidden = !open; burger.setAttribute('aria-expanded', open); }
burger.onclick = () => toggleMenu(mnav.hidden);
mnav.addEventListener('click', e => { if (e.target.closest('a')) toggleMenu(false); });
matchMedia('(min-width:901px)').addEventListener('change', e => { if (e.matches) toggleMenu(false); });

/* form */
const fields = {name:byId('fName'), phone:byId('fPhone'), product:byId('fProduct'), filling:byId('fFilling'),
  date:byId('fDate'), guests:byId('fGuests'), comment:byId('fComment'), website:byId('fWebsite'), agree:byId('fAgree')};
const t = new Date();
fields.date.min = [t.getFullYear(), String(t.getMonth() + 1).padStart(2, '0'), String(t.getDate()).padStart(2, '0')].join('-');
fields.phone.addEventListener('focus', () => { if (!fields.phone.value) fields.phone.value = '+7 '; });
const form = byId('form'), submit = byId('submit'), err = byId('err');
function allowNext() { if (!byId('sent').hidden) { byId('sent').hidden = true; submit.hidden = false; } }
form.addEventListener('input', allowNext);
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (submit.disabled || submit.hidden) return;
  byId('fallback').hidden = true; err.textContent = '';
  if (fields.name.value.trim().length < 2) { err.textContent = 'Укажите имя'; fields.name.focus(); return; }
  let digits = fields.phone.value.replace(/\D/g, '');
  if (digits.length === 10) digits = '7' + digits;
  if (digits.length !== 11) { err.textContent = 'Проверьте номер телефона, нужно 11 цифр'; fields.phone.focus(); return; }
  if (!fields.agree.checked) { err.textContent = 'Отметьте согласие на обработку данных'; return; }
  const parts = ['Макет torty-na-zakaz', 'Что: ' + fields.product.value, 'Начинка: ' + fields.filling.value];
  if (fields.date.value) parts.push('Дата: ' + fields.date.value.split('-').reverse().join('.'));
  if (fields.guests.value) parts.push('Гостей: ' + fields.guests.value);
  submit.disabled = true; const label = submit.textContent; submit.textContent = 'Отправляем…';
  let ok = false;
  try {
    const r = await fetch(LEAD_URL, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, signal:AbortSignal.timeout(20000),
      body:JSON.stringify({site:location.hostname, name:fields.name.value.trim(), phone:fields.phone.value.trim(), details:parts.join(', '),
        comment:fields.comment.value.trim().replace(/\s*[\r\n]+\s*/g, ', '), website:fields.website.value})});
    ok = (await r.json()).ok === true;
  } catch { /* fallback below offers VK chat */ }
  submit.disabled = false; submit.textContent = label;
  if (ok) window.ym?.(114704759, 'reachGoal', 'lead');
  submit.hidden = ok; byId('sent').hidden = !ok; byId('fallback').hidden = ok;
});

// Переходы по контактам из любого блока страницы.
document.addEventListener('click', event => {
  if (event.target.closest('a[href^="tel:"], a[href^="https://vk.me/"], a[href^="https://max.ru/u/"]')) {
    window.ym?.(114704759, 'reachGoal', 'contact');
  }
});

all('#form [placeholder]').forEach(el => el.dataset.placeholder = el.placeholder);
function showSite() {
  renderContent();
  document.documentElement.classList.remove('applying-data');
}
const siteReady = awaitingPages && ownVersion.photos?.length
  ? restorePhotos(ownVersion.photos).catch(() => {}).then(showSite)
  : Promise.resolve(showSite());

let masterLoad;
async function openMaster() {
  if (!masterLoad) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'master.css?v=1'; document.head.append(css);
    masterLoad = import('./master.js?v=2').catch(error => { masterLoad = null; throw error; });
  }
  try { await siteReady; (await masterLoad).open(); }
  catch { alert('Панель не загрузилась. Проверьте связь и повторите вход.'); }
}
byId('masterEntry').addEventListener('click', e => { e.preventDefault(); openMaster(); });
window.addEventListener('hashchange', () => { if (location.hash === '#master') openMaster(); });
if (location.hash === '#master' || readStored('localStorage', authKey)?.exp > Date.now()) openMaster();
