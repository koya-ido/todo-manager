/**
 * Todo機能のユーティリティ関数
 */

/**
 * 複数選択フィルター（ステータス、優先度）の次の選択値を計算する。
 * 「すべて」を選択すると他の選択がリセットされ、
 * すべての個別の選択肢を選択すると「すべて」にリセットされる特殊なロジックを処理する。
 */
export const getNextMultiSelectValue = (
  prev: string[],
  next: string[],
  allLabel: string,
  otherLabels: string[],
): string[] => {
  if (next.length === 0) {
    return [allLabel];
  }

  const selectedOthers = next.filter((x) => x !== allLabel);
  const isAllOthersSelected = otherLabels.every((label) =>
    selectedOthers.includes(label),
  );

  if (isAllOthersSelected) {
    return [allLabel];
  }

  const added = next.filter((x) => !prev.includes(x));
  if (added.includes(allLabel)) {
    return [allLabel];
  }
  if (prev.includes(allLabel) && next.includes(allLabel) && next.length > 1) {
    return next.filter((x) => x !== allLabel);
  }
  return next;
};
