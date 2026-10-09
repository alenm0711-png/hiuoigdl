/* =====================================================================
   main.js — ЗАПУСК: навешиваем обработчики кликов и запускаем таймер
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  // Вкладки
  $('tabs').addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) switchTab(tab.dataset.tab);
  });

  // Открытие кейса (кнопки создаются динамически — слушаем контейнер)
  $('cases-grid').addEventListener('click', e => {
    const btn = e.target.closest('[data-open]');
    if (btn) openCase(btn.dataset.open);
  });

  // Продажа одного скина
  $('inventory-grid').addEventListener('click', e => {
    const btn = e.target.closest('[data-sell]');
    if (btn) {
      const gain = sellItem(btn.dataset.sell);
      if (gain) showToast('Продано: +' + formatNum(gain) + ' монет');
    }
  });

  // Продать всё (с подтверждением)
  $('sell-all-btn').addEventListener('click', () => {
    if (confirm('Продать все скины из инвентаря?')) sellAll();
  });

  // Заработок
  $('work-btn').addEventListener('click', e => {
    work();
    floatText('+' + state.clickPower, e.clientX, e.clientY);
  });
  $('upgrade-btn').addEventListener('click', buyUpgrade);
  $('bonus-btn').addEventListener('click', claimBonus);

  $('reset-btn').addEventListener('click', () => {
    if (confirm('Удалить весь прогресс и начать заново?')) {
      resetState();
      renderAll();
      showToast('Прогресс сброшен');
    }
  });

  // Кнопки в окне результата
  $('result-keep').addEventListener('click', closeModal);
  $('result-sell').addEventListener('click', () => {
    if (lastWin) {
      const gain = sellItem(lastWin.uid);
      showToast('Продано: +' + formatNum(gain) + ' монет');
    }
    closeModal();
  });

  // Таймер бонуса обновляется раз в секунду
  setInterval(renderEarn, 1000);
});
