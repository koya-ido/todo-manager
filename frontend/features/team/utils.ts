/**
 * Utility functions for Team feature
 */

/**
 * Formats the applied date to locale string.
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
 * Formats a message template containing "{id}" with the actual team ID.
 */
export const formatTeamId = (
  template: string | undefined,
  displayTeamsId: string,
): string => {
  return (template || "ID: {id}").replace("{id}", displayTeamsId);
};

/**
 * Formats a message template containing "{date}" with the formatted applied date.
 */
export const formatAppliedDateLabel = (
  template: string | undefined,
  appliedAt: string,
  locale?: string,
): string => {
  const dateStr = formatAppliedDate(appliedAt, locale);
  return (template || "申請日: {date}").replace("{date}", dateStr);
};
