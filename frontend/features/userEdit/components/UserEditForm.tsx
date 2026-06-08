import { Button } from "@/components/forms/Button";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { PasswordField } from "@/components/forms/FieldWrapper/components/PasswordField";
import { Card } from "@/components/Layout/Card";
import { LabelWithIcon } from "@/components/Layout/LabelWithIcon/LabelWithIcon";
import { Heading } from "@/components/typography/Heading";
import { Circle, CircleCheck } from "lucide-react";
import { FC, FormEvent } from "react";

type UserEditFormProps = {
  messages: Record<string, string>;
  userName: string;
  setUserName: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isCheckingUsername: boolean;
  isAvailable: boolean;
  isUserName5CharactersOrMoreAnd30CharactersOrLess: boolean;
  isUserNameOnlyHalfWidthAlphanumericAndUnderscore: boolean;
  isPassword8CharactersOrMore: boolean;
  isPasswordOnlyHalfWidth: boolean;
  isPasswordIncludesUppercaseLetter: boolean;
  isPasswordIncludesLowercaseLetter: boolean;
  isPasswordIncludesNumber: boolean;
  isPasswordIncludesSymbol: boolean;
  isConfirmPasswordMatchesPassword: boolean;
  isSubmitDisabled: boolean;
  handleSubmit: (event: FormEvent) => void;
  getInlineError: (pointer: string) => string | null;
};

export const UserEditForm: FC<UserEditFormProps> = ({
  messages,
  userName,
  setUserName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isCheckingUsername,
  isAvailable,
  isUserName5CharactersOrMoreAnd30CharactersOrLess,
  isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
  isPassword8CharactersOrMore,
  isPasswordOnlyHalfWidth,
  isPasswordIncludesUppercaseLetter,
  isPasswordIncludesLowercaseLetter,
  isPasswordIncludesNumber,
  isPasswordIncludesSymbol,
  isConfirmPasswordMatchesPassword,
  isSubmitDisabled,
  handleSubmit,
  getInlineError,
}) => {
  const userNameChecklist = [
    {
      isValid: isUserName5CharactersOrMoreAnd30CharactersOrLess,
      message: messages["common.username.checklist-1"],
    },
    {
      isValid: isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
      message: messages["common.username.checklist-2"],
    },
    {
      isValid: isAvailable && !isCheckingUsername,
      message: messages["common.username.checklist-3"] || "使用可能",
    },
  ];

  const passwordChecklist = [
    {
      isValid: isPassword8CharactersOrMore,
      message: messages["common.password.checklist-1"],
    },
    {
      isValid: isPasswordOnlyHalfWidth,
      message: messages["common.password.checklist-2"],
    },
    {
      isValid: isPasswordIncludesUppercaseLetter,
      message: messages["common.password.checklist-3"],
    },
    {
      isValid: isPasswordIncludesLowercaseLetter,
      message: messages["common.password.checklist-4"],
    },
    {
      isValid: isPasswordIncludesNumber,
      message: messages["common.password.checklist-5"],
    },
    {
      isValid: isPasswordIncludesSymbol,
      message: messages["common.password.checklist-6"],
    },
  ];

  const confirmPasswordChecklist = [
    {
      isValid: isConfirmPasswordMatchesPassword,
      message: messages["common.confirm-password.checklist-1"],
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-1 py-2">
        <Heading level={1} className="text-2xl font-bold">
          {messages["user-edit.heading"]}
        </Heading>
        <Heading level={2} className="text-muted-foreground text-sm font-medium">
          {messages["user-edit.description"]}
        </Heading>
      </div>

      <Card>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6"
          noValidate
        >
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
                  className={
                    check.isValid ? "text-[#35B820]" : "text-[#888888]"
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full gap-2">
            <PasswordField
              label={messages["common.label.password"]}
              placeholder={messages["common.label.password"]}
              type="password"
              required
              className="h-6.25 bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errorText={getInlineError("/password") || undefined}
            />
            <div className="w-full flex flex-col gap-2">
              {passwordChecklist.map((check, index) => (
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
                  className={
                    check.isValid ? "text-[#35B820]" : "text-[#888888]"
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full gap-2">
            <PasswordField
              label={messages["common.label.confirm-password"]}
              placeholder={messages["common.label.confirm-password"]}
              type="password"
              required
              className="h-6.25 bg-background"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="w-full">
              {confirmPasswordChecklist.map((check, index) => (
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
                  className={
                    check.isValid ? "text-[#35B820]" : "text-[#888888]"
                  }
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-3"
          >
            {messages["user-edit.update"]}
          </Button>
        </form>
      </Card>
    </div>
  );
};
