"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import {
  TeamApplicantResponse,
  TeamDetailResponse,
  TeamMemberResponse,
} from "@/features/team/types";
import { Tag } from "@/features/userSetting/types";
import { isErrorResponse } from "@/hooks/useError/errorUtils";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/hooks/useFetchApi";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export const useTeamDetail = (
  teamId: number,
  messages: Record<string, string>,
) => {
  const router = useRouter();
  const { setErrorResponse } = useContext(ErrorContext);

  // 状態
  const [team, setTeam] = useState<TeamDetailResponse | null>(null);
  const [members, setMembers] = useState<TeamMemberResponse[]>([]);
  const [applicants, setApplicants] = useState<TeamApplicantResponse[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // フォーム状態
  const [newTagName, setNewTagName] = useState<string>("");
  const [isSubmittingTag, setIsSubmittingTag] = useState<boolean>(false);
  const [isUpdatingTag, setIsUpdatingTag] = useState<boolean>(false);
  const [deletingTagId, setDeletingTagId] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [editingTagName, setEditingTagName] = useState<string>("");

  // ダイアログ制御状態
  const [kickTarget, setKickTarget] = useState<TeamMemberResponse | null>(null);
  const [isSubmittingKick, setIsSubmittingKick] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeletingTeam, setIsDeletingTeam] = useState<boolean>(false);
  const [isTogglingAccept, setIsTogglingAccept] = useState<boolean>(false);
  const [rejectTarget, setRejectTarget] =
    useState<TeamApplicantResponse | null>(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState<boolean>(false);

  // すべてのチーム詳細データをロード
  const fetchData = async () => {
    try {
      const teamDetails = await apiGet<TeamDetailResponse>(`/team/${teamId}`);
      setTeam(teamDetails);

      const teamMembers = await apiGet<TeamMemberResponse[]>(
        `/team/${teamId}/members`,
      );
      setMembers(teamMembers);

      const teamTags = await apiGet<Tag[]>(`/tags/team/${teamId}`);
      setTags(teamTags);

      if (teamDetails.is_owner) {
        const teamApplicants = await apiGet<TeamApplicantResponse[]>(
          `/team/${teamId}/applicants`,
        );
        setApplicants(teamApplicants);
      }
      setIsLoading(false);
    } catch (error) {
      if (isErrorResponse(error)) {
        router.push(`/error?status=${error.status}&code=${error.code}`);
      } else {
        router.push("/error?status=500&code=UNKNOWN");
      }
    }
  };

  useEffect(() => {
    void fetchData();
  }, [teamId]);

  // 表示用IDのコピー
  const handleCopyId = async () => {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(team.display_teams_id);
      setIsCopied(true);
      toast.success(messages["team.detail.toast.copy-success"]);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error(messages["FAILED_TO_UPDATE"]?.replace("{name}", "ID"));
    }
  };

  // 申請受付ステータスの切り替え
  const handleToggleAcceptApps = async (checked: boolean) => {
    if (!team || isTogglingAccept) return;
    setIsTogglingAccept(true);
    try {
      await apiPatch(
        `/team/${teamId}/accepting-applications`,
        JSON.stringify({ accepting_applications: checked }),
      );
      setTeam((prev) =>
        prev ? { ...prev, accepting_applications: checked } : null,
      );
      toast.success(messages["team.detail.toast.accept-apps-updated"]);
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsTogglingAccept(false);
    }
  };

  // 参加申請者の承認
  const handleApproveApplicant = async (userId: number) => {
    try {
      await apiPost(`/team/${teamId}/applicants/${userId}/approve`);
      toast.success(messages["team.detail.toast.approve-success"]);
      void fetchData();
    } catch (error) {
      setErrorResponse(error);
    }
  };

  // 参加申請者の却下（確認ダイアログのトリガー）
  const handleConfirmRejectApplicant = async () => {
    if (!rejectTarget) return;
    setIsSubmittingReject(true);
    try {
      await apiPost(`/team/${teamId}/applicants/${rejectTarget.id}/reject`);
      toast.success(messages["team.detail.toast.reject-success"]);
      setRejectTarget(null);
      void fetchData();
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // メンバーのキック
  const handleConfirmKick = async () => {
    if (!kickTarget) return;
    setIsSubmittingKick(true);
    try {
      await apiDelete(`/team/${teamId}/members/${kickTarget.id}`);
      toast.success(messages["team.detail.toast.kick-success"]);
      setKickTarget(null);
      void fetchData();
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsSubmittingKick(false);
    }
  };

  // チームの削除
  const handleDeleteTeam = async () => {
    setIsDeletingTeam(true);
    try {
      await apiDelete(`/team/${teamId}`);
      toast.success(messages["team.detail.toast.delete-success"]);
      router.push("/team");
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsDeletingTeam(false);
      setShowDeleteDialog(false);
    }
  };

  // チームタグの作成
  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name || isSubmittingTag) return;
    setIsSubmittingTag(true);
    try {
      await apiPost(`/tags/team/${teamId}`, JSON.stringify({ name }));
      toast.success(messages["team.detail.toast.tag-create-success"]);
      setNewTagName("");
      const teamTags = await apiGet<Tag[]>(`/tags/team/${teamId}`);
      setTags(teamTags);
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsSubmittingTag(false);
    }
  };

  // タグの更新
  const handleUpdateTag = async () => {
    const name = editingTagName.trim();
    if (!selectedTag || !name || isUpdatingTag) return;
    setIsUpdatingTag(true);
    try {
      await apiPut(
        `/tags/team/${teamId}/${selectedTag.id}`,
        JSON.stringify({ name }),
      );
      toast.success(messages["team.detail.toast.tag-update-success"]);
      setSelectedTag(null);
      setEditingTagName("");
      const teamTags = await apiGet<Tag[]>(`/tags/team/${teamId}`);
      setTags(teamTags);
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsUpdatingTag(false);
    }
  };

  // タグの削除
  const handleDeleteTag = async (tagId: number) => {
    if (deletingTagId !== null) return;
    setDeletingTagId(tagId);
    try {
      await apiDelete(`/tags/team/${teamId}/${tagId}`);
      toast.success(messages["team.detail.toast.tag-delete-success"]);
      setSelectedTag(null);
      setEditingTagName("");
      const teamTags = await apiGet<Tag[]>(`/tags/team/${teamId}`);
      setTags(teamTags);
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setDeletingTagId(null);
    }
  };

  const handleOpenTagDialog = (tag: Tag) => {
    setSelectedTag(tag);
    setEditingTagName(tag.name);
  };

  return {
    team,
    members,
    applicants,
    tags,
    isLoading,
    isCopied,
    newTagName,
    setNewTagName,
    isSubmittingTag,
    isUpdatingTag,
    deletingTagId,
    selectedTag,
    setSelectedTag,
    editingTagName,
    setEditingTagName,
    kickTarget,
    setKickTarget,
    isSubmittingKick,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeletingTeam,
    isTogglingAccept,
    rejectTarget,
    setRejectTarget,
    isSubmittingReject,
    fetchData,
    handleCopyId,
    handleToggleAcceptApps,
    handleApproveApplicant,
    handleConfirmRejectApplicant,
    handleConfirmKick,
    handleDeleteTeam,
    handleCreateTag,
    handleUpdateTag,
    handleDeleteTag,
    handleOpenTagDialog,
  };
};
