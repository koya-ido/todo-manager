/**
 * Utility functions for Todos feature
 */

/**
 * Calculates the next selected value for a multi-select filter (status, priority).
 * Handles the special logic where selecting "all" resets other selections,
 * and selecting all individual choices resets to "all".
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
