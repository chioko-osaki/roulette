/* =========================================================
   sound.js
   効果音（SE）の再生を担当するファイルです。

   ★SEの付け方★
   audio フォルダの中に、下記の「決まったファイル名」で音声ファイル
   （mp3推奨）を置くだけで、該当するタイミングで自動的に音が鳴ります。
   コードを書き換える必要はありません。

     audio/draw-start.mp3     … 「抽選する」ボタンを押した瞬間
     audio/roulette.mp3       … ルーレットが回転している間（自動でループ再生）
     audio/roulette-stop.mp3  … ルーレットが止まって賞を指した瞬間
     audio/result-show.mp3    … 景品の結果画面に切り替わった瞬間

   ファイルを置いていないタイミングは、再生しようとして失敗しても
   エラーにならず、何も起きないだけです。抽選処理には一切影響しません。
   後からファイルを追加・差し替えたいときは、同じファイル名で
   audio フォルダの中身を入れ替えるだけでOKです。
   ========================================================= */

const SOUND_FILES = {
  'draw-start': 'audio/draw-start.mp3',
  'roulette': 'audio/roulette.mp3',
  'roulette-stop': 'audio/roulette-stop.mp3',
  'result-show': 'audio/result-show.mp3',
};

// ループ再生中の音を覚えておくための入れ物（ルーレット回転音の停止に使用）
const activeLoopingAudio = {};

// key: SOUND_FILESのいずれか
// loop: trueにすると、stopSound(key)を呼ぶまでループ再生し続ける
//       （「ルーレットが回っている間」ずっと鳴らしたい場合に使う）
function playSound(key, options) {
  const src = SOUND_FILES[key];
  if (!src) return;

  const loop = !!(options && options.loop);

  try {
    const audio = new Audio(src);
    audio.loop = loop;
    if (loop) {
      activeLoopingAudio[key] = audio;
    }
    // 音声ファイルが存在しない/再生できない場合もエラーにせず、静かに無視する
    audio.play().catch(() => {});
  } catch (error) {
    // 再生に失敗しても抽選処理には影響させない
  }
}

// loop: trueで再生した音を止めたいときに呼ぶ（例：ルーレットが止まったタイミング）
function stopSound(key) {
  const audio = activeLoopingAudio[key];
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  delete activeLoopingAudio[key];
}
