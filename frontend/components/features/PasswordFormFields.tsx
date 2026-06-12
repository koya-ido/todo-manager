import { PasswordField } from "@/components/forms/FieldWrapper/components/PasswordField";
import { LabelWithIcon } from "@/components/Layout/LabelWithIcon/LabelWithIcon";
import { useUserValidation } from "@/hooks/useUserValidation";
import { Circle, CircleCheck } from "lucide-react";
import { FC } from "react";

type PasswordFormFieldsProps = {
  messages: Record<string, string>;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isNew?: boolean;
  isTeamMode?: boolean;
  getInlineError?: (pointer: string) => string | null;
  fieldErrors?: {
    password?: string;
    confirmPassword?: string;
  };
};

export const PasswordFormFields: FC<PasswordFormFieldsProps> = ({
  messages,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isNew = false,
  isTeamMode = false,
  getInlineError,
  fieldErrors,
}) => {
  const {
    isPassword8CharactersOrMore,
    isPasswordOnlyHalfWidth,
    isPasswordIncludesUppercaseLetter,
    isPasswordIncludesLowercaseLetter,
    isPasswordIncludesNumber,
    isPasswordIncludesSymbol,
    isConfirmPasswordMatchesPassword,
  } = useUserValidation("", password, confirmPassword);

  const passwordChecklist = isTeamMode
    ? [
        {
          isValid: isPassword8CharactersOrMore,
          message: messages["common.password.checklist-1"],
        },
      ]
    : [
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

  const isConfirmPasswordMatches = isTeamMode
    ? confirmPassword.length > 0 && password === confirmPassword
    : isConfirmPasswordMatchesPassword;

  const confirmPasswordChecklist = [
    {
      isValid: isConfirmPasswordMatches,
      message: messages["common.confirm-password.checklist-1"],
    },
  ];

  const inlinePasswordError = getInlineError?.("/password") || fieldErrors?.password;
  const inlineConfirmPasswordError = getInlineError?.("/confirmPassword") || fieldErrors?.confirmPassword;

  const checkIconColor = isTeamMode ? undefined : "#35B820";
  const uncheckedIconColor = isTeamMode ? undefined : "#888888";
  const checkIconClass = isTeamMode ? "text-green-500" : undefined;
  const uncheckedIconClass = isTeamMode ? "text-muted-foreground/50" : undefined;

  const checkTextClass = isTeamMode
    ? "text-green-600 dark:text-green-400 font-semibold"
    : "text-[#35B820]";
  const uncheckedTextClass = isTeamMode
    ? "text-muted-foreground"
    : "text-[#888888]";

  return (
    <>
      <div className="w-full space-y-2">
        <PasswordField
          label={
            isTeamMode
              ? messages["team.search-result.password-placeholder"]
              : messages["common.label.password"]
          }
          placeholder={
            isTeamMode
              ? isNew
                ? messages["team.search-result.password-placeholder"]
                : messages["team-edit.password.placeholder.edit"]
              : messages["common.label.password"]
          }
          required={!isTeamMode || isNew}
          className="w-full bg-background"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          errorText={inlinePasswordError || undefined}
        />
        {(!isTeamMode || password) && (
          <div className="w-full flex flex-col gap-2 pt-1">
            {passwordChecklist.map((check, index) => (
              <LabelWithIcon
                key={index}
                icon={
                  check.isValid ? (
                    <CircleCheck size={12} className={checkIconClass} color={checkIconColor} />
                  ) : (
                    <Circle size={12} className={uncheckedIconClass} color={uncheckedIconColor} />
                  )
                }
                label={check.message}
                className={check.isValid ? checkTextClass : uncheckedTextClass}
              />
            ))}
          </div>
        )}
      </div>

      {(!isTeamMode || password || isNew) && (
        <div className="w-full space-y-2">
          <PasswordField
            label={messages["common.label.confirm-password"]}
            placeholder={messages["common.label.confirm-password"]}
            required={!isTeamMode || isNew || !!password}
            className="w-full bg-background"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            errorText={inlineConfirmPasswordError || undefined}
          />
          {(!isTeamMode || confirmPassword) && (
            <div className="w-full flex flex-col gap-2 pt-1">
              {confirmPasswordChecklist.map((check, index) => (
                <LabelWithIcon
                  key={index}
                  icon={
                    check.isValid ? (
                      <CircleCheck size={12} className={checkIconClass} color={checkIconColor} />
                    ) : (
                      <Circle size={12} className={uncheckedIconClass} color={uncheckedIconColor} />
                    )
                  }
                  label={check.message}
                  className={check.isValid ? checkTextClass : uncheckedTextClass}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
