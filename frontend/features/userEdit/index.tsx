"use client";

import { UserEditForm } from "@/features/userEdit/components/UserEditForm";
import { UserEditSkeleton } from "@/features/userEdit/components/UserEditSkeleton";
import { useUserEdit } from "@/features/userEdit/hooks/useUserEdit";
import { ContentProps } from "@/types/contentTypes";
import { FC } from "react";

export const Content: FC<ContentProps> = ({ messages }) => {
  const userEditState = useUserEdit({ messages });

  if (userEditState.isLoading) {
    return <UserEditSkeleton />;
  }

  return (
    <UserEditForm
      messages={messages}
      userName={userEditState.userName}
      setUserName={userEditState.setUserName}
      password={userEditState.password}
      setPassword={userEditState.setPassword}
      confirmPassword={userEditState.confirmPassword}
      setConfirmPassword={userEditState.setConfirmPassword}
      isCheckingUsername={userEditState.isCheckingUsername}
      isAvailable={userEditState.isAvailable}
      isSubmitDisabled={userEditState.isSubmitDisabled}
      handleSubmit={userEditState.handleSubmit}
      getInlineError={userEditState.getInlineError}
    />
  );
};
