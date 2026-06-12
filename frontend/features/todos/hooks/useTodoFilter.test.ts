import { useTodoFilter } from "@/features/todos/hooks/useTodoFilter";
import React from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";

describe("features/todos/hooks/useTodoFilter (Todoフィルター状態管理フック)", () => {
  const dummyMessages: Record<string, string> = {
    "todo-list.filter-option.status.all": "すべてのステータス",
    "common.status.not-started": "未着手",
    "common.status.in-progress": "進行中",
    "common.status.done": "完了",
    "common.status.pending": "保留",
    "todo-list.filter-option.priority.all": "すべての優先度",
    "common.priority.high": "高",
    "common.priority.medium": "中",
    "common.priority.low": "低",
    "todo-list.sort-option.createdAt-desc": "作成日新しい順",
  };

  it("メッセージをもとに初期状態およびフィルターアイテムが正しく生成されること", async () => {
    let hookResult: ReturnType<typeof useTodoFilter> | null = null;
    const TestComponent = () => {
      hookResult = useTodoFilter(dummyMessages);
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    await new Promise((resolve) => setTimeout(resolve, 10));

    // 初期状態の検証
    expect(hookResult!.keyword).toBe("");
    expect(hookResult!.status).toEqual(["すべてのステータス"]);
    expect(hookResult!.priority).toEqual(["すべての優先度"]);
    expect(hookResult!.sort).toBe("create-date-desc");
    expect(hookResult!.managerId).toBe("0");

    // フィルターアイテム選択肢の検証
    expect(hookResult!.StatusFilterItems[0].label).toBe("すべてのステータス");
    expect(hookResult!.StatusFilterItems[1].label).toBe("未着手");
    expect(hookResult!.PriorityFilterItems[0].label).toBe("すべての優先度");

    root.unmount();
    container.remove();
  });

  it("ステータスや優先度を変更した際、選択されたIDが正しく反映されること", async () => {
    let hookResult: ReturnType<typeof useTodoFilter> | null = null;
    const TestComponent = () => {
      hookResult = useTodoFilter(dummyMessages);
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    await new Promise((resolve) => setTimeout(resolve, 10));

    // 初期状態の選択IDは「すべて」に対応する [0]
    expect(hookResult!.selectedStatusIds).toEqual([0]);

    // ステータスを「未着手」(値:1) に変更
    hookResult!.handleStatusChange("未着手");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(hookResult!.status).toEqual(["未着手"]);
    expect(hookResult!.selectedStatusIds).toEqual([1]);

    // ステータスに「進行中」(値:2) を追加 (複数選択)
    hookResult!.handleStatusChange(["未着手", "進行中"]);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(hookResult!.status).toEqual(["未着手", "進行中"]);
    expect(hookResult!.selectedStatusIds).toEqual([1, 2]);

    root.unmount();
    container.remove();
  });

  it("検索実行時に、入力されたフィルター値が適用済み状態 (applied...) に適用されること", async () => {
    let hookResult: ReturnType<typeof useTodoFilter> | null = null;
    const TestComponent = () => {
      hookResult = useTodoFilter(dummyMessages);
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    await new Promise((resolve) => setTimeout(resolve, 10));

    // 各フィルター値を変更する
    hookResult!.setKeyword("バグ修正");
    hookResult!.handleStatusChange("進行中");
    hookResult!.handlePriorityChange("高");
    hookResult!.setSort("create-date-desc");
    hookResult!.setManagerId("5");

    await new Promise((resolve) => setTimeout(resolve, 10));

    // この時点では、適用済み状態 (applied) は初期値のまま
    expect(hookResult!.appliedKeyword).toBe("");
    expect(hookResult!.appliedStatus).toEqual([0]);

    // 検索サブミットイベントを発火
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    hookResult!.handleClickSearch(mockEvent);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // 適用済み状態が更新されていること
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(hookResult!.appliedKeyword).toBe("バグ修正");
    expect(hookResult!.appliedStatus).toEqual([2]); // 「進行中」の値は 2
    expect(hookResult!.appliedPriority).toEqual([1]); // 「高」の値は 1
    expect(hookResult!.appliedSort).toBe("create-date-desc");
    expect(hookResult!.appliedManagerId).toBe(5);

    root.unmount();
    container.remove();
  });
});
