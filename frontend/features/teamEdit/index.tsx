"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { Button } from "@/components/forms/Button";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { PasswordField } from "@/components/forms/FieldWrapper/components/PasswordField";
import { PageContainer, PageHeader } from "@/components/Layout";
import { Card } from "@/components/Layout/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { LabelWithIcon } from "@/components/Layout/LabelWithIcon/LabelWithIcon";
import { Skeleton } from "@/components/Layout/Skeleton";
import { useTeamForm } from "@/features/teamEdit/hooks/useTeamForm";
import { TeamEditProps } from "@/features/teamEdit/types";
import { Circle, CircleCheck, Plus, Settings, TriangleAlert } from "lucide-react";
import { FC, useContext, useMemo } from "react";

export const Content: FC<TeamEditProps> = ({ isNew = false, teamId, messages }) => {
  const { getInlineError } = useContext(ErrorContext);
  const {
    name,
    password,
    confirmPassword,
    isLoading,
    isSubmitting,
    showDiscardDialog,
    setShowDiscardDialog,
    fieldErrors,
    handleNameChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    isSubmitDisabled,
    handleConfirmDiscard,
    handleCancelDiscard,
  } = useTeamForm({
    isNew,
    teamId,
    messages,
  });

  const isPasswordLengthValid = useMemo(() => {
    return password.length >= 8;
  }, [password]);

  const isConfirmPasswordMatches = useMemo(() => {
    return confirmPassword.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  const passwordChecklist = [
    {
      isValid: isPasswordLengthValid,
      message: messages["common.password.checklist-1"],
    },
  ];

  const confirmPasswordChecklist = [
    {
      isValid: isConfirmPasswordMatches,
      message: messages["common.confirm-password.checklist-1"],
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full pb-28 space-y-6 max-w-2xl mx-auto animate-pulse">
        {/* タイトルヘッダーのスケルトン */}
        <div className="space-y-2 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* メインフォームのスケルトン */}
        <Card className="p-6 rounded-xl border bg-card space-y-6">
          {/* チーム名フィールド */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* チームパスワードフィールド */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* パスワード確認用フィールド */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>

        {/* 送信ボタンのスケルトン */}
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    );
  }

  return (
    <PageContainer>
      {/* タイトルヘッダー */}
      <PageHeader
        title={
          <>
            {isNew ? <Plus className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
            {isNew ? messages["team-edit.heading.register"] : messages["team-edit.heading.edit"]}
          </>
        }
        description={messages["team-edit.description"]}
      />

      {/* メインフォーム */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card className="p-6 rounded-xl border bg-card space-y-6">
          {/* チーム名 */}
          <InputField
            label={messages["team.detail.info.name"]}
            placeholder={messages["team.detail.info.name"]}
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full font-sans bg-background"
            errorText={fieldErrors.name || getInlineError("/name") || undefined}
          />



          {/* チームパスワード */}
          <div className="space-y-2">
            <PasswordField
              label={messages["team.search-result.password-placeholder"]}
              placeholder={
                isNew
                  ? messages["team.search-result.password-placeholder"]
                  : messages["team-edit.password.placeholder.edit"]
              }
              required={isNew}
              className="w-full bg-background"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              errorText={fieldErrors.password || getInlineError("/password") || undefined}
            />
            {password && (
              <div className="w-full flex flex-col gap-2 pt-1">
                {passwordChecklist.map((check, index) => (
                  <LabelWithIcon
                    key={index}
                    icon={
                      check.isValid ? (
                        <CircleCheck size={12} className="text-green-500" />
                      ) : (
                        <Circle size={12} className="text-muted-foreground/50" />
                      )
                    }
                    label={check.message}
                    className={
                      check.isValid ? "text-green-600 dark:text-green-400 font-semibold" : "text-muted-foreground"
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* パスワード確認用（パスワードが入力された場合のみ検証される） */}
          {(password || isNew) && (
            <div className="space-y-2">
              <PasswordField
                label={messages["common.label.confirm-password"]}
                placeholder={messages["common.label.confirm-password"]}
                required={isNew || !!password}
                className="w-full bg-background"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                errorText={fieldErrors.confirmPassword || getInlineError("/confirmPassword") || undefined}
              />
              {confirmPassword && (
                <div className="w-full flex flex-col gap-2 pt-1">
                  {confirmPasswordChecklist.map((check, index) => (
                    <LabelWithIcon
                      key={index}
                      icon={
                        check.isValid ? (
                          <CircleCheck size={12} className="text-green-500" />
                        ) : (
                          <Circle size={12} className="text-muted-foreground/50" />
                        )
                      }
                      label={check.message}
                      className={
                        check.isValid ? "text-green-600 dark:text-green-400 font-semibold" : "text-muted-foreground"
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* 送信ボタン */}
        <Button
          type="submit"
          disabled={isSubmitDisabled || isSubmitting}
          className="w-full font-bold py-3 px-6 shadow-md flex items-center justify-center gap-2"
        >
          {isNew ? (
            <>
              <Plus className="h-5 w-5" />
              {messages["common.register"]}
            </>
          ) : (
            messages["common.update"]
          )}
        </Button>
      </form>

      {/* 破棄確認ダイアログ */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center justify-center gap-2">
              <TriangleAlert size={24} className="text-destructive" />
              {messages["todo-edit.confirm-discard.title"]}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center py-2">
            {messages["todo-edit.confirm-discard.description"]}
          </DialogDescription>
          <DialogFooter>
            <div className="w-full flex flex-col gap-2">
              <Button
                variant="destructive"
                className="w-full font-bold"
                onClick={handleConfirmDiscard}
              >
                {messages["todo-edit.confirm-discard.confirm"]}
              </Button>
              <Button
                variant="outline"
                className="w-full font-bold"
                onClick={handleCancelDiscard}
              >
                {messages["todo-edit.confirm-discard.cancel"]}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};
