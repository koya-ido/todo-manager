"use client";

import { PageContainer, PageHeader } from "@/components/Layout";
import { Skeleton } from "@/components/Layout/Skeleton";
import { DeleteTeamDialog } from "@/features/team/components/DeleteTeamDialog";
import { KickMemberDialog } from "@/features/team/components/KickMemberDialog";
import { RejectApplicantDialog } from "@/features/team/components/RejectApplicantDialog";
import { TagSettingsDialog } from "@/features/team/components/TagSettingsDialog";
import { TeamDetailAdminSettingsCard } from "@/features/team/components/TeamDetailAdminSettingsCard";
import { TeamDetailInfoCard } from "@/features/team/components/TeamDetailInfoCard";
import { TeamDetailMembersCard } from "@/features/team/components/TeamDetailMembersCard";
import { TeamDetailTagsCard } from "@/features/team/components/TeamDetailTagsCard";
import { useTeamDetail } from "@/features/team/hooks/useTeamDetail";
import { FC } from "react";

type ContentProps = {
  teamId: number;
  messages: Record<string, string>;
  locale?: string;
};

export const Content: FC<ContentProps> = ({
  teamId,
  messages,
}) => {
  const {
    team,
    members,
    applicants,
    tags,
    isLoading,
    isCopied,
    isCopiedPassword,
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
    handleCopyId,
    handleCopyPassword,
    handleToggleAcceptApps,
    handleApproveApplicant,
    handleConfirmRejectApplicant,
    handleConfirmKick,
    handleDeleteTeam,
    handleCreateTag,
    handleUpdateTag,
    handleDeleteTag,
    handleOpenTagDialog,
  } = useTeamDetail(teamId, messages);

  // スケルトンローダービュー
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <PageContainer className="animate-in fade-in duration-300">
      {/* メインタイトルと説明 */}
      <PageHeader
        title={team.name}
        description={messages["team.detail.description"]}
      />

      {/* レイアウトグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* カード1：チームとオーナーの詳細 */}
        <TeamDetailInfoCard
          team={team}
          messages={messages}
          isCopied={isCopied}
          onCopyId={() => void handleCopyId()}
        />

        {/* カード2：タグ管理 */}
        <TeamDetailTagsCard
          tags={tags}
          messages={messages}
          newTagName={newTagName}
          setNewTagName={setNewTagName}
          isSubmittingTag={isSubmittingTag}
          onCreateTag={() => void handleCreateTag()}
          onOpenTagDialog={handleOpenTagDialog}
        />

        {/* カード3：メンバーリスト */}
        <TeamDetailMembersCard
          team={team}
          members={members}
          messages={messages}
          onKickClick={(member) => setKickTarget(member)}
        />

        {/* カード4：管理者コントロールセクション */}
        {team.is_owner && (
          <TeamDetailAdminSettingsCard
            team={team}
            applicants={applicants}
            messages={messages}
            isTogglingAccept={isTogglingAccept}
            isCopiedPassword={isCopiedPassword}
            onToggleAcceptApps={(checked) => void handleToggleAcceptApps(checked)}
            onApproveApplicant={(userId) => void handleApproveApplicant(userId)}
            onRejectClick={(app) => setRejectTarget(app)}
            onDeleteTeamClick={() => setShowDeleteDialog(true)}
            onCopyPassword={() => void handleCopyPassword()}
          />
        )}
      </div>

      {/* ダイアログ1：キック確認 */}
      <KickMemberDialog
        kickTarget={kickTarget}
        onClose={() => setKickTarget(null)}
        isSubmitting={isSubmittingKick}
        onConfirm={() => void handleConfirmKick()}
        messages={messages}
      />

      {/* ダイアログ2：チーム削除確認 */}
      <DeleteTeamDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        teamName={team.name}
        isDeleting={isDeletingTeam}
        onConfirm={() => void handleDeleteTeam()}
        messages={messages}
      />

      {/* ダイアログ3：共通タグの名称変更と削除ダイアログ */}
      <TagSettingsDialog
        selectedTag={selectedTag}
        onClose={() => {
          setSelectedTag(null);
          setEditingTagName("");
        }}
        editingTagName={editingTagName}
        setEditingTagName={setEditingTagName}
        isUpdatingTag={isUpdatingTag}
        onUpdateTag={() => void handleUpdateTag()}
        deletingTagId={deletingTagId}
        onDeleteTag={(tagId) => void handleDeleteTag(tagId)}
        messages={messages}
      />

      {/* ダイアログ4：却下確認ダイアログ */}
      <RejectApplicantDialog
        rejectTarget={rejectTarget}
        onClose={() => setRejectTarget(null)}
        isSubmitting={isSubmittingReject}
        onConfirm={() => void handleConfirmRejectApplicant()}
        messages={messages}
      />
    </PageContainer>
  );
};
