/* =========================================================
   sound.js
   効果音（SE）を後から追加しやすくするためのファイルです。

   ★SEを追加する手順★
   1. audio フォルダに音声ファイル（例: draw-start.mp3）を置く
   2. 下の SOUND_FILES の該当する行の null を
      'audio/draw-start.mp3' のようにファイルパスへ書き換える
   これだけで、他のファイル（app.js / roulette.js）を変更せずにSEが鳴るようになります。
   ========================================================= */

const SOUND_FILES = {
  'draw-start': null, // 抽選開始時に鳴らす音（例: 'audio/draw-start.mp3'）
  'roulette': null,   // ルーレット回転中に鳴らす音
  'win': null,        // 当選結果表示時に鳴らす音
};

// key: 'draw-start' | 'roulette' | 'win'
function playSound(key) {
  const src = SOUND_FILES[key];
  if (!src) return; // ファイルが設定されていなければ何もしない（安全に無視）
  try {
    const audio = new Audio(src);
    // 自動再生がブロックされる場合があるが、抽選処理には影響させない
    audio.play().catch(() => {});
  } catch (error) {
    // 再生に失敗しても抽選処理には影響させない
  }
}
