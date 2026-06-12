import { formatAppliedDate } from "@/utils/DateUtils";
export { formatAppliedDate };

/**
 * "{id}"を含むメッセージテンプレートを実際のチームIDでフォーマットする。
 */
export const formatTeamId = (
  template: string | undefined,
  displayTeamsId: string,
): string => {
  return (template || "ID: {id}").replace("{id}", displayTeamsId);
};

/**
 * "{date}"を含むメッセージテンプレートをフォーマットされた申請日でフォーマットする。
 */
export const formatAppliedDateLabel = (
  template: string | undefined,
  appliedAt: string,
  locale?: string,
): string => {
  const dateStr = formatAppliedDate(appliedAt, locale);
  return (template || "申請日: {date}").replace("{date}", dateStr);
};
