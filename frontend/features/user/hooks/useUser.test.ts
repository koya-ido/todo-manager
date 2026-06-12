import { ErrorContext } from "@/components/features/ErrorProvider";
import { useUser } from "@/features/user/hooks/useUser";
import { apiGet } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
}));

describe("features/user/hooks/useUser (ユーザー情報取得フック)", () => {
  const mockSetErrorResponse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      ErrorContext.Provider,
      {
        value: {
          getInlineError: vi.fn(),
          setErrorResponse: mockSetErrorResponse,
          clearInlineErrors: vi.fn(),
        },
      },
      children,
    );

  it("APIからユーザー情報を正常に取得できた場合、userIdとuserNameが正しくセットされること", async () => {
    const mockMeResponse = {
      display_user_id: "user_123",
      user_name: "テストユーザー",
    };
    vi.mocked(apiGet).mockResolvedValue(mockMeResponse);

    let hookResult: ReturnType<typeof useUser> | null = null;
    const TestComponent = () => {
      hookResult = useUser();
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      React.createElement(wrapper, {
        children: React.createElement(TestComponent),
      }),
    );

    // 非動作API処理の完了を待つ
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(apiGet).toHaveBeenCalledWith("/me");
    expect(hookResult!.userId).toBe("user_123");
    expect(hookResult!.userName).toBe("テストユーザー");

    root.unmount();
    container.remove();
  });

  it("API呼び出しでエラーが発生した場合、setErrorResponseが呼び出されること", async () => {
    const mockError = new Error("ユーザー情報の取得に失敗しました。");
    vi.mocked(apiGet).mockRejectedValue(mockError);

    let hookResult: ReturnType<typeof useUser> | null = null;
    const TestComponent = () => {
      hookResult = useUser();
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      React.createElement(wrapper, {
        children: React.createElement(TestComponent),
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(apiGet).toHaveBeenCalledWith("/me");
    expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
    expect(hookResult!.userId).toBe("");
    expect(hookResult!.userName).toBe("");

    root.unmount();
    container.remove();
  });
});
