"use client";

import { Button } from "@/components/forms/Button";
import { Card } from "@/components/Layout/Card";
import { InboxItem } from "@/features/inbox/hooks/useInbox";
import { getCardDetails, toDisplayDateTime } from "@/features/inbox/utils";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

type InboxCardProps = {
  item: InboxItem;
  messages: Record<string, string>;
  isDeleting: boolean;
  onDeleteClick: (id: number) => void;
};

export const InboxCard: FC<InboxCardProps> = ({
  item,
  messages,
  isDeleting,
  onDeleteClick,
}) => {
  const { label, labelBg, title, subInfo, linkUrl, linkLabel } = getCardDetails(item, messages);

  return (
    <Card
      className={`relative p-5 rounded-2xl border bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xs transition-all duration-300 group
        ${isDeleting ? "opacity-0 -translate-y-4 max-h-0 py-0 my-0 overflow-hidden border-transparent scale-95" : "opacity-100 hover:shadow-md border-slate-200/80 dark:border-slate-800/85"}
      `}
    >
      {/* 右上 X ボタン */}
      <Button
        variant="ghost"
        onClick={() => onDeleteClick(item.id)}
        className="w-4 h-4 absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        aria-label="Delete notification"
      >
        <X className="w-4 h-4 transition-transform duration-300 hover:rotate-90" />
      </Button>

      <div className="space-y-3 pr-8">
        {/* 種別バッジ & 通知日時 */}
        <div className="flex items-center gap-3">
          <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-md ${labelBg}`}>
            {label}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {toDisplayDateTime(item.created_at)}
          </span>
        </div>

        {/* 本文タイトル */}
        <p className="text-[15px] font-semibold text-slate-850 dark:text-slate-200 leading-snug">
          {title}
        </p>

        {/* 補足情報 (申請日時や承諾日時など) */}
        {subInfo && (
          <p className="text-xs text-muted-foreground font-medium">
            {subInfo}
          </p>
        )}

        {/* 詳細アクションリンク */}
        {linkUrl && (
          <div className="pt-1.5">
            <Link
              href={linkUrl}
              className="inline-flex items-center gap-1 text-sm font-semibold hover:underline group/link"
            >
              {linkLabel}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};
