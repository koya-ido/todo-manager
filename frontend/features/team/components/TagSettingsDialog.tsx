import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { Tag } from "@/features/userSetting/types";
import { FC } from "react";

type TagSettingsDialogProps = {
  selectedTag: Tag | null;
  onClose: () => void;
  editingTagName: string;
  setEditingTagName: (name: string) => void;
  isUpdatingTag: boolean;
  onUpdateTag: () => void;
  deletingTagId: number | null;
  onDeleteTag: (tagId: number) => void;
  messages: Record<string, string>;
};

export const TagSettingsDialog: FC<TagSettingsDialogProps> = ({
  selectedTag,
  onClose,
  editingTagName,
  setEditingTagName,
  isUpdatingTag,
  onUpdateTag,
  deletingTagId,
  onDeleteTag,
  messages,
}) => {
  return (
    <Dialog
      open={selectedTag !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {messages["team.detail.tags.dialog.title"]}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-slate-500 dark:text-slate-400 my-2">
          {messages["team.detail.tags.dialog.description"]}
        </DialogDescription>
        <div className="flex items-center gap-2 my-2">
          <Input
            placeholder={messages["team.detail.tags.placeholder"]}
            value={editingTagName}
            onChange={(e) => setEditingTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onUpdateTag();
            }}
          />
          <Button
            disabled={!editingTagName.trim() || isUpdatingTag}
            onClick={onUpdateTag}
          >
            {messages["team.detail.tags.dialog.update"]}
          </Button>
        </div>
        <DialogFooter className="flex w-full gap-2 mt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={onClose}
          >
            {messages["team.detail.tags.dialog.cancel"]}
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            disabled={!selectedTag || deletingTagId === selectedTag.id}
            onClick={() => {
              if (selectedTag) {
                onDeleteTag(selectedTag.id);
              }
            }}
          >
            {messages["team.detail.tags.dialog.delete"]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
