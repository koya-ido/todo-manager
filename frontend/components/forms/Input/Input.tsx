import { FieldWrapperContext } from "@/components/forms/FieldWrapper";
import { InputProps } from "@/components/forms/Input/types";
import { cn } from "@/lib/utils";
import { useContext } from "react";

/**
 * Shadcn UI の Inputコンポーネント
 * @param type インプットタイプ
 * @param disabled 非活性化
 * @returns input要素
 */
export const Input = ({ className, type, disabled, ...props }: InputProps) => {
  const { required, isError } = useContext(FieldWrapperContext);
  return (
    <input
      data-slot="input"
      type={type}
      required={required}
      suppressHydrationWarning
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-6.25 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      aria-invalid={isError}
      disabled={disabled}
      {...props}
    />
  );
};
