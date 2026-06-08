"use client";

import { Button } from "@/components/forms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Layout/Card";
import { TeamApplyingResponse } from "@/features/team/types";
import { formatAppliedDateLabel, formatTeamId } from "@/features/team/utils";
import { Calendar } from "lucide-react";
import { FC } from "react";

type ApplyingTeamCardProps = {
  team: TeamApplyingResponse;
  messages: Record<string, string>;
  locale?: string;
  onCancel: (teamId: number, teamName: string) => void;
}

export const ApplyingTeamCard: FC<ApplyingTeamCardProps> = ({
  team,
  messages,
  locale,
  onCancel,
}) => {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 transition-shadow hover:shadow-sm flex flex-col justify-between">
      <div>
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-sm text-slate-600 dark:text-slate-400">
          <p className="text-xs text-slate-400 font-mono">
            {formatTeamId(messages["team.search-result.team-id"], team.display_teams_id)}
          </p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {formatAppliedDateLabel(messages["team.applied-date"], team.applied_at, locale)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{messages["team.owner"]}</span>
            <span>{team.created_user_name}</span>
            <span className="text-slate-400/80">#{team.created_user_display_id}</span>
          </div>
        </CardContent>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-900/50">
        <Button
          variant="destructive"
          size="sm"
          className="w-full flex items-center justify-center gap-1"
          onClick={() => onCancel(team.id, team.name)}
        >
          {messages["team.action.cancel-apply"]}
        </Button>
      </div>
    </Card>
  );
};
