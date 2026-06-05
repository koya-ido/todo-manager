import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { FieldWrapperProps } from "@/components/forms/FieldWrapper/types";
import { InputProps } from "@/components/forms/Input/types";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/forms/InputGroup";
import { FC, ReactNode } from "react";

/**
 * アプリから呼び出すテキスト入力コンポーネント
 * @returns テキスト入力コンポーネント
 */
export const InputGroupField: FC<
  FieldWrapperProps &
    InputProps & { label?: string; leftItem?: ReactNode; rightItem?: ReactNode }
> = ({
  type,
  label = "Label",
  description,
  errorText,
  placeholder,
  required,
  value,
  onChange,
  leftItem,
  rightItem,
}) => {
  return (
    <FieldWrapper
      label={label}
      required={required}
      description={description}
      errorText={errorText}
    >
      <InputGroup>
        {leftItem && <InputGroupAddon>{leftItem}</InputGroupAddon>}
        <InputGroupInput
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {rightItem && <InputGroupAddon>{rightItem}</InputGroupAddon>}
      </InputGroup>
    </FieldWrapper>
  );
};
