/* =========================================================
   app.js
   アプリ全体の初期化と、各ファイル（inventory / history / roulette / sound）の
   連携を担当する司令塔ファイルです。
   管理画面（admin.html）は別ページのため、ここでは扱いません。

   抽選処理の流れ（仕様どおり、内部処理と演出を分離しています）：
   ① 当選景品を決定
   ② 在庫を1減らす（本番モードのみ）
   ③ 抽選履歴を保存（本番モードのみ）
   ④ ルーレット演出を開始
   ⑤ 演出終了後、決定した景品の結果画面を表示
   ========================================================= */

const App = (function () {
  let mode = 'test';        // 'test' または 'production'
  let isDrawing = false;    // 二重抽選防止用フラグ
  let els = {};

  function init() {
    els.drawScreen = document.getElementById('draw-screen');
    els.resultScreen = document.getElementById('result-screen');
    els.drawBtn = document.getElementById('draw-btn');
    els.nextBtn = document.getElementById('next-btn');
    els.testBanner = document.getElementById('test-mode-banner');
    els.soldOutMessage = document.getElementById('sold-out-message');
    els.resultTestBadge = document.getElementById('result-test-badge');
    els.resultImage = document.getElementById('result-image');
    els.resultImageFallback = document.getElementById('result-image-fallback');
    els.resultName = document.getElementById('result-name');

    Inventory.init();
    History.init();
    mode = Storage.loadMode();

    els.drawBtn.addEventListener('click', handleDraw);
    els.nextBtn.addEventListener('click', backToDrawScreen);

    // 画像が読み込めなかった場合は、景品名だけの表示に切り替える（抽選自体は失敗させない）
    els.resultImage.addEventListener('error', () => {
      els.resultImage.hidden = true;
      els.resultImageFallback.hidden = false;
    });

    refreshDrawScreen();
  }

  function getMode() {
    return mode;
  }

  function setMode(newMode) {
    mode = newMode;
    Storage.saveMode(mode);
    els.testBanner.hidden = mode !== 'test';
  }

  // 抽選画面（ホイールの中身・在庫切れ表示など）を最新の状態に更新する
  function refreshDrawScreen() {
    els.testBanner.hidden = mode !== 'test';

    const candidates = Inventory.getAvailable();
    const allSoldOut = candidates.length === 0;

    els.soldOutMessage.hidden = !allSoldOut;
    els.drawBtn.hidden = allSoldOut;

    if (!allSoldOut) {
      Roulette.render(candidates);
    }
  }

  function handleDraw() {
    if (isDrawing) return; // 連続タップによる二重抽選を防止

    const candidates = Inventory.getAvailable();
    if (candidates.length === 0) {
      refreshDrawScreen();
      return;
    }

    isDrawing = true;
    els.drawBtn.disabled = true;

    // ① 当選景品を決定
    // 「在庫がある景品の種類」から均等な確率で1つを選ぶ（在庫数の多い/少ないは無関係）
    const winner = candidates[Math.floor(Math.random() * candidates.length)];

    if (mode === 'production') {
      // ② 在庫を1減らす
      Inventory.decrementStock(winner.id);
      // ③ 抽選履歴を保存
      History.add(winner);
    }
    // テストモードの場合は②③を行わないため、在庫も履歴も変化しない

    playSound('draw-start');

    // ④ ルーレット演出を開始 → ⑤ 終了後に結果画面を表示
    Roulette.spinTo(winner.id, () => {
      showResultScreen(winner);
      isDrawing = false;
      els.drawBtn.disabled = false;
    });
  }

  function showResultScreen(prize) {
    els.drawScreen.hidden = true;
    els.resultScreen.hidden = false;

    els.resultTestBadge.hidden = mode !== 'test';

    els.resultImage.hidden = false;
    els.resultImageFallback.hidden = true;
    els.resultImage.src = prize.image;
    els.resultImage.alt = prize.name;

    els.resultName.textContent = prize.name;
  }

  // スタッフが「次の方」ボタンを押したときの処理
  function backToDrawScreen() {
    els.resultScreen.hidden = true;
    els.drawScreen.hidden = false;
    refreshDrawScreen();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { getMode, setMode, refreshDrawScreen };
})();
