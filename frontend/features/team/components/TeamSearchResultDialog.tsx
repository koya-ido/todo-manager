"use client";

import { Button } from "@/components/forms/Button";
import { InputPassword } from "@/components/forms/InputPassword";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { TeamSearchResponse } from "@/features/team/types";
import { formatTeamId } from "@/features/team/utils";
import { AlertCircle, CheckCircle2, Loader2, Users, XCircle } from "lucide-react";
import { FC, FormEvent } from "react";

type TeamSearchResultDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchedTeam: TeamSearchResponse | null;
  applyPassword: string;
  setApplyPassword: (val: string) => void;
  isSubmittingApply: boolean;
  applyError: string;
  onSubmitApply: (e: FormEvent) => void;
  messages: Record<string, string>;
}

export const TeamSearchResultDialog: FC<TeamSearchResultDialogProps> = ({
  isOpen,
  onOpenChange,
  searchedTeam,
  applyPassword,
  setApplyPassword,
  isSubmittingApply,
  applyError,
  onSubmitApply,
  messages,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isSubmittingApply} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            {messages["team.search-result.title"]}
          </DialogTitle>
        </DialogHeader>

        {searchedTeam && (
          <div className="space-y-4 py-2">
            {/* チームメタデータボックス */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                  {searchedTeam.name}
                </h3>
                <span className="font-mono text-2xs text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {formatTeamId(messages["team.search-result.team-id"], searchedTeam.display_teams_id)}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>
                  <span className="text-slate-400">
                    {messages["team.search-result.owner-name"]}
                  </span>{" "}
                  {searchedTeam.created_user_name}
                </p>
                <p>
                  <span className="text-slate-400">
                    {messages["team.search-result.owner-id"]}
                  </span>{" "}
                  {searchedTeam.created_user_display_id}
                </p>
              </div>
            </div>

            {/* チームに対するユーザーの状態に応じたアクション */}
            {searchedTeam.is_member ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-950">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>
                  {messages["team.search-result.already-member"]}
                </p>
              </div>
            ) : searchedTeam.is_applying ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-950">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>
                  {messages["team.search-result.already-applying"]}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmitApply} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">
                    {messages["team.search-result.input-password-label"]}
                  </label>
                  <InputPassword
                    value={applyPassword}
                    onChange={(e) => setApplyPassword(e.target.value)}
                    placeholder={messages["team.search-result.password-placeholder"]}
                    required
                    disabled={isSubmittingApply}
                  />
                </div>

                {applyError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingApply || !applyPassword.trim()}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingApply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {messages["team.search-result.apply-button"]}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
