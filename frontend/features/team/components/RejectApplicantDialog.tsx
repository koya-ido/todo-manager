import { Button } from "@/components/forms/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
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
    <Dialog
      open={rejectTarget !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {messages["team.detail.applicants.reject-dialog.title"]}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-slate-500 dark:text-slate-400 my-2">
          {messages["team.detail.applicants.reject-dialog.description"]?.replace(
            "{name}",
            rejectTarget?.user_name || ""
          )}
        </DialogDescription>
        <DialogFooter className="flex w-full gap-2 mt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {messages["common.cancel"]}
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {messages["team.detail.applicants.reject-dialog.confirm"]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
