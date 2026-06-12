import { LocaleContext } from "@/components/features/LocaleProvider/LocaleProvider";
import { useLocaleSetting } from "@/features/userSetting/hooks/useLocaleSetting";
import { setLocale } from "@/lib/server-actions";
import React from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock setLocale server action
vi.mock("@/lib/server-actions", () => ({
  setLocale: vi.fn(),
}));

// Mock useRouter from next/navigation
const mockRefresh = vi.fn();
const mockRouter = { refresh: mockRefresh };
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    useRouter: vi.fn(() => mockRouter),
  };
});

describe("features/userSetting/hooks/useLocaleSetting (ロケール設定管理フック)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupHook = (localeValue: string) => {
    let hookResult: ReturnType<typeof useLocaleSetting> | null = null;

    const TestComponent = () => {
      hookResult = useLocaleSetting();
      return null;
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        LocaleContext.Provider,
        {
          value: {
            locale: localeValue,
            setLocale: vi.fn(),
          },
        },
        children
      );

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      React.createElement(wrapper, null, React.createElement(TestComponent))
    );

    const getHook = () => {
      if (!hookResult) {
        throw new Error("Hook has not finished mounting or rendering.");
      }
      return hookResult;
    };

    return {
      getHook,
      root,
      container,
    };
  };

  it("初期状態: Contextから取得したロケールが正しく返されること", async () => {
    const { getHook, root, container } = setupHook("en");

    // レンダリング・更新反映のための微小待機
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(getHook().locale).toBe("en");

    root.unmount();
    container.remove();
  });

  it("handleLocaleChange: 新しいロケールが空文字の場合は処理を行わないこと", async () => {
    const { getHook, root, container } = setupHook("ja");
    await new Promise((resolve) => setTimeout(resolve, 10));

    await getHook().handleLocaleChange("");

    expect(setLocale).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();

    root.unmount();
    container.remove();
  });

  it("handleLocaleChange: 新しいロケールが現在と同じ場合は処理を行わないこと", async () => {
    const { getHook, root, container } = setupHook("ja");
    await new Promise((resolve) => setTimeout(resolve, 10));

    await getHook().handleLocaleChange("ja");

    expect(setLocale).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();

    root.unmount();
    container.remove();
  });

  it("handleLocaleChange: 異なるロケールが指定された場合、setLocaleを呼び出し、router.refreshを実行すること", async () => {
    const { getHook, root, container } = setupHook("ja");
    await new Promise((resolve) => setTimeout(resolve, 10));

    vi.mocked(setLocale).mockResolvedValue(undefined);

    await getHook().handleLocaleChange("en");

    expect(setLocale).toHaveBeenCalledWith("en");
    expect(mockRefresh).toHaveBeenCalled();

    root.unmount();
    container.remove();
  });
});
