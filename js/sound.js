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

   ★再生の遅延について★
   ページを開いた時点で、下の audioElements があらかじめ各音声ファイルの
   読み込みを開始しておきます（プリロード）。これにより、ボタンを押した
   瞬間に初めてファイルを読みに行くことがなくなり、再生の遅延が
   目立ちにくくなります。
   それでも遅れが気になる場合は、音声ファイル自体の先頭に無音部分が
   入っていないか確認し、入っていれば編集ソフトでカットしてみてください。
   ========================================================= */

const SOUND_FILES = {
  'draw-start': 'audio/draw-start.mp3',
  'roulette': 'audio/roulette.mp3',
  'roulette-stop': 'audio/roulette-stop.mp3',
  'result-show': 'audio/result-show.mp3',
};

// 各SEを1つずつ事前に作成し、読み込みを開始しておく（使い回すことで遅延を防ぐ）
const audioElements = {};
Object.keys(SOUND_FILES).forEach((key) => {
  const audio = new Audio(SOUND_FILES[key]);
  audio.preload = 'auto';
  audio.load();
  audioElements[key] = audio;
});

// key: SOUND_FILESのいずれか
// loop: trueにすると、stopSound(key)を呼ぶまでループ再生し続ける
//       （「ルーレットが回っている間」ずっと鳴らしたい場合に使う）
function playSound(key, options) {
  const audio = audioElements[key];
  if (!audio) return;

  const loop = !!(options && options.loop);
  audio.loop = loop;

  try {
    audio.currentTime = 0; // 前回の再生位置が残らないよう、必ず先頭から鳴らす
    // 音声ファイルが存在しない/再生できない場合もエラーにせず、静かに無視する
    audio.play().catch(() => {});
  } catch (error) {
    // 再生に失敗しても抽選処理には影響させない
  }
}

// loop: trueで再生した音を止めたいときに呼ぶ（例：ルーレットが止まったタイミング）
function stopSound(key) {
  const audio = audioElements[key];
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}
