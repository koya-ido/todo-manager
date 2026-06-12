import { ErrorContext } from "@/components/features/ErrorProvider";
import { useTeamContent } from "@/features/team/hooks/useTeamContent";
import {
  TeamApplyingResponse,
  TeamJoinedResponse,
  TeamSearchResponse,
} from "@/features/team/types";
import { apiDelete, apiGet, apiPost } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("features/team/hooks/useTeamContent (チームコンテンツ状態管理フック)", () => {
  const mockSetErrorResponse = vi.fn();
  const dummyMessages: Record<string, string> = {
    "team.label": "チーム",
    "team.toast.search-failed": "検索に失敗しました。",
    "team.toast.apply-success": "参加申請を送信しました。",
    "team.toast.apply-failed-password": "パスワードが正しくありません。",
    "team.toast.cancel-success": "申請をキャンセルしました。",
    FAILED_TO_FETCH: "{name}の取得に失敗しました。",
  };

  const mockJoinedTeams: TeamJoinedResponse[] = [
    {
      id: 1,
      display_teams_id: "team-a",
      name: "チームA",
      created_user_id: 10,
      created_user_name: "作成者A",
      created_user_display_id: "creator-a",
      member_count: 5,
      is_owner: true,
    },
  ];

  const mockApplyingTeams: TeamApplyingResponse[] = [
    {
      id: 2,
      display_teams_id: "team-b",
      name: "チームB",
      created_user_name: "作成者B",
      created_user_display_id: "creator-b",
      applied_at: "2026-06-11T12:00:00Z",
    },
  ];

  const mockSearchTeam: TeamSearchResponse = {
    id: 3,
    display_teams_id: "team-c",
    name: "チームC",
    created_user_name: "作成者C",
    created_user_display_id: "creator-c",
    is_member: false,
    is_applying: false,
    accepting_applications: true,
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
          clearInlineErrors: vi.fn(),
        },
      },
      children,
    );

  it("マウント時にチームの情報を正常に取得できること", async () => {
    vi.mocked(apiGet).mockImplementation(async (url) => {
      if (url === "/team/joined") return mockJoinedTeams;
      if (url === "/team/applying") return mockApplyingTeams;
      throw new Error(`Unexpected URL: ${url}`);
    });

    let hookResult: ReturnType<typeof useTeamContent> | null = null;
    const TestComponent = () => {
      const result = useTeamContent(dummyMessages);
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

    // ロード完了を待つ
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(apiGet).toHaveBeenCalledWith("/team/joined");
    expect(apiGet).toHaveBeenCalledWith("/team/applying");
    expect(hookResult!.joinedTeams).toEqual(mockJoinedTeams);
    expect(hookResult!.applyingTeams).toEqual(mockApplyingTeams);
    expect(hookResult!.isLoading).toBe(false);

    root.unmount();
    container.remove();
  });

  it("マウント時にAPIリクエストが失敗した場合、setErrorResponseが呼び出されること", async () => {
    const mockError = new Error("データロード失敗");
    vi.mocked(apiGet).mockRejectedValue(mockError);

    let hookResult: ReturnType<typeof useTeamContent> | null = null;
    const TestComponent = () => {
      const result = useTeamContent(dummyMessages);
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

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
    expect(hookResult!.isLoading).toBe(false);

    root.unmount();
    container.remove();
  });

  describe("handleSearchSubmit (チーム検索)", () => {
    it("検索IDが空の場合はAPIリクエストを行わないこと", async () => {
      vi.mocked(apiGet).mockResolvedValue({});

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.setSearchId("   ");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;
      await hookResult!.handleSearchSubmit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(apiGet).not.toHaveBeenCalledWith(
        expect.stringContaining("/team/search"),
      );

      root.unmount();
      container.remove();
    });

    it("検索IDが入力されている場合、APIを呼び出し、成功時は検索結果を格納してモーダルを開くこと", async () => {
      let resolveSearch: any = null;
      vi.mocked(apiGet).mockImplementation(async (url) => {
        if (url === "/team/joined") return [];
        if (url === "/team/applying") return [];
        if (url.startsWith("/team/search")) {
          return new Promise((resolve) => {
            resolveSearch = resolve;
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      });

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.setSearchId("  team-c  ");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;
      const searchPromise = hookResult!.handleSearchSubmit(mockEvent);

      // isSearching状態がtrueになっていることを確認
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(hookResult!.isSearching).toBe(true);

      // APIレスポンスを解決
      resolveSearch(mockSearchTeam);
      await searchPromise;

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(apiGet).toHaveBeenCalledWith(
        "/team/search?display_teams_id=team-c",
      );
      expect(hookResult!.searchedTeam).toEqual(mockSearchTeam);
      expect(hookResult!.showSearchModal).toBe(true);
      expect(hookResult!.isSearching).toBe(false);

      root.unmount();
      container.remove();
    });

    it("検索APIがエラー(detailを含むオブジェクト)を返した場合、そのメッセージでトーストエラーを表示すること", async () => {
      vi.mocked(apiGet).mockImplementation(async (url) => {
        if (url.startsWith("/team/search")) {
          throw { detail: "指定されたチームは見つかりませんでした。" };
        }
        return [];
      });

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.setSearchId("team-unknown");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;
      await hookResult!.handleSearchSubmit(mockEvent);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(toast.error).toHaveBeenCalledWith(
        "指定されたチームは見つかりませんでした。",
      );
      expect(hookResult!.isSearching).toBe(false);

      root.unmount();
      container.remove();
    });

    it("検索APIがその他のエラーを返した場合、デフォルトのエラーメッセージでトーストエラーを表示すること", async () => {
      vi.mocked(apiGet).mockImplementation(async (url) => {
        if (url.startsWith("/team/search")) {
          throw new Error("通信エラー");
        }
        return [];
      });

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.setSearchId("team-unknown");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;
      await hookResult!.handleSearchSubmit(mockEvent);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // FAILED_TO_FETCH のプレースホルダーが "チーム" に置換されること
      expect(toast.error).toHaveBeenCalledWith("チームの取得に失敗しました。");
      expect(hookResult!.isSearching).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("handleApplySubmit (参加申請送信)", () => {
    it("searchedTeam または applyPassword が無い場合は処理を行わないこと", async () => {
      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      // 両方無い場合
      await hookResult!.handleApplySubmit(mockEvent);
      expect(apiPost).not.toHaveBeenCalled();

      // パスワードだけある場合
      hookResult!.setApplyPassword("pw123");
      await new Promise((resolve) => setTimeout(resolve, 10));
      await hookResult!.handleApplySubmit(mockEvent);
      expect(apiPost).not.toHaveBeenCalled();

      // チームだけある場合
      hookResult!.setApplyPassword("");
      hookResult!.setSearchedTeam(mockSearchTeam);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await hookResult!.handleApplySubmit(mockEvent);
      expect(apiPost).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("必要なパラメータが揃っている場合、APIを呼び出し、成功時はモーダルを閉じてデータを再ロードすること", async () => {
      vi.mocked(apiGet).mockResolvedValue([]);

      let resolvePost: any = null;
      vi.mocked(apiPost).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePost = resolve;
          }),
      );

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.setSearchedTeam(mockSearchTeam);
      hookResult!.setApplyPassword("  secret-password  ");
      hookResult!.setShowSearchModal(true);
      hookResult!.setSearchId("team-c");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;
      const applyPromise = hookResult!.handleApplySubmit(mockEvent);

      // submitting状態に更新されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(hookResult!.isSubmittingApply).toBe(true);

      resolvePost({});
      await applyPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(apiPost).toHaveBeenCalledWith(
        "/team/3/apply",
        JSON.stringify({ password: "secret-password" }),
      );
      expect(toast.success).toHaveBeenCalledWith("参加申請を送信しました。");
      expect(hookResult!.showSearchModal).toBe(false);
      expect(hookResult!.searchId).toBe("");
      expect(hookResult!.isSubmittingApply).toBe(false);

      // loadTeamsData が silent=true で呼ばれていることを確認 (計2回、初期マウント時のGet呼び出しと、今回の更新でのGet呼び出し)
      expect(apiGet).toHaveBeenCalledTimes(4); // 2(初期) + 2(更新)

      root.unmount();
      container.remove();
    });

    it("申請APIがエラー(detailを含むオブジェクト)を返した場合、applyErrorにそのメッセージをセットすること", async () => {
      vi.mocked(apiGet).mockResolvedValue([]);
      vi.mocked(apiPost).mockRejectedValue({
        detail: "パスワードが間違っています。",
      });

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.setSearchedTeam(mockSearchTeam);
      hookResult!.setApplyPassword("wrong-password");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;
      await hookResult!.handleApplySubmit(mockEvent);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(hookResult!.applyError).toBe("パスワードが間違っています。");
      expect(hookResult!.isSubmittingApply).toBe(false);

      root.unmount();
      container.remove();
    });

    it("申請APIがその他のエラーを返した場合、デフォルトのエラーメッセージをapplyErrorにセットすること", async () => {
      vi.mocked(apiGet).mockResolvedValue([]);
      vi.mocked(apiPost).mockRejectedValue(new Error("Network Error"));

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.setSearchedTeam(mockSearchTeam);
      hookResult!.setApplyPassword("wrong-password");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;
      await hookResult!.handleApplySubmit(mockEvent);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(hookResult!.applyError).toBe("パスワードが正しくありません。");
      expect(hookResult!.isSubmittingApply).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("handleCancelApply / handleConfirmCancelApply (申請キャンセル)", () => {
    it("handleCancelApply が cancelTarget をセットすること", async () => {
      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.handleCancelApply(42, "キャンセル対象チーム");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      expect(hookResult!.cancelTarget).toEqual({
        id: 42,
        name: "キャンセル対象チーム",
      });

      root.unmount();
      container.remove();
    });

    it("cancelTarget が無い場合は handleConfirmCancelApply が何もしないこと", async () => {
      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      await hookResult!.handleConfirmCancelApply();
      expect(apiDelete).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("cancelTarget がある場合、APIを呼び出して削除し、成功トーストを表示してデータを再ロードすること", async () => {
      vi.mocked(apiGet).mockResolvedValue([]);

      let resolveDelete: any = null;
      vi.mocked(apiDelete).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          }),
      );

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.handleCancelApply(55, "チームキャンセル");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      const confirmPromise = hookResult!.handleConfirmCancelApply();

      // submitting状態に更新されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(hookResult!.isSubmittingCancel).toBe(true);

      resolveDelete({});
      await confirmPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(apiDelete).toHaveBeenCalledWith("/team/55/apply");
      expect(toast.success).toHaveBeenCalledWith("申請をキャンセルしました。");
      expect(hookResult!.cancelTarget).toBeNull();
      expect(hookResult!.isSubmittingCancel).toBe(false);

      expect(apiGet).toHaveBeenCalledTimes(4); // 2(初期) + 2(更新)

      root.unmount();
      container.remove();
    });

    it("キャンセルのAPIリクエストが失敗した場合、setErrorResponseが呼び出されること", async () => {
      vi.mocked(apiGet).mockResolvedValue([]);
      const mockError = new Error("キャンセルエラー");
      vi.mocked(apiDelete).mockRejectedValue(mockError);

      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      hookResult!.handleCancelApply(55, "チームキャンセル");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 状態更新を反映

      await hookResult!.handleConfirmCancelApply();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(hookResult!.isSubmittingCancel).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("activeTab 状態管理", () => {
    it("activeTabの初期値が 'joined' であり、setActiveTabによって更新できること", async () => {
      let hookResult: ReturnType<typeof useTeamContent> | null = null;
      const TestComponent = () => {
        const result = useTeamContent(dummyMessages);
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

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(hookResult!.activeTab).toBe("joined");
      hookResult!.setActiveTab("applying");

      // レンダリングサイクルを待つ
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(hookResult!.activeTab).toBe("applying");

      root.unmount();
      container.remove();
    });
  });
});
