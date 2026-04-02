"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { Button } from "@/components/forms/Button";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { PasswordField } from "@/components/forms/FieldWrapper/components/PasswordField";
import { Card } from "@/components/Layout/Card";
import { useLogin } from "@/features/login/hooks/useLogin";
import { useRouter } from "next/navigation";
import { SubmitEvent, useContext, useState } from "react";

type LoginFormProps = {
  messages: Record<string, string>;
};

export const LoginForm = ({ messages }: LoginFormProps) => {
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const { handleLogin } = useLogin();

  const { getInlineError, setErrorResponse } = useContext(ErrorContext);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await handleLogin(userId, password);
    } catch (error: unknown) {
      return setErrorResponse(error);
    }

    // ログイン成功後のリダイレクト
    router.push("/home");
  };

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        suppressHydrationWarning
        className="w-full flex flex-col justify-center items-center gap-8"
      >
        <div className="flex flex-col w-full gap-2 justify-center items-center">
          <InputField
            label="ID"
            placeholder="ID"
            type="text"
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <div className="pb-3.75" />
          <PasswordField
            label={messages["login.password"]}
            placeholder={messages["login.password"]}
            type="password"
            required
            className="h-6.25 bg-background"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="pb-3.75" />
          <div aria-label="validation-message-aria" className="h-5">
            {getInlineError("login-form") && (
              <p className="text-sm text-destructive">
                {getInlineError("login-form")}
              </p>
            )}
          </div>
        </div>
        <Button type="submit">{messages["login.sign-in"]}</Button>
      </form>
    </Card>
  );
};
