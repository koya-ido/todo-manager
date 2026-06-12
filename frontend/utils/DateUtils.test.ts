import {
  getLocalDateString,
  getTodayLocalDateString,
  getTodayDisplayString,
  toDisplayDateTime,
  formatAppliedDate,
  toDisplayDate,
  formatDate,
  formatDateTime,
  toLocalDateTimeString,
  isDateOverdue,
  compareDates,
  isAfterDate,
} from "@/utils/DateUtils";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("lib/DateUtils", () => {
  describe("getLocalDateString", () => {
    it("日付を正しく YYYY-MM-DD 形式の文字列に変換できること", () => {
      const date = new Date(2026, 5, 11); // 6月11日
      expect(getLocalDateString(date)).toBe("2026-06-11");
    });

    it("1桁の月や日に対して 0 埋めが行われること", () => {
      const date = new Date(2026, 0, 5); // 1月5日
      expect(getLocalDateString(date)).toBe("2026-01-05");
    });
  });

  describe("getTodayLocalDateString", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("本日の日付を YYYY-MM-DD 形式で取得できること", () => {
      const date = new Date(2026, 11, 25);
      vi.useFakeTimers();
      vi.setSystemTime(date);

      expect(getTodayLocalDateString()).toBe("2026-12-25");
    });
  });

  describe("getTodayDisplayString", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("本日の日付を正しく YYYY/MM/DD 形式で取得できること", () => {
      const date = new Date(2026, 11, 25);
      vi.useFakeTimers();
      vi.setSystemTime(date);

      expect(getTodayDisplayString()).toBe("2026/12/25");
    });
  });

  describe("toDisplayDateTime", () => {
    it("値が null または空文字列の場合は '-' を返すこと", () => {
      expect(toDisplayDateTime(null)).toBe("-");
      expect(toDisplayDateTime("")).toBe("-");
    });

    it("不正な日付文字列の場合はそのままの値を返すこと", () => {
      expect(toDisplayDateTime("invalid-date")).toBe("invalid-date");
    });

    it("有効な日付文字列の場合は指定形式 (ja-JP) でフォーマットされること", () => {
      const dateStr = "2026-06-11T17:30:00+09:00";
      const result = toDisplayDateTime(dateStr);
      expect(result).toContain("2026");
      expect(result).toContain("06");
      expect(result).toContain("11");
      expect(result).toContain("17:30");
    });
  });

  describe("formatAppliedDate", () => {
    const testDate = "2026-06-11T08:00:00.000Z";

    it("ロケールが ja の場合は日本語形式の日付文字列に変換されること", () => {
      const formatted = formatAppliedDate(testDate, "ja");
      expect(formatted).toContain("2026");
      expect(formatted).toContain("6");
      expect(formatted).toContain("11");
    });

    it("ロケールが en の場合は英語（US）形式の日付文字列に変換されること", () => {
      const formatted = formatAppliedDate(testDate, "en");
      expect(formatted).toContain("6");
      expect(formatted).toContain("11");
      expect(formatted).toContain("2026");
    });
  });

  describe("toDisplayDate", () => {
    it("値が null の場合は '-' を返すこと", () => {
      expect(toDisplayDate(null)).toBe("-");
    });

    it("不正な日付文字列の場合はそのままの値を返すこと", () => {
      expect(toDisplayDate("invalid-date")).toBe("invalid-date");
    });

    it("有効な日付文字列の場合は指定形式 (ja-JP) でフォーマットされること", () => {
      const dateStr = "2026-06-11T17:30:00+09:00";
      const result = toDisplayDate(dateStr);
      expect(result).toContain("2026");
      expect(result).toContain("06");
      expect(result).toContain("11");
    });
  });

  describe("formatDate", () => {
    it("値が null の場合は 'yyyy/MM/dd' を返すこと", () => {
      expect(formatDate(null)).toBe("yyyy/MM/dd");
    });

    it("日付文字列を YYYY/MM/DD 形式にフォーマットできること", () => {
      expect(formatDate("2026-06-11")).toBe("2026/06/11");
      expect(formatDate("2026-01-02T00:00:00Z")).toBe("2026/01/02");
    });
  });

  describe("formatDateTime", () => {
    it("値が null または undefined の場合は空文字列を返すこと", () => {
      expect(formatDateTime(null)).toBe("");
      expect(formatDateTime(undefined)).toBe("");
    });

    it("日付文字列を YYYY/MM/DD HH:mm 形式にフォーマットできること", () => {
      expect(formatDateTime("2026-06-11T17:30:00+09:00")).toContain("2026/06/11 17:30");
    });
  });

  describe("toLocalDateTimeString", () => {
    it("値が null の場合は空文字列を返すこと", () => {
      expect(toLocalDateTimeString(null)).toBe("");
    });

    it("日付文字列をローカルの日付および時間形式にフォーマットできること", () => {
      const formatted = toLocalDateTimeString("2026-06-11T17:30:00+09:00");
      expect(formatted).toBeTruthy();
    });
  });

  describe("isDateOverdue", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("値が null の場合は false を返すこと", () => {
      expect(isDateOverdue(null)).toBe(false);
    });

    it("今日より前の日付の場合は true を返すこと", () => {
      const today = new Date(2026, 5, 11);
      vi.useFakeTimers();
      vi.setSystemTime(today);
      expect(isDateOverdue("2026-06-10")).toBe(true);
    });

    it("今日と同じ日付の場合は false を返すこと", () => {
      const today = new Date(2026, 5, 11);
      vi.useFakeTimers();
      vi.setSystemTime(today);
      expect(isDateOverdue("2026-06-11")).toBe(false);
    });

    it("今日より後の日付の場合は false を返すこと", () => {
      const today = new Date(2026, 5, 11);
      vi.useFakeTimers();
      vi.setSystemTime(today);
      expect(isDateOverdue("2026-06-12")).toBe(false);
    });
  });

  describe("compareDates", () => {
    it("二つの日付文字列を比較できること", () => {
      expect(compareDates("2026-06-11T08:00:00Z", "2026-06-11T09:00:00Z")).toBeLessThan(0);
      expect(compareDates("2026-06-11T10:00:00Z", "2026-06-11T09:00:00Z")).toBeGreaterThan(0);
      expect(compareDates("2026-06-11T09:00:00Z", "2026-06-11T09:00:00Z")).toBe(0);
    });
  });

  describe("isAfterDate", () => {
    it("日付の前後関係を正しく判定できること", () => {
      expect(isAfterDate("2026-06-11T10:00:00Z", "2026-06-11T09:00:00Z")).toBe(true);
      expect(isAfterDate("2026-06-11T08:00:00Z", "2026-06-11T09:00:00Z")).toBe(false);
    });
  });
});
