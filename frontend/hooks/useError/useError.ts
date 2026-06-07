import { getFieldError } from "@/hooks/useError/errorUtils";
import {
  ErrorResponse,
  FieldError,
  ParsedError,
  UseErrorProps,
} from "@/hooks/useError/types";
import { useCallback, useState } from "react";

/**
 * エラー表示を管理するカスタムフック
 */
export const useError = ({ messages }: UseErrorProps) => {
  const [errors, setErrors] = useState<ParsedError[]>([]);

  /**
   * エラーレスポンスをパースして、表示用のエラーオブジェクトに変換する関数
   * @param errorResponse APIからのエラーレスポンス
   * @returns パースされたエラーオブジェクトの配列
   */
  const parsedErrorResponse = (errorResponse: ErrorResponse): ParsedError[] => {
    const parsedErrors: ParsedError[] = [];

    if (errorResponse.errors && errorResponse.errors.length > 0) {
      errorResponse.errors.forEach((fieldError: FieldError) => {
        parsedErrors.push({
          displayType: "inline",
          i18nKey: fieldError.code,
          params: fieldError.param,
          fieldName: fieldError.pointer,
        });
      });
    } else {
      parsedErrors.push({
        displayType: "toast",
        i18nKey: errorResponse.code,
        params: {
          detail: errorResponse.detail,
        },
      });
    }

    return parsedErrors;
  };

  /**
   * フィールドエラーをセット
   * @param newErrors 新しいエラーオブジェクトの配列
   */
  const setInlineErrors = useCallback((newErrors: ParsedError[]) => {
    setErrors(newErrors);
  }, []);

  /**
   * フィールドエラーをクリア
   */
  const clearInlineErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * 指定したフィールドのエラーメッセージを取得する関数
   * @param fieldName フィールド名
   */
  const getFieldErrorMessage = useCallback(
    (fieldName: string): string | null => {
      const error = getFieldError(errors, fieldName);
      if (!error) return null;

      // メッセージオブジェクトからエラーメッセージを取得
      let message = messages[error.i18nKey] || error.i18nKey;
      if (error.params) {
        Object.entries(error.params).forEach(([key, value]) => {
          message = message.replace(`{${key}}`, String(value));
        });
      }
      return message;
    },
    [errors, messages],
  );

  return {
    parsedErrorResponse,
    setInlineErrors,
    clearInlineErrors,
    getFieldErrorMessage,
  };
};
