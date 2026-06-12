import { useUserValidation } from "@/hooks/useUserValidation";
import React from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

describe("hooks/useUserValidation (ユーザー入力バリデーションフック)", () => {
  const getValidation = async (
    userName: string,
    password: string,
    confirmPassword?: string,
  ) => {
    let hookResult: ReturnType<typeof useUserValidation> | null = null;
    const TestComponent = () => {
      const result = useUserValidation(userName, password, confirmPassword);
      React.useEffect(() => {
        hookResult = result;
      });
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    // レンダリング完了を待つ
    await new Promise((resolve) => setTimeout(resolve, 10));

    root.unmount();
    container.remove();

    return hookResult!;
  };

  describe("ユーザー名のバリデーション", () => {
    it("文字数チェック (5文字以上30文字以下) が正しく機能すること", async () => {
      // 4文字 (無効)
      const res4 = await getValidation("abcd", "Password123!");
      expect(res4.isUserName5CharactersOrMoreAnd30CharactersOrLess).toBe(false);

      // 5文字 (有効)
      const res5 = await getValidation("abcde", "Password123!");
      expect(res5.isUserName5CharactersOrMoreAnd30CharactersOrLess).toBe(true);

      // 30文字 (有効)
      const res30 = await getValidation("a".repeat(30), "Password123!");
      expect(res30.isUserName5CharactersOrMoreAnd30CharactersOrLess).toBe(true);

      // 31文字 (無効)
      const res31 = await getValidation("a".repeat(31), "Password123!");
      expect(res31.isUserName5CharactersOrMoreAnd30CharactersOrLess).toBe(false);
    });

    it("文字種チェック (半角英数字・アンダースコア) が正しく機能すること", async () => {
      // 半角英数字・アンダースコア (有効)
      const resValid = await getValidation("valid_UserName123", "Password123!");
      expect(resValid.isUserNameOnlyHalfWidthAlphanumericAndUnderscore).toBe(true);

      // ハイフンを含む (無効)
      const resHyphen = await getValidation("invalid-name", "Password123!");
      expect(resHyphen.isUserNameOnlyHalfWidthAlphanumericAndUnderscore).toBe(false);

      // ドットを含む (無効)
      const resDot = await getValidation("invalid.name", "Password123!");
      expect(resDot.isUserNameOnlyHalfWidthAlphanumericAndUnderscore).toBe(false);

      // 全角文字を含む (無効)
      const resZen = await getValidation("全角文字", "Password123!");
      expect(resZen.isUserNameOnlyHalfWidthAlphanumericAndUnderscore).toBe(false);
    });
  });

  describe("パスワードのバリデーション", () => {
    it("8文字以上チェックが正しく機能すること", async () => {
      // 7文字 (無効)
      const res7 = await getValidation("username", "Pass12!");
      expect(res7.isPassword8CharactersOrMore).toBe(false);

      // 8文字 (有効)
      const res8 = await getValidation("username", "Pass123!");
      expect(res8.isPassword8CharactersOrMore).toBe(true);
    });

    it("半角文字のみチェックが正しく機能すること", async () => {
      // 半角文字のみ (有効)
      const resHalf = await getValidation("username", "Password123!");
      expect(resHalf.isPasswordOnlyHalfWidth).toBe(true);

      // 全角文字を含む (無効)
      const resFull = await getValidation("username", "Password１23!");
      expect(resFull.isPasswordOnlyHalfWidth).toBe(false);
    });

    it("英大文字を含むチェックが正しく機能すること", async () => {
      // 英大文字なし (無効)
      const resNoUpper = await getValidation("username", "password123!");
      expect(resNoUpper.isPasswordIncludesUppercaseLetter).toBe(false);

      // 英大文字あり (有効)
      const resUpper = await getValidation("username", "Password123!");
      expect(resUpper.isPasswordIncludesUppercaseLetter).toBe(true);
    });

    it("英小文字を含むチェックが正しく機能すること", async () => {
      // 英小文字なし (無効)
      const resNoLower = await getValidation("username", "PASSWORD123!");
      expect(resNoLower.isPasswordIncludesLowercaseLetter).toBe(false);

      // 英小文字あり (有効)
      const resLower = await getValidation("username", "Password123!");
      expect(resLower.isPasswordIncludesLowercaseLetter).toBe(true);
    });

    it("数字を含むチェックが正しく機能すること", async () => {
      // 数字なし (無効)
      const resNoNum = await getValidation("username", "Password!");
      expect(resNoNum.isPasswordIncludesNumber).toBe(false);

      // 数字あり (有効)
      const resNum = await getValidation("username", "Password123!");
      expect(resNum.isPasswordIncludesNumber).toBe(true);
    });

    it("記号を含むチェックが正しく機能すること", async () => {
      // 記号なし (無効)
      const resNoSymbol = await getValidation("username", "Password123");
      expect(resNoSymbol.isPasswordIncludesSymbol).toBe(false);

      // 記号あり (有効)
      const resSymbol = await getValidation("username", "Password123!");
      expect(resSymbol.isPasswordIncludesSymbol).toBe(true);

      // スペースを含む記号入力 (無効)
      const resSpaceSymbol = await getValidation("username", "Password123 !");
      expect(resSpaceSymbol.isPasswordIncludesSymbol).toBe(false);
    });
  });

  describe("確認用パスワードのバリデーション", () => {
    it("一致チェックが正しく機能すること", async () => {
      // 未入力 (無効)
      const resEmpty = await getValidation("username", "Password123!", "");
      expect(resEmpty.isConfirmPasswordMatchesPassword).toBe(false);

      // 不一致 (無効)
      const resDiff = await getValidation("username", "Password123!", "Different123!");
      expect(resDiff.isConfirmPasswordMatchesPassword).toBe(false);

      // 一致 (有効)
      const resMatch = await getValidation("username", "Password123!", "Password123!");
      expect(resMatch.isConfirmPasswordMatchesPassword).toBe(true);

      // confirmPasswordが未定義の場合 (無効)
      const resUndefined = await getValidation("username", "Password123!");
      expect(resUndefined.isConfirmPasswordMatchesPassword).toBe(false);
    });
  });
});
