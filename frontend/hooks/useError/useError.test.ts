import { ErrorResponse, ParsedError } from "@/hooks/useError/types";
import { useError } from "@/hooks/useError/useError";
import React from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

describe("hooks/useError (エラー表示管理フック)", () => {
  const messages: Record<string, string> = {
    "validation.email.required": "メールアドレスは必須です。",
    "validation.password.length": "パスワードは {min} 文字以上必要です。",
    "error.server": "システムエラーが発生しました。({detail})",
  };

  it("parsedErrorResponse が API エラーレスポンスを正しくパースすること", async () => {
    let hookResult: ReturnType<typeof useError> | null = null;

    const TestComponent = () => {
      hookResult = useError({ messages });
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    // マウントを待つ
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(hookResult).not.toBeNull();
    const { parsedErrorResponse } = hookResult!;

    // 1. フィールドエラーがある場合
    const fieldErrorResponse: ErrorResponse = {
      status: 400,
      title: "Validation Error",
      detail: "Validation Error",
      code: "validation_error",
      errors: [
        {
          code: "validation.email.required",
          pointer: "email",
          param: {},
        },
      ],
    };

    const parsedField = parsedErrorResponse(fieldErrorResponse);
    expect(parsedField).toEqual([
      {
        displayType: "inline",
        i18nKey: "validation.email.required",
        params: {},
        fieldName: "email",
      },
    ]);

    // 2. トーストエラーの場合
    const toastErrorResponse: ErrorResponse = {
      status: 500,
      title: "Internal Server Error",
      detail: "Internal Server Error",
      code: "error.server",
    };

    const parsedToast = parsedErrorResponse(toastErrorResponse);
    expect(parsedToast).toEqual([
      {
        displayType: "toast",
        i18nKey: "error.server",
        params: {
          detail: "Internal Server Error",
        },
      },
    ]);

    root.unmount();
    container.remove();
  });

  it("getFieldErrorMessage がインラインエラーメッセージを正しく組み立て、プレースホルダーを置換すること", async () => {
    let hookResult: ReturnType<typeof useError> | null = null;

    const TestComponent = () => {
      hookResult = useError({ messages });
      return null;
    };

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(React.createElement(TestComponent));

    await new Promise((resolve) => setTimeout(resolve, 10));

    // 最初はエラーなし
    expect(hookResult!.getFieldErrorMessage("email")).toBeNull();

    // インラインエラーをセット
    const mockErrors: ParsedError[] = [
      {
        displayType: "inline",
        fieldName: "email",
        i18nKey: "validation.email.required",
        params: {},
      },
      {
        displayType: "inline",
        fieldName: "password",
        i18nKey: "validation.password.length",
        params: { min: 8 },
      },
    ];

    hookResult!.setInlineErrors(mockErrors);

    await new Promise((resolve) => setTimeout(resolve, 10));

    // プレーンなメッセージ (常に最新のフックの返り値を参照)
    expect(hookResult!.getFieldErrorMessage("email")).toBe("メールアドレスは必須です。");
    // プレースホルダー置換ありのメッセージ
    expect(hookResult!.getFieldErrorMessage("password")).toBe(
      "パスワードは 8 文字以上必要です。",
    );

    // エラーをクリア
    hookResult!.clearInlineErrors();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(hookResult!.getFieldErrorMessage("email")).toBeNull();

    root.unmount();
    container.remove();
  });
});
