import { TeamFormState } from "@/features/teamEdit/types";
import { isStateDirty } from "@/features/teamEdit/utils";
import { describe, expect, it } from "vitest";

describe("features/teamEdit/utils (チーム編集ユーティリティ)", () => {
  describe("isStateDirty", () => {
    const defaultInitial: TeamFormState = {
      name: "チームA",
      password: "password123",
      confirmPassword: "password123",
    };

    it("初期状態が null の場合は false を返すこと", () => {
      const current: TeamFormState = { ...defaultInitial };
      expect(isStateDirty(current, null)).toBe(false);
    });

    it("現在の状態と初期状態が同じ場合は false を返すこと", () => {
      const current: TeamFormState = { ...defaultInitial };
      expect(isStateDirty(current, defaultInitial)).toBe(false);
    });

    it("チーム名が変更された場合は true を返すこと", () => {
      const current: TeamFormState = {
        ...defaultInitial,
        name: "新しいチーム名",
      };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("パスワードが変更された場合は true を返すこと", () => {
      const current: TeamFormState = {
        ...defaultInitial,
        password: "newpassword",
      };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });

    it("確認用パスワードが変更された場合は true を返すこと", () => {
      const current: TeamFormState = {
        ...defaultInitial,
        confirmPassword: "newpassword",
      };
      expect(isStateDirty(current, defaultInitial)).toBe(true);
    });
  });
});
