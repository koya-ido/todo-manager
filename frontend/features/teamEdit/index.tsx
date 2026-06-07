"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { Button } from "@/components/forms/Button";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { PasswordField } from "@/components/forms/FieldWrapper/components/PasswordField";
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
import { Heading } from "@/components/typography/Heading";
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
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-28 space-y-6 max-w-2xl mx-auto">
      {/* Title Header */}
      <section className="space-y-1 py-2">
        <Heading level={1} className="text-2xl font-bold flex items-center gap-2">
          {isNew ? <Plus className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
          {isNew ? messages["team-edit.heading.register"] : messages["team-edit.heading.edit"]}
        </Heading>
        <p className="text-sm text-muted-foreground">
          {messages["team-edit.description"]}
        </p>
      </section>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card className="p-6 rounded-xl border bg-card space-y-6">
          {/* Team Name */}
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



          {/* Team Password */}
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

          {/* Confirm Team Password (only validated if password is typed) */}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitDisabled || isSubmitting}
          className="w-full text-white font-bold py-3 px-6 shadow-md flex items-center justify-center gap-2"
        >
          {isNew ? (
            <>
              <Plus className="h-5 w-5" />
              {messages["common.register"]}
            </>
          ) : (
            messages["todo-edit.update"]
          )}
        </Button>
      </form>

      {/* Discard confirmation Dialog */}
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
    </div>
  );
};
