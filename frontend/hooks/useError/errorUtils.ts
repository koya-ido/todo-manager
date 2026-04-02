import { ErrorResponse, ParsedError } from "@/hooks/useError/types";

/**
 * JSON Pointer をフィールド名に変換する関数
 * @example "/email" -> "email", "/user/name" -> "user.name"
 * @returns フィールド名
 */
export const pointerToFieldName = (pointer: string): string => {
  return pointer.replace(/^\//, "").replace(/\//g, ".");
};

/**
 * ErrorResponseかどうかを判定する型ガード関数
 * @param data
 * @returns ErrorResponseであればtrue、そうでなければfalse
 */
export const isErrorResponse = (data: unknown): data is ErrorResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    "detail" in data
  );
};

/**
 * 指定したフィールドのエラーメッセージを取得する関数
 * @param parsedErrors パースされたエラーオブジェクトの配列
 * @param fieldName フィールド名
 * @returns エラーメッセージのi18nキーとパラメータ、または undefined
 */
export const getFieldError = (
  parsedErrors: ParsedError[],
  fieldName: string,
): ParsedError | undefined => {
  return parsedErrors.find(
    (error) => error.displayType === "inline" && error.fieldName === fieldName,
  );
};

/**
 * トースト表示用のエラーを取得する関数
 * @param parsedErrors パースされたエラーオブジェクトの配列
 * @returns トースト表示用のエラーオブジェクトの配列
 */
export const getToastErrors = (parsedErrors: ParsedError[]): ParsedError[] => {
  return parsedErrors.filter((error) => error.displayType === "toast");
};
