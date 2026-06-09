import { ConfirmDialog } from "@/components/Layout/Dialog";
import { TeamApplicantResponse } from "@/features/team/types";
import { FC } from "react";

type RejectApplicantDialogProps = {
  rejectTarget: TeamApplicantResponse | null;
  onClose: () => void;
  isSubmitting: boolean;
  onConfirm: () => void;
  messages: Record<string, string>;
};

export const RejectApplicantDialog: FC<RejectApplicantDialogProps> = ({
  rejectTarget,
  onClose,
  isSubmitting,
  onConfirm,
  messages,
}) => {
  return (
    <ConfirmDialog
      isOpen={rejectTarget !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={messages["team.detail.applicants.reject-dialog.title"]}
      description={messages["team.detail.applicants.reject-dialog.description"]?.replace(
        "{name}",
        rejectTarget?.user_name || ""
      )}
      confirmText={messages["team.detail.applicants.reject-dialog.confirm"]}
      cancelText={messages["common.cancel"]}
      onConfirm={onConfirm}
      onCancel={onClose}
      isConfirmDisabled={isSubmitting}
      isSubmitting={isSubmitting}
    />
  );
};
