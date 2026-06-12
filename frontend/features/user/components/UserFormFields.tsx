import { PasswordFormFields } from "@/components/features/PasswordFormFields";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { LabelWithIcon } from "@/components/Layout/LabelWithIcon/LabelWithIcon";
import { useUserValidation } from "@/hooks/useUserValidation";
import { Circle, CircleCheck } from "lucide-react";
import { FC } from "react";

type UserFormFieldsProps = {
  messages: Record<string, string>;
  userName: string;
  setUserName: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isCheckingUsername?: boolean;
  isAvailable?: boolean;
  getInlineError: (pointer: string) => string | null;
};

export const UserFormFields: FC<UserFormFieldsProps> = ({
  messages,
  userName,
  setUserName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isCheckingUsername,
  isAvailable,
  getInlineError,
}) => {
  const {
    isUserName5CharactersOrMoreAnd30CharactersOrLess,
    isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
  } = useUserValidation(userName, "", "");

  const userNameChecklist = [
    {
      isValid: isUserName5CharactersOrMoreAnd30CharactersOrLess,
      message: messages["common.username.checklist-1"],
    },
    {
      isValid: isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
      message: messages["common.username.checklist-2"],
    },
    ...(isAvailable !== undefined && isCheckingUsername !== undefined
      ? [
          {
            isValid: isAvailable && !isCheckingUsername,
            message: messages["common.username.checklist-3"],
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="flex flex-col w-full gap-2">
        <InputField
          label={messages["common.label.username"]}
          placeholder={messages["common.label.username"]}
          type="text"
          required
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          errorText={getInlineError("/username") || undefined}
        />
        <div className="w-full flex flex-col gap-2">
          {userNameChecklist.map((check, index) => (
            <LabelWithIcon
              key={index}
              icon={
                check.isValid ? (
                  <CircleCheck size={12} color="#35B820" />
                ) : (
                  <Circle size={12} color="#888888" />
                )
              }
              label={check.message}
              className={check.isValid ? "text-[#35B820]" : "text-[#888888]"}
            />
          ))}
        </div>
      </div>

      <PasswordFormFields
        messages={messages}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        getInlineError={getInlineError}
      />
    </>
  );
};
