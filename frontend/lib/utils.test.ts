import { cn } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("lib/utils (共通ユーティリティ)", () => {
  describe("cn (クラス結合ユーティリティ)", () => {
    it("複数のクラス名をスペース区切りで結合できること", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("条件付きのクラス名を正しく処理できること", () => {
      expect(
        cn("class1", false && "class2", "class3", undefined, null, ""),
      ).toBe("class1 class3");
    });

    it("衝突する Tailwind クラス名が適切にマージ（後勝ち）されること", () => {
      expect(cn("p-2", "p-4")).toBe("p-4");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });
  });
});
