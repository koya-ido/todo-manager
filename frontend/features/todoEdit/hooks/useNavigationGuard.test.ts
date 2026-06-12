import { useNavigationGuard } from "@/features/todoEdit/hooks/useNavigationGuard";
import React from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockRouter = { push: mockPush };

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    useRouter: vi.fn(() => mockRouter),
  };
});

describe("features/todoEdit/hooks/useNavigationGuard (画面遷移ガードフック)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupHook = async (isDirty: boolean, onConfirm?: () => void) => {
    let hookResult: ReturnType<typeof useNavigationGuard> | null = null;
    const TestComponent = () => {
      const result = useNavigationGuard(isDirty, onConfirm);
      React.useEffect(() => {
        hookResult = result;
      });
      return null;
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    // マウントとuseEffectの処理を待つ
    await new Promise((resolve) => setTimeout(resolve, 20));

    const getHook = () => hookResult!;

    return {
      getHook,
      root,
      container,
    };
  };

  describe("初期状態", () => {
    it("初期状態ではダイアログが非表示であること", async () => {
      const { getHook, root, container } = await setupHook(false);
      expect(getHook().showDiscardDialog).toBe(false);

      await root.unmount();
      container.remove();
    });
  });

  describe("beforeunload イベントの制御", () => {
    it("isDirtyがtrueの場合、beforeunloadイベントが抑止され、returnValueが設定されること", async () => {
      const { root, container } = await setupHook(true);

      const event = new Event("beforeunload", { cancelable: true });
      let returnValue: string | undefined = undefined;
      Object.defineProperty(event, "returnValue", {
        set(val: string) {
          returnValue = val;
        },
        get() {
          return returnValue;
        },
        configurable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(returnValue).toBe("");

      await root.unmount();
      container.remove();
    });

    it("isDirtyがfalseの場合、beforeunloadイベントは抑止されないこと", async () => {
      const { root, container } = await setupHook(false);

      const event = new Event("beforeunload", { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();

      await root.unmount();
      container.remove();
    });
  });

  describe("リンククリック（Anchor Click）時の制御", () => {
    const testAnchorClick = async ({
      isDirty,
      href,
      shouldIntercept,
    }: {
      isDirty: boolean;
      href: string | null;
      shouldIntercept: boolean;
    }) => {
      const { getHook, root, container } = await setupHook(isDirty);

      const anchor = document.createElement("a");
      if (href !== null) {
        anchor.setAttribute("href", href);
      }
      container.appendChild(anchor);

      let hookPreventedDefault = false;
      let bubbleListenerCalled = false;
      const preventNavigationListener = (e: MouseEvent) => {
        bubbleListenerCalled = true;
        hookPreventedDefault = e.defaultPrevented;
        e.preventDefault(); // テストランナーのiframeが遷移するのを防ぐ
      };
      document.addEventListener("click", preventNavigationListener);

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });

      anchor.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 20));

      document.removeEventListener("click", preventNavigationListener);

      if (shouldIntercept) {
        // 抑止された場合、hook側でstopPropagationが呼ばれるためバブルアップリスナーが呼ばれないか、
        // もしくは呼ばれたとしても defaultPrevented が true になっている
        expect(bubbleListenerCalled ? hookPreventedDefault : true).toBe(true);
        expect(getHook().showDiscardDialog).toBe(true);
      } else {
        expect(bubbleListenerCalled).toBe(true);
        expect(hookPreventedDefault).toBe(false);
        expect(getHook().showDiscardDialog).toBe(false);
      }

      await root.unmount();
      container.remove();
    };

    it("isDirtyがtrueで、相対パス（/dashboard）のリンクがクリックされたとき、遷移が抑止されてダイアログが表示されること", async () => {
      await testAnchorClick({
        isDirty: true,
        href: "/dashboard",
        shouldIntercept: true,
      });
    });

    it("isDirtyがtrueで、スキーマを含まないリンク（dashboard）がクリックされたとき、遷移が抑止されてダイアログが表示されること", async () => {
      await testAnchorClick({
        isDirty: true,
        href: "dashboard",
        shouldIntercept: true,
      });
    });

    it("isDirtyがtrueでも、外部リンク（https://...）がクリックされたときは遷移が抑止されないこと", async () => {
      await testAnchorClick({
        isDirty: true,
        href: "https://example.com",
        shouldIntercept: false,
      });
    });

    it("isDirtyがtrueでも、メールリンク（mailto:...）がクリックされたときは遷移が抑止されないこと", async () => {
      await testAnchorClick({
        isDirty: true,
        href: "mailto:test@example.com",
        shouldIntercept: false,
      });
    });

    it("isDirtyがtrueでも、電話リンク（tel:...）がクリックされたときは遷移が抑止されないこと", async () => {
      await testAnchorClick({
        isDirty: true,
        href: "tel:09012345678",
        shouldIntercept: false,
      });
    });

    it("isDirtyがtrueでも、href属性を持たないリンクがクリックされたときは遷移が抑止されないこと", async () => {
      await testAnchorClick({
        isDirty: true,
        href: null,
        shouldIntercept: false,
      });
    });

    it("isDirtyがfalseの場合、相対パスのリンクがクリックされても遷移は抑止されないこと", async () => {
      await testAnchorClick({
        isDirty: false,
        href: "/dashboard",
        shouldIntercept: false,
      });
    });
  });

  describe("ダイアログのアクション制御", () => {
    it("破棄確認ダイアログで「破棄」を選択したとき、onConfirmが実行され、保留中のURLへ遷移すること", async () => {
      const onConfirm = vi.fn();
      const { getHook, root, container } = await setupHook(true, onConfirm);

      const anchor = document.createElement("a");
      anchor.setAttribute("href", "/target-page");
      container.appendChild(anchor);

      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      anchor.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(getHook().showDiscardDialog).toBe(true);

      getHook().handleConfirmDiscard();
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(getHook().showDiscardDialog).toBe(false);
      expect(onConfirm).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/target-page");

      await root.unmount();
      container.remove();
    });

    it("onConfirmが指定されていない場合でも、「破棄」を選択したときに保留中のURLへ正常に遷移すること", async () => {
      const { getHook, root, container } = await setupHook(true);

      const anchor = document.createElement("a");
      anchor.setAttribute("href", "/another-page");
      container.appendChild(anchor);

      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      anchor.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(getHook().showDiscardDialog).toBe(true);

      getHook().handleConfirmDiscard();
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(getHook().showDiscardDialog).toBe(false);
      expect(mockPush).toHaveBeenCalledWith("/another-page");

      await root.unmount();
      container.remove();
    });

    it("破棄確認ダイアログで「キャンセル」を選択したとき、ダイアログを閉じ、遷移がキャンセルされること", async () => {
      const onConfirm = vi.fn();
      const { getHook, root, container } = await setupHook(true, onConfirm);

      const anchor = document.createElement("a");
      anchor.setAttribute("href", "/target-page");
      container.appendChild(anchor);

      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      anchor.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(getHook().showDiscardDialog).toBe(true);

      getHook().handleCancelDiscard();
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(getHook().showDiscardDialog).toBe(false);
      expect(onConfirm).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();

      await root.unmount();
      container.remove();
    });
  });

  describe("クリーンアップ", () => {
    it("アンマウント時にイベントリスナーがクリーンアップされること", async () => {
      const { root, container } = await setupHook(true);

      await root.unmount();
      await new Promise((resolve) => setTimeout(resolve, 20));

      // beforeunloadイベントが抑止されないこと
      const unloadEvent = new Event("beforeunload", { cancelable: true });
      const unloadPreventDefaultSpy = vi.spyOn(unloadEvent, "preventDefault");
      window.dispatchEvent(unloadEvent);
      expect(unloadPreventDefaultSpy).not.toHaveBeenCalled();

      // リンククリックイベントが抑止されないこと
      const anchor = document.createElement("a");
      anchor.setAttribute("href", "/target-page");
      container.appendChild(anchor);

      let hookPreventedDefault = false;
      const preventNavigationListener = (e: MouseEvent) => {
        hookPreventedDefault = e.defaultPrevented;
        e.preventDefault(); // テストランナーのiframeが遷移するのを防ぐ
      };
      document.addEventListener("click", preventNavigationListener);

      const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
      anchor.dispatchEvent(clickEvent);
      await new Promise((resolve) => setTimeout(resolve, 20));

      document.removeEventListener("click", preventNavigationListener);

      expect(hookPreventedDefault).toBe(false);

      container.remove();
    });
  });
});
