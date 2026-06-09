import { ConfirmDialog } from "@/components/Layout/Dialog";
import { TeamMemberResponse } from "@/features/team/types";
import { FC } from "react";

type KickMemberDialogProps = {
  kickTarget: TeamMemberResponse | null;
  onClose: () => void;
  isSubmitting: boolean;
  onConfirm: () => void;
  messages: Record<string, string>;
};

export const KickMemberDialog: FC<KickMemberDialogProps> = ({
  kickTarget,
  onClose,
  isSubmitting,
  onConfirm,
  messages,
}) => {
  return (
    <ConfirmDialog
      isOpen={kickTarget !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={messages["team.detail.members.kick-dialog.title"]}
      description={messages["team.detail.members.kick-dialog.description"]?.replace(
        "{name}",
        kickTarget?.user_name || ""
      )}
      confirmText={messages["team.detail.members.kick-dialog.confirm"]}
      cancelText={messages["common.cancel"]}
      onConfirm={onConfirm}
      onCancel={onClose}
      isConfirmDisabled={isSubmitting}
      isSubmitting={isSubmitting}
    />
  );
};
