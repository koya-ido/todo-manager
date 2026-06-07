import { Button } from "@/components/forms/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
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
    <Dialog
      open={kickTarget !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {messages["team.detail.members.kick-dialog.title"]}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-slate-500 dark:text-slate-400 my-2">
          {messages["team.detail.members.kick-dialog.description"]?.replace(
            "{name}",
            kickTarget?.user_name || ""
          )}
        </DialogDescription>
        <DialogFooter className="flex w-full gap-2 mt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {messages["team.detail.members.kick-dialog.cancel"]}
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {messages["team.detail.members.kick-dialog.confirm"]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
