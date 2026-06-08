"use client";

import { Button } from "@/components/forms/Button";
import { Skeleton } from "@/components/Layout/Skeleton";
import { Heading } from "@/components/typography/Heading";
import { EmptyInbox } from "@/features/inbox/components/EmptyInbox";
import { InboxCard } from "@/features/inbox/components/InboxCard";
import { useInbox } from "@/features/inbox/hooks/useInbox";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 画面ヘッダー */}
      <header className="mb-8 space-y-1">
        <Heading level={1} className="text-2xl font-bold flex items-center gap-2">
          {messages["inbox.heading"]}
        </Heading>
        <Heading level={2} className="text-muted-foreground text-sm font-medium">
          {messages["inbox.description"]}
        </Heading>
      </header>

      {inboxes.length === 0 ? (
        /* お知らせ無し状態 */
        <EmptyInbox messages={messages} />
      ) : (
        /* お知らせリスト表示 */
        <div className="space-y-4">
          <div className="space-y-3.5">
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
            <Link href="/home" passHref>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 shadow-xs px-6 py-2.5 font-semibold text-sm border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {messages["common.back-home"]}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
