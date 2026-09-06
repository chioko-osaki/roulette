/* =========================================================
   storage.js
   localStorageへの保存・読み込みだけを担当するファイルです。
   他のファイルは、直接localStorageを触らず、必ずこのStorageを経由してください。
   ========================================================= */

const STORAGE_KEYS = {
  PRIZES: 'raffle_prizes',
  HISTORY: 'raffle_history',
  MODE: 'raffle_mode',
  DRAW_COUNT: 'raffle_draw_count',
};

// JSON.parseに失敗しても落ちないようにする安全な読み込み関数
function safeParseJSON(rawText, fallbackValue) {
  try {
    const parsed = JSON.parse(rawText);
    if (parsed === null || parsed === undefined) return fallbackValue;
    return parsed;
  } catch (error) {
    console.warn('保存データの読み込みに失敗したため、初期値を使用します。', error);
    return fallbackValue;
  }
}

const Storage = {
  // ---- 景品情報（在庫を含む） ----
  loadPrizes(fallbackValue) {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (!raw) return fallbackValue;
    return safeParseJSON(raw, fallbackValue);
  },
  savePrizes(prizes) {
    localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
  },

  // ---- 抽選履歴 ----
  loadHistory() {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return safeParseJSON(raw, []);
  },
  saveHistory(historyEntries) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyEntries));
  },

  // ---- モード（test / production） ----
  loadMode() {
    const raw = localStorage.getItem(STORAGE_KEYS.MODE);
    return raw === 'production' ? 'production' : 'test';
  },
  saveMode(mode) {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  },

  // ---- 抽選回数（本番のみ） ----
  loadDrawCount() {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAW_COUNT);
    const parsedNumber = parseInt(raw, 10);
    return Number.isFinite(parsedNumber) && parsedNumber >= 0 ? parsedNumber : 0;
  },
  saveDrawCount(count) {
    localStorage.setItem(STORAGE_KEYS.DRAW_COUNT, String(count));
  },
};
