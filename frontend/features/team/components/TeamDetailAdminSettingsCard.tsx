import { Button } from "@/components/forms/Button";
import { Checkbox } from "@/components/forms/Checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Layout/Card";
import { Heading } from "@/components/typography/Heading";
import { TeamApplicantResponse, TeamDetailResponse } from "@/features/team/types";
import { Edit, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

type TeamDetailAdminSettingsCardProps = {
  team: TeamDetailResponse;
  applicants: TeamApplicantResponse[];
  messages: Record<string, string>;
  isTogglingAccept: boolean;
  onToggleAcceptApps: (checked: boolean) => void;
  onApproveApplicant: (userId: number) => void;
  onRejectClick: (app: TeamApplicantResponse) => void;
  onDeleteTeamClick: () => void;
};

export const TeamDetailAdminSettingsCard: FC<TeamDetailAdminSettingsCardProps> = ({
  team,
  applicants,
  messages,
  isTogglingAccept,
  onToggleAcceptApps,
  onApproveApplicant,
  onRejectClick,
  onDeleteTeamClick,
}) => {
  return (
    <Card className="md:col-span-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xs">
      <CardHeader className="p-0 flex flex-row items-center gap-2 pb-2">
        <Settings className="w-5 h-5 text-foreground" />
        <CardTitle className="text-lg font-bold">
          {messages["team.detail.settings.heading"]}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        {/* Settings Action: Toggle Applications */}
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

        {/* Applicants List */}
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
                        className="text-white font-bold"
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

        {/* Admin actions: Edit and Delete Team */}
        <div className="border-t border-slate-100 dark:border-slate-900/50 pt-5 flex justify-between items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            asChild
            className="flex items-center gap-1.5 font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Link href={`/team/edit?id=${team.id}`}>
              <Edit className="w-4 h-4" />
              {messages["breadcrumb.team.edit"]}
            </Link>
          </Button>

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
