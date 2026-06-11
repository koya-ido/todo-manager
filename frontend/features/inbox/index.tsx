"use client";

import { ButtonLink } from "@/components/forms/Button";
import { PageContainer, PageHeader } from "@/components/Layout";
import { Skeleton } from "@/components/Layout/Skeleton";
import { EmptyInbox } from "@/features/inbox/components/EmptyInbox";
import { InboxCard } from "@/features/inbox/components/InboxCard";
import { useInbox } from "@/features/inbox/hooks/useInbox";
import { ArrowLeft } from "lucide-react";
import { FC } from "react";

type ContentProps = {
  messages: Record<string, string>;
};

export const Content: FC<ContentProps> = ({ messages }) => {
  const { inboxes, isLoading, deletingIds, deleteInboxItem } = useInbox();

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4 md:px-0 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-3.5 pt-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <PageContainer className="max-w-3xl mx-auto">
      {/* 画面ヘッダー */}
      <PageHeader
        title={messages["inbox.heading"]}
        description={messages["inbox.description"]}
      />

      {inboxes.length === 0 ? (
        /* お知らせ無し状態 */
        <EmptyInbox messages={messages} />
      ) : (
        /* お知らせリスト表示 */
        <div className="space-y-4">
          <div className="space-y-2">
            {inboxes.map((item) => (
              <InboxCard
                key={item.id}
                item={item}
                messages={messages}
                isDeleting={deletingIds.includes(item.id)}
                onDeleteClick={deleteInboxItem}
              />
            ))}
          </div>

          {/* 下部ホームへ戻るボタン */}
          <div className="flex justify-center pt-6">
            <ButtonLink href="/home" variant="link" className="w-auto">
              <ArrowLeft className="w-4 h-4" />
              {messages["common.back-home"]}
            </ButtonLink>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
