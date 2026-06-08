"use client";

import {
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
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { FC } from "react";

type UserSettingProps = ContentProps;

export const Content: FC<UserSettingProps> = ({ messages }) => {
  const { setTheme, theme } = useTheme();
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
    <div className="w-full space-y-6">
      <Heading level={1}>{messages["user-setting.heading"]}</Heading>
      <Heading level={2} className="text-muted-foreground text-sm font-medium">{messages["user-setting.description"]}</Heading>
      <section className="flex flex-col gap-3">
        <Heading level={3}>{messages["user-setting.tag"]}</Heading>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant="secondary"
              size="xs"
              className="h-auto rounded-full px-2 py-1 font-bold bg-gray-300"
              onClick={() => handleOpenTagDialog(tag)}
            >
              {tag.name}
            </Button>
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
                    if (selectedTag) {
                      void handleDeleteTag(selectedTag.id);
                    }
                  }}
                >
                  {messages["common.delete"]}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
    </div>
  );
};
