import { ErrorContext } from "@/components/features/ErrorProvider";
import { useTeamDetail } from "@/features/team/hooks/useTeamDetail";
import {
  TeamApplicantResponse,
  TeamDetailResponse,
  TeamMemberResponse,
} from "@/features/team/types";
import { Tag } from "@/features/userSetting/types";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
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

describe("features/team/hooks/useTeamDetail (チーム詳細状態管理フック)", () => {
  const mockSetErrorResponse = vi.fn();
  const dummyMessages: Record<string, string> = {
    "team.detail.toast.copy-success": "IDをコピーしました。",
    "team.detail.toast.copy-password-success": "パスワードをコピーしました。",
    "team.detail.toast.accept-apps-updated": "申請受付設定を更新しました。",
    "team.detail.toast.approve-success": "申請を承認しました。",
    "team.detail.toast.reject-success": "申請を却下しました。",
    "team.detail.toast.kick-success": "メンバーをキックしました。",
    "team.detail.toast.delete-success": "チームを削除しました。",
    "team.detail.toast.tag-create-success": "タグを作成しました。",
    "team.detail.toast.tag-update-success": "タグを更新しました。",
    "team.detail.toast.tag-delete-success": "タグを削除しました。",
    FAILED_TO_UPDATE: "{name}の更新に失敗しました。",
  };

  const mockTeamOwner: TeamDetailResponse = {
    id: 1,
    display_teams_id: "team-1",
    name: "テストチーム（オーナー）",
    created_user_id: 10,
    created_user_name: "作成者",
    created_user_display_id: "creator",
    is_owner: true,
    accepting_applications: true,
    password: "team-password-123",
  };

  const mockTeamMember: TeamDetailResponse = {
    id: 1,
    display_teams_id: "team-1",
    name: "テストチーム（メンバー）",
    created_user_id: 10,
    created_user_name: "作成者",
    created_user_display_id: "creator",
    is_owner: false,
    accepting_applications: true,
  };

  const mockMembers: TeamMemberResponse[] = [
    {
      id: 10,
      display_user_id: "creator",
      user_name: "作成者",
      is_owner: true,
    },
    {
      id: 11,
      display_user_id: "member1",
      user_name: "メンバー1",
      is_owner: false,
    },
  ];

  const mockApplicants: TeamApplicantResponse[] = [
    {
      id: 20,
      display_user_id: "applicant1",
      user_name: "申請者1",
      applied_at: "2026-06-11T12:00:00Z",
    },
  ];

  const mockTags: Tag[] = [
    {
      id: 30,
      name: "タグA",
      user_id: null,
      team_id: 1,
      delete_flag: false,
      created_at: "2026-06-11T12:00:00Z",
      updated_at: "2026-06-11T12:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    if (navigator.clipboard) {
      vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    } else {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        configurable: true,
        writable: true,
      });
    }
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

  const setupHook = async (teamDetail: TeamDetailResponse = mockTeamOwner) => {
    vi.mocked(apiGet).mockImplementation(async (url) => {
      if (url === "/team/1") return teamDetail;
      if (url === "/team/1/members") return mockMembers;
      if (url === "/tags/team/1") return mockTags;
      if (url === "/team/1/applicants") return mockApplicants;
      throw new Error(`Unexpected URL: ${url}`);
    });

    let hookResult: ReturnType<typeof useTeamDetail> | null = null;
    const TestComponent = () => {
      const result = useTeamDetail(1, dummyMessages);
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

    // ロード完了を待つ (非同期フェッチ)
    await new Promise((resolve) => setTimeout(resolve, 50));

    const getHook = () => hookResult!;

    return {
      getHook,
      root,
      container,
    };
  };

  describe("fetchData (初期データのロード)", () => {
    it("オーナーの場合、チーム詳細、メンバー、タグ、申請一覧が正常に取得できること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);

      expect(apiGet).toHaveBeenCalledWith("/team/1");
      expect(apiGet).toHaveBeenCalledWith("/team/1/members");
      expect(apiGet).toHaveBeenCalledWith("/tags/team/1");
      expect(apiGet).toHaveBeenCalledWith("/team/1/applicants");

      expect(getHook().team).toEqual(mockTeamOwner);
      expect(getHook().members).toEqual(mockMembers);
      expect(getHook().tags).toEqual(mockTags);
      expect(getHook().applicants).toEqual(mockApplicants);
      expect(getHook().isLoading).toBe(false);

      root.unmount();
      container.remove();
    });

    it("オーナーではない場合、申請一覧のAPIは呼び出されないこと", async () => {
      const { getHook, root, container } = await setupHook(mockTeamMember);

      expect(apiGet).toHaveBeenCalledWith("/team/1");
      expect(apiGet).toHaveBeenCalledWith("/team/1/members");
      expect(apiGet).toHaveBeenCalledWith("/tags/team/1");
      expect(apiGet).not.toHaveBeenCalledWith("/team/1/applicants");

      expect(getHook().team).toEqual(mockTeamMember);
      expect(getHook().members).toEqual(mockMembers);
      expect(getHook().tags).toEqual(mockTags);
      expect(getHook().applicants).toEqual([]);
      expect(getHook().isLoading).toBe(false);

      root.unmount();
      container.remove();
    });

    it("エラーレスポンスが返された場合、ステータスに応じたエラーページに遷移すること", async () => {
      const mockError = {
        status: 403,
        code: "FORBIDDEN",
        detail: "権限がありません",
      };
      vi.mocked(apiGet).mockRejectedValue(mockError);

      const TestComponent = () => {
        useTeamDetail(1, dummyMessages);
        return null;
      };

      const container = document.createElement("div");
      const root = createRoot(container);
      root.render(
        React.createElement(wrapper, null, React.createElement(TestComponent)),
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockPush).toHaveBeenCalledWith("/error?status=403&code=FORBIDDEN");

      root.unmount();
      container.remove();
    });

    it("未知のエラーが発生した場合、500エラーページに遷移すること", async () => {
      vi.mocked(apiGet).mockRejectedValue(new Error("Unknown server error"));

      const TestComponent = () => {
        useTeamDetail(1, dummyMessages);
        return null;
      };

      const container = document.createElement("div");
      const root = createRoot(container);
      root.render(
        React.createElement(wrapper, null, React.createElement(TestComponent)),
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockPush).toHaveBeenCalledWith("/error?status=500&code=UNKNOWN");

      root.unmount();
      container.remove();
    });
  });

  describe("コピークリップボード機能", () => {
    it("handleCopyId がIDを正常にコピーし、一時的にisCopiedをtrueにすること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      const setTimeoutSpy = vi.spyOn(window, "setTimeout");

      await getHook().handleCopyId();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("team-1");
      expect(toast.success).toHaveBeenCalledWith("IDをコピーしました。");
      expect(getHook().isCopied).toBe(true);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

      setTimeoutSpy.mockRestore();
      root.unmount();
      container.remove();
    });

    it("handleCopyId が失敗した場合、エラーのトーストを表示すること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      (navigator.clipboard.writeText as any).mockRejectedValue(
        new Error("Clipboard Error"),
      );

      await getHook().handleCopyId();

      expect(toast.error).toHaveBeenCalledWith("IDの更新に失敗しました。");

      root.unmount();
      container.remove();
    });

    it("handleCopyPassword がパスワードを正常にコピーし、一時的にisCopiedPasswordをtrueにすること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      const setTimeoutSpy = vi.spyOn(window, "setTimeout");

      await getHook().handleCopyPassword();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "team-password-123",
      );
      expect(toast.success).toHaveBeenCalledWith(
        "パスワードをコピーしました。",
      );
      expect(getHook().isCopiedPassword).toBe(true);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

      setTimeoutSpy.mockRestore();
      root.unmount();
      container.remove();
    });

    it("handleCopyPassword が失敗した場合、エラーのトーストを表示すること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      (navigator.clipboard.writeText as any).mockRejectedValue(
        new Error("Clipboard Error"),
      );

      await getHook().handleCopyPassword();

      expect(toast.error).toHaveBeenCalledWith(
        "Passwordの更新に失敗しました。",
      );

      root.unmount();
      container.remove();
    });
  });

  describe("handleToggleAcceptApps (申請受付ステータス変更)", () => {
    it("チェック状態を変更したとき、APIを呼び出し、ステートを更新すること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);

      let resolvePatch: any;
      vi.mocked(apiPatch).mockReturnValue(
        new Promise((resolve) => {
          resolvePatch = resolve;
        }),
      );

      const togglePromise = getHook().handleToggleAcceptApps(false);

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isTogglingAccept).toBe(true);

      resolvePatch({});
      await togglePromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(apiPatch).toHaveBeenCalledWith(
        "/team/1/accepting-applications",
        JSON.stringify({ accepting_applications: false }),
      );
      expect(toast.success).toHaveBeenCalledWith(
        "申請受付設定を更新しました。",
      );
      expect(getHook().team?.accepting_applications).toBe(false);
      expect(getHook().isTogglingAccept).toBe(false);

      root.unmount();
      container.remove();
    });

    it("APIが失敗したとき、setErrorResponseが呼び出されること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      const mockError = new Error("Patch error");
      vi.mocked(apiPatch).mockRejectedValue(mockError);

      const togglePromise = getHook().handleToggleAcceptApps(false);
      await togglePromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(getHook().isTogglingAccept).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("handleApproveApplicant (申請者承認)", () => {
    it("申請者を承認したとき、APIを呼び出し、再ロードすること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      vi.mocked(apiPost).mockResolvedValue({});

      const approvePromise = getHook().handleApproveApplicant(20);
      await approvePromise;
      await new Promise((resolve) => setTimeout(resolve, 50)); // 再ロードのフェッチ完了を待つ

      expect(apiPost).toHaveBeenCalledWith("/team/1/applicants/20/approve");
      expect(toast.success).toHaveBeenCalledWith("申請を承認しました。");
      // 再ロードが走るため、apiGetが追加で呼ばれること
      expect(apiGet).toHaveBeenCalledTimes(8); // 初回4回 + 再ロード4回

      root.unmount();
      container.remove();
    });

    it("APIが失敗したとき、setErrorResponseが呼びされること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      const mockError = new Error("Approve error");
      vi.mocked(apiPost).mockRejectedValue(mockError);

      const approvePromise = getHook().handleApproveApplicant(20);
      await approvePromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);

      root.unmount();
      container.remove();
    });
  });

  describe("handleConfirmRejectApplicant (申請者却下)", () => {
    it("rejectTargetがセットされていないときは何もしないこと", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);

      await getHook().handleConfirmRejectApplicant();
      expect(apiPost).not.toHaveBeenCalledWith(
        expect.stringContaining("/reject"),
      );

      root.unmount();
      container.remove();
    });

    it("rejectTargetがある場合、APIを呼び出して却下し、ターゲットをクリアして再ロードすること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);

      let resolvePost: any;
      vi.mocked(apiPost).mockReturnValue(
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
      );

      getHook().setRejectTarget(mockApplicants[0]);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const rejectPromise = getHook().handleConfirmRejectApplicant();

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isSubmittingReject).toBe(true);

      resolvePost({});
      await rejectPromise;
      await new Promise((resolve) => setTimeout(resolve, 50)); // 再ロードのフェッチ完了を待つ

      expect(apiPost).toHaveBeenCalledWith("/team/1/applicants/20/reject");
      expect(toast.success).toHaveBeenCalledWith("申請を却下しました。");
      expect(getHook().rejectTarget).toBeNull();
      expect(getHook().isSubmittingReject).toBe(false);
      expect(apiGet).toHaveBeenCalledTimes(8); // 再ロード

      root.unmount();
      container.remove();
    });

    it("APIが失敗したとき、setErrorResponseが呼び出されること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      const mockError = new Error("Reject error");
      vi.mocked(apiPost).mockRejectedValue(mockError);

      getHook().setRejectTarget(mockApplicants[0]);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const rejectPromise = getHook().handleConfirmRejectApplicant();
      await rejectPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(getHook().isSubmittingReject).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("handleConfirmKick (メンバーキック)", () => {
    it("kickTargetがセットされていないときは何もしないこと", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);

      await getHook().handleConfirmKick();
      expect(apiDelete).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("kickTargetがある場合、APIを呼び出してキックし、ターゲットをクリアして再ロードすること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);

      let resolveDelete: any;
      vi.mocked(apiDelete).mockReturnValue(
        new Promise((resolve) => {
          resolveDelete = resolve;
        }),
      );

      getHook().setKickTarget(mockMembers[1]);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const kickPromise = getHook().handleConfirmKick();

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isSubmittingKick).toBe(true);

      resolveDelete({});
      await kickPromise;
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(apiDelete).toHaveBeenCalledWith("/team/1/members/11");
      expect(toast.success).toHaveBeenCalledWith("メンバーをキックしました。");
      expect(getHook().kickTarget).toBeNull();
      expect(getHook().isSubmittingKick).toBe(false);
      expect(apiGet).toHaveBeenCalledTimes(8);

      root.unmount();
      container.remove();
    });

    it("APIが失敗したとき、setErrorResponseが呼び出されること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      const mockError = new Error("Kick error");
      vi.mocked(apiDelete).mockRejectedValue(mockError);

      getHook().setKickTarget(mockMembers[1]);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const kickPromise = getHook().handleConfirmKick();
      await kickPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(getHook().isSubmittingKick).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("handleDeleteTeam (チーム削除)", () => {
    it("APIを呼び出し、削除成功時に一覧ページへ遷移し、ダイアログを閉じること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);

      let resolveDelete: any;
      vi.mocked(apiDelete).mockReturnValue(
        new Promise((resolve) => {
          resolveDelete = resolve;
        }),
      );

      getHook().setShowDeleteDialog(true);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const deletePromise = getHook().handleDeleteTeam();

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isDeletingTeam).toBe(true);

      resolveDelete({});
      await deletePromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(apiDelete).toHaveBeenCalledWith("/team/1");
      expect(toast.success).toHaveBeenCalledWith("チームを削除しました。");
      expect(mockPush).toHaveBeenCalledWith("/team");
      expect(getHook().isDeletingTeam).toBe(false);
      expect(getHook().showDeleteDialog).toBe(false);

      root.unmount();
      container.remove();
    });

    it("APIが失敗したとき、setErrorResponseが呼び出されること", async () => {
      const { getHook, root, container } = await setupHook(mockTeamOwner);
      const mockError = new Error("Delete error");
      vi.mocked(apiDelete).mockRejectedValue(mockError);

      const deletePromise = getHook().handleDeleteTeam();
      await deletePromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(getHook().isDeletingTeam).toBe(false);
      expect(getHook().showDeleteDialog).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("タグ操作関連", () => {
    describe("handleCreateTag (タグ新規作成)", () => {
      it("入力値が空または空白のみの場合は何も行わないこと", async () => {
        const { getHook, root, container } = await setupHook(mockTeamOwner);

        getHook().setNewTagName("   ");
        await new Promise((resolve) => setTimeout(resolve, 10));

        await getHook().handleCreateTag();
        expect(apiPost).not.toHaveBeenCalled();

        root.unmount();
        container.remove();
      });

      it("入力値がある場合、APIを呼び出し、成功時にテキストクリアとタグ一覧再取得を行うこと", async () => {
        const { getHook, root, container } = await setupHook(mockTeamOwner);

        let resolvePost: any;
        vi.mocked(apiPost).mockReturnValue(
          new Promise((resolve) => {
            resolvePost = resolve;
          }),
        );

        const newTagsList = [
          ...mockTags,
          {
            id: 31,
            name: "新しいタグ",
            user_id: null,
            team_id: 1,
            delete_flag: false,
            created_at: "2026-06-11T12:00:00Z",
            updated_at: "2026-06-11T12:00:00Z",
          },
        ];
        vi.mocked(apiGet).mockImplementation(async (url) => {
          if (url === "/tags/team/1") return newTagsList;
          if (url === "/team/1") return mockTeamOwner;
          if (url === "/team/1/members") return mockMembers;
          if (url === "/team/1/applicants") return mockApplicants;
          return [];
        });

        getHook().setNewTagName("新しいタグ");
        await new Promise((resolve) => setTimeout(resolve, 10));

        const createPromise = getHook().handleCreateTag();

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(getHook().isSubmittingTag).toBe(true);

        resolvePost({});
        await createPromise;
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(apiPost).toHaveBeenCalledWith(
          "/tags/team/1",
          JSON.stringify({ name: "新しいタグ" }),
        );
        expect(toast.success).toHaveBeenCalledWith("タグを作成しました。");
        expect(getHook().newTagName).toBe("");
        expect(getHook().tags).toEqual(newTagsList);
        expect(getHook().isSubmittingTag).toBe(false);

        root.unmount();
        container.remove();
      });

      it("APIが失敗したとき、setErrorResponseが呼び出されること", async () => {
        const { getHook, root, container } = await setupHook(mockTeamOwner);
        const mockError = new Error("Tag Create error");
        vi.mocked(apiPost).mockRejectedValue(mockError);

        getHook().setNewTagName("新しいタグ");
        await new Promise((resolve) => setTimeout(resolve, 10));

        const createPromise = getHook().handleCreateTag();
        await createPromise;
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
        expect(getHook().isSubmittingTag).toBe(false);

        root.unmount();
        container.remove();
      });
    });

    describe("handleUpdateTag (タグ更新)", () => {
      it("選択されたタグが無い、または入力値が空の場合は何も行わないこと", async () => {
        const { getHook, root, container } = await setupHook(mockTeamOwner);

        // 選択されたタグが無い場合
        await getHook().handleUpdateTag();
        expect(apiPut).not.toHaveBeenCalled();

        // 選択されたタグはあるが、入力値が空の場合
        getHook().handleOpenTagDialog(mockTags[0]);
        getHook().setEditingTagName("   ");
        await new Promise((resolve) => setTimeout(resolve, 10));

        await getHook().handleUpdateTag();
        expect(apiPut).not.toHaveBeenCalled();

        root.unmount();
        container.remove();
      });

      it("必要な値がある場合、APIを呼び出して更新し、ダイアログを閉じて再取得すること", async () => {
        const { getHook, root, container } = await setupHook(mockTeamOwner);

        let resolvePut: any;
        vi.mocked(apiPut).mockReturnValue(
          new Promise((resolve) => {
            resolvePut = resolve;
          }),
        );

        const updatedTagsList = [
          {
            id: 30,
            name: "更新されたタグ",
            user_id: null,
            team_id: 1,
            delete_flag: false,
            created_at: "2026-06-11T12:00:00Z",
            updated_at: "2026-06-11T12:00:00Z",
          },
        ];
        vi.mocked(apiGet).mockImplementation(async (url) => {
          if (url === "/tags/team/1") return updatedTagsList;
          if (url === "/team/1") return mockTeamOwner;
          if (url === "/team/1/members") return mockMembers;
          if (url === "/team/1/applicants") return mockApplicants;
          return [];
        });

        getHook().handleOpenTagDialog(mockTags[0]);
        getHook().setEditingTagName("更新されたタグ");
        await new Promise((resolve) => setTimeout(resolve, 10));

        const updatePromise = getHook().handleUpdateTag();

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(getHook().isUpdatingTag).toBe(true);

        resolvePut({});
        await updatePromise;
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(apiPut).toHaveBeenCalledWith(
          "/tags/team/1/30",
          JSON.stringify({ name: "更新されたタグ" }),
        );
        expect(toast.success).toHaveBeenCalledWith("タグを更新しました。");
        expect(getHook().selectedTag).toBeNull();
        expect(getHook().editingTagName).toBe("");
        expect(getHook().tags).toEqual(updatedTagsList);
        expect(getHook().isUpdatingTag).toBe(false);

        root.unmount();
        container.remove();
      });

      it("APIが失敗したとき、setErrorResponseが呼び出されること", async () => {
        const { getHook, root, container } = await setupHook(mockTeamOwner);
        const mockError = new Error("Tag Update error");
        vi.mocked(apiPut).mockRejectedValue(mockError);

        getHook().handleOpenTagDialog(mockTags[0]);
        getHook().setEditingTagName("更新されたタグ");
        await new Promise((resolve) => setTimeout(resolve, 10));

        const updatePromise = getHook().handleUpdateTag();
        await updatePromise;
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
        expect(getHook().isUpdatingTag).toBe(false);

        root.unmount();
        container.remove();
      });
    });

    describe("handleDeleteTag (タグ削除)", () => {
      it("APIを呼び出して削除し、ダイアログを閉じて再取得すること", async () => {
        const { getHook, root, container } = await setupHook(mockTeamOwner);

        let resolveDelete: any;
        vi.mocked(apiDelete).mockReturnValue(
          new Promise((resolve) => {
            resolveDelete = resolve;
          }),
        );

        const updatedTagsList: Tag[] = [];
        vi.mocked(apiGet).mockImplementation(async (url) => {
          if (url === "/tags/team/1") return updatedTagsList;
          if (url === "/team/1") return mockTeamOwner;
          if (url === "/team/1/members") return mockMembers;
          if (url === "/team/1/applicants") return mockApplicants;
          return [];
        });

        getHook().handleOpenTagDialog(mockTags[0]);
        await new Promise((resolve) => setTimeout(resolve, 10));

        const deletePromise = getHook().handleDeleteTag(30);

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(getHook().deletingTagId).toBe(30);

        resolveDelete({});
        await deletePromise;
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(apiDelete).toHaveBeenCalledWith("/tags/team/1/30");
        expect(toast.success).toHaveBeenCalledWith("タグを削除しました。");
        expect(getHook().selectedTag).toBeNull();
        expect(getHook().editingTagName).toBe("");
        expect(getHook().tags).toEqual([]);
        expect(getHook().deletingTagId).toBeNull();

        root.unmount();
        container.remove();
      });

      it("APIが失敗したとき、setErrorResponseが呼び出されること", async () => {
        const { getHook, root, container } = await setupHook(mockTeamOwner);
        const mockError = new Error("Tag Delete error");
        vi.mocked(apiDelete).mockRejectedValue(mockError);

        const deletePromise = getHook().handleDeleteTag(30);
        await deletePromise;
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
        expect(getHook().deletingTagId).toBeNull();

        root.unmount();
        container.remove();
      });
    });
  });
});
