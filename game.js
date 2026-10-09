/* =====================================================================
   game.js — ИГРОВАЯ ЛОГИКА (шансы, открытие, продажа, заработок)
   Здесь нет работы с HTML — только данные и правила.
   Отрисовка находится в js/ui.js.
   ===================================================================== */

// Текущее состояние игрока (загружается из сохранения)
let state = loadState();

// Блокировка, чтобы нельзя было открыть второй кейс во время прокрутки
let isOpening = false;

/* ---------- Вспомогательные функции ---------- */

function getRarity(id) {
  return RARITIES.find(r => r.id === id);
}

function formatNum(n) {
  return Math.floor(n).toLocaleString('ru-RU');
}

// Цена продажи скина (цена * sellMultiplier)
function sellPrice(item) {
  return Math.floor(item.price * CONFIG.sellMultiplier);
}

function addMoney(amount) {
  state.balance += amount;
  state.earned += amount;
}

/* ---------- Выпадение скина ---------- */

// Превращаем описание скина из конфига в предмет инвентаря
function makeItem(skin, caseData) {
  return {
    uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), // уникальный номер
    name: skin.name,
    weapon: skin.weapon,
    rarity: skin.rarity,
    price: skin.price,
    icon: skin.icon || CONFIG.defaultIcon,
    image: skin.image || null,
    caseName: caseData.name
  };
}

// Случайный скин из кейса: сначала выбираем редкость по весам, потом скин внутри неё
function rollSkin(caseData) {
  // Берём только те редкости, которые реально есть в кейсе
  const available = RARITIES.filter(r => caseData.skins.some(s => s.rarity === r.id));
  const total = available.reduce((sum, r) => sum + r.weight, 0);

  let roll = Math.random() * total;
  let picked = available[available.length - 1];
  for (const r of available) {
    if (roll < r.weight) { picked = r; break; }
    roll -= r.weight;
  }

  const pool = caseData.skins.filter(s => s.rarity === picked.id);
  const skin = pool[Math.floor(Math.random() * pool.length)];
  return makeItem(skin, caseData);
}

/* ---------- Открытие кейса ---------- */

function openCase(caseId) {
  if (isOpening) return;

  const caseData = CASES.find(c => c.id === caseId);
  if (!caseData) return;

  if (state.balance < caseData.price) {
    showToast('Не хватает монет. Заработайте их во вкладке «Заработок».');
    return;
  }

  isOpening = true;

  // Списываем деньги сразу
  state.balance -= caseData.price;
  state.spent += caseData.price;

  // Готовим ленту: случайные предметы + один выигрышный на позиции winIndex
  const strip = [];
  for (let i = 0; i < CONFIG.roulette.itemsCount; i++) strip.push(rollSkin(caseData));
  const win = rollSkin(caseData);
  strip[CONFIG.roulette.winIndex] = win;

  saveState();
  updateBalance();

  // Запускаем анимацию; когда она закончится — выдаём предмет
  playRoulette(caseData, strip, () => {
    state.inventory.push(win);
    state.opened++;
    if (!state.bestDrop || win.price > state.bestDrop.price) {
      state.bestDrop = { name: win.weapon + ' | ' + win.name, price: win.price };
    }
    saveState();
    isOpening = false;
    renderAll();
    showResult(win);
  });
}

/* ---------- Продажа ---------- */

function sellItem(uid) {
  const index = state.inventory.findIndex(i => i.uid === uid);
  if (index === -1) return 0;
  const item = state.inventory[index];
  const gain = sellPrice(item);
  state.inventory.splice(index, 1);
  addMoney(gain);
  saveState();
  renderAll();
  return gain;
}

function sellAll() {
  if (!state.inventory.length) return;
  const total = state.inventory.reduce((sum, i) => sum + sellPrice(i), 0);
  state.inventory = [];
  addMoney(total);
  saveState();
  renderAll();
  showToast('Все скины проданы: +' + formatNum(total) + ' монет');
}

/* ---------- Заработок ---------- */

// Клик по кнопке «Подработка»
function work() {
  addMoney(state.clickPower);
  state.clicks++;
  saveState();
  updateBalance();
  renderEarn();
}

// Цена следующего улучшения клика
function upgradeCost() {
  const level = Math.round((state.clickPower - CONFIG.click.startPower) / CONFIG.click.upgradeStep);
  return Math.floor(CONFIG.click.upgradeBaseCost * Math.pow(CONFIG.click.upgradeGrowth, level));
}

function buyUpgrade() {
  const cost = upgradeCost();
  if (state.balance < cost) {
    showToast('Для улучшения нужно ' + formatNum(cost) + ' монет');
    return;
  }
  state.balance -= cost;
  state.clickPower += CONFIG.click.upgradeStep;
  saveState();
  renderAll();
}

// Сколько секунд осталось до следующего бонуса (0 — можно забирать)
function bonusLeftSec() {
  const passed = (Date.now() - state.lastBonus) / 1000;
  return Math.max(0, Math.ceil(CONFIG.bonus.cooldownSec - passed));
}

function claimBonus() {
  if (bonusLeftSec() > 0) return;
  addMoney(CONFIG.bonus.amount);
  state.lastBonus = Date.now();
  saveState();
  renderAll();
  showToast('Бонус получен: +' + formatNum(CONFIG.bonus.amount) + ' монет');
}
