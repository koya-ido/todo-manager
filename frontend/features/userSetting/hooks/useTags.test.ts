import { ErrorContext } from "@/components/features/ErrorProvider";
import { useTags } from "@/features/userSetting/hooks/useTags";
import { Tag } from "@/features/userSetting/types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("features/userSetting/hooks/useTags (タグ管理フック)", () => {
  const mockSetErrorResponse = vi.fn();

  const mockTags: Tag[] = [
    {
      id: 1,
      name: "タグ1",
      user_id: 10,
      team_id: null,
      delete_flag: false,
      created_at: "2026-06-11T12:00:00Z",
      updated_at: "2026-06-11T12:00:00Z",
    },
    {
      id: 2,
      name: "タグ2",
      user_id: 10,
      team_id: null,
      delete_flag: false,
      created_at: "2026-06-11T12:00:00Z",
      updated_at: "2026-06-11T12:00:00Z",
    },
  ];

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

  const setupHook = async () => {
    let hookResult: ReturnType<typeof useTags> | null = null;
    const TestComponent = () => {
      const result = useTags();
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

    // Wait for the async tags loading in useEffect to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    const getHook = () => hookResult!;

    return {
      getHook,
      root,
      container,
    };
  };

  describe("初期表示時のタグ取得 (fetchTags)", () => {
    it("正常にタグ一覧が取得され、tagsステートに格納されること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);

      const { getHook, root, container } = await setupHook();

      expect(apiGet).toHaveBeenCalledWith("/tags/me");
      expect(getHook().tags).toEqual(mockTags);
      expect(mockSetErrorResponse).not.toHaveBeenCalled();

      root.unmount();
      container.remove();
    });

    it("エラーが発生した場合、setErrorResponseが呼び出されること", async () => {
      const mockError = new Error("Get tags error");
      vi.mocked(apiGet).mockRejectedValue(mockError);

      const { getHook, root, container } = await setupHook();

      expect(apiGet).toHaveBeenCalledWith("/tags/me");
      expect(getHook().tags).toEqual([]);
      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);

      root.unmount();
      container.remove();
    });
  });

  describe("タグの作成 (handleCreateTag)", () => {
    it("入力値が無い（空文字またはスペースのみ）場合、タグ作成処理を行わないこと", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const { getHook, root, container } = await setupHook();

      // 空白文字
      getHook().setNewTag("   ");
      await new Promise((resolve) => setTimeout(resolve, 10));

      await getHook().handleCreateTag();

      expect(apiPost).not.toHaveBeenCalled();
      expect(getHook().isSubmittingTag).toBe(false);

      root.unmount();
      container.remove();
    });

    it("入力値がある場合、タグが作成され、tagsステートに追加されること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const createdTag: Tag = {
        id: 3,
        name: "新規タグ",
        user_id: 10,
        team_id: null,
        delete_flag: false,
        created_at: "2026-06-12T12:00:00Z",
        updated_at: "2026-06-12T12:00:00Z",
      };

      // eslint-disable-next-line no-unused-vars
      let resolvePost!: (value: Tag) => void;
      const postPromise = new Promise<Tag>((resolve) => {
        resolvePost = resolve;
      });
      vi.mocked(apiPost).mockReturnValue(postPromise);

      const { getHook, root, container } = await setupHook();

      getHook().setNewTag("  新規タグ  ");
      await new Promise((resolve) => setTimeout(resolve, 10));

      const createPromise = getHook().handleCreateTag();

      // ローディング状態の確認
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isSubmittingTag).toBe(true);

      resolvePost(createdTag);
      await createPromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(apiPost).toHaveBeenCalledWith(
        "/tags/me",
        JSON.stringify({ name: "新規タグ" }),
      );
      expect(getHook().tags).toEqual([...mockTags, createdTag]);
      expect(getHook().newTag).toBe("");
      expect(getHook().isSubmittingTag).toBe(false);

      root.unmount();
      container.remove();
    });

    it("エラーが発生した場合、setErrorResponseが呼び出されること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const mockError = new Error("Create tag error");
      vi.mocked(apiPost).mockRejectedValue(mockError);

      const { getHook, root, container } = await setupHook();

      getHook().setNewTag("エラータグ");
      await new Promise((resolve) => setTimeout(resolve, 10));

      await getHook().handleCreateTag();

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(getHook().isSubmittingTag).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("ダイアログ開閉操作", () => {
    it("handleOpenTagDialog がダイアログを開き、selectedTagとeditingTagNameを設定すること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const { getHook, root, container } = await setupHook();

      getHook().handleOpenTagDialog(mockTags[0]);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(getHook().selectedTag).toEqual(mockTags[0]);
      expect(getHook().editingTagName).toBe(mockTags[0].name);

      root.unmount();
      container.remove();
    });

    it("handleCloseTagDialog がダイアログを閉じ、selectedTagとeditingTagNameをクリアすること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const { getHook, root, container } = await setupHook();

      getHook().handleOpenTagDialog(mockTags[0]);
      await new Promise((resolve) => setTimeout(resolve, 10));

      getHook().handleCloseTagDialog();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(getHook().selectedTag).toBeNull();
      expect(getHook().editingTagName).toBe("");

      root.unmount();
      container.remove();
    });
  });

  describe("タグの更新 (handleUpdateTag)", () => {
    it("selectedTagが無い、または入力値が空文字の場合、タグ更新処理を行わないこと", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const { getHook, root, container } = await setupHook();

      // 1. selectedTagが無い場合
      await getHook().handleUpdateTag();
      expect(apiPut).not.toHaveBeenCalled();

      // 2. selectedTagはあるが入力が空文字の場合
      getHook().handleOpenTagDialog(mockTags[0]);
      getHook().setEditingTagName("   ");
      await new Promise((resolve) => setTimeout(resolve, 10));

      await getHook().handleUpdateTag();
      expect(apiPut).not.toHaveBeenCalled();
      expect(getHook().isUpdatingTag).toBe(false);

      root.unmount();
      container.remove();
    });

    it("入力値があり正常に更新された場合、tagsが更新されダイアログが閉じること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const updatedTag: Tag = {
        ...mockTags[0],
        name: "更新タグ",
      };

      // eslint-disable-next-line no-unused-vars
      let resolvePut!: (value: Tag) => void;
      const putPromise = new Promise<Tag>((resolve) => {
        resolvePut = resolve;
      });
      vi.mocked(apiPut).mockReturnValue(putPromise);

      const { getHook, root, container } = await setupHook();

      getHook().handleOpenTagDialog(mockTags[0]);
      getHook().setEditingTagName("  更新タグ  ");
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatePromise = getHook().handleUpdateTag();

      // ローディング状態の確認
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().isUpdatingTag).toBe(true);

      resolvePut(updatedTag);
      await updatePromise;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(apiPut).toHaveBeenCalledWith(
        `/tags/me/${mockTags[0].id}`,
        JSON.stringify({ name: "更新タグ" }),
      );
      expect(getHook().tags).toEqual([updatedTag, mockTags[1]]);
      expect(getHook().selectedTag).toBeNull();
      expect(getHook().editingTagName).toBe("");
      expect(getHook().isUpdatingTag).toBe(false);

      root.unmount();
      container.remove();
    });

    it("エラーが発生した場合、setErrorResponseが呼び出されること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const mockError = new Error("Update tag error");
      vi.mocked(apiPut).mockRejectedValue(mockError);

      const { getHook, root, container } = await setupHook();

      getHook().handleOpenTagDialog(mockTags[0]);
      getHook().setEditingTagName("エラー更新");
      await new Promise((resolve) => setTimeout(resolve, 10));

      await getHook().handleUpdateTag();

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(getHook().isUpdatingTag).toBe(false);

      root.unmount();
      container.remove();
    });
  });

  describe("タグの削除 (handleDeleteTag)", () => {
    it("既に削除処理中の場合、何もしないこと", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const { getHook, root, container } = await setupHook();

      // 既に削除中のダミーステートを設定するために、一度呼び出してAPI返却を未完了にする
      // eslint-disable-next-line no-unused-vars
      let resolveDelete!: (value: Tag) => void;
      const deletePromise = new Promise<Tag>((resolve) => {
        resolveDelete = resolve;
      });
      vi.mocked(apiDelete).mockReturnValue(deletePromise);

      // 1回目の削除要求
      const firstDelete = getHook().handleDeleteTag(1);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(getHook().deletingTagId).toBe(1);

      // 2回目の削除要求 (別ID)
      await getHook().handleDeleteTag(2);
      expect(apiDelete).toHaveBeenCalledTimes(1); // 1回目しか呼び出されていないこと

      resolveDelete(mockTags[0]);
      await firstDelete;

      root.unmount();
      container.remove();
    });

    it("正常に削除された場合、tagsステートから削除され、deletingTagIdがリセットされること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      // eslint-disable-next-line no-unused-vars
      let resolveDelete!: (value: Tag) => void;
      const deletePromise = new Promise<Tag>((resolve) => {
        resolveDelete = resolve;
      });
      vi.mocked(apiDelete).mockReturnValue(deletePromise);

      const { getHook, root, container } = await setupHook();

      const runDelete = getHook().handleDeleteTag(1);

      // wait for state update to trigger re-render
      await new Promise((resolve) => setTimeout(resolve, 10));

      // ローディング状態の確認
      expect(getHook().deletingTagId).toBe(1);

      resolveDelete(mockTags[0]);
      await runDelete;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(apiDelete).toHaveBeenCalledWith("/tags/me/1");
      expect(getHook().tags).toEqual([mockTags[1]]);
      expect(getHook().deletingTagId).toBeNull();

      root.unmount();
      container.remove();
    });

    it("削除対象が現在選択中のタグである場合、ダイアログも閉じること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      vi.mocked(apiDelete).mockResolvedValue({});

      const { getHook, root, container } = await setupHook();

      getHook().handleOpenTagDialog(mockTags[0]);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await getHook().handleDeleteTag(mockTags[0].id);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(getHook().selectedTag).toBeNull();
      expect(getHook().editingTagName).toBe("");

      root.unmount();
      container.remove();
    });

    it("エラーが発生した場合、setErrorResponseが呼び出されること", async () => {
      vi.mocked(apiGet).mockResolvedValue(mockTags);
      const mockError = new Error("Delete tag error");
      vi.mocked(apiDelete).mockRejectedValue(mockError);

      const { getHook, root, container } = await setupHook();

      await getHook().handleDeleteTag(1);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
      expect(getHook().deletingTagId).toBeNull();

      root.unmount();
      container.remove();
    });
  });
});
