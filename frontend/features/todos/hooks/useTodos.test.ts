import { describe, expect, it, vi, beforeEach } from "vitest";
import { useTodos } from "@/features/todos/hooks/useTodos";
import React from "react";
import { createRoot } from "react-dom/client";
import { apiGet } from "@/hooks/useFetchApi";
import { ErrorContext } from "@/components/features/ErrorProvider";
import { TodoPriorityFilter, TodoStatusFilter } from "@/types/todo";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
}));

describe("features/todos/hooks/useTodos (Todo一覧状態管理フック)", () => {
  const mockSetErrorResponse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(
      ErrorContext.Provider,
      {
        value: {
          getInlineError: vi.fn(),
          setErrorResponse: mockSetErrorResponse,
          clearInlineErrors: vi.fn(),
        },
      },
      children
    )
  );

  const mockApiTodosResponse = {
    total: 2,
    items: [
      {
        id: 1,
        name: "Todo A",
        delete_flag: false,
        status_id: 1,
        priority_id: 2,
        created_at: "2026-06-11T08:00:00Z",
        due_date: "2026-06-12T00:00:00Z",
        tasks: [],
        manager_id: 10,
        manager: { user_name: "山田太郎" },
      },
      {
        id: 2,
        name: "Todo B",
        delete_flag: false,
        status_id: 2,
        priority_id: 1,
        created_at: "2026-06-11T09:00:00Z",
        due_date: null,
        tasks: [],
        manager_id: 11,
      },
    ],
  };

  const defaultStatus: TodoStatusFilter[] = [0];
  const defaultPriority: TodoPriorityFilter[] = [0];

  it("マウント時にTodo一覧と合計数を正常に取得し、UI表示用にマッピングできること", async () => {
    vi.mocked(apiGet).mockResolvedValue(mockApiTodosResponse);

    let hookResult: ReturnType<typeof useTodos> | null = null;
    const TestComponent = () => {
      hookResult = useTodos("private", false, "", defaultStatus, defaultPriority, "create-date-desc");
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(wrapper, { children: React.createElement(TestComponent) }));

    // 非同期処理を待つ
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(apiGet).toHaveBeenCalledTimes(2); // 合計カウント用とフィルタ一覧用
    expect(hookResult!.filteredTodos.length).toBe(2);

    const firstTodo = hookResult!.filteredTodos[0];
    expect(firstTodo.id).toBe(1);
    expect(firstTodo.title).toBe("Todo A");
    expect(firstTodo.status).toBe("not-started");
    expect(firstTodo.priority).toBe("medium");
    expect(firstTodo.managerName).toBe("山田太郎");
    expect(firstTodo.dueDate).not.toBe("-");

    const secondTodo = hookResult!.filteredTodos[1];
    expect(secondTodo.dueDate).toBe("-");

    expect(hookResult!.isLoading).toBe(false);
    expect(hookResult!.hasMore).toBe(false);

    root.unmount();
    container.remove();
  });

  it("loadMoreが追加のTodoを取得しステートにマージすること", async () => {
    // 初回フェッチ
    vi.mocked(apiGet).mockResolvedValueOnce({ total: 2, items: [mockApiTodosResponse.items[0]] }); // 総数用
    vi.mocked(apiGet).mockResolvedValueOnce({ total: 2, items: [mockApiTodosResponse.items[0]] }); // フィルタ一覧用
    // 追加フェッチ (loadMore)
    vi.mocked(apiGet).mockResolvedValueOnce({ total: 2, items: [mockApiTodosResponse.items[1]] });

    let hookResult: ReturnType<typeof useTodos> | null = null;
    const TestComponent = () => {
      hookResult = useTodos("private", false, "", defaultStatus, defaultPriority, "create-date-desc");
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(wrapper, { children: React.createElement(TestComponent) }));

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(hookResult!.filteredTodos.length).toBe(1);
    expect(hookResult!.hasMore).toBe(true);

    // 追加読み込みを呼び出す
    void hookResult!.loadMore();
    await new Promise((resolve) => setTimeout(resolve, 50));

    // マージされて2つになっていること
    expect(hookResult!.filteredTodos.length).toBe(2);
    expect(hookResult!.filteredTodos[1].id).toBe(2);
    expect(hookResult!.hasMore).toBe(false);

    root.unmount();
    container.remove();
  });
});
