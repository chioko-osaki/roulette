/* =========================================================
   inventory.js
   景品の一覧・在庫数・一時停止・抽選対象の判定を管理するファイルです。

   ★景品の内容を変更したいときは、下の PRIZE_CONFIG を編集してください。
   　（景品名・画像パス・初期在庫数を変えられます）
   　画像は images フォルダに入れて、パスを合わせてください。

   ※ PRIZE_CONFIG を編集した場合、景品の数や id が前回と変わっていれば
   　次にページを開いたときに自動的に新しい内容で在庫がリセットされます。
   　（詳しくは configMatchesSaved() を参照）
   ========================================================= */

const PRIZE_CONFIG = [
 { id: 'A', name: '【橋元隊員】特製スマホクリーナー', image: 'images/prize-a.png', initialStock: 20 },
 { id: 'B', name: '【秋山隊員】○○', image: 'images/prize-b.png', initialStock: 20 },
 { id: 'C', name: '【氏家隊員】○○', image: 'images/prize-c.png', initialStock: 20 },
 { id: 'D', name: '【外崎隊員】○○', image: 'images/prize-c.png', initialStock: 20 },
 { id: 'E', name: '【粕谷隊員】○○', image: 'images/prize-c.png', initialStock: 20 },
 { id: 'F', name: '【今野隊員】○○', image: 'images/prize-c.png', initialStock: 20 },
];

const Inventory = (function () {
  let prizes = [];

  function buildDefaultPrizes() {
    return PRIZE_CONFIG.map((config) => ({
      id: config.id,
      name: config.name,
      image: config.image,
      initialStock: config.initialStock,
      currentStock: config.initialStock,
      paused: false,
    }));
  }

  // 保存されていたデータが、現在のPRIZE_CONFIGと対応しているか確認する。
  // 景品の種類（id）が変わっていたら「合っていない」と判断し、初期状態から作り直す。
  function configMatchesSaved(saved) {
    if (!Array.isArray(saved) || saved.length !== PRIZE_CONFIG.length) return false;
    const savedIds = saved.map((p) => p.id).slice().sort().join(',');
    const configIds = PRIZE_CONFIG.map((p) => p.id).slice().sort().join(',');
    return savedIds === configIds;
  }

  function init() {
    const saved = Storage.loadPrizes(null);
    if (configMatchesSaved(saved)) {
      prizes = saved;
    } else {
      prizes = buildDefaultPrizes();
      Storage.savePrizes(prizes);
    }
  }

  function getAll() {
    return prizes;
  }

  // 「在庫が1個以上」かつ「一時停止されていない」景品だけを抽選対象として返す。
  // ここで返された配列の中から均等な確率で1つ選ぶことで、
  // 在庫数の多い/少ないに関わらず確率が均等になる。
  function getAvailable() {
    return prizes.filter((prize) => prize.currentStock > 0 && !prize.paused);
  }

  function decrementStock(prizeId) {
    const prize = prizes.find((p) => p.id === prizeId);
    if (prize && prize.currentStock > 0) {
      prize.currentStock -= 1;
      Storage.savePrizes(prizes);
    }
  }

  // 管理画面からの手動増減（+1 / -1）。0未満にはならないようにする。
  function adjustStock(prizeId, delta) {
    const prize = prizes.find((p) => p.id === prizeId);
    if (!prize) return;
    prize.currentStock = Math.max(0, prize.currentStock + delta);
    Storage.savePrizes(prizes);
  }

  function togglePause(prizeId) {
    const prize = prizes.find((p) => p.id === prizeId);
    if (!prize) return;
    prize.paused = !prize.paused;
    Storage.savePrizes(prizes);
  }

  // 本番開始時：在庫をすべて初期値に戻し、一時停止も解除する。
  function resetForProduction() {
    prizes = prizes.map((prize) => ({
      ...prize,
      currentStock: prize.initialStock,
      paused: false,
    }));
    Storage.savePrizes(prizes);
  }

  return {
    init,
    getAll,
    getAvailable,
    decrementStock,
    adjustStock,
    togglePause,
    resetForProduction,
  };
})();
