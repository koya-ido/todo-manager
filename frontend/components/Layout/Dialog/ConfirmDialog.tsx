"use client";

import { Button } from "@/components/forms/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog/Dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { FC, ReactNode } from "react";

export type ConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmText: ReactNode;
  cancelText: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isConfirmDisabled?: boolean;
  isSubmitting?: boolean;
  variant?: "destructive" | "default" | "secondary" | "outline" | "ghost" | "link";
  showCloseButton?: boolean;
  buttonLayout?: "horizontal" | "vertical";
};

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isConfirmDisabled = false,
  isSubmitting = false,
  variant = "destructive",
  showCloseButton = false,
  buttonLayout = "horizontal",
}) => {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const isVertical = buttonLayout === "vertical";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={showCloseButton && !isSubmitting}>
        <DialogHeader>
          <DialogTitle className={cn(
            "flex items-center gap-2 text-md font-semibold",
            isVertical ? "justify-center" : "justify-start"
          )}>
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className={cn(
          "py-2 text-sm text-slate-500 dark:text-slate-400",
          isVertical ? "text-center" : "text-left"
        )}>
          {description}
        </DialogDescription>
        <DialogFooter className="mt-4">
          <div className={cn("w-full flex gap-2", isVertical ? "flex-col" : "flex-row")}>
            {isVertical ? (
              <>
                <Button
                  variant={variant}
                  className="w-full text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                  disabled={isConfirmDisabled || isSubmitting}
                  onClick={onConfirm}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {confirmText}
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-sm font-semibold cursor-pointer"
                  disabled={isSubmitting}
                  onClick={handleCancel}
                >
                  {cancelText}
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={handleCancel}
                >
                  {cancelText}
                </Button>
                <Button
                  className="flex-1 flex items-center justify-center gap-1.5"
                  variant={variant}
                  disabled={isConfirmDisabled || isSubmitting}
                  onClick={onConfirm}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {confirmText}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
