import { ErrorContext } from "@/components/features/ErrorProvider";
import { Tag } from "@/features/userSetting/types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/hooks/useFetchApi";
import { useCallback, useContext, useEffect, useState } from "react";

export const useTags = () => {
  const [newTag, setNewTag] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [editingTagName, setEditingTagName] = useState<string>("");
  const [isSubmittingTag, setIsSubmittingTag] = useState<boolean>(false);
  const [isUpdatingTag, setIsUpdatingTag] = useState<boolean>(false);
  const [deletingTagId, setDeletingTagId] = useState<number | null>(null);
  const { setErrorResponse } = useContext(ErrorContext);

  const fetchTags = useCallback(async () => {
    try {
      const response = await apiGet<Tag[]>("/tags/me");
      setTags(response);
    } catch (error) {
      setErrorResponse(error);
    }
  }, [setErrorResponse]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const handleCreateTag = async () => {
    const name = newTag.trim();
    if (!name || isSubmittingTag) return;

    setIsSubmittingTag(true);
    try {
      const createdTag = await apiPost<Tag>(
        "/tags/me",
        JSON.stringify({ name }),
      );
      setTags((currentTags) => [...currentTags, createdTag]);
      setNewTag("");
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsSubmittingTag(false);
    }
  };

  const handleOpenTagDialog = (tag: Tag) => {
    setSelectedTag(tag);
    setEditingTagName(tag.name);
  };

  const handleCloseTagDialog = () => {
    setSelectedTag(null);
    setEditingTagName("");
  };

  const handleUpdateTag = async () => {
    const name = editingTagName.trim();
    if (!selectedTag || !name || isUpdatingTag) return;

    setIsUpdatingTag(true);
    try {
      const updatedTag = await apiPut<Tag>(
        `/tags/me/${selectedTag.id}`,
        JSON.stringify({ name }),
      );
      setTags((currentTags) =>
        currentTags.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)),
      );
      handleCloseTagDialog();
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsUpdatingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (deletingTagId !== null) return;

    setDeletingTagId(tagId);
    try {
      await apiDelete<Tag>(`/tags/me/${tagId}`);
      setTags((currentTags) => currentTags.filter((tag) => tag.id !== tagId));
      if (selectedTag?.id === tagId) {
        handleCloseTagDialog();
      }
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setDeletingTagId(null);
    }
  };

  return {
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
  };
};
