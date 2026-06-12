import { useLogin } from "@/features/login/hooks/useLogin";
import { apiPost } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiPost: vi.fn(),
}));

describe("features/login/hooks/useLogin (ログイン処理フック)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleLogin が指定したユーザーIDとパスワードでAPIリクエストを正常に送信し、結果を返すこと", async () => {
    const mockResponse = { access_token: "token_123", token_type: "bearer" };
    vi.mocked(apiPost).mockResolvedValue(mockResponse);

    let hookResult: ReturnType<typeof useLogin> | null = null;
    const TestComponent = () => {
      hookResult = useLogin();
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    await new Promise((resolve) => setTimeout(resolve, 10));

    const result = await hookResult!.handleLogin("user-999", "password-xyz");

    expect(apiPost).toHaveBeenCalledWith(
      "/login",
      JSON.stringify({ username: "user-999", password: "password-xyz" }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(result).toEqual(mockResponse);

    root.unmount();
    container.remove();
  });

  it("APIリクエストが失敗した場合、エラーがそのままスローされること", async () => {
    const mockError = new Error("認証エラー");
    vi.mocked(apiPost).mockRejectedValue(mockError);

    let hookResult: ReturnType<typeof useLogin> | null = null;
    const TestComponent = () => {
      hookResult = useLogin();
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    await new Promise((resolve) => setTimeout(resolve, 10));

    await expect(
      hookResult!.handleLogin("user-999", "password-xyz"),
    ).rejects.toThrow("認証エラー");

    root.unmount();
    container.remove();
  });
});
