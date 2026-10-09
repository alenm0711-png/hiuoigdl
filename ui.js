/* =====================================================================
   ui.js — ОТРИСОВКА: превращает данные из game.js в HTML на странице.
   Тексты кнопок и подписей можно менять прямо здесь.
   ===================================================================== */

const $ = id => document.getElementById(id);

/* ---------- Карточка скина (используется везде) ---------- */
// Чтобы показывать картинки, укажите image у скина в config.js
function itemCard(item, extraHtml) {
  const r = getRarity(item.rarity);
  const pic = item.image
    ? `<img class="item-img" src="${item.image}" alt="">`
    : `<div class="item-icon">${item.icon}</div>`;
  return `
    <div class="item" style="--rc:${r.color}">
      ${pic}
      <div class="item-weapon">${item.weapon}</div>
      <div class="item-name">${item.name}</div>
      <div class="item-price"><span class="coin"></span>${formatNum(item.price)}</div>
      ${extraHtml || ''}
    </div>`;
}

/* ---------- Баланс ---------- */
function updateBalance() {
  $('balance').textContent = formatNum(state.balance);
}

/* ---------- Вкладка «Кейсы» ---------- */
function renderCases() {
  $('cases-grid').innerHTML = CASES.map(c => {
    // Список возможных скинов, отсортирован от дорогих к дешёвым
    const preview = [...c.skins].sort((a, b) => b.price - a.price).map(s => {
      const r = getRarity(s.rarity);
      return `<li style="--rc:${r.color}"><span>${s.weapon} | ${s.name}</span><b>${formatNum(s.price)}</b></li>`;
    }).join('');

    return `
      <article class="case" style="--cc:${c.color}">
        <div class="case-icon">${c.icon}</div>
        <h3>${c.name}</h3>
        <button class="btn btn-accent" data-open="${c.id}">
          Открыть за <span class="coin"></span>${formatNum(c.price)}
        </button>
        <details>
          <summary>Что может выпасть</summary>
          <ul class="drops">${preview}</ul>
        </details>
      </article>`;
  }).join('');
}

/* ---------- Вкладка «Инвентарь» ---------- */
function renderInventory() {
  $('inv-count').textContent = state.inventory.length;

  const total = state.inventory.reduce((s, i) => s + sellPrice(i), 0);
  $('inv-summary').textContent = state.inventory.length
    ? `Предметов: ${state.inventory.length}. Если продать всё — ${formatNum(total)} монет.`
    : '';
  $('sell-all-btn').classList.toggle('hidden', !state.inventory.length);

  if (!state.inventory.length) {
    $('inventory-grid').innerHTML =
      '<p class="empty">Здесь пока пусто. Откройте кейс во вкладке «Кейсы» — выпавшие скины появятся тут.</p>';
    return;
  }

  // Сначала самые дорогие
  const sorted = [...state.inventory].sort((a, b) => b.price - a.price);
  $('inventory-grid').innerHTML = sorted.map(item =>
    itemCard(item, `<button class="btn btn-small" data-sell="${item.uid}">Продать за ${formatNum(sellPrice(item))}</button>`)
  ).join('');
}

/* ---------- Вкладка «Заработок» ---------- */
function renderEarn() {
  $('work-reward').textContent = '+' + state.clickPower;
  $('upgrade-btn').innerHTML = `Улучшить (+${CONFIG.click.upgradeStep} за клик) — <span class="coin"></span>${formatNum(upgradeCost())}`;

  const left = bonusLeftSec();
  const bonusBtn = $('bonus-btn');
  bonusBtn.disabled = left > 0;
  bonusBtn.textContent = left > 0
    ? `Следующий бонус через ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
    : `Забрать +${CONFIG.bonus.amount} монет`;

  // Строки статистики — можно добавлять свои
  const stats = [
    ['Открыто кейсов', formatNum(state.opened)],
    ['Потрачено на кейсы', formatNum(state.spent)],
    ['Заработано всего', formatNum(state.earned)],
    ['Кликов сделано', formatNum(state.clicks)],
    ['Лучший дроп', state.bestDrop ? `${state.bestDrop.name} (${formatNum(state.bestDrop.price)})` : '—']
  ];
  $('stats-list').innerHTML = stats.map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join('');
}

function renderAll() {
  updateBalance();
  renderCases();
  renderInventory();
  renderEarn();
}

/* ---------- Переключение вкладок ---------- */
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
}

/* ---------- Уведомления ---------- */
let toastTimer;
function showToast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2800); // 2800 мс — время показа
}

/* ---------- Плавающий текст «+N» при клике ---------- */
function floatText(text, x, y) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ---------- Рулетка ---------- */
function playRoulette(caseData, items, onDone) {
  const { itemWidth, itemGap, winIndex, durationSec } = CONFIG.roulette;
  const strip = $('roulette-strip');
  const viewport = $('roulette-viewport');

  $('roulette-title').textContent = caseData.name;
  $('result-box').classList.add('hidden');
  $('roulette-box').classList.remove('hidden');
  $('roulette-modal').classList.remove('hidden');

  // Лента: каждый предмет с заданной шириной и отступом
  strip.style.transition = 'none';
  strip.style.transform = 'translateX(0)';
  strip.innerHTML = items.map(item => {
    const r = getRarity(item.rarity);
    return `<div class="roulette-item" style="--rc:${r.color};width:${itemWidth}px;margin-right:${itemGap}px">
              <div class="item-icon">${item.icon}</div>
              <div class="item-weapon">${item.weapon}</div>
              <div class="item-name">${item.name}</div>
            </div>`;
  }).join('');

  void strip.offsetWidth; // принудительный пересчёт, чтобы анимация началась с нуля

  // Случайное смещение внутри выигрышной карточки — как в оригинале, указатель не всегда по центру
  const jitter = (Math.random() - 0.5) * (itemWidth - 30);
  const target = winIndex * (itemWidth + itemGap) + itemWidth / 2 + jitter - viewport.offsetWidth / 2;

  // Кривая cubic-bezier задаёт «торможение» ленты — можно подкрутить
  strip.style.transition = `transform ${durationSec}s cubic-bezier(0.12, 0.6, 0.1, 1)`;
  strip.style.transform = `translateX(${-target}px)`;

  setTimeout(onDone, durationSec * 1000 + 250);
}

/* ---------- Результат открытия ---------- */
let lastWin = null;
function showResult(item) {
  lastWin = item;
  $('result-card').innerHTML = itemCard(item);
  $('result-sell').textContent = `Продать за ${formatNum(sellPrice(item))}`;
  $('roulette-box').classList.add('hidden');
  $('result-box').classList.remove('hidden');
}

function closeModal() {
  $('roulette-modal').classList.add('hidden');
  lastWin = null;
}
