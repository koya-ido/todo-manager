"use client";

import { PageContainer, PageHeader } from "@/components/Layout";
import { TagBadge } from "@/components/Layout/Badge";
import { Card } from "@/components/Layout/Card";
import {
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { ToggleGroup, ToggleGroupItem } from "@/components/forms/ToggleGroup";
import { Heading } from "@/components/typography/Heading";
import { useLocaleSetting } from "@/features/userSetting/hooks/useLocaleSetting";
import { useTags } from "@/features/userSetting/hooks/useTags";
import { ContentProps } from "@/types/contentTypes";
import { AlertCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { FC, useState } from "react";

type UserSettingProps = ContentProps;

export const Content: FC<UserSettingProps> = ({ messages }) => {
  const { setTheme, theme } = useTheme();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const { locale, handleLocaleChange } = useLocaleSetting();
  const {
    deletingTagId,
    editingTagName,
    handleCloseTagDialog,
    handleCreateTag,
    handleDeleteTag,
    handleOpenTagDialog,
    handleUpdateTag,
    isSubmittingTag,
    isUpdatingTag,
    newTag,
    selectedTag,
    setEditingTagName,
    setNewTag,
    tags,
  } = useTags();

  return (
    <PageContainer>
      <PageHeader
        title={messages["user-setting.heading"]}
        description={messages["user-setting.description"]}
      />
      <Card>
        <section className="flex flex-col gap-3">
          <Heading level={3}>{messages["user-setting.tag"]}</Heading>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge
                key={tag.id}
                name={tag.name}
                onClick={() => handleOpenTagDialog(tag)}
              />
            ))}
          </div>
          <div className="w-full flex items-center gap-2">
            <Input
              placeholder={messages["user-setting.tag.placeholder"]}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleCreateTag();
                }
              }}
            />
            <Button
              disabled={!newTag.trim() || isSubmittingTag}
              onClick={() => void handleCreateTag()}
            >
              {messages["user-setting.tag.add"]}
            </Button>
          </div>
          <Dialog
            open={selectedTag !== null}
            onOpenChange={(open) => {
              if (!open) {
                handleCloseTagDialog();
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {messages["user-setting.tag.dialog.title"]}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="sr-only">
                {messages["user-setting.tag.dialog.description"]}
              </DialogDescription>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={messages["user-setting.tag.placeholder"]}
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleUpdateTag();
                    }
                  }}
                />
                <Button
                  disabled={!editingTagName.trim() || isUpdatingTag}
                  onClick={() => void handleUpdateTag()}
                >
                  {messages["common.update"]}
                </Button>
              </div>
              <DialogFooter>
                <div className="flex w-full gap-2">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={handleCloseTagDialog}
                  >
                    {messages["common.cancel"]}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    disabled={!selectedTag || deletingTagId === selectedTag.id}
                    onClick={() => {
                      setIsDeleteConfirmOpen(true);
                    }}
                  >
                    {messages["common.delete"]}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ConfirmDialog
            isOpen={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
            title={
              <>
                <AlertCircle size={20} className="text-destructive" />
                {messages["user-setting.tag.delete.dialog.title"]}
              </>
            }
            description={messages["user-setting.tag.delete.dialog.confirm"]}
            confirmText={messages["common.delete.verb"] || messages["common.delete"]}
            cancelText={messages["common.cancel"]}
            buttonLayout="vertical"
            isConfirmDisabled={!selectedTag || deletingTagId === selectedTag.id}
            isSubmitting={selectedTag !== null && deletingTagId === selectedTag.id}
            onConfirm={async () => {
              if (selectedTag) {
                try {
                  await handleDeleteTag(selectedTag.id);
                } finally {
                  setIsDeleteConfirmOpen(false);
                }
              }
            }}
          />
        </section>
        <section className="flex flex-col gap-3">
          <Heading level={3}>{messages["user-setting.theme"]}</Heading>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={setTheme}
            variant="outline"
            className="flex w-full"
          >
            <ToggleGroupItem
              className={`py-3 h-fit w-[50%] flex flex-col justify-center items-center gap-3 disabled:opacity-100 ${theme === "light" ? "bg-foreground text-background" : "bg-transparent text-foreground"}`}
              value="light"
              disabled={theme === "light"}
              aria-label="light"
              data-state="off"
            >
              <Sun size={16} />
              {messages["user-setting.theme.light"]}
            </ToggleGroupItem>
            <ToggleGroupItem
              className={`py-3 h-fit w-[50%] flex flex-col justify-center items-center gap-3 disabled:opacity-100 ${theme === "dark" ? "bg-foreground text-background" : "bg-transparent text-foreground"}`}
              value="dark"
              disabled={theme === "dark"}
              aria-label="dark"
              data-state="off"
            >
              <Moon size={16} />
              {messages["user-setting.theme.dark"]}
            </ToggleGroupItem>
          </ToggleGroup>
        </section>
        <section className="flex flex-col gap-3">
          <Heading level={3}>{messages["user-setting.language"]}</Heading>
          <ToggleGroup
            type="single"
            value={locale}
            onValueChange={handleLocaleChange}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem
              value="ja"
              aria-label="日本語"
              className={locale === "ja" ? "bg-foreground" : ""}
            >
              {messages["user-setting.language.ja"]}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="en"
              aria-label="English"
              className={locale === "en" ? "bg-foreground" : ""}
            >
              {messages["user-setting.language.en"]}
            </ToggleGroupItem>
          </ToggleGroup>
        </section>
      </Card>
    </PageContainer>
  );
};
