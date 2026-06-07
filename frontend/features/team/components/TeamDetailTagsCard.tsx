import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Layout/Card";
import { Tag } from "@/features/userSetting/types";
import { Plus, Tag as TagIcon } from "lucide-react";
import { FC } from "react";

type TeamDetailTagsCardProps = {
  tags: Tag[];
  messages: Record<string, string>;
  newTagName: string;
  setNewTagName: (name: string) => void;
  isSubmittingTag: boolean;
  onCreateTag: () => void;
  onOpenTagDialog: (tag: Tag) => void;
};

export const TeamDetailTagsCard: FC<TeamDetailTagsCardProps> = ({
  tags,
  messages,
  newTagName,
  setNewTagName,
  isSubmittingTag,
  onCreateTag,
  onOpenTagDialog,
}) => {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xs">
      <CardHeader className="p-0 flex flex-row items-center gap-2 pb-2">
        <TagIcon className="w-5 h-5 text-foreground" />
        <CardTitle className="text-lg font-bold">
          {messages["team.detail.tags.heading"]}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {/* Tag Badges List */}
        <div className="flex flex-wrap gap-2 min-h-12 items-center">
          {tags.length === 0 ? (
            <span className="text-slate-400 text-sm italic">
              {messages["todo-detail.no-tag"] || "No tags"}
            </span>
          ) : (
            tags.map((tag) => (
              <Button
                key={tag.id}
                variant="secondary"
                size="xs"
                className="h-auto rounded-full px-2.5 py-1 font-bold bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-slate-800 dark:hover:bg-indigo-950/50 transition-all cursor-pointer"
                onClick={() => onOpenTagDialog(tag)}
              >
                {tag.name}
              </Button>
            ))
          )}
        </div>

        {/* Inline creation */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-900/50 pt-3">
          <Input
            placeholder={messages["team.detail.tags.placeholder"]}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCreateTag();
            }}
          />
          <Button
            disabled={!newTagName.trim() || isSubmittingTag}
            onClick={onCreateTag}
            className="flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {messages["team.detail.tags.add"]}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
