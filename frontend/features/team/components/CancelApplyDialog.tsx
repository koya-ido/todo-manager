"use client";

import { ConfirmDialog } from "@/components/Layout/Dialog";
import { XCircle } from "lucide-react";
import { FC } from "react";

type CancelApplyDialogProps = {
  cancelTarget: { id: number; name: string } | null;
  onClose: () => void;
  isSubmittingCancel: boolean;
  onConfirm: () => void;
  messages: Record<string, string>;
}

export const CancelApplyDialog: FC<CancelApplyDialogProps> = ({
  cancelTarget,
  onClose,
  isSubmittingCancel,
  onConfirm,
  messages,
}) => {
  return (
    <ConfirmDialog
      isOpen={!!cancelTarget}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={
        <>
          <XCircle className="w-5 h-5 text-rose-500" />
          {messages["team.cancel-dialog.title"]}
        </>
      }
      description={(
        messages["team.cancel-dialog.description"]
      ).replace("{name}", cancelTarget?.name || "")}
      confirmText={
        <>
          {!isSubmittingCancel && <XCircle className="w-4 h-4" />}
          {messages["team.cancel-dialog.confirm-button"]}
        </>
      }
      cancelText={messages["common.cancel"]}
      onConfirm={onConfirm}
      onCancel={onClose}
      isConfirmDisabled={isSubmittingCancel}
      isSubmitting={isSubmittingCancel}
      showCloseButton={true}
    />
  );
};
