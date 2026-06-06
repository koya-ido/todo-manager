import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { FieldWrapperProps } from "@/components/forms/FieldWrapper/types";
import { Input } from "@/components/forms/Input";
import { InputProps } from "@/components/forms/Input/types";
import { FC } from "react";

/**
 * アプリから呼び出すテキスト入力コンポーネント
 * @returns テキスト入力コンポーネント
 */
export const InputField: FC<
  FieldWrapperProps & InputProps & { label?: string }
> = ({
  type,
  label = "Label",
  description,
  errorText,
  placeholder,
  required,
  value,
  className,
  onChange,
}) => {
  return (
    <FieldWrapper
      label={label}
      required={required}
      description={description}
      errorText={errorText}
    >
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        className={className}
        onChange={onChange}
      />
    </FieldWrapper>
  );
};
