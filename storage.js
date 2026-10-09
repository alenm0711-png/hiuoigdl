/* =====================================================================
   storage.js — сохранение прогресса в браузере (localStorage)
   Обычно этот файл редактировать не нужно.
   ===================================================================== */

// Начальное состояние игрока. Новые поля добавляйте сюда.
function defaultState() {
  return {
    balance: CONFIG.startBalance,   // текущие монеты
    inventory: [],                  // выбитые скины
    opened: 0,                      // сколько кейсов открыто
    spent: 0,                       // сколько потрачено на кейсы
    earned: 0,                      // сколько заработано (клики, бонусы, продажа)
    clicks: 0,                      // сколько кликов сделано
    clickPower: CONFIG.click.startPower, // монет за клик
    lastBonus: 0,                   // время последнего бонуса (мс)
    bestDrop: null                  // самый дорогой выпавший скин
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.saveKey);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {
    console.warn('Не удалось прочитать сохранение', e);
  }
  return defaultState();
}

function saveState() {
  try {
    localStorage.setItem(CONFIG.saveKey, JSON.stringify(state));
  } catch (e) {
    console.warn('Не удалось сохранить', e);
  }
}

function resetState() {
  localStorage.removeItem(CONFIG.saveKey);
  state = defaultState();
}
