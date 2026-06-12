import { Button } from "@/components/forms/Button";
import { PageContainer, PageHeader } from "@/components/Layout";
import { Card } from "@/components/Layout/Card";
import { UserFormFields } from "@/features/user/components/UserFormFields";
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
  isSubmitDisabled,
  handleSubmit,
  getInlineError,
}) => {
  return (
    <PageContainer className="max-w-3xl mx-auto">
      <PageHeader
        title={messages["user-edit.heading"]}
        description={messages["user-edit.description"]}
      />

      <Card>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6"
          noValidate
        >
          <UserFormFields
            messages={messages}
            userName={userName}
            setUserName={setUserName}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isCheckingUsername={isCheckingUsername}
            isAvailable={isAvailable}
            getInlineError={getInlineError}
          />

          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-3"
          >
            {messages["user-edit.update"]}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
};
