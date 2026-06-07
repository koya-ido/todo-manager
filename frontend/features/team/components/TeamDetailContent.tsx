"use client";

import { Skeleton } from "@/components/Layout/Skeleton";
import { Heading } from "@/components/typography/Heading";
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

type TeamDetailContentProps = {
  teamId: number;
  messages: Record<string, string>;
  locale?: string;
};

export const TeamDetailContent: FC<TeamDetailContentProps> = ({
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

  // Skeleton Loader View
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto py-6">
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

  if (!team) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive font-semibold text-lg">
          {messages["error.heading"] || "Error"}
        </p>
        <p className="text-muted-foreground mt-1">
          {messages["not-found.content"]}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 mx-auto animate-in fade-in duration-300">
      {/* Main Title & Description */}
      <div>
        <Heading level={1}>{team.name}</Heading>
        <Heading level={2} className="text-muted-foreground mt-1">
          {messages["team.detail.description"]}
        </Heading>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Team & Owner Details */}
        <TeamDetailInfoCard
          team={team}
          messages={messages}
          isCopied={isCopied}
          onCopyId={() => void handleCopyId()}
        />

        {/* Card 2: Tag Management */}
        <TeamDetailTagsCard
          tags={tags}
          messages={messages}
          newTagName={newTagName}
          setNewTagName={setNewTagName}
          isSubmittingTag={isSubmittingTag}
          onCreateTag={() => void handleCreateTag()}
          onOpenTagDialog={handleOpenTagDialog}
        />

        {/* Card 3: Members List */}
        <TeamDetailMembersCard
          team={team}
          members={members}
          messages={messages}
          onKickClick={(member) => setKickTarget(member)}
        />

        {/* Card 4: Admin Controls Section */}
        {team.is_owner && (
          <TeamDetailAdminSettingsCard
            team={team}
            applicants={applicants}
            messages={messages}
            isTogglingAccept={isTogglingAccept}
            onToggleAcceptApps={(checked) => void handleToggleAcceptApps(checked)}
            onApproveApplicant={(userId) => void handleApproveApplicant(userId)}
            onRejectClick={(app) => setRejectTarget(app)}
            onDeleteTeamClick={() => setShowDeleteDialog(true)}
          />
        )}
      </div>

      {/* Dialog 1: Kick Confirmation */}
      <KickMemberDialog
        kickTarget={kickTarget}
        onClose={() => setKickTarget(null)}
        isSubmitting={isSubmittingKick}
        onConfirm={() => void handleConfirmKick()}
        messages={messages}
      />

      {/* Dialog 2: Delete Team Confirmation */}
      <DeleteTeamDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        teamName={team.name}
        isDeleting={isDeletingTeam}
        onConfirm={() => void handleDeleteTeam()}
        messages={messages}
      />

      {/* Dialog 3: Common Tag Rename & Delete Dialog */}
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

      {/* Dialog 4: Reject Confirmation Dialog */}
      <RejectApplicantDialog
        rejectTarget={rejectTarget}
        onClose={() => setRejectTarget(null)}
        isSubmitting={isSubmittingReject}
        onConfirm={() => void handleConfirmRejectApplicant()}
        messages={messages}
      />
    </div>
  );
};
