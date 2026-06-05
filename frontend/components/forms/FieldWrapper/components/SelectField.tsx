import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { FieldWrapperProps } from "@/components/forms/FieldWrapper/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/forms/Select";
import { ComponentProps, FC } from "react";

/**
 * アプリから呼び出すセレクトコンポーネント
 * @returns セレクトコンポーネント
 */
export const SelectField: FC<
  FieldWrapperProps & ComponentProps<typeof Select> & ComponentProps<typeof SelectValue> & {
    label?: string,
    items: string[] | { value: string; label: string }[]
  }
> = ({
  label = "Label",
  description,
  errorText,
  required,
  value,
  items,
  placeholder,
  defaultValue,
  onValueChange,
}) => {
    return (
      <FieldWrapper
        label={label}
        required={required}
        description={description}
        errorText={errorText}
      >
        <Select
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map((item) => {
                const itemValue = typeof item === "string" ? item : item.value;
                const itemLabel = typeof item === "string" ? item : item.label;
                return (
                  <SelectItem key={itemValue} value={itemValue}>
                    {itemLabel}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FieldWrapper>
    );
  };
