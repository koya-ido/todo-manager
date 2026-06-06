import { DatePicker } from "@/components/forms/DatePicker"
import { FieldWrapper } from "@/components/forms/FieldWrapper"
import { FieldWrapperProps } from "@/components/forms/FieldWrapper/types"
import { format, parseISO } from "date-fns"
import { FC } from "react"

/**
 * アプリから呼び出す日付入力コンポーネント
 * @returns 日付入力コンポーネント
 */
export const DateField: FC<
  Omit<FieldWrapperProps, "children"> & {
    value?: string
    /* eslint-disable no-unused-vars */
    onChange?: (value: string) => void
    /* eslint-enable no-unused-vars */
    placeholder?: string
    disabled?: boolean
  }
> = ({
  label = "Label",
  description,
  errorText,
  required,
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  const parsedDate = value ? parseISO(value) : undefined
  const dateValue = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : undefined

  const handleDateChange = (date: Date | undefined) => {
    if (onChange) {
      if (date && !isNaN(date.getTime())) {
        onChange(format(date, "yyyy-MM-dd"))
      } else {
        onChange("")
      }
    }
  }

  return (
    <FieldWrapper
      label={label}
      required={required}
      description={description}
      errorText={errorText}
    >
      <DatePicker
        value={dateValue}
        onChange={handleDateChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </FieldWrapper>
  )
}
