import { getNextMultiSelectValue } from "@/features/todos/utils";
import { describe, expect, it } from "vitest";

describe("features/todos/utils (Todo一覧機能ユーティリティ)", () => {
  describe("getNextMultiSelectValue", () => {
    const allLabel = "すべて";
    const otherLabels = ["未着手", "進行中", "完了"];

    it("選択された値が空（next.length === 0）の場合、'すべて'を返すこと", () => {
      const prev = [allLabel];
      const next: string[] = [];
      expect(
        getNextMultiSelectValue(prev, next, allLabel, otherLabels),
      ).toEqual([allLabel]);
    });

    it("すべての個別選択肢が選択された場合、'すべて'に集約されること", () => {
      const prev = ["未着手", "進行中"];
      const next = ["未着手", "進行中", "完了"];
      expect(
        getNextMultiSelectValue(prev, next, allLabel, otherLabels),
      ).toEqual([allLabel]);
    });

    it("すでに個別の値が選択されている状態で、新しく'すべて'が選択されたら'すべて'のみを返すこと", () => {
      const prev = ["未着手"];
      const next = ["未着手", allLabel];
      expect(
        getNextMultiSelectValue(prev, next, allLabel, otherLabels),
      ).toEqual([allLabel]);
    });

    it("すでに'すべて'が選択されている状態で、別の個別選択肢が選択されたら'すべて'を除外した個別選択肢のみを返すこと", () => {
      const prev = [allLabel];
      const next = [allLabel, "進行中"];
      expect(
        getNextMultiSelectValue(prev, next, allLabel, otherLabels),
      ).toEqual(["進行中"]);
    });

    it("上記以外の一般的な選択変更時には、選択された値をそのまま返すこと", () => {
      const prev = ["未着手"];
      const next = ["未着手", "進行中"];
      expect(
        getNextMultiSelectValue(prev, next, allLabel, otherLabels),
      ).toEqual(["未着手", "進行中"]);
    });
  });
});
