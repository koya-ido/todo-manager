import { ErrorContext } from "@/components/features/ErrorProvider";
import { useUserEdit } from "@/features/userEdit/hooks/useUserEdit";
import { apiGet, apiPut } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockRouter = { push: mockPush, refresh: mockRefresh };
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    useRouter: vi.fn(() => mockRouter),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("features/userEdit/hooks/useUserEdit (ユーザー編集状態管理フック)", () => {
  const mockSetErrorResponse = vi.fn();
  const mockClearInlineErrors = vi.fn();

  const dummyMessages: Record<string, string> = {
    FAILED_TO_FETCH: "{name}の取得に失敗しました。",
    FAILED_TO_UPDATE: "{name}の更新に失敗しました。",
    "user.username": "ユーザー名",
    "user-edit.toast.update-success": "ユーザー情報を更新しました。",
  };

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
          clearInlineErrors: mockClearInlineErrors,
        },
      },
      children,
    );

  const setupHook = async (initialUserResponse: unknown = { user_name: "initial_user" }) => {
    if (initialUserResponse instanceof Error) {
      vi.mocked(apiGet).mockRejectedValue(initialUserResponse);
    } else {
      vi.mocked(apiGet).mockResolvedValue(initialUserResponse);
    }

    let hookResult: ReturnType<typeof useUserEdit> | null = null;
    const TestComponent = () => {
      const result = useUserEdit({ messages: dummyMessages });
      React.useEffect(() => {
        hookResult = result;
      });
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      React.createElement(wrapper, null, React.createElement(TestComponent)),
    );

    // Wait for the fetch effect and standard mounting to finish
    await new Promise((resolve) => setTimeout(resolve, 50));

    const getHook = () => hookResult!;

    return {
      getHook,
      root,
      container,
    };
  };

  describe("初期表示とロード処理", () => {
    it("正常系: マウント時に現在のユーザー情報を取得してフォームの初期値に設定すること", async () => {
      const mockUser = { user_name: "test_username" };
      const { getHook, root, container } = await setupHook(mockUser);

      expect(apiGet).toHaveBeenCalledWith("/me");
      expect(mockClearInlineErrors).toHaveBeenCalled();

      expect(getHook().userName).toBe("test_username");
      expect(getHook().isAvailable).toBe(true);
      expect(getHook().isLoading).toBe(false);

      root.unmount();
      container.remove();
    });

    it("異常系: ユーザー情報の取得に失敗した場合、エラーコンテキストにセットしてトーストを表示すること", async () => {
      const mockError = new Error("Network error");
      const { getHook, root, container } = await setupHook(mockError);

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(toast.error).toHaveBeenCalledWith("ユーザー名の取得に失敗しました。");

      expect(getHook().isLoading).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("アンマウント時のクリーンアップ", () => {
    it("アンマウント時にも inline error をクリアすること", async () => {
      const { root, container } = await setupHook();
      expect(mockClearInlineErrors).toHaveBeenCalledTimes(1);

      root.unmount();
      container.remove();

      expect(mockClearInlineErrors).toHaveBeenCalledTimes(2);
    });
  });

  describe("ユーザー名の重複チェック（遅延実行・バリデーション）", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("空文字が設定された場合、重複チェックは行われず、利用不可状態になること", async () => {
      const { getHook, root, container } = await setupHook({ user_name: "initial_user" });

      getHook().setUserName("");
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(getHook().isAvailable).toBe(false);
      expect(getHook().isCheckingUsername).toBe(false);
      expect(apiGet).not.toHaveBeenCalledWith(expect.stringContaining("check-username"));

      root.unmount();
      container.remove();
    });

    it("元のユーザー名と同じ場合は、重複チェックは行われず、利用可能状態のままであること", async () => {
      const { getHook, root, container } = await setupHook({ user_name: "initial_user" });

      // 一度変更したあとに元の名前に戻す
      getHook().setUserName("changed_name");
      await new Promise((resolve) => setTimeout(resolve, 20));
      getHook().setUserName("initial_user");
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(getHook().isAvailable).toBe(true);
      expect(getHook().isCheckingUsername).toBe(false);
      // check-username APIは initial_user に対しては呼ばれていないことを確認
      expect(apiGet).not.toHaveBeenCalledWith(
        expect.stringContaining("check-username?username=initial_user")
      );

      root.unmount();
      container.remove();
    });

    it("文字数バリデーション（5文字未満または30文字超過）に違反している場合、重複チェックは行われず、利用不可状態になること", async () => {
      const { getHook, root, container } = await setupHook({ user_name: "initial_user" });

      // 4文字
      getHook().setUserName("abcd");
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(getHook().isAvailable).toBe(false);

      // 31文字
      getHook().setUserName("a".repeat(31));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(getHook().isAvailable).toBe(false);

      expect(apiGet).not.toHaveBeenCalledWith(expect.stringContaining("check-username"));

      root.unmount();
      container.remove();
    });

    it("文字種バリデーション（半角英数字・アンダースコア以外）に違反している場合、重複チェックは行われず、利用不可状態になること", async () => {
      const { getHook, root, container } = await setupHook({ user_name: "initial_user" });

      getHook().setUserName("invalid-name"); // ハイフンは不可
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(getHook().isAvailable).toBe(false);

      expect(apiGet).not.toHaveBeenCalledWith(expect.stringContaining("check-username"));

      root.unmount();
      container.remove();
    });

    it("正常なユーザー名に変更された際、500msの遅延後に重複チェックAPIが実行され、結果が反映されること", async () => {
      const { getHook, root, container } = await setupHook({ user_name: "initial_user" });

      vi.useFakeTimers();
      getHook().setUserName("new_user");
      
      // レンダリング更新をトリガー
      await vi.advanceTimersByTimeAsync(50);
      expect(getHook().isCheckingUsername).toBe(true);

      // API結果をモック
      vi.mocked(apiGet).mockResolvedValue({ available: true });

      // 500ms 進めてタイマーを実行
      await vi.advanceTimersByTimeAsync(450);

      expect(apiGet).toHaveBeenCalledWith("/user/check-username?username=new_user");
      expect(getHook().isAvailable).toBe(true);
      expect(getHook().isCheckingUsername).toBe(false);

      vi.useRealTimers();
      root.unmount();
      container.remove();
    });

    it("重複チェックAPIがエラーになった場合、利用不可状態になり、チェック状態が終了すること", async () => {
      const { getHook, root, container } = await setupHook({ user_name: "initial_user" });

      vi.useFakeTimers();
      getHook().setUserName("new_user");
      await vi.advanceTimersByTimeAsync(50);

      vi.mocked(apiGet).mockRejectedValue(new Error("check failed"));

      await vi.advanceTimersByTimeAsync(450);

      expect(getHook().isAvailable).toBe(false);
      expect(getHook().isCheckingUsername).toBe(false);

      vi.useRealTimers();
      root.unmount();
      container.remove();
    });

    it("500msが経過する前に再度ユーザー名が変更された場合、前の重複チェック処理がキャンセルされること", async () => {
      const { getHook, root, container } = await setupHook({ user_name: "initial_user" });

      vi.useFakeTimers();

      // 1回目の変更
      getHook().setUserName("first_user");
      await vi.advanceTimersByTimeAsync(200);

      // 500ms経つ前に2回目の変更
      getHook().setUserName("second_user");
      await vi.advanceTimersByTimeAsync(200); // ここで1回目から計400ms

      vi.mocked(apiGet).mockResolvedValue({ available: true });

      // さらに進めて、2回目のタイマーが完了する時間まで進める
      await vi.advanceTimersByTimeAsync(300); // 2回目の変更から計500ms

      // 1回目の重複チェックは呼ばれず、2回目の重複チェックのみが呼ばれること
      expect(apiGet).not.toHaveBeenCalledWith(
        expect.stringContaining("check-username?username=first_user")
      );
      expect(apiGet).toHaveBeenCalledWith("/user/check-username?username=second_user");

      vi.useRealTimers();
      root.unmount();
      container.remove();
    });
  });



  describe("送信の無効化条件 (isSubmitDisabled)", () => {
    it("isLoading、isSubmitting、isCheckingUsername、またはバリデーションエラーがある場合、isSubmitDisabled が true であること", async () => {
      const { getHook, root, container } = await setupHook();

      // 初期状態 (パスワード・確認パスワードが未入力のため disabled)
      expect(getHook().isSubmitDisabled).toBe(true);

      // 全て有効な値を入力 (元のユーザー名であれば重複チェックをバイパスし即座に利用可能となる)
      getHook().setUserName("initial_user");
      getHook().setPassword("ValidPass123!");
      getHook().setConfirmPassword("ValidPass123!");
      await new Promise((resolve) => setTimeout(resolve, 20));

      // この状態では isAvailable が true のため、submit可能になるはず
      expect(getHook().isSubmitDisabled).toBe(false);

      // パスワード不一致
      getHook().setConfirmPassword("mismatch_pass");
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isSubmitDisabled).toBe(true);

      root.unmount();
      container.remove();
    });
  });

  describe("handleSubmit (送信処理)", () => {
    it("isSubmitDisabled が true のときは送信を行わないこと", async () => {
      const { getHook, root, container } = await setupHook();

      // disabled状態のまま送信を実行
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await getHook().handleSubmit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(apiPut).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("正常系: 送信成功時、apiPutを呼び出し、成功トースト表示、遷移とリフレッシュを行うこと", async () => {
      const { getHook, root, container } = await setupHook();

      // 有効なフォーム値を設定 (元のユーザー名であれば重複チェックをバイパスし即座に利用可能となる)
      getHook().setUserName("initial_user");
      getHook().setPassword("NewStrongPass1!");
      getHook().setConfirmPassword("NewStrongPass1!");
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(getHook().isSubmitDisabled).toBe(false);

      let resolvePut = (val: { id: number; user_name: string }) => {
        void val;
      };
      vi.mocked(apiPut).mockReturnValue(
        new Promise((resolve) => {
          resolvePut = resolve;
        })
      );

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      const submitPromise = getHook().handleSubmit(mockEvent);

      // 送信中のローディング状態を確認
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isSubmitting).toBe(true);

      // API呼び出しを成功させる
      resolvePut({ id: 1, user_name: "initial_user" });
      await submitPromise;

      expect(apiPut).toHaveBeenCalledWith(
        "/user/me",
        JSON.stringify({
          username: "initial_user",
          password: "NewStrongPass1!",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("ユーザー情報を更新しました。");
      expect(mockPush).toHaveBeenCalledWith("/user");
      expect(mockRefresh).toHaveBeenCalled();

      // 送信完了後は false に戻ることを確認
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isSubmitting).toBe(false);

      root.unmount();
      container.remove();
    });

    it("異常系: 送信失敗時、setErrorResponseを呼び出し、エラートーストを表示すること", async () => {
      const { getHook, root, container } = await setupHook();

      // 有効なフォーム値を設定 (元のユーザー名であれば重複チェックをバイパスし即座に利用可能となる)
      getHook().setUserName("initial_user");
      getHook().setPassword("NewStrongPass1!");
      getHook().setConfirmPassword("NewStrongPass1!");
      await new Promise((resolve) => setTimeout(resolve, 20));

      const mockError = new Error("Failed to update user");
      vi.mocked(apiPut).mockRejectedValue(mockError);

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await getHook().handleSubmit(mockEvent);

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(toast.error).toHaveBeenCalledWith("ユーザー名の更新に失敗しました。");
      expect(getHook().isSubmitting).toBe(false);

      root.unmount();
      container.remove();
    });
  });
});
