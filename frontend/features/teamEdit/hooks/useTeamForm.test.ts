import { ErrorContext } from "@/components/features/ErrorProvider";
import { useTeamForm } from "@/features/teamEdit/hooks/useTeamForm";
import { useNavigationGuard } from "@/features/todoEdit/hooks/useNavigationGuard";
import { apiGet, apiPost, apiPut } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

const mockPush = vi.fn();
const mockRouter = { push: mockPush };
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

const mockSetShowDiscardDialog = vi.fn();
const mockHandleConfirmDiscard = vi.fn();
const mockHandleCancelDiscard = vi.fn();

vi.mock("@/features/todoEdit/hooks/useNavigationGuard", () => ({
  useNavigationGuard: vi.fn((isDirty: boolean, onConfirm?: () => void) => {
    return {
      showDiscardDialog: false,
      setShowDiscardDialog: mockSetShowDiscardDialog,
      handleConfirmDiscard: vi.fn(() => {
        if (onConfirm) onConfirm();
        mockHandleConfirmDiscard();
      }),
      handleCancelDiscard: mockHandleCancelDiscard,
    };
  }),
}));

describe("features/teamEdit/hooks/useTeamForm (チーム編集・作成フォームフック)", () => {
  const mockSetErrorResponse = vi.fn();
  const mockClearInlineErrors = vi.fn();

  const dummyMessages: Record<string, string> = {
    "validate.required": "必須項目です。",
    "validate.maxLength": "最大{max}文字です。",
    "common.password.checklist-1": "パスワードは8文字以上必要です。",
    "common.confirm-password.checklist-1": "パスワードが一致しません。",
    "team-edit.toast.create-success": "チームを作成しました。",
    "team-edit.toast.update-success": "チームを更新しました。",
    FAILED_TO_CREATE: "{name}の作成に失敗しました。",
    FAILED_TO_UPDATE: "{name}の更新に失敗しました。",
    "team.label": "チーム",
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

  const setupHook = async (props: { isNew: boolean; teamId?: number }) => {
    let hookResult: ReturnType<typeof useTeamForm> | null = null;
    const TestComponent = () => {
      hookResult = useTeamForm({ ...props, messages: dummyMessages });
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      React.createElement(wrapper, null, React.createElement(TestComponent)),
    );

    // wait for async / useEffect calls
    await new Promise((resolve) => setTimeout(resolve, 25));

    return {
      getHook: () => hookResult!,
      root,
      container,
    };
  };

  describe("初期状態 (isNew: true)", () => {
    it("新規作成時、フォーム項目が空で、isLoadingがfalseであること", async () => {
      const { getHook, root, container } = await setupHook({ isNew: true });
      const hook = getHook();

      expect(hook.name).toBe("");
      expect(hook.password).toBe("");
      expect(hook.confirmPassword).toBe("");
      expect(hook.isLoading).toBe(false);
      expect(hook.isSubmitting).toBe(false);
      expect(hook.isSubmitDisabled).toBe(true); // nameとpasswordが空なのでdisabled

      root.unmount();
      container.remove();
    });
  });

  describe("初期状態とロード処理 (isNew: false)", () => {
    it("既存チーム編集時、APIからデータを取得してフォームに設定すること", async () => {
      const mockTeam = { id: 42, name: "既存のチーム名" };
      vi.mocked(apiGet).mockResolvedValue(mockTeam);

      const { getHook, root, container } = await setupHook({
        isNew: false,
        teamId: 42,
      });

      expect(apiGet).toHaveBeenCalledWith("/team/42");
      const hook = getHook();
      expect(hook.name).toBe("既存のチーム名");
      expect(hook.isLoading).toBe(false);
      expect(hook.isSubmitDisabled).toBe(false); // 初期状態では名前が入力されておりエラーも無いため送信可能

      root.unmount();
      container.remove();
    });

    it("既存チームデータのフェッチがエラーレスポンスで失敗した場合、適切なエラーページにリダイレクトされること", async () => {
      const mockError = {
        status: 403,
        code: "FORBIDDEN",
        detail: "閲覧権限がありません",
      };
      vi.mocked(apiGet).mockRejectedValue(mockError);

      const { root, container } = await setupHook({
        isNew: false,
        teamId: 42,
      });

      expect(mockPush).toHaveBeenCalledWith("/error?status=403&code=FORBIDDEN");

      root.unmount();
      container.remove();
    });

    it("既存チームデータのフェッチが未知のエラーで失敗した場合、500エラーページにリダイレクトされること", async () => {
      vi.mocked(apiGet).mockRejectedValue(new Error("Network fail"));

      const { root, container } = await setupHook({
        isNew: false,
        teamId: 42,
      });

      expect(mockPush).toHaveBeenCalledWith("/error?status=500&code=UNKNOWN");

      root.unmount();
      container.remove();
    });
  });

  describe("入力バリデーション", () => {
    describe("チーム名 (name)", () => {
      it("空白文字のみの場合にエラーになり、入力するとエラーが解消されること", async () => {
        const { getHook, root, container } = await setupHook({ isNew: true });
        
        // 空白を入力
        getHook().handleNameChange("   ");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.name).toBe("必須項目です。");
        expect(getHook().isSubmitDisabled).toBe(true);

        // 正しい値を入力
        getHook().handleNameChange("新しいチーム");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.name).toBeUndefined();

        root.unmount();
        container.remove();
      });

      it("255文字を超える場合にエラーになること", async () => {
        const { getHook, root, container } = await setupHook({ isNew: true });
        const longName = "a".repeat(256);

        getHook().handleNameChange(longName);
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.name).toBe("最大255文字です。");

        root.unmount();
        container.remove();
      });
    });

    describe("パスワード (password)", () => {
      it("新規作成時、パスワードが空の場合にエラーになること", async () => {
        const { getHook, root, container } = await setupHook({ isNew: true });

        getHook().handlePasswordChange("");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.password).toBe("必須項目です。");

        root.unmount();
        container.remove();
      });

      it("パスワードが8文字未満の場合にエラーになること", async () => {
        const { getHook, root, container } = await setupHook({ isNew: true });

        getHook().handlePasswordChange("127");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.password).toBe("パスワードは8文字以上必要です。");

        root.unmount();
        container.remove();
      });

      it("既存チーム編集時、パスワードが空（更新しない）は許容され、入力時のみ8文字未満チェックが走ること", async () => {
        // ロード済みの状態から開始
        vi.mocked(apiGet).mockResolvedValue({ id: 42, name: "既存チーム" });
        const { getHook, root, container } = await setupHook({ isNew: false, teamId: 42 });

        // 空の場合はエラーなし
        getHook().handlePasswordChange("");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.password).toBeUndefined();

        // 8文字未満を入力した場合はエラー
        getHook().handlePasswordChange("123");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.password).toBe("パスワードは8文字以上必要です。");

        // 8文字以上入力した場合はエラーが解消
        getHook().handlePasswordChange("12345678");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.password).toBeUndefined();

        root.unmount();
        container.remove();
      });
    });

    describe("確認用パスワード (confirmPassword)", () => {
      it("パスワードと一致しない場合エラーになり、一致するとエラーがクリアされること", async () => {
        const { getHook, root, container } = await setupHook({ isNew: true });

        getHook().handlePasswordChange("password123");
        await new Promise((resolve) => setTimeout(resolve, 20));

        getHook().handleConfirmPasswordChange("different_pass");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.confirmPassword).toBe("パスワードが一致しません。");

        getHook().handleConfirmPasswordChange("password123");
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(getHook().fieldErrors.confirmPassword).toBeUndefined();

        root.unmount();
        container.remove();
      });
    });
  });

  describe("フォーム送信処理", () => {
    it("新規チーム作成時、バリデーションエラーがある場合は送信されずトーストで警告されること", async () => {
      const { getHook, root, container } = await setupHook({ isNew: true });

      // 空欄のまま送信を試みる
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await getHook().handleSubmit(mockEvent);

      expect(apiPost).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("入力内容を確認してください");

      root.unmount();
      container.remove();
    });

    it("新規チーム作成成功時、apiPostが呼ばれ、成功トーストが表示され、遷移すること", async () => {
      vi.mocked(apiPost).mockResolvedValue({ id: 99, name: "新しいチーム" });
      const { getHook, root, container } = await setupHook({ isNew: true });

      getHook().handleNameChange(" 新しいチーム  ");
      await new Promise((resolve) => setTimeout(resolve, 20));
      getHook().handlePasswordChange("password123");
      await new Promise((resolve) => setTimeout(resolve, 20));
      getHook().handleConfirmPasswordChange("password123");
      await new Promise((resolve) => setTimeout(resolve, 20));

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await getHook().handleSubmit(mockEvent);

      expect(apiPost).toHaveBeenCalledWith(
        "/team",
        JSON.stringify({ name: "新しいチーム", password: "password123" })
      );
      expect(toast.success).toHaveBeenCalledWith("チームを作成しました。");
      expect(mockPush).toHaveBeenCalledWith("/team/99");

      root.unmount();
      container.remove();
    });

    it("新規チーム作成失敗時、setErrorResponseが呼ばれ、エラートーストが表示されること", async () => {
      const mockError = new Error("Creation failed");
      vi.mocked(apiPost).mockRejectedValue(mockError);
      const { getHook, root, container } = await setupHook({ isNew: true });

      getHook().handleNameChange("新しいチーム");
      await new Promise((resolve) => setTimeout(resolve, 20));
      getHook().handlePasswordChange("password123");
      await new Promise((resolve) => setTimeout(resolve, 20));
      getHook().handleConfirmPasswordChange("password123");
      await new Promise((resolve) => setTimeout(resolve, 20));

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await getHook().handleSubmit(mockEvent);

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(toast.error).toHaveBeenCalledWith("チームの作成に失敗しました。");

      root.unmount();
      container.remove();
    });

    it("既存チーム更新成功時、apiPutが呼ばれ、成功トーストが表示され、遷移すること", async () => {
      vi.mocked(apiGet).mockResolvedValue({ id: 42, name: "既存チーム" });
      vi.mocked(apiPut).mockResolvedValue({ id: 42, name: "更新チーム" });

      const { getHook, root, container } = await setupHook({ isNew: false, teamId: 42 });

      getHook().handleNameChange("更新チーム");
      await new Promise((resolve) => setTimeout(resolve, 20));
      getHook().handlePasswordChange("newpassword123");
      await new Promise((resolve) => setTimeout(resolve, 20));
      getHook().handleConfirmPasswordChange("newpassword123");
      await new Promise((resolve) => setTimeout(resolve, 20));

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await getHook().handleSubmit(mockEvent);

      expect(apiPut).toHaveBeenCalledWith(
        "/team/42",
        JSON.stringify({ name: "更新チーム", password: "newpassword123" })
      );
      expect(toast.success).toHaveBeenCalledWith("チームを更新しました。");
      expect(mockPush).toHaveBeenCalledWith("/team/42");

      root.unmount();
      container.remove();
    });

    it("既存チーム更新成功時（パスワード未入力）、apiPutにpassword: nullで送信されること", async () => {
      vi.mocked(apiGet).mockResolvedValue({ id: 42, name: "既存チーム" });
      vi.mocked(apiPut).mockResolvedValue({ id: 42, name: "更新チーム" });

      const { getHook, root, container } = await setupHook({ isNew: false, teamId: 42 });

      getHook().handleNameChange("更新チーム");
      await new Promise((resolve) => setTimeout(resolve, 20));
      getHook().handlePasswordChange("");
      await new Promise((resolve) => setTimeout(resolve, 20));

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await getHook().handleSubmit(mockEvent);

      expect(apiPut).toHaveBeenCalledWith(
        "/team/42",
        JSON.stringify({ name: "更新チーム", password: null })
      );

      root.unmount();
      container.remove();
    });
  });

  describe("Navigation Guard と Dirty状態", () => {
    it("値が変更されると isDirty として判定され navigation guard に伝達されること", async () => {
      const { getHook, root, container } = await setupHook({ isNew: true });

      // 初期状態は isDirty = false なので (isDirty && !isSubmitting) は false
      let lastCall = vi.mocked(useNavigationGuard).mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(false);

      // 値を変更する
      getHook().handleNameChange("変更あり");
      await new Promise((resolve) => setTimeout(resolve, 20));

      // isDirty = true になり、!isSubmitting も true なので (isDirty && !isSubmitting) は true
      lastCall = vi.mocked(useNavigationGuard).mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(true);

      root.unmount();
      container.remove();
    });

    it("変更破棄確認ダイアログで破棄を決定した際、initialState が null に戻ること", async () => {
      const { getHook, root, container } = await setupHook({ isNew: true });

      getHook().handleNameChange("編集");
      await new Promise((resolve) => setTimeout(resolve, 20));

      // 破棄決定ハンドラを呼び出し
      getHook().handleConfirmDiscard();
      await new Promise((resolve) => setTimeout(resolve, 20));

      // 破棄後は initialState が null になり、isDirty は false になるはず
      const lastCall = vi.mocked(useNavigationGuard).mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(false);

      root.unmount();
      container.remove();
    });
  });
});
