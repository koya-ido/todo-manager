import { ErrorContext } from "@/components/features/ErrorProvider";
import { useTodoDetail } from "@/features/todoDetail/hooks/useTodoDetail";
import { apiGet, apiPut } from "@/hooks/useFetchApi";
import React from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFetchApi", () => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
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

describe("features/todoDetail/hooks/useTodoDetail (Todo詳細状態管理フック)", () => {
  const mockSetErrorResponse = vi.fn();
  const dummyMessages: Record<string, string> = {
    "todo-edit.update.success": "更新に成功しました。",
    "todo-detail.comment.create.success": "コメントを送信しました。",
  };

  const mockTodo = {
    id: 42,
    name: "詳細テストTodo",
    status_id: 1,
    priority_id: 2,
    created_at: "2026-06-11T08:00:00Z",
    due_date: "2026-06-12",
    tasks: [],
    comments: [],
    manager_id: 1,
  };

  const mockUser = {
    display_user_id: "user-1",
    user_name: "山田太郎",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiGet).mockImplementation(async (url) => {
      if (url.startsWith("/todo/")) return mockTodo;
      if (url === "/me") return mockUser;
      throw new Error(`Unexpected URL: ${url}`);
    });
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

  it("マウント時にTodo詳細と現在ユーザーの情報をフェッチできること", async () => {
    let hookResult: ReturnType<typeof useTodoDetail> | null = null;
    const TestComponent = () => {
      hookResult = useTodoDetail({ todoId: 42, messages: dummyMessages });
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

    expect(apiGet).toHaveBeenCalledWith("/todo/42");
    expect(apiGet).toHaveBeenCalledWith("/me");
    expect(hookResult!.todo).toEqual(mockTodo);
    expect(hookResult!.currentUser).toEqual(mockUser);
    expect(hookResult!.isLoading).toBe(false);

    root.unmount();
    container.remove();
  });

  it("handleUpdateStatus がステータス更新APIを呼び出して成功トーストを表示すること", async () => {
    const mockUpdatedTodo = { ...mockTodo, status_id: 2 };
    vi.mocked(apiPut).mockResolvedValue(mockUpdatedTodo);

    let hookResult: ReturnType<typeof useTodoDetail> | null = null;
    const TestComponent = () => {
      hookResult = useTodoDetail({ todoId: 42, messages: dummyMessages });
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(wrapper, { children: React.createElement(TestComponent) }));

    await new Promise((resolve) => setTimeout(resolve, 50));

    await hookResult!.handleUpdateStatus("2");
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(apiPut).toHaveBeenCalledWith("/todo/42", JSON.stringify({ status_id: 2 }));
    expect(toast.success).toHaveBeenCalledWith("更新に成功しました。");
    expect(hookResult!.todo!.status_id).toBe(2);

    root.unmount();
    container.remove();
  });

  it("Todoが存在しない (404) 場合、not-foundページにリダイレクトされること", async () => {
    const mock404Error = {
      status: 404,
      code: "TODO_NOT_FOUND",
      detail: "Not Found",
      title: "Not Found",
    };
    vi.mocked(apiGet).mockRejectedValueOnce(mock404Error);

    let hookResult: ReturnType<typeof useTodoDetail> | null = null;
    const TestComponent = () => {
      hookResult = useTodoDetail({ todoId: 42, messages: dummyMessages });
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

    expect(mockPush).toHaveBeenCalledWith("/not-found");

    root.unmount();
    container.remove();
  });
});
