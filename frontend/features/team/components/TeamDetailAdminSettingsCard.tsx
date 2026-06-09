import { Button, ButtonLink } from "@/components/forms/Button";
import { Checkbox } from "@/components/forms/Checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Layout/Card";
import { Heading } from "@/components/typography/Heading";
import { TeamApplicantResponse, TeamDetailResponse } from "@/features/team/types";
import { Check, Copy, Edit, Eye, EyeOff, Settings, Trash2 } from "lucide-react";
import { FC, useState } from "react";

type TeamDetailAdminSettingsCardProps = {
  team: TeamDetailResponse;
  applicants: TeamApplicantResponse[];
  messages: Record<string, string>;
  isTogglingAccept: boolean;
  isCopiedPassword: boolean;
  onToggleAcceptApps: (checked: boolean) => void;
  onApproveApplicant: (userId: number) => void;
  onRejectClick: (app: TeamApplicantResponse) => void;
  onDeleteTeamClick: () => void;
  onCopyPassword: () => void;
};

export const TeamDetailAdminSettingsCard: FC<TeamDetailAdminSettingsCardProps> = ({
  team,
  applicants,
  messages,
  isTogglingAccept,
  isCopiedPassword,
  onToggleAcceptApps,
  onApproveApplicant,
  onRejectClick,
  onDeleteTeamClick,
  onCopyPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Card className="md:col-span-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xs">
      <CardHeader className="p-0 flex flex-row items-center gap-2 pb-2">
        <Settings className="w-5 h-5 text-foreground" />
        <CardTitle className="text-lg font-bold">
          {messages["team.detail.settings.heading"]}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        {/* 設定アクション：申請受付の切り替え */}
        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-900/50">
          <Checkbox
            id="accept-applications-checkbox"
            checked={team.accepting_applications}
            onCheckedChange={(checked) => onToggleAcceptApps(!!checked)}
            disabled={isTogglingAccept}
          />
          <label
            htmlFor="accept-applications-checkbox"
            className="text-sm font-semibold select-none cursor-pointer text-slate-700 dark:text-slate-300"
          >
            {messages["team.detail.settings.accept-apps"]}
          </label>
        </div>

        {/* 設定アクション：パスワードの確認・コピー */}
        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-900/50 space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
            {messages["team.detail.settings.password-label"]}
          </span>
          {team.password ? (
            <div className="flex items-center gap-2">
              <code className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-sm font-mono font-bold text-slate-800 dark:text-slate-200 select-all min-w-[120px] text-center border border-slate-200 dark:border-slate-700">
                {showPassword ? team.password : "********"}
              </code>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center justify-center p-2"
                title={showPassword ? "Hide" : "Show"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={onCopyPassword}
                className="flex items-center gap-1 text-xs"
              >
                {isCopiedPassword ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {isCopiedPassword
                  ? messages["team.detail.settings.password-copied"]
                  : messages["team.detail.settings.password-copy"]}
              </Button>
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic block pt-1">
              {messages["team.detail.settings.password-unavailable"]}
            </span>
          )}
        </div>

        {/* 申請者リスト */}
        <div className="space-y-3">
          <Heading level={3} className="text-base font-bold">
            {messages["team.detail.applicants.heading"]}
          </Heading>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            {applicants.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center italic">
                {messages["team.detail.applicants.empty"]}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {applicants.map((app) => (
                  <li
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3 sm:gap-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {app.user_name}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          #{app.display_user_id}
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs block mt-1">
                        {messages["team.detail.applicants.applied-at"]?.replace(
                          "{date}",
                          new Date(app.applied_at).toLocaleString()
                        ) || `Applied: ${new Date(app.applied_at).toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <Button
                        size="sm"
                        className="flex items-center gap-1 shrink-0"
                        onClick={() => onApproveApplicant(app.id)}
                      >
                        {messages["team.detail.applicants.approve"]}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 font-bold"
                        onClick={() => onRejectClick(app)}
                      >
                        {messages["team.detail.applicants.reject"]}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 管理者アクション：チームの編集と削除 */}
        <div className="border-t border-slate-100 dark:border-slate-900/50 pt-5 flex justify-between items-center gap-3 flex-wrap">
          <ButtonLink
            variant="outline"
            href={`/team/edit?id=${team.id}`}
            className="flex items-center gap-1.5 font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 w-auto"
          >
            <Edit className="w-4 h-4" />
            {messages["common.edit"]}
          </ButtonLink>

          <Button
            variant="destructive"
            onClick={onDeleteTeamClick}
            className="flex items-center gap-1.5 font-bold"
          >
            <Trash2 className="w-4 h-4" />
            {messages["team.detail.settings.delete-team"]}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
