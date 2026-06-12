import {
  formatAppliedDateLabel,
  formatTeamId,
} from "@/features/team/utils";
import { formatAppliedDate } from "@/utils/DateUtils";
import { describe, expect, it } from "vitest";

describe("features/team/utils (チーム機能ユーティリティ)", () => {
  describe("formatTeamId", () => {
    it("テンプレートが未指定の場合、デフォルトの形式でチームIDが埋め込まれること", () => {
      expect(formatTeamId(undefined, "123")).toBe("ID: 123");
    });

    it("指定されたテンプレート内の {id} がチームIDに置換されること", () => {
      expect(formatTeamId("チーム番号: {id}", "999")).toBe("チーム番号: 999");
    });
  });

  describe("formatAppliedDateLabel", () => {
    const testDate = "2026-06-11T08:00:00.000Z";

    it("申請日ラベルテンプレート内の {date} がフォーマットされた日付文字列に置換されること", () => {
      const result = formatAppliedDateLabel(
        "申請した日: {date}",
        testDate,
        "ja",
      );
      const expectedDate = formatAppliedDate(testDate, "ja");
      expect(result).toBe(`申請した日: ${expectedDate}`);
    });

    it("テンプレートが未指定の場合、デフォルトの形式で申請日ラベルに置換されること", () => {
      const result = formatAppliedDateLabel(undefined, testDate, "ja");
      const expectedDate = formatAppliedDate(testDate, "ja");
      expect(result).toBe(`申請日: ${expectedDate}`);
    });
  });
});
