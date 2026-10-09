/* =====================================================================
   config.js — ВСЕ НАСТРОЙКИ САЙТА В ОДНОМ МЕСТЕ
   Здесь можно менять цены, шансы, скины и кейсы, не трогая остальной код.
   ===================================================================== */

const CONFIG = {
  // Ключ сохранения в браузере. Поменяйте, чтобы начать «с чистого листа».
  saveKey: 'casedrop_save_v1',

  // Сколько монет у игрока в начале
  startBalance: 1000,

  // За какую часть цены можно продать скин (0.9 = 90%).
  // Чем меньше число, тем сложнее заработать на продаже.
  sellMultiplier: 0.9,

  // Иконка, если у скина не указана своя (можно писать эмодзи)
  defaultIcon: '🔫',

  // --- Заработок кликами ---
  click: {
    startPower: 1,        // монет за клик в начале
    upgradeStep: 1,       // на сколько растёт награда за одно улучшение
    upgradeBaseCost: 50,  // цена первого улучшения
    upgradeGrowth: 1.6    // во сколько раз растёт цена каждого следующего улучшения
  },

  // --- Бесплатный бонус ---
  bonus: {
    amount: 150,          // сколько монет даёт бонус
    cooldownSec: 180      // как часто можно забирать (в секундах)
  },

  // --- Рулетка (анимация открытия) ---
  roulette: {
    itemsCount: 60,       // сколько предметов в ленте
    winIndex: 50,         // номер предмета, на котором лента остановится
    durationSec: 6,       // длительность прокрутки в секундах
    itemWidth: 150,       // ширина карточки в ленте (px)
    itemGap: 10           // расстояние между карточками (px)
  }
};

/* =====================================================================
   РЕДКОСТИ
   id      — короткое имя, на него ссылаются скины
   name    — название, которое видит игрок
   color   — цвет рамки и свечения
   weight  — вес шанса. Шанс = weight / сумма весов редкостей, которые есть в кейсе.
             Хотите сделать золото чаще — увеличьте его weight.
   ===================================================================== */
const RARITIES = [
  { id: 'blue',   name: 'Армейское',        color: '#4b69ff', weight: 7992 },
  { id: 'purple', name: 'Запрещённое',      color: '#8847ff', weight: 1598 },
  { id: 'pink',   name: 'Засекреченное',    color: '#d32ce6', weight: 320  },
  { id: 'red',    name: 'Тайное',           color: '#eb4b4b', weight: 64   },
  { id: 'gold',   name: 'Редкий предмет',   color: '#ffd24a', weight: 26   }
];

/* =====================================================================
   КЕЙСЫ
   id     — уникальное имя (латиницей, без пробелов)
   name   — название на карточке
   price  — цена открытия в монетах
   icon   — эмодзи на карточке
   color  — цвет подсветки карточки
   skins  — список скинов, которые могут выпасть из этого кейса
            { name, weapon, rarity, price, icon }
            rarity — id из списка RARITIES выше
            price  — рыночная цена скина в монетах (по ней считается продажа)

   СОВЕТ: чтобы кейс не был «золотой жилой», следите, чтобы средняя цена
   выпадения * sellMultiplier была ниже цены кейса.

   КАК ДОБАВИТЬ КАРТИНКУ: добавьте скину поле image: 'img/ak47.png'
   (папку img создайте сами) — и в js/ui.js функция itemCard() покажет её.
   ===================================================================== */
const CASES = [
  {
    id: 'starter',
    name: 'Стартовый кейс',
    price: 100,
    icon: '📦',
    color: '#7fa6c9',
    skins: [
      { name: 'Песчаная дюна',   weapon: 'P250',           rarity: 'blue',   price: 25,   icon: '🔫' },
      { name: 'Ночной страж',    weapon: 'USP-S',          rarity: 'blue',   price: 35,   icon: '🔫' },
      { name: 'Ржавчина',        weapon: 'MP9',            rarity: 'blue',   price: 30,   icon: '🔫' },
      { name: 'Красная линия',   weapon: 'AK-47',          rarity: 'purple', price: 110,  icon: '🔫' },
      { name: 'Неоновый штурм',  weapon: 'M4A4',           rarity: 'purple', price: 130,  icon: '🔫' },
      { name: 'Ледяной змей',    weapon: 'AWP',            rarity: 'pink',   price: 450,  icon: '🎯' },
      { name: 'Пламя дракона',   weapon: 'AK-47',          rarity: 'red',    price: 1800, icon: '🔥' },
      { name: 'Закат',           weapon: '★ Нож-бабочка',  rarity: 'gold',   price: 6500, icon: '🗡️' }
    ]
  },
  {
    id: 'hunter',
    name: 'Кейс Охотника',
    price: 500,
    icon: '🧰',
    color: '#c9a45c',
    skins: [
      { name: 'Тень',            weapon: 'Glock-18',       rarity: 'blue',   price: 120,   icon: '🔫' },
      { name: 'Джунгли',         weapon: 'Five-SeveN',     rarity: 'blue',   price: 140,   icon: '🔫' },
      { name: 'Токсин',          weapon: 'MAC-10',         rarity: 'blue',   price: 130,   icon: '🔫' },
      { name: 'Кибер-пульс',     weapon: 'M4A1-S',         rarity: 'purple', price: 520,   icon: '🔫' },
      { name: 'Золотой песок',   weapon: 'Desert Eagle',   rarity: 'purple', price: 600,   icon: '🔫' },
      { name: 'Громовой раскат', weapon: 'AWP',            rarity: 'pink',   price: 2200,  icon: '🎯' },
      { name: 'Королевский',     weapon: 'AK-47',          rarity: 'pink',   price: 2600,  icon: '🔫' },
      { name: 'Император',       weapon: 'M4A4',           rarity: 'red',    price: 9000,  icon: '🔥' },
      { name: 'Лава',            weapon: '★ Керамбит',     rarity: 'gold',   price: 35000, icon: '🗡️' }
    ]
  },
  {
    id: 'golden',
    name: 'Золотой кейс',
    price: 2500,
    icon: '👑',
    color: '#ffd24a',
    skins: [
      { name: 'Позолота',        weapon: 'Tec-9',          rarity: 'blue',   price: 600,    icon: '🔫' },
      { name: 'Роскошь',         weapon: 'P90',            rarity: 'blue',   price: 650,    icon: '🔫' },
      { name: 'Хищник',          weapon: 'SSG 08',         rarity: 'purple', price: 2400,   icon: '🎯' },
      { name: 'Полночь',         weapon: 'Nova',           rarity: 'purple', price: 2300,   icon: '🔫' },
      { name: 'Золотой век',     weapon: 'AK-47',          rarity: 'pink',   price: 9500,   icon: '🔫' },
      { name: 'Корона',          weapon: 'USP-S',          rarity: 'pink',   price: 10500,  icon: '🔫' },
      { name: 'Повелитель драконов', weapon: 'AWP',        rarity: 'red',    price: 45000,  icon: '🔥' },
      { name: 'Аврора',          weapon: '★ Перчатки',     rarity: 'gold',   price: 150000, icon: '🧤' }
    ]
  }
];
