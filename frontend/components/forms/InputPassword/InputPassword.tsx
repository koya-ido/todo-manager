import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/forms/InputGroup";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { FC, useMemo, useState } from "react";

export type InputPasswordProps = React.ComponentProps<"input">;

/**
 * パスワード入力用テキストボックスコンポーネント
 * @returns パスワード入力用テキストボックス
 */
const InputPassword: FC<InputPasswordProps> = ({
  id = "inline-end-input",
  placeholder = "Enter password",
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const inputType: "text" | "password" = useMemo(() => {
    return showPassword ? "text" : "password";
  }, [showPassword]);

  return (
    <InputGroup className={className}>
      <InputGroupInput
        id={id}
        type={inputType}
        placeholder={placeholder}
        {...props}
      />
      <InputGroupAddon align="inline-end" className="py-0">
        <InputGroupButton
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showPassword ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export { InputPassword };
