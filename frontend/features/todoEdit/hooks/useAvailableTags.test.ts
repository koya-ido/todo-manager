import { useAvailableTags } from "@/features/todoEdit/hooks/useAvailableTags";
import { Tag } from "@/features/todoEdit/types";
import { apiGet, apiPost } from "@/hooks/useFetchApi";
import { TodoMode } from "@/types/todo";
import React from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("features/todoEdit/hooks/useAvailableTags (利用可能タグ管理フック)", () => {
  const mockSetErrorResponse = vi.fn();

  const mockTags: Tag[] = [
    { id: 1, name: "タグA" },
    { id: 2, name: "タグB" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupHook = async (props: { mode: TodoMode; currentTeamId?: number }) => {
    let hookResult: ReturnType<typeof useAvailableTags> | null = null;
    const TestComponent = () => {
      const result = useAvailableTags({
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

  describe("初期表示時のタグのロード (useEffect)", () => {
    it("個人モードの場合、/tags/me からタグを取得して availableTags に設定すること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);

      const { getHook, root, container } = await setupHook({
        mode: "private",
      });

      expect(apiGet).toHaveBeenCalledWith("/tags/me");
      expect(getHook().availableTags).toEqual(mockTags);
      expect(getHook().selectedTags).toEqual([]);
      expect(mockSetErrorResponse).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("チームモードでチームIDがある場合、/tags/team/:teamId からタグを取得して設定すること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);

      const { getHook, root, container } = await setupHook({
        mode: "team",
        currentTeamId: 123,
      });

      expect(apiGet).toHaveBeenCalledWith("/tags/team/123");
      expect(getHook().availableTags).toEqual(mockTags);
      expect(mockSetErrorResponse).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("チームモードでチームIDが無い場合、/tags/me からタグを取得すること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);

      const { getHook, root, container } = await setupHook({
        mode: "team",
        currentTeamId: undefined,
      });

      expect(apiGet).toHaveBeenCalledWith("/tags/me");
      expect(getHook().availableTags).toEqual(mockTags);
      expect(mockSetErrorResponse).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("タグの取得に失敗した場合、setErrorResponseが呼び出されること", async () => {
      const mockError = new Error("Get tags failed");
      vi.mocked(apiGet).mockRejectedValue(mockError);

      const { getHook, root, container } = await setupHook({
        mode: "private",
      });

      expect(apiGet).toHaveBeenCalledWith("/tags/me");
      expect(getHook().availableTags).toEqual([]);
      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);

      root.unmount();
      container.remove();
    });
  });

  describe("タグの作成機能 (handleCreateTag)", () => {
    it("入力値が無い（空文字またはスペースのみ）場合、タグ作成処理を行わないこと", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const { getHook, root, container } = await setupHook({
        mode: "private",
      });

      const mockEvent = {
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      // 空白文字
      getHook().setNewTagName("   ");
      await new Promise((resolve) => setTimeout(resolve, 10));

      await getHook().handleCreateTag(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(apiPost).not.toHaveBeenCalled();
      expect(getHook().isCreatingTag).toBe(false);

      root.unmount();
      container.remove();
    });

    it("個人モードでタグを正常に作成し、状態を更新すること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const createdTag: Tag = { id: 3, name: "新しいタグ" };

      let resolvePost: any;
      const postPromise = new Promise((resolve) => {
        resolvePost = resolve;
      });
      vi.mocked(apiPost).mockReturnValue(postPromise);

      const { getHook, root, container } = await setupHook({
        mode: "private",
      });

      const mockEvent = {
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      getHook().setNewTagName(" 新しいタグ ");
      await new Promise((resolve) => setTimeout(resolve, 10));

      const createPromise = getHook().handleCreateTag(mockEvent);

      // 非同期リクエスト中のローディング確認
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isCreatingTag).toBe(true);

      // レスポンスの返却
      resolvePost(createdTag);
      await createPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(apiPost).toHaveBeenCalledWith(
        "/tags/me",
        JSON.stringify({ name: "新しいタグ" })
      );
      expect(getHook().availableTags).toEqual([...mockTags, createdTag]);
      expect(getHook().selectedTags).toEqual([createdTag]);
      expect(getHook().newTagName).toBe("");
      expect(toast.success).toHaveBeenCalledWith("タグを追加しました");
      expect(getHook().isCreatingTag).toBe(false);

      root.unmount();
      container.remove();
    });

    it("チームモードでタグを正常に作成すること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const createdTag: Tag = { id: 3, name: "チームタグ" };
      vi.mocked(apiPost).mockResolvedValue(createdTag);

      const { getHook, root, container } = await setupHook({
        mode: "team",
        currentTeamId: 123,
      });

      const mockEvent = {
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      getHook().setNewTagName("チームタグ");
      await new Promise((resolve) => setTimeout(resolve, 10));

      await getHook().handleCreateTag(mockEvent);
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(apiPost).toHaveBeenCalledWith(
        "/tags/team/123",
        JSON.stringify({ name: "チームタグ" })
      );
      expect(getHook().availableTags).toEqual([...mockTags, createdTag]);
      expect(getHook().selectedTags).toEqual([createdTag]);
      expect(getHook().newTagName).toBe("");
      expect(toast.success).toHaveBeenCalledWith("タグを追加しました");

      root.unmount();
      container.remove();
    });

    it("タグ作成APIがエラーになった場合、setErrorResponseが呼び出されること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const mockError = new Error("Post failed");
      vi.mocked(apiPost).mockRejectedValue(mockError);

      const { getHook, root, container } = await setupHook({
        mode: "private",
      });

      const mockEvent = {
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      getHook().setNewTagName("タグエラー");
      await new Promise((resolve) => setTimeout(resolve, 10));

      await getHook().handleCreateTag(mockEvent);

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(getHook().isCreatingTag).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("タグの削除機能 (handleRemoveTag)", () => {
    it("選択済みタグから指定IDのタグを取り除くこと（availableTagsは変更しないこと）", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const { getHook, root, container } = await setupHook({
        mode: "private",
      });

      // 選択済みの状態を手動でシミュレートする
      getHook().setSelectedTags(mockTags);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 1つのタグを削除
      getHook().handleRemoveTag(1);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(getHook().selectedTags).toEqual([{ id: 2, name: "タグB" }]);
      expect(getHook().availableTags).toEqual(mockTags); // 選択肢自体は変わらないこと

      root.unmount();
      container.remove();
    });
  });
});
