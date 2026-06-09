import { ConfirmDialog } from "@/components/Layout/Dialog";
import { FC } from "react";

type DeleteTeamDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  messages: Record<string, string>;
};

export const DeleteTeamDialog: FC<DeleteTeamDialogProps> = ({
  isOpen,
  onOpenChange,
  teamName,
  isDeleting,
  onConfirm,
  messages,
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={messages["team.detail.settings.delete-dialog.title"]}
      description={messages["team.detail.settings.delete-dialog.description"]?.replace(
        "{name}",
        teamName
      )}
      confirmText={messages["common.delete.verb"]}
      cancelText={messages["common.cancel"]}
      isConfirmDisabled={isDeleting}
      isSubmitting={isDeleting}
      onConfirm={onConfirm}
    />
  );
};
