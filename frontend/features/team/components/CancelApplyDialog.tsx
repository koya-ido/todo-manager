"use client";

import { Button } from "@/components/forms/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { Loader2, XCircle } from "lucide-react";
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
    <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={!isSubmittingCancel} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500" />
            {messages["team.cancel-dialog.title"]}
          </DialogTitle>
          <DialogDescription>
            {(
              messages["team.cancel-dialog.description"]
            ).replace("{name}", cancelTarget?.name || "")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmittingCancel}>
            {messages["team.cancel-dialog.cancel-button"]}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmittingCancel}
            className="flex items-center gap-1.5"
          >
            {isSubmittingCancel ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {messages["team.cancel-dialog.confirm-button"]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
