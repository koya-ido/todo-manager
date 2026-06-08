"use client";

import { Button } from "@/components/forms/Button";
import { ArrowLeft, Megaphone } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

type EmptyInboxProps = {
  messages: Record<string, string>;
};

export const EmptyInbox: FC<EmptyInboxProps> = ({ messages }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-8 backdrop-blur-xs">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl scale-150 animate-pulse" />
        <Megaphone className="w-20 h-20 text-slate-400 dark:text-slate-600 rotate-[-15deg] relative z-10" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-350">
          {messages["inbox.empty.title"]}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {messages["inbox.empty.description"]}
        </p>
      </div>
      <Link href="/home" passHref>
        <Button
          variant="outline"
          className="mt-4 flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 shadow-xs px-6 py-2.5 font-semibold text-sm border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {messages["common.back-home"]}
        </Button>
      </Link>
    </div>
  );
};
