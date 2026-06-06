import { Field, FieldError, FieldLabel } from "@/components/forms/Field";
import { FieldWrapperProps } from "@/components/forms/FieldWrapper/types";
import { cn } from "@/lib/utils";
import { createContext, FC } from "react";

/**
 * 子要素にエラー状態と必須バリデーションを通知するコンテキスト
 */
export const FieldWrapperContext = createContext<{
  required: boolean;
  isError: boolean;
}>({
  required: false,
  isError: false,
});

/**
 * input要素をfield単位でまとめるコンポーネント
 * @param label ラベル
 * @param required 必須
 * @param description fieldの説明
 * @param errorText fieldのエラーメッセージ
 * @returns ラベル + 入力欄 + (説明文) + エラーメッセージのセットコンポーネント
 */
export const FieldWrapper: FC<FieldWrapperProps> = ({
  label,
  required = false,
  children,
  description,
  errorText,
}) => {
  return (
    <Field className="gap-1">
      <FieldLabel
        className={cn(
          "flex flex-col gap-1 items-start w-full",
          errorText && "text-destructive",
        )}
      >
        {`${label}${required ? "*" : ""}`}
        <FieldWrapperContext.Provider
          value={{ required, isError: !!errorText }}
        >
          {children}
        </FieldWrapperContext.Provider>
      </FieldLabel>
      {description && description}
      {errorText && <FieldError>{errorText}</FieldError>}
    </Field>
  );
};
