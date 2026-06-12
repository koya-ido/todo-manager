import { useTeamMembers } from "@/features/todoEdit/hooks/useTeamMembers";
import { Member } from "@/features/todoEdit/types";
import { apiGet } from "@/hooks/useFetchApi";
import { TodoMode } from "@/types/todo";
import React from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
}));

describe("features/todoEdit/hooks/useTeamMembers (チームメンバー管理フック)", () => {
  const mockSetErrorResponse = vi.fn();

  const mockMembers: Member[] = [
    { id: 1, user_name: "ユーザー1", display_user_id: "user_1" },
    { id: 2, user_name: "ユーザー2", display_user_id: "user_2" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupHook = async (props: { mode: TodoMode; currentTeamId?: number }) => {
    let hookResult: ReturnType<typeof useTeamMembers> | null = null;
    const TestComponent = () => {
      const result = useTeamMembers({
        mode: props.mode,
        currentTeamId: props.currentTeamId,
        setErrorResponse: mockSetErrorResponse,
      });
      React.useEffect(() => {
        hookResult = result;
      });
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    // ロード完了を待つ (非同期フェッチ)
    await new Promise((resolve) => setTimeout(resolve, 50));

    const getHook = () => hookResult!;

    return {
      getHook,
      root,
      container,
    };
  };

  describe("初期表示時のメンバー取得 (useEffect)", () => {
    it("個人モードの場合、APIをコールせず、membersは空配列であること", async () => {
      const { getHook, root, container } = await setupHook({
        mode: "private",
      });

      expect(apiGet).not.toHaveBeenCalled();
      expect(getHook().members).toEqual([]);
      expect(mockSetErrorResponse).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("チームモードでチームIDが無い場合、APIをコールせず、membersは空配列であること", async () => {
      const { getHook, root, container } = await setupHook({
        mode: "team",
        currentTeamId: undefined,
      });

      expect(apiGet).not.toHaveBeenCalled();
      expect(getHook().members).toEqual([]);
      expect(mockSetErrorResponse).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("チームモードでチームIDがある場合、指定チームのメンバー一覧を取得してmembersに設定すること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockMembers);

      const { getHook, root, container } = await setupHook({
        mode: "team",
        currentTeamId: 101,
      });

      expect(apiGet).toHaveBeenCalledWith("/user/team/101/members");
      expect(getHook().members).toEqual(mockMembers);
      expect(mockSetErrorResponse).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("メンバー一覧の取得に失敗した場合、setErrorResponseが呼び出されること", async () => {
      const mockError = new Error("Get members failed");
      vi.mocked(apiGet).mockRejectedValue(mockError);

      const { getHook, root, container } = await setupHook({
        mode: "team",
        currentTeamId: 102,
      });

      expect(apiGet).toHaveBeenCalledWith("/user/team/102/members");
      expect(getHook().members).toEqual([]);
      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);

      root.unmount();
      container.remove();
    });
  });

  describe("メンバーの更新機能 (setMembers)", () => {
    it("setMembersを呼び出すことで、members状態を更新できること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockMembers);

      const { getHook, root, container } = await setupHook({
        mode: "team",
        currentTeamId: 101,
      });

      expect(getHook().members).toEqual(mockMembers);

      const updatedMembers = [
        ...mockMembers,
        { id: 3, user_name: "ユーザー3", display_user_id: "user_3" },
      ];

      // setMembersをコールして状態を更新
      React.startTransition(() => {
        getHook().setMembers(updatedMembers);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(getHook().members).toEqual(updatedMembers);

      root.unmount();
      container.remove();
    });
  });
});
