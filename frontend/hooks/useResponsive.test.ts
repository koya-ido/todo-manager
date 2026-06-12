import { useResponsive } from "@/hooks/useResponsive";
import React from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

describe("useResponsive (レスポンシブデザイン判定フック)", () => {
  it("画面幅が 768px 以下の時は isMobileLayout が true になり、それ以上の時は false になること", async () => {
    const originalWidth = window.innerWidth;

    // テスト用のダミーコンポーネント
    const TestComponent = () => {
      const { isMobileLayout } = useResponsive();
      return React.createElement(
        "div",
        { id: "test-responsive-result" },
        isMobileLayout ? "mobile" : "desktop",
      );
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      // 1. 画面幅をモバイルサイズ (500px) に設定してレンダリング
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      root.render(React.createElement(TestComponent));

      // DOMへの反映を待つ
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(
        document.getElementById("test-responsive-result")?.textContent,
      ).toBe("mobile");

      // 2. 画面幅をデスクトップサイズ (1024px) に変更し resize イベントを発火
      window.innerWidth = 1024;
      window.dispatchEvent(new Event("resize"));

      // 状態変化と再レンダリングを待つ
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(
        document.getElementById("test-responsive-result")?.textContent,
      ).toBe("desktop");
    } finally {
      // テスト終了後のクリーンアップ
      root.unmount();
      container.remove();
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: originalWidth,
      });
    }
  });
});
