import { Checkbox } from "@/components/forms/Checkbox";
import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { FieldWrapperProps } from "@/components/forms/FieldWrapper/types";
import { ComponentProps, FC } from "react";

export type CheckboxFieldProps = Omit<FieldWrapperProps, "children"> &
  ComponentProps<typeof Checkbox>;

/**
 * アプリから呼び出すチェックボックス入力コンポーネント（フィールドラッパー付き）
 * @returns チェックボックス入力コンポーネント
 */
export const CheckboxField: FC<CheckboxFieldProps> = ({
  label = "Label",
  description,
  errorText,
  required,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  ...props
}) => {
  return (
    <FieldWrapper
      label={label}
      required={required}
      description={description}
      errorText={errorText}
    >
      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          {...props}
        />
      </div>
    </FieldWrapper>
  );
};
