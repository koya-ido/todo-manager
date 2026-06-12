/**
 * 日付・時刻操作に関する共通ユーティリティ関数群
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
 * 本日の日付を YYYY-MM-DD 形式のローカル日付文字列で取得する
 */
export const getTodayLocalDateString = (): string => {
  return getLocalDateString(new Date());
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

/**
 * 日付文字列を ja-JP 形式の YYYY/MM/DD HH:mm 形式に変換する（不正な場合は元の文字列を返す、nullの場合は '-'）
 */
export const toDisplayDateTime = (value: string | null): string => {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return value;
  }
};

/**
 * 申請日をローカル形式の文字列にフォーマットする
 */
export const formatAppliedDate = (
  appliedAt: string,
  locale?: string,
): string => {
  return new Date(appliedAt).toLocaleDateString(
    locale === "en" ? "en-US" : "ja-JP",
  );
};

/**
 * 日付文字列を YYYY/MM/DD 形式に変換する
 */
export const toDisplayDate = (value: string | null): string => {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return value;
  }
};

/**
 * 日付文字列を YYYY/MM/DD 形式にフォーマットする（todoDetail/index.tsx用）
 */
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "yyyy/MM/dd";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};

/**
 * 日付文字列を YYYY/MM/DD HH:mm 形式にフォーマットする（todoDetail/index.tsx用）
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * 日付文字列をローカルの日付および時間文字列に変換する (TeamDetailAdminSettingsCard.tsx用)
 */
export const toLocalDateTimeString = (dateStr: string | null): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString();
  } catch {
    return dateStr;
  }
};

/**
 * 期限超過しているかどうかを判定する (今日より前かつ今日ではない)
 */
export const isDateOverdue = (dueDateStr: string | null): boolean => {
  if (!dueDateStr) return false;
  try {
    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) return false;
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  } catch {
    return false;
  }
};

/**
 * 二つの日付文字列を比較し、差を返す (ソート用)
 */
export const compareDates = (a: string, b: string): number => {
  return new Date(a).getTime() - new Date(b).getTime();
};

/**
 * aがbより後の日付かどうかを判定する
 */
export const isAfterDate = (a: string, b: string): boolean => {
  return new Date(a).getTime() > new Date(b).getTime();
};
