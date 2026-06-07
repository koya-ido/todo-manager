"use client";

import { getToastErrors, isErrorResponse } from "@/hooks/useError/errorUtils";
import { useError } from "@/hooks/useError/useError";
import { createContext, ReactNode } from "react";
import { toast } from "sonner";

type ErrorProviderProps = {
  messages: Record<string, string>;
  children: ReactNode;
};

const defaultErrorContextValue = {
  getInlineError: (fieldName?: string): string | null => {
    void fieldName;
    return null;
  },
  setErrorResponse: (errorResponse?: unknown): void => {
    void errorResponse;
  },
  clearInlineErrors: () => { },
};

export const ErrorContext = createContext(defaultErrorContextValue);

export const ErrorProvider = ({ messages, children }: ErrorProviderProps) => {
  const {
    setInlineErrors,
    clearInlineErrors,
    parsedErrorResponse,
    getFieldErrorMessage,
  } = useError({ messages });

  const handleInlineError = (fieldName?: string) =>
    getFieldErrorMessage(fieldName ?? "");

  /**
   * エラーレスポンスを処理し、トースト と inline エラーを分離
   * @param errorResponse APIからのエラーレスポンス
   */
  const handleErrorResponse = (errorResponse: unknown) => {
    // 型チェック
    if (!isErrorResponse(errorResponse)) {
      const unexpectedMessage = messages["error.description"];
      toast.error(unexpectedMessage, {
        position: "top-center",
        style: {
          backgroundColor: "var(--destructive)",
          color: "var(--background)",
          fontWeight: "bold",
        },
      });
      return;
    }

    // エラーレスポンスをパース
    const parsedErrors = parsedErrorResponse(errorResponse);

    // toastエラーを取得して表示
    const toastErrors = getToastErrors(parsedErrors);
    toastErrors.forEach((error) => {
      let message = messages[error.i18nKey] || error.i18nKey;
      if (error.params) {
        Object.entries(error.params).forEach(([key, value]) => {
          message = message.replace(`{${key}}`, String(value));
        });
      }
      toast.error(message, {
        position: "top-center",
        style: {
          backgroundColor: "var(--destructive)",
          color: "var(--background)",
          fontWeight: "bold",
        },
      });
    });

    // inlineエラー（フィールドエラー）をContextにセット
    const inlineOnlyErrors = parsedErrors.filter(
      (error) => error.displayType === "inline",
    );

    setInlineErrors(inlineOnlyErrors);
  };

  const errorContextValue = {
    getInlineError: handleInlineError,
    setErrorResponse: handleErrorResponse,
    clearInlineErrors,
  };

  return (
    <ErrorContext.Provider value={errorContextValue}>
      {children}
    </ErrorContext.Provider>
  );
};
