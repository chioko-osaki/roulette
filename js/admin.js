/* =========================================================
   admin.js
   管理画面（スタッフ専用オーバーレイ）の表示・操作を担当します。
   ========================================================= */

const Admin = (function () {
  let els = {};

  function init() {
    els.overlay = document.getElementById('admin-overlay');
    els.openBtn = document.getElementById('admin-open-btn');
    els.closeBtn = document.getElementById('admin-close-btn');
    els.modeLabel = document.getElementById('admin-mode-label');
    els.drawCount = document.getElementById('admin-draw-count');
    els.prizeList = document.getElementById('admin-prize-list');
    els.historyList = document.getElementById('admin-history-list');
    els.startProductionBtn = document.getElementById('admin-start-production-btn');

    els.openBtn.addEventListener('click', open);
    els.closeBtn.addEventListener('click', close);
    els.startProductionBtn.addEventListener('click', handleStartProduction);
  }

  function open() {
    render();
    els.overlay.hidden = false;
  }

  function close() {
    els.overlay.hidden = true;
  }

  function render() {
    els.modeLabel.textContent = App.getMode() === 'production' ? '本番モード' : 'テストモード';
    els.drawCount.textContent = String(History.getCount());

    renderPrizeList();
    renderHistoryList();
  }

  function renderPrizeList() {
    els.prizeList.innerHTML = '';

    Inventory.getAll().forEach((prize) => {
      const row = document.createElement('div');
      row.className = 'admin-prize-row';

      let statusText = '抽選対象';
      if (prize.paused) statusText = '一時停止中';
      else if (prize.currentStock <= 0) statusText = '在庫なし';

      row.innerHTML = `
        <span class="admin-prize-name">${escapeHtml(prize.name)}</span>
        <span class="admin-prize-stock">${prize.currentStock} / ${prize.initialStock}</span>
        <span class="admin-prize-status">${statusText}</span>
        <button type="button" data-action="minus" data-id="${prize.id}">−1</button>
        <button type="button" data-action="plus" data-id="${prize.id}">＋1</button>
        <button type="button" data-action="pause" data-id="${prize.id}">${prize.paused ? '再開' : '一時停止'}</button>
      `;
      els.prizeList.appendChild(row);
    });

    els.prizeList.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', handlePrizeAction);
    });
  }

  function renderHistoryList() {
    els.historyList.innerHTML = '';
    const entries = History.getAll();

    if (entries.length === 0) {
      els.historyList.textContent = 'まだ抽選履歴はありません。';
      return;
    }

    entries.slice().reverse().forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'admin-history-row';
      const displayNo = `#${String(entry.no).padStart(3, '0')}`;
      row.textContent = `${displayNo}　${entry.timestamp}　${entry.prizeName}`;
      els.historyList.appendChild(row);
    });
  }

  function handlePrizeAction(event) {
    const id = event.currentTarget.dataset.id;
    const action = event.currentTarget.dataset.action;

    if (action === 'minus') Inventory.adjustStock(id, -1);
    if (action === 'plus') Inventory.adjustStock(id, 1);
    if (action === 'pause') Inventory.togglePause(id);

    renderPrizeList();
    App.refreshDrawScreen();
  }

  function handleStartProduction() {
    const confirmed = window.confirm(
      'この操作を行うと現在の履歴などがリセットされます。実行しますか？'
    );
    if (!confirmed) return;

    Inventory.resetForProduction();
    History.resetForProduction();
    App.setMode('production');

    render();
    App.refreshDrawScreen();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return { init, render };
})();
