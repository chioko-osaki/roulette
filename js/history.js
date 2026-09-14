/* =========================================================
   history.js
   抽選履歴（何番目に、いつ、何が当たったか）と
   本番抽選回数の管理を担当するファイルです。

   ※テストモード中は add() を呼び出さない設計にしているため
   　（app.js側で制御）、テスト結果は履歴に残りません。
   ========================================================= */

const History = (function () {
  let entries = [];
  let drawCount = 0;

  function init() {
    entries = Storage.loadHistory();
    drawCount = Storage.loadDrawCount();
  }

  function add(prize) {
    drawCount += 1;
    const entry = {
      no: drawCount,
      timestamp: new Date().toLocaleString('ja-JP'),
      prizeId: prize.id,
      prizeName: prize.name,
    };
    entries.push(entry);
    Storage.saveHistory(entries);
    Storage.saveDrawCount(drawCount);
  }

  function getAll() {
    return entries;
  }

  function getCount() {
    return drawCount;
  }

  function resetForProduction() {
    entries = [];
    drawCount = 0;
    Storage.saveHistory(entries);
    Storage.saveDrawCount(drawCount);
  }

  return { init, add, getAll, getCount, resetForProduction };
})();
