import { useSignUp } from "@/features/signUp/hooks/useSignUp";
import { apiPost } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiPost: vi.fn(),
}));

describe("features/signUp/hooks/useSignUp (ユーザー登録処理フック)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleSignUp が指定したユーザーIDとパスワードでAPIリクエストを正常に送信し、結果を返すこと", async () => {
    const mockResponse = { id: 1, display_id: "user_123", username: "user-999" };
    vi.mocked(apiPost).mockResolvedValue(mockResponse);

    let hookResult: ReturnType<typeof useSignUp> | null = null;
    const TestComponent = () => {
      hookResult = useSignUp();
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    await new Promise((resolve) => setTimeout(resolve, 10));

    const result = await hookResult!.handleSignUp("user-999", "password-xyz");

    expect(apiPost).toHaveBeenCalledWith(
      "/signup",
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
    const mockError = new Error("登録エラー");
    vi.mocked(apiPost).mockRejectedValue(mockError);

    let hookResult: ReturnType<typeof useSignUp> | null = null;
    const TestComponent = () => {
      hookResult = useSignUp();
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    await new Promise((resolve) => setTimeout(resolve, 10));

    await expect(
      hookResult!.handleSignUp("user-999", "password-xyz"),
    ).rejects.toThrow("登録エラー");

    root.unmount();
    container.remove();
  });
});
