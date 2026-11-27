// Адрес развернутого веб-приложения Apps Script. Пустое значение включает демо.
const MASTER_URL = "";
const sections = {
  cat:'Товары', fmt:'Начинки', kg:'Цена за кг', gallery:'Галерея',
  reviews:'Отзывы', faq:'Вопросы и ответы', delivery:'Доставка', contacts:'Контакты', texts:'Тексты'
};
const clone = value => structuredClone(value);
const uid = () => crypto.randomUUID().replaceAll('-', '');
let active = false, opening = false, busy = false, dirty = false, base = 0;
let pending = new Set();
let lastDraft = null;
const panel = document.createElement('div');
panel.className = 'ms-panel';
panel.hidden = true;
panel.innerHTML = '<div class="ms-status" role="status"></div><nav aria-label="Режим мастера"><button data-do="sections">Разделы</button><button class="ms-primary" data-do="save">Сохранить</button><button data-do="exit">Выйти</button></nav>';
const dialog = document.createElement('dialog');
dialog.className = 'ms-dialog ym-hide-content';
dialog.setAttribute('aria-labelledby', 'ms-title');
document.body.append(panel, dialog);
const status = message => { panel.querySelector('[role=status]').textContent = message; };
const summary = () => (MASTER_URL ? 'Режим мастера' : 'Демо') + (dirty ? ' · Есть черновик' : ' · Нажмите на текст или фото');
function button(label, action, cls = '') {
  return `<button type="button" class="${cls}" data-do="${action}">${esc(label)}</button>`;
}
function show(title, body, back) {
  dialog.innerHTML = `<header>${back ? button('Назад', 'back') : ''}<h2 id="ms-title">${esc(title)}</h2>${button('Закрыть', 'close')}</header><div class="ms-body">${body}</div>`;
  dialog.querySelector('[data-do=close]').onclick = () => dialog.close();
  if (back) dialog.querySelector('[data-do=back]').onclick = back;
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.ms-body').scrollTop = 0;
}
function alertBox(title, message, back) {
  show(title, `<p role="status">${esc(message)}</p>`, back);
}
function photoPaths(data) {
  return [...new Set([...Object.values(data.im || {}), ...['cat','fmt','gallery'].flatMap(key => (data[key] || []).map(row => row.img))]
    .filter(path => typeof path === 'string' && path.startsWith('img/u/')))];
}
function record(next, redraw = true) {
  const photos = photoPaths(next).filter(path => pending.has(path));
  try {
    const snapshot = JSON.stringify({base, data:next, photos});
    localStorage.setItem(draftKey,snapshot);
    lastDraft = snapshot;
  } catch {
    alertBox('Не удалось записать черновик', 'Проверьте свободное место и разрешение браузера на хранение данных.');
    return false;
  }
  siteData = next;
  dirty = true;
  if (redraw) { renderContent(); enableInline(); }
  status(summary());
  return true;
}
async function api(payload) {
  const response = await fetch(MASTER_URL, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify(payload), signal:AbortSignal.timeout(100000)
  });
  if (!response.ok) throw new Error('http');
  return response.json();
}
function login(message = '') {
  show('Вход для мастера', `<form><p>${esc(message || (MASTER_URL ? 'Введите пароль для редактирования сайта.' : 'Демо-режим. Черновик останется на этом устройстве. Публикация отключена.'))}</p>
    ${MASTER_URL ? '<label>Пароль<input name="pw" type="password" autocomplete="current-password" required></label>' : ''}
    <button class="ms-primary">Войти${MASTER_URL ? '' : ' в демо'}</button><p class="ms-error" role="alert"></p></form>`);
  const form = dialog.querySelector('form');
  form.onsubmit = async e => {
    e.preventDefault();
    const submit = form.querySelector('button'); submit.disabled = true;
    try {
      const auth = MASTER_URL ? await api({a:'login', pw:form.elements.pw.value}) : {ok:true, demo:true, exp:Date.now()+86400000};
      if (!form.isConnected || !dialog.open) return;
      if (!auth.ok) {
        form.querySelector('.ms-error').textContent = auth.err === 'locked' ? 'Слишком много попыток. Попробуйте через 15 минут.' : 'Войти не удалось. Проверьте пароль.';
        return;
      }
      localStorage.setItem(authKey, JSON.stringify(auth));
      await enter();
    } catch { form.querySelector('.ms-error').textContent = 'Проверьте связь и доступ к хранилищу браузера.'; }
    finally { submit.disabled = false; }
  };
}
async function enter() {
  if (!active) {
    lastDraft = localStorage.getItem(draftKey);
    const draft = readStored('localStorage', draftKey);
    base = draft?.base ?? siteData.rev ?? 0;
    pending = new Set(draft?.photos || []);
    if (draft) {
      await restorePhotos(draft.photos);
      siteData = draft.data;
      dirty = true;
      renderContent();
    }
  }
  active = true;
  dialog.close(); panel.hidden = false;
  document.body.classList.add('ms-active');
  enableInline();
  status(summary());
}
export async function open() {
  if (opening || busy) return;
  if (active) return sectionMenu();
  opening = true;
  try {
    const auth = readStored('localStorage', authKey);
    if (auth?.exp > Date.now() && (MASTER_URL ? !auth.demo && (await api({a:'check', token:auth.token})).ok : auth.demo)) {
      await enter();
    } else {
      localStorage.removeItem(authKey);
      login();
    }
  } catch { login('Не удалось открыть панель. Проверьте связь и попробуйте ещё раз.'); }
  finally { opening = false; }
}
function clearOwnDraft() {
  if (localStorage.getItem(draftKey) === lastDraft) localStorage.removeItem(draftKey);
  lastDraft = null;
}
function exitMaster(discard) {
  if (discard) clearOwnDraft();
  localStorage.removeItem(authKey);
  if (location.hash === '#master') history.replaceState(null, '', location.pathname + location.search);
  location.reload();
}
function sectionMenu() {
  show('Разделы сайта', '<div class="ms-sections">' + Object.entries(sections).map(([key,label]) => button(label, key)).join('') + '</div>');
  for (const b of dialog.querySelectorAll('.ms-sections button')) b.onclick = () => {
    const key = b.dataset.do;
    if (key === 'kg' || key === 'contacts') editSettings(key);
    else if (key === 'texts') editTexts();
    else showList(key);
  };
}
function field(name, label, value = '', opts = {}) {
  const attrs = opts.required ? ' required' : '';
  if (opts.type === 'checkbox') return `<label class="ms-check"><input type="checkbox" name="${name}" ${value ? 'checked' : ''}>${esc(label)}</label>`;
  const input = opts.multiline ? `<textarea name="${name}" rows="3"${attrs}>${esc(value)}</textarea>`
    : `<input name="${name}" type="${opts.type || 'text'}" value="${esc(value)}"${attrs}${opts.type === 'number' ? ' min="0" max="99999999" step="0.01" inputmode="decimal"' : ''}>`;
  return `<label>${esc(label)}${input}</label>`;
}
const applyButton = '<button class="ms-primary" type="submit">Применить</button>';
function editSettings(key) {
  const kg = key === 'kg';
  const contacts = {...contactDefaults, ...siteData.contacts};
  const content = kg ? field('kg','Рублей за килограмм',listData('kg'),{type:'number',required:true}) :
    Object.entries({phone:'Телефон', vk:'Сообщения ВКонтакте', group:'Группа ВКонтакте', max:'Профиль MAX'}).map(([k,label]) =>
      field(k,label,contacts[k],{type:k === 'phone' ? 'tel' : 'url',required:true})).join('');
  show(sections[key], `<form>${content}${applyButton}</form>`, sectionMenu);
  const form = dialog.querySelector('form');
  form.onsubmit = e => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    if (!kg) {
      const valid = {phone:/^\+?[\d ()-]+$/, vk:/^https:\/\/(vk\.me|vk\.ru|vk\.com)\/.+/i, group:/^https:\/\/(vk\.ru|vk\.com)\/.+/i, max:/^https:\/\/max\.ru\/u\/.+/i};
      for (const [k, pattern] of Object.entries(valid)) {
        values[k] = values[k].trim();
        if (!pattern.test(values[k]) || (k === 'phone' && !/^\d{10,15}$/.test(values[k].replace(/\D/g,'')))) {
          const el = form.elements[k]; el.setCustomValidity(k === 'phone' ? 'Введите номер с кодом страны.' : 'Проверьте ссылку на этот сервис.'); el.reportValidity(); el.setCustomValidity(''); return;
        }
      }
    }
    if (record({...siteData, [key]:kg ? Number(values.kg) : values})) dialog.close();
  };
}
function editTexts() {
  const options = [...textDefaults.keys()].map(key => [key, textDefaults.get(key)]);
  const ph = all('[data-placeholder]').map(el => ['placeholder-'+el.id, 'Подсказка поля · '+el.dataset.placeholder]);
  show('Тексты сайта', `<form><label>Надпись<select name="key">${[...options, ...ph].map(([k,v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('')}</select></label>
    ${field('text','Текст','',{multiline:true})}${applyButton}</form>`, sectionMenu);
  const form = dialog.querySelector('form'), selector = form.elements.key;
  function read() {
    const key = selector.value;
    form.elements.text.value = key.startsWith('placeholder-') ? byId(key.slice(12)).placeholder : siteData.tx?.[key] ?? textDefaults.get(key);
  }
  read(); selector.onchange = read;
  form.onsubmit = e => {
    e.preventDefault();
    let key = selector.value, group = 'tx';
    if (key.startsWith('placeholder-')) { key = key.slice(12); group = 'placeholders'; }
    if (record({...siteData, [group]:{...siteData[group], [key]:form.elements.text.value}})) dialog.close();
  };
}
function rowName(row) { return row.title || row.name || 'Без названия'; }
function showList(key) {
  const rows = listData(key);
  const html = rows.map((row,i) => `<li data-i="${i}"><button type="button" class="ms-row-edit" data-do="edit">
    ${row.img ? `<img src="${esc(photoSrc(row.img))}" alt="">` : ''}<span>${esc(rowName(row))}${row.hidden ? '<small>Скрыто</small>' : ''}</span></button>
    <div class="ms-move"><button aria-label="Поднять" data-do="up"${i ? '' : ' disabled'}>↑</button><button aria-label="Опустить" data-do="down"${i+1 < rows.length ? '' : ' disabled'}>↓</button></div></li>`).join('');
  show(sections[key], `<ul class="ms-list">${html}</ul>${button('Добавить', 'add','ms-primary')}`, sectionMenu);
  dialog.querySelector('[data-do=add]').onclick = () => editRow(key,rows.length);
  dialog.querySelector('.ms-list').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const i = Number(b.closest('li').dataset.i);
    if (b.dataset.do === 'edit') return editRow(key,i);
    const next = [...rows], j = i + (b.dataset.do === 'up' ? -1 : 1);
    [next[i],next[j]] = [next[j],next[i]];
    if (record({...siteData,[key]:next})) {
      const body = dialog.querySelector('.ms-body'), y = body.scrollTop;
      showList(key); dialog.querySelector('.ms-body').scrollTop = y;
    }
  };
}
function editRow(key, index) {
  const rows = listData(key), isNew = index === rows.length;
  const product = key === 'cat', filling = key === 'fmt', gallery = key === 'gallery';
  const hasPhoto = product || filling || gallery;
  const row = clone(rows[index] || (product ? {id:uid(), t:'cake', from:true, unit:'/кг',list:[]} : filling ? {c:defaults.fmt[0].c} : {}));
  let html = '';
  const titleKey = filling ? 'name' : 'title';
  html += field(titleKey, {faq:'Вопрос',reviews:'Автор',gallery:'Подпись к фото'}[key] || 'Название', row[titleKey], {required:!gallery});
  if (product) html += `<label>Категория<select name="t"><option value="cake">Торты</option><option value="cup"${row.t === 'cup' ? ' selected' : ''}>Капкейки</option></select></label>`;
  if (hasPhoto) html += '<div class="ms-photo-field"></div>';
  if (key !== 'delivery' && !gallery) html += field('text', {faq:'Ответ',reviews:'Отзыв'}[key] || 'Описание', row.text,{multiline:true});
  if (product || filling) {
    html += field(product ? 'badge' : 'tag','Метка',product ? row.badge : row.tag);
    html += '<div class="ms-pair">'+field('price','Цена, ₽',row.price,{type:'number',required:product})+field('unit','Единица',row.unit)+'</div>';
    html += field('from','Добавить «от» перед ценой',row.from,{type:'checkbox'})+field('hidden','Скрыть с сайта',row.hidden,{type:'checkbox'});
  }
  if (product || key === 'delivery') html += field('list','Пункты, по одному на строку',(row.list || []).join('\n'),{multiline:true});
  if (isNew && key === 'delivery') row.icon = 0;
  show((isNew ? 'Добавить · ' : '') + sections[key], `<form>${html}<div class="ms-actions">${applyButton}${isNew ? '' : button('Удалить','delete','ms-danger')}</div><p class="ms-error" role="alert"></p></form>`, () => showList(key));
  const form = dialog.querySelector('form');
  if (hasPhoto) {
    const slot = form.querySelector('.ms-photo-field');
    const frame = document.querySelector(`[data-item="${key}"][data-index="${index}"] .layers`);
    const ratio = product ? 4/3.4 : gallery ? 1 : (frame?.clientWidth && frame.clientHeight ? frame.clientWidth/frame.clientHeight : 3);
    const paint = () => {
      slot.innerHTML = (row.img ? `<img src="${esc(photoSrc(row.img))}" alt="Выбранное фото">` : '') + button(row.img ? 'Заменить фото' : 'Добавить фото','photo') + (filling && row.img ? button('Убрать фото','clear') : '');
      slot.querySelector('[data-do=photo]').onclick = () => pickPhoto(ratio, path => { row.img = path; paint(); });
      const clear = slot.querySelector('[data-do=clear]');
      if (clear) clear.onclick = () => { delete row.img; paint(); };
    };
    paint();
  }
  form.onsubmit = e => {
    e.preventDefault();
    if ((product || gallery) && !row.img) { form.querySelector('.ms-error').textContent = 'Добавьте фото.'; return; }
    for (const [name, val] of new FormData(form)) {
      if (name === 'price') row.price = val === '' ? null : Number(val);
      else if (name === 'list') row.list = val.split('\n').map(x => x.trim()).filter(Boolean);
      else row[name] = val.trim();
    }
    if (product || filling) { row.hidden = form.elements.hidden.checked; row.from = form.elements.from.checked; }
    const next = [...rows]; next[index] = row;
    if (record({...siteData,[key]:next})) showList(key);
  };
  const del = form.querySelector('[data-do=delete]');
  if (del) del.onclick = () => {
    if (confirm('Удалить «'+ rowName(row) +'» из списка?') && record({...siteData,[key]:rows.filter((_,i) => i !== index)})) showList(key);
  };
}

async function cachePhoto(blob) {
  const path = 'img/u/c/' + uid() + '.jpg';
  const db = await openPhotoDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('photos','readwrite');
    tx.objectStore('photos').put(blob,path);
    tx.oncomplete = resolve; tx.onabort = () => reject(tx.error);
  });
  previews.set(path, URL.createObjectURL(blob));
  pending.add(path);
  return path;
}
function pickPhoto(ratio, accept) {
  const crop = document.createElement('dialog');
  crop.className = 'ms-dialog ms-crop';
  crop.setAttribute('aria-label','Замена фото');
  crop.innerHTML = `<header><h2>Замена фото</h2>${button('Закрыть','close')}</header><div class="ms-body"><label>Фото с устройства<input type="file" accept="image/*"></label>
    <div class="ms-crop-tools" hidden><canvas aria-label="Предпросмотр кадра"></canvas>
    <label>Масштаб<input type="range" name="zoom" min="1" max="3" value="1" step="0.01"></label>
    <label>По горизонтали<input type="range" name="x" min="0" max="100" value="50"></label>
    <label>По вертикали<input type="range" name="y" min="0" max="100" value="50"></label>
    ${button('Использовать фото','use','ms-primary')}</div><p class="ms-error" role="alert"></p></div>`;
  document.body.append(crop); crop.showModal();
  const file = crop.querySelector('[type=file]'), tools = crop.querySelector('.ms-crop-tools');
  const canvas = crop.querySelector('canvas'), use = crop.querySelector('[data-do=use]');
  const message = crop.querySelector('.ms-error');
  let source, objectURL, generation = 0;
  function paint() {
    if (!source) return;
    const zoom = Number(crop.querySelector('[name=zoom]').value);
    const w = Math.min(source.naturalWidth, source.naturalHeight*ratio)/zoom, h = w/ratio;
    const x = (source.naturalWidth-w)*crop.querySelector('[name=x]').value/100;
    const y = (source.naturalHeight-h)*crop.querySelector('[name=y]').value/100;
    const scale = Math.min(1,1600/Math.max(w,h));
    canvas.width = Math.max(1, Math.round(w*scale)); canvas.height = Math.max(1, Math.round(h*scale));
    const ctx = canvas.getContext('2d',{alpha:false});
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(source,x,y,w,h,0,0,canvas.width,canvas.height);
  }
  crop.querySelector('[data-do=close]').onclick = () => crop.close();
  crop.onclose = () => { generation++; if (objectURL) URL.revokeObjectURL(objectURL); crop.remove(); };
  file.onchange = async () => {
    const id = ++generation;
    tools.hidden = true; source = null; message.textContent = '';
    if (objectURL) URL.revokeObjectURL(objectURL);
    if (!file.files[0]) return;
    const im = new Image();
    im.src = objectURL = URL.createObjectURL(file.files[0]);
    try {
      await im.decode();
      if (id !== generation) return;
      source = im;
      tools.querySelectorAll('input').forEach(el => el.value = el.defaultValue);
      tools.hidden = false; paint();
    } catch { if (id === generation) message.textContent = 'Не удалось открыть фото. Выберите JPEG, PNG или WebP.'; }
  };
  tools.oninput = paint;
  use.onclick = async () => {
    use.disabled = true;
    const id = generation;
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',0.85));
      if (!blob || blob.size > 2250000) throw new Error('size');
      const path = await cachePhoto(blob);
      if (id !== generation || !crop.open) return;
      crop.close(); accept(path);
    } catch { message.textContent = 'Не удалось сохранить фото на устройстве. Проверьте свободное место или выберите другой кадр.'; }
    finally { use.disabled = false; }
  };
}
function editImage(el) {
  const key = el.dataset.ik;
  if (!imageDefaults.has(key)) {
    const [list,i] = key.split('-');
    return editRow(list,Number(i));
  }
  const {width,height} = el.getBoundingClientRect();
  pickPhoto(width && height ? width/height : 1, path => record({...siteData, im:{...siteData.im,[key]:path}}));
}
// Текст в списке редактируется на странице и в диалоге через одно поле записи.
function enableInline() {
  const seen = new Map();
  function mark(el, property, line) {
    let hash = 5381;
    for (const ch of el.innerHTML.replace(/\s+/g,' ').trim().split('')) hash = (hash * 33 ^ ch.charCodeAt(0)) >>> 0;
    const stem = el.localName + hash.toString(36);
    let n = seen.get(stem) || 0, key;
    do { n++; key = stem + (n === 1 ? '' : '_' + n); } while (textDefaults.has(key));
    seen.set(stem,n);
    el.dataset.tk = key; el.dataset.field = property;
    if (line !== undefined) el.dataset.line = line;
  }
  for (const [key, selector] of [['faq','.faq details'],['delivery','.dgrid .d'],['reviews','#reviewList article']]) {
    all(selector).forEach((row, index) => {
      row.dataset.item = key; row.dataset.index = index;
      mark(row.querySelector(key === 'faq' ? 'summary' : 'h3'),'title');
      if (key === 'delivery') row.querySelectorAll('li').forEach((el,i) => mark(el,'list',i));
      else mark(row.querySelector('p'),'text');
    });
  }
  all('[data-tk]').forEach(el => el.setAttribute('contenteditable','plaintext-only'));
}
document.addEventListener('click', e => {
  if (!active || busy || e.target.closest('.ms-panel,.ms-dialog')) return;
  const el = e.target.closest('[data-tk], [data-ik], [data-kg], [data-phone], [data-group], [data-item], .faq details, .dgrid .d');
  if (!el) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (el.hasAttribute('data-tk')) {
    if (el.matches('summary')) el.parentElement.open = true;
    el.focus(); return;
  }
  if (el.hasAttribute('data-ik')) return editImage(el);
  if (el.hasAttribute('data-kg')) return editSettings('kg');
  if (el.matches('[data-phone],[data-group]')) return editSettings('contacts');
  if (el.dataset.item) return editRow(el.dataset.item,Number(el.dataset.index));
  editRow(el.matches('details') ? 'faq' : 'delivery', [...el.parentElement.children].indexOf(el));
},true);
document.addEventListener('input', e => {
  const el = e.target.closest('[data-tk]');
  if (!active || !el) return;
  let next;
  if (el.dataset.field) {
    const {item,index} = el.closest('[data-item]').dataset;
    const rows = [...listData(item)], row = {...rows[index]};
    if (el.dataset.field === 'list') {
      row.list = [...row.list]; row.list[Number(el.dataset.line)] = el.textContent;
    } else row[el.dataset.field] = el.textContent;
    rows[index] = row; next = {...siteData,[item]:rows};
  } else next = {...siteData,tx:{...siteData.tx,[el.dataset.tk]:el.textContent}};
  if (!record(next,false)) { renderContent(); enableInline(); }
});
document.addEventListener('keydown', e => {
  if (active && !e.isComposing && e.key === 'Enter' && e.target.closest('[data-tk]')) {
    e.preventDefault(); e.target.blur();
  }
});
async function imageFiles(paths) {
  return Promise.all(paths.map(async path => {
    const url = previews.get(path);
    if (!url) throw new Error('missing-photo');
    const blob = await (await fetch(url)).blob();
    const b64 = await new Promise((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return {path, b64};
  }));
}
async function save(force = false) {
  if (busy) return;
  if (!MASTER_URL) return alertBox('Демо-режим', dirty ? 'Публикация отключена. Черновик сохранён только в этом браузере.' : 'Публикация отключена. Новых правок пока нет.');
  if (!dirty) { status('Нет новых правок'); return; }
  const auth = readStored('localStorage', authKey);
  if (!auth || auth.exp <= Date.now() || auth.demo) return login('Вход истёк. Введите пароль, чтобы сохранить черновик.');
  busy = true;
  show('Сохраняем изменения', '<p role="status">Отправляем правки на сайт…</p>');
  const hold = e => e.preventDefault();
  dialog.addEventListener('cancel', hold);
  dialog.querySelector('[data-do=close]').disabled = true;
  try {
    const data = {...siteData, v:1, cat:listData('cat'), fmt:listData('fmt')};
    const used = photoPaths(data);
    const files = await imageFiles(used.filter(path => pending.has(path)));
    const result = await api({a:'save', token:auth.token, base, force, data, files});
    if (result.ok) {
      base = data.rev = result.rev; siteData = data;
      const photos = used.filter(path => previews.has(path));
      let cached = true;
      try { sessionStorage.setItem(publishedKey,JSON.stringify({data,photos})); } catch { cached = false; }
      clearOwnDraft();
      dirty = false; pending.clear();
      dialog.close();
      status(cached ? 'Сохранено · Сайт обновится через 1–2 минуты' : 'Сохранено · Дождитесь обновления Pages перед перезагрузкой');
    } else if (result.err === 'conflict') {
      show('Перезаписать изменения?', `<p>С другого устройства уже сохранена версия ${esc(result.rev)}. Перезаписать её вашим черновиком?</p><div class="ms-actions">${button('Перезаписать','force','ms-primary')}${button('Отмена','cancel')}</div>`);
      dialog.querySelector('[data-do=force]').onclick = () => save(true);
      dialog.querySelector('[data-do=cancel]').onclick = () => dialog.close();
    } else if (result.err === 'auth') {
      localStorage.removeItem(authKey); login('Вход истёк. Войдите снова, черновик сохранён.');
    } else {
      const reason = {too_many_files:'Слишком много новых фото за одно сохранение.',too_big:'Превышен размер данных сайта.',bad_file:'Сервис отклонил файл фото.'}[result.err];
      alertBox('Черновик сохранён на устройстве', reason || 'Сервис не принял изменения. Повторите сохранение.');
    }
  } catch (error) {
    alertBox('Не удалось подтвердить сохранение', error.message === 'missing-photo' ? 'Черновик содержит недоступное фото. Выберите его снова.' : 'Проверьте связь и повторите сохранение. Черновик остался на устройстве.');
  } finally { busy = false; dialog.removeEventListener('cancel',hold); }
}
panel.querySelector('[data-do=sections]').onclick = sectionMenu;
panel.querySelector('[data-do=save]').onclick = () => save();
panel.querySelector('[data-do=exit]').onclick = () => {
  if (!dirty) return exitMaster(false);
  show('Выйти из режима мастера?', `<p>Черновик можно продолжить при следующем входе с этого устройства.</p>${button('Выйти с черновиком','keep','ms-primary')}${button('Удалить черновик и выйти','discard','ms-danger')}`);
  dialog.querySelector('[data-do=keep]').onclick = () => exitMaster(false);
  dialog.querySelector('[data-do=discard]').onclick = () => { if (confirm('Удалить все неопубликованные правки на этом устройстве?')) exitMaster(true); };
};
