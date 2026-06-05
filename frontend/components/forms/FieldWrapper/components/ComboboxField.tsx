import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/forms/Combobox";
import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { FieldWrapperProps } from "@/components/forms/FieldWrapper/types";
import * as React from "react";

export type ComboboxFieldProps = FieldWrapperProps & {
  items: string[];
  value: string | string[] | null;
  defaultValue?: string | string[];
  onValueChange: (value: string | string[] | null) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

export const ComboboxField: React.FC<ComboboxFieldProps> = ({
  label,
  required,
  description,
  errorText,
  items,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  placeholder,
  disabled,
}) => {
  const chipsRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <FieldWrapper
      label={label}
      required={required}
      description={description}
      errorText={errorText}
    >
      <Combobox
        multiple={multiple}
        items={items}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        {multiple ? (
          <ComboboxChips ref={chipsRef} className="w-full">
            <ComboboxValue>
              {(selectedValues: string[]) => (
                <React.Fragment>
                  {selectedValues.map((val) => (
                    <ComboboxChip key={val} showRemove={selectedValues.length > 1}>
                      {val}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={selectedValues.length === 0 ? placeholder : ""}
                    disabled={disabled}
                  />
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
        ) : (
          <ComboboxInput
            ref={inputRef}
            placeholder={placeholder}
            showClear={!!value}
            disabled={disabled}
          />
        )}
        <ComboboxContent anchor={multiple ? chipsRef : inputRef}>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FieldWrapper>
  );
};
