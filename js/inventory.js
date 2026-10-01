/* =========================================================
   inventory.js
   景品の一覧・在庫数・一時停止・抽選対象の判定を管理するファイルです。

   ★景品の内容を変更したいときは、下の PRIZE_CONFIG を編集してください。

   - rankName  … ルーレット画面と結果画面に大きく表示する「賞の名前」（例：A賞）
   - itemName  … 結果画面でrankNameの下に表示する「実際の景品名」（例：Amazonギフト券500円分）
   - image     … images フォルダに入れた画像ファイルへのパス
   - initialStock … イベント開始時点の在庫数

   ※ PRIZE_CONFIGを編集してページを再読み込みすると、
   　id（景品の記号）が変わっていない限り、現在の在庫数はそのまま保たれ、
   　rankName・itemName・image・initialStock の表示内容だけが新しくなります。
   　（文言の修正や画像の差し替えだけなら、在庫をリセットせずに反映できます）
   　id を追加・削除した場合は、在庫が初期値から作り直されます。
   ========================================================= */

const PRIZE_CONFIG = [
  { id: 'A', rankName: '橋元隊員賞', itemName: '特製スマホクリーナー', image: 'images/IMG_prize01.png', initialStock: 5 },
  { id: 'B', rankName: '秋山隊員賞', itemName: 'ミニコースター', image: 'images/IMG_prize02.png', initialStock: 10 },
  { id: 'C', rankName: '氏家隊員賞', itemName: '景品名を入力してください', image: 'images/prize-c.png', initialStock: 20 },
  { id: 'D', rankName: '外崎隊員賞', itemName: '大崎市クリアファイル', image: 'images/IMG_prize04.png', initialStock: 20 },
  { id: 'E', rankName: '粕谷隊員賞', itemName: '景品名を入力してください', image: 'images/prize-c.png', initialStock: 20 },
  { id: 'F', rankName: '今野隊員賞', itemName: '景品名を入力してください', image: 'images/prize-c.png', initialStock: 20 },
];

const Inventory = (function () {
  let prizes = [];

  function buildDefaultPrizes() {
    return PRIZE_CONFIG.map((config) => ({
      id: config.id,
      rankName: config.rankName,
      itemName: config.itemName,
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
      // idが一致していれば、在庫数(currentStock)と一時停止状態(paused)は
      // 保存されていた値を引き継ぎ、表示用の文言・画像・初期在庫数は
      // 常にPRIZE_CONFIGの最新の内容を使う。
      // （イベント中に賞の名前や景品名の誤字を直したい場合など、
      //   在庫をリセットせずに文言だけ更新できるようにするため）
      prizes = saved.map((savedPrize) => {
        const config = PRIZE_CONFIG.find((c) => c.id === savedPrize.id);
        return {
          id: config.id,
          rankName: config.rankName,
          itemName: config.itemName,
          image: config.image,
          initialStock: config.initialStock,
          currentStock: savedPrize.currentStock,
          paused: !!savedPrize.paused,
        };
      });
    } else {
      prizes = buildDefaultPrizes();
    }
    Storage.savePrizes(prizes);
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
