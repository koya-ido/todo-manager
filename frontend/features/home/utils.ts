/**
 * 日付操作に関するユーティリティ関数
 */

/**
 * 指定した日付を YYYY-MM-DD 形式のローカル日付文字列に変換する
 */
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 本日の日付を YYYY/MM/DD 形式の表示用文字列で取得する
 */
export const getTodayDisplayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};
