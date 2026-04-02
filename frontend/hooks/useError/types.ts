import { HttpStatusCode } from "@/types/httpStatus";

export type InlineErrorMessages = Record<string, string | number>;

export type FieldError = {
  /** エラーコード (i18nキー) */
  code: string;
  /** 対象フィールドのJSON Pointer */
  pointer: string;
  /** 文言生成用パラメータ */
  param: InlineErrorMessages;
};

export type ErrorResponse = {
  /** HTTPステータスコード */
  status: HttpStatusCode;
  /** 人間可読な概要 */
  title: string;
  /** 人間可読な詳細 */
  detail: string;
  /** 画面単位のエラー種別コード */
  code: string;
  /** フィールド単位のエラー配列 */
  errors?: FieldError[];
};

export type ParsedError = {
  /** 表示種別 */
  displayType: "inline" | "toast";
  /** i18nキー */
  i18nKey: string;
  /** i18nパラメータ */
  params?: InlineErrorMessages;
  /** フィールド識別子 (inline用) */
  fieldName?: string;
};

export type UseErrorProps = {
  messages: Record<string, string>;
};
