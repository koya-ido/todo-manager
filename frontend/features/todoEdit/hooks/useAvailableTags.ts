import { Tag } from "@/features/todoEdit/types";
import { apiGet, apiPost } from "@/hooks/useFetchApi";
import { TodoMode } from "@/types/todo";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type UseAvailableTagsProps = {
  mode: TodoMode;
  currentTeamId?: number;
  setErrorResponse: (error: unknown) => void;
};

export const useAvailableTags = ({
  mode,
  currentTeamId,
  setErrorResponse,
}: UseAvailableTagsProps) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState<string>("");
  const [isCreatingTag, setIsCreatingTag] = useState<boolean>(false);

  // Load available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const url =
          mode === "team" && currentTeamId
            ? `/tags/team/${currentTeamId}`
            : "/tags/me";
        const tags = await apiGet<Tag[]>(url);
        setAvailableTags(tags);
      } catch (error) {
        setErrorResponse(error);
      }
    };
    void fetchTags();
  }, [mode, currentTeamId, setErrorResponse]);

  const handleCreateTag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      const url =
        mode === "team" && currentTeamId
          ? `/tags/team/${currentTeamId}`
          : "/tags/me";
      const createdTag = await apiPost<Tag>(
        url,
        JSON.stringify({ name: newTagName.trim() }),
      );
      setAvailableTags((prev) => [...prev, createdTag]);
      setSelectedTags((prev) => [...prev, createdTag]);
      setNewTagName("");
      toast.success("タグを追加しました");
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  return {
    availableTags,
    setAvailableTags,
    selectedTags,
    setSelectedTags,
    newTagName,
    setNewTagName,
    isCreatingTag,
    handleCreateTag,
    handleRemoveTag,
  };
};
