import { Button } from "@/components/forms/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {messages["team.detail.settings.delete-dialog.title"]}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-slate-500 dark:text-slate-400 my-2">
          {messages["team.detail.settings.delete-dialog.description"]?.replace(
            "{name}",
            teamName
          )}
        </DialogDescription>
        <DialogFooter className="flex w-full gap-2 mt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {messages["team.detail.settings.delete-dialog.cancel"]}
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {messages["team.detail.settings.delete-dialog.confirm"]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
