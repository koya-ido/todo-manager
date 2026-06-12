import { ErrorContext } from "@/components/features/ErrorProvider";
import { InboxItem, useInbox } from "@/features/inbox/hooks/useInbox";
import { apiDelete, apiGet } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("features/inbox/hooks/useInbox (通知一覧フック)", () => {
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

  const mockInboxItems: InboxItem[] = [
    {
      id: 1,
      target_user_id: 10,
      todo_id: null,
      type: "todo_today",
      message: "山田太郎さんがタスクを作成しました",
      is_read: false,
      created_at: "2026-06-11T08:00:00Z",
      todo: null,
    },
    {
      id: 2,
      target_user_id: 10,
      todo_id: 100,
      type: "todo_comment",
      message: "コメントです",
      is_read: true,
      created_at: "2026-06-11T08:30:00Z",
      todo: {
        id: 100,
        name: "買い物タスク",
        team_name: null,
        team_id: null,
      },
    },
  ];

  it("マウント時に通知一覧を正常に取得できること", async () => {
    vi.mocked(apiGet).mockResolvedValue(mockInboxItems);

    let hookResult: ReturnType<typeof useInbox> | null = null;
    const TestComponent = () => {
      hookResult = useInbox();
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

    expect(apiGet).toHaveBeenCalledWith("/inbox");
    expect(hookResult!.inboxes).toEqual(mockInboxItems);
    expect(hookResult!.isLoading).toBe(false);

    root.unmount();
    container.remove();
  });

  it("deleteInboxItem が通知アイテムを正しく削除しステートを更新すること", async () => {
    vi.mocked(apiGet).mockResolvedValue(mockInboxItems);
    vi.mocked(apiDelete).mockResolvedValue({});

    let hookResult: ReturnType<typeof useInbox> | null = null;
    const TestComponent = () => {
      hookResult = useInbox();
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

    // 削除を呼び出す
    hookResult!.deleteInboxItem(1);

    // React の状態更新と再レンダリングをわずかに待つ
    await new Promise((resolve) => setTimeout(resolve, 10));

    // 呼び出し直後（アニメーション中）: deletingIds にIDが追加されていること
    expect(hookResult!.deletingIds).toContain(1);

    // アニメーション時間 (300ms) 以上の経過を待つ
    await new Promise((resolve) => setTimeout(resolve, 350));

    // API削除リクエストの検証
    expect(apiDelete).toHaveBeenCalledWith("/inbox/1");

    // 削除成功後: inboxesからアイテムが除外され、deletingIdsからも除外されていること
    expect(hookResult!.inboxes.length).toBe(1);
    expect(hookResult!.inboxes[0].id).toBe(2);

    root.unmount();
    container.remove();
  });

  it("削除APIが失敗した場合、setErrorResponseを呼び出しフェードアウトをキャンセルすること", async () => {
    vi.mocked(apiGet).mockResolvedValue(mockInboxItems);
    const mockError = new Error("削除失敗");
    vi.mocked(apiDelete).mockRejectedValue(mockError);

    let hookResult: ReturnType<typeof useInbox> | null = null;
    const TestComponent = () => {
      hookResult = useInbox();
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

    hookResult!.deleteInboxItem(1);

    // React の状態更新と再レンダリングをわずかに待つ
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(hookResult!.deletingIds).toContain(1);

    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(apiDelete).toHaveBeenCalledWith("/inbox/1");
    expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);

    // 削除失敗後: inboxes数は減っておらず、deletingIdsからも除外されていること
    expect(hookResult!.inboxes.length).toBe(2);
    expect(hookResult!.deletingIds).not.toContain(1);

    root.unmount();
    container.remove();
  });
});
