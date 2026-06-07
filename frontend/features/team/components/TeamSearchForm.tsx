"use client";

import { Button } from "@/components/forms/Button";
import { Input } from "@/components/forms/Input";
import { Card } from "@/components/Layout/Card";
import { Loader2, Search } from "lucide-react";
import { FC, FormEvent } from "react";

type TeamSearchFormProps = {
  messages: Record<string, string>;
  searchId: string;
  setSearchId: (val: string) => void;
  isSearching: boolean;
  onSubmit: (e: FormEvent) => void;
}

export const TeamSearchForm: FC<TeamSearchFormProps> = ({
  messages,
  searchId,
  setSearchId,
  isSearching,
  onSubmit,
}) => {
  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-3 items-end p-1">
        <div className="w-full relative">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">
            {messages["team.search.label"]}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder={messages["team.search.placeholder"]}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-9 h-11"
              disabled={isSearching}
              maxLength={20}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isSearching || !searchId.trim()}
          className="w-full md:w-32 h-11 shrink-0 flex items-center justify-center gap-1.5"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {messages["common.search"]}
        </Button>
      </form>
    </Card>
  );
};
