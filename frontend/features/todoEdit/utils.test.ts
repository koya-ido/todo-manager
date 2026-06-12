import { FormState } from "@/features/todoEdit/types";
import { isStateDirty } from "@/features/todoEdit/utils";
import { describe, expect, it } from "vitest";

describe("features/todoEdit/utils (Todo編集ユーティリティ)", () => {
  describe("isStateDirty", () => {
    const defaultInitial: FormState = {
      name: "Todoタイトル",
      statusId: "1",
      priorityId: "2",
      startDate: "2026-06-11",
      dueDate: "2026-06-12",
      managerId: "user-1",
      selectedTags: [
        { id: 1, name: "タグ1" },
        { id: 2, name: "タグ2" },
      ],
      tasks: [
        {
          id: 1,
          title: "サブタスク1",
          completion_flag: false,
          content: "詳細1",
          key: "key-1",
        },
        {
          id: 2,
          title: "サブタスク2",
          completion_flag: true,
          content: "",
          key: "key-2",
        },
      ],
    };

    it("初期状態が null の場合は false を返すこと", () => {
      const current = { ...defaultInitial };
      expect(isStateDirty(current, null)).toBe(false);
    });

    it("現在の状態と初期状態が同一の場合は false を返すこと", () => {
      const current = { ...defaultInitial };
      expect(isStateDirty(current, defaultInitial)).toBe(false);
    });

    it("基本属性 (name) が変更された場合に true を返すこと", () => {
      const current = { ...defaultInitial, name: "変更後のタイトル" };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("ステータスIDが変更された場合に true を返すこと", () => {
      const current = { ...defaultInitial, statusId: "2" };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("優先度IDが変更された場合に true を返すこと", () => {
      const current = { ...defaultInitial, priorityId: "3" };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("開始日が変更された場合に true を返すこと", () => {
      const current = { ...defaultInitial, startDate: "2026-06-10" };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("期限日が変更された場合に true を返すこと", () => {
      const current = { ...defaultInitial, dueDate: "2026-06-15" };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("担当者IDが変更された場合に true を返すこと", () => {
      const current = { ...defaultInitial, managerId: "user-2" };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("選択されたタグの数が変更された場合に true を返すこと", () => {
      const current = {
        ...defaultInitial,
        selectedTags: [{ id: 1, name: "タグ1" }],
      };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("選択されたタグの中身（ID）が変更された場合に true を返すこと", () => {
      const current = {
        ...defaultInitial,
        selectedTags: [
          { id: 1, name: "タグ1" },
          { id: 3, name: "タグ3" },
        ],
      };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("サブタスクの数が変更された場合に true を返すこと", () => {
      const current = {
        ...defaultInitial,
        tasks: defaultInitial.tasks.slice(0, 1),
      };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("サブタスクのタイトルが変更された場合に true を返すこと", () => {
      const current = {
        ...defaultInitial,
        tasks: [
          {
            id: 1,
            title: "サブタスク1 変更",
            completion_flag: false,
            content: "詳細1",
            key: "key-1",
          },
          defaultInitial.tasks[1],
        ],
      };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("サブタスクの完了状態が変更された場合に true を返すこと", () => {
      const current = {
        ...defaultInitial,
        tasks: [
          defaultInitial.tasks[0],
          {
            id: 2,
            title: "サブタスク2",
            completion_flag: false,
            content: "",
            key: "key-2",
          },
        ],
      };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });
  });
});
