"use client";

import { ButtonLink } from "@/components/forms/Button";
import { Badge } from "@/components/Layout/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Layout/Card";
import { TeamJoinedResponse } from "@/features/team/types";
import { formatTeamId } from "@/features/team/utils";
import { cn } from "@/lib/utils";
import { ExternalLink, Users } from "lucide-react";
import { FC } from "react";

type JoinedTeamCardProps = {
  team: TeamJoinedResponse;
  messages: Record<string, string>;
}

export const JoinedTeamCard: FC<JoinedTeamCardProps> = ({ team, messages }) => {
  return (
    <Card
      className={cn(
        "relative group overflow-hidden transition-all duration-300 hover:shadow-md border border-slate-200 dark:border-slate-800 flex flex-col"
      )}
    >
      <div className="space-y-2">
        <CardHeader className="p-0 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold transition-colors">
              {team.name}
            </CardTitle>
          </div>
          {team.is_owner && (
            <Badge className="py-1 font-bold rounded-md border-0 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 h-fit">
              {messages["team.role.owner"]}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0 text-sm text-slate-600 dark:text-slate-400">
          <p className="text-xs text-slate-400 font-mono">
            {formatTeamId(messages["team.search-result.team-id"], team.display_teams_id)}
          </p>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>
              {messages["team.member-count.label"]}
              <span className="font-semibold">{team.member_count}</span>
              {messages["team.member-count.unit"]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{messages["team.owner"]}</span>
            <span>{team.created_user_name}</span>
            <span className="text-slate-400/80"> #{team.created_user_display_id}</span>
          </div>
        </CardContent>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-900/50">
        <div className="space-y-2">
          <ButtonLink
            variant="outline"
            size="sm"
            href={`/todo?mode=team&teamId=${team.id}`}
            className="w-full flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {messages["team.action.todo-list"]}
          </ButtonLink>

          <ButtonLink
            variant="secondary"
            size="sm"
            href={`/team/${team.id}`}
            className="w-full flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {messages["team.action.team-detail"]}
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
};
