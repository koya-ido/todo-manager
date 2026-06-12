import {
  getFieldError,
  getToastErrors,
  isErrorResponse,
  pointerToFieldName,
} from "@/hooks/useError/errorUtils";
import { ParsedError } from "@/hooks/useError/types";
import { describe, expect, it } from "vitest";

describe("hooks/useError/errorUtils (エラー処理ユーティリティ)", () => {
  describe("pointerToFieldName", () => {
    it("先頭のスラッシュが削除されること", () => {
      expect(pointerToFieldName("/email")).toBe("email");
    });

    it("ネストされたスラッシュがドットに置換されること", () => {
      expect(pointerToFieldName("/user/profile/name")).toBe(
        "user.profile.name",
      );
    });

    it("空のスラッシュのみの場合は空文字列を返すこと", () => {
      expect(pointerToFieldName("/")).toBe("");
    });
  });

  describe("isErrorResponse", () => {
    it("statusとdetailプロパティを持つオブジェクトの場合は true を返すこと", () => {
      const valid = { status: 400, detail: "エラー詳細" };
      expect(isErrorResponse(valid)).toBe(true);
    });

    it("statusまたはdetailが欠けている、またはオブジェクト以外の場合は false を返すこと", () => {
      expect(isErrorResponse(null)).toBe(false);
      expect(isErrorResponse(undefined)).toBe(false);
      expect(isErrorResponse({ status: 400 })).toBe(false);
      expect(isErrorResponse({ detail: "エラー詳細" })).toBe(false);
      expect(isErrorResponse("文字列エラー")).toBe(false);
    });
  });

  describe("getFieldError", () => {
    const parsedErrors: ParsedError[] = [
      {
        displayType: "inline",
        fieldName: "email",
        i18nKey: "validation.email",
      },
      {
        displayType: "toast",
        fieldName: "password",
        i18nKey: "validation.password",
      },
    ];

    it("displayType が inline でかつ指定されたフィールド名に一致するエラーを返すこと", () => {
      const result = getFieldError(parsedErrors, "email");
      expect(result).toEqual({
        displayType: "inline",
        fieldName: "email",
        i18nKey: "validation.email",
      });
    });

    it("displayType が inline であってもフィールド名が一致しない場合は undefined を返すこと", () => {
      expect(getFieldError(parsedErrors, "username")).toBeUndefined();
    });

    it("フィールド名が一致しても displayType が toast の場合は undefined を返すこと", () => {
      expect(getFieldError(parsedErrors, "password")).toBeUndefined();
    });
  });

  describe("getToastErrors", () => {
    const parsedErrors: ParsedError[] = [
      {
        displayType: "inline",
        fieldName: "email",
        i18nKey: "validation.email",
      },
      {
        displayType: "toast",
        fieldName: "password",
        i18nKey: "validation.password",
      },
      {
        displayType: "toast",
        fieldName: "general",
        i18nKey: "validation.general",
      },
    ];

    it("displayType が toast のエラーのみをフィルタリングして返すこと", () => {
      const result = getToastErrors(parsedErrors);
      expect(result.length).toBe(2);
      expect(result).toEqual([
        {
          displayType: "toast",
          fieldName: "password",
          i18nKey: "validation.password",
        },
        {
          displayType: "toast",
          fieldName: "general",
          i18nKey: "validation.general",
        },
      ]);
    });
  });
});
