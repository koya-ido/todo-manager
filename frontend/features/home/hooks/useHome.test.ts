import { ErrorContext } from "@/components/features/ErrorProvider";
import { useHome } from "@/features/home/hooks/useHome";
import { getLocalDateString } from "@/utils/DateUtils";
import { useUser } from "@/features/user/hooks/useUser";
import { apiGet } from "@/hooks/useFetchApi";
import { TodoStatus } from "@/types/todo";
import React from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/user/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
}));

describe("features/home/hooks/useHome (ホーム画面フック)", () => {
  const mockSetErrorResponse = vi.fn();
  const todayString = getLocalDateString(new Date());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
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
      children,
    )
  );

  it("APIからTODOを正常に取得した場合、統計情報や本日締め切りの未完了TODOを正しく算出できること", async () => {
    vi.mocked(useUser).mockReturnValue({
      userId: "user-1",
      userName: "山田太郎",
    });

    // モックデータ (2つ有効、1つ論理削除、1つ完了)
    const mockTodosResponse = {
      items: [
        {
          id: 1,
          name: "期限今日・未完了",
          delete_flag: false,
          status_id: TodoStatus.NOT_STARTED,
          priority_id: 1,
          due_date: todayString,
        },
        {
          id: 2,
          name: "期限今日・完了",
          delete_flag: false,
          status_id: TodoStatus.DONE,
          priority_id: 1,
          due_date: todayString,
        },
        {
          id: 3,
          name: "期限今日・削除済み",
          delete_flag: true,
          status_id: TodoStatus.NOT_STARTED,
          priority_id: 1,
          due_date: todayString,
        },
        {
          id: 4,
          name: "期限明日・未完了",
          delete_flag: false,
          status_id: TodoStatus.NOT_STARTED,
          priority_id: 2,
          due_date: "2099-12-31", // 未来
        },
      ],
    };
    vi.mocked(apiGet).mockResolvedValue(mockTodosResponse);

    let hookResult: ReturnType<typeof useHome> | null = null;
    const TestComponent = () => {
      hookResult = useHome();
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(wrapper, { children: React.createElement(TestComponent) }));

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(apiGet).toHaveBeenCalledWith("/todo");
    expect(hookResult!.userName).toBe("山田太郎");
    expect(hookResult!.isDataLoading).toBe(false);

    // 削除フラグが立っていない有効な TODO の総数は 3 つ (1, 2, 4)
    expect(hookResult!.totalTodosCount).toBe(3);

    // 完了済みの有効な TODO は 1 つ (2)
    expect(hookResult!.completedTodosCount).toBe(1);

    // 本日締め切りで未完了の有効な TODO は 1 つ (1)
    expect(hookResult!.todayIncompleteTodos.length).toBe(1);
    expect(hookResult!.todayIncompleteTodos[0].id).toBe(1);

    root.unmount();
    container.remove();
  });

  it("API呼び出しでエラーが発生した場合、setErrorResponseが呼び出されること", async () => {
    vi.mocked(useUser).mockReturnValue({
      userId: "user-1",
      userName: "山田太郎",
    });
    const mockError = new Error("APIエラー");
    vi.mocked(apiGet).mockRejectedValue(mockError);

    let hookResult: ReturnType<typeof useHome> | null = null;
    const TestComponent = () => {
      hookResult = useHome();
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(wrapper, { children: React.createElement(TestComponent) }));

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(apiGet).toHaveBeenCalledWith("/todo");
    expect(mockSetErrorResponse).toHaveBeenCalledWith(mockError);
    expect(hookResult!.isDataLoading).toBe(false); // エラーでもローディング終了
    expect(hookResult!.totalTodosCount).toBe(0);

    root.unmount();
    container.remove();
  });
});
