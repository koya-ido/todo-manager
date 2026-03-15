import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { FieldWrapperProps } from "@/components/forms/FieldWrapper/types";
import { InputProps } from "@/components/forms/Input/types";
import { InputPassword } from "@/components/forms/InputPassword";
import { FC } from "react";

/**
 * アプリから呼び出すパスワード入力コンポーネント
 * @returns パスワード入力コンポーネント
 */
export const PasswordField: FC<
  FieldWrapperProps & InputProps & { label?: string }
> = ({
  label = "Password",
  description,
  errorText,
  required,
  placeholder,
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
      <InputPassword
        placeholder={placeholder}
        value={value}
        className={className}
        onChange={onChange}
      />
    </FieldWrapper>
  );
};
