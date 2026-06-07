import { Button } from "@/components/forms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Layout/Card";
import { TeamDetailResponse } from "@/features/team/types";
import { Check, Copy, Crown, Info } from "lucide-react";
import { FC } from "react";

type TeamDetailInfoCardProps = {
  team: TeamDetailResponse;
  messages: Record<string, string>;
  isCopied: boolean;
  onCopyId: () => void;
};

export const TeamDetailInfoCard: FC<TeamDetailInfoCardProps> = ({
  team,
  messages,
  isCopied,
  onCopyId,
}) => {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xs">
      <CardHeader className="p-0 flex flex-row items-center gap-2 pb-2">
        <Info className="w-5 h-5 text-foreground" />
        <CardTitle className="text-lg font-bold">
          {messages["team.detail.info.heading"]}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4 text-sm">
        <div>
          <span className="text-foreground font-bold block text-xs">
            {messages["team.detail.info.name"]}
          </span>
          <span className="font-bold text-base text-slate-800 dark:text-slate-200">
            {team.name}
          </span>
        </div>

        <div>
          <span className="text-foreground font-bold block text-xs">
            {messages["team.detail.info.id"]}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <code className="bg-foreground/10 dark:bg-foreground/10 px-2.5 py-1 rounded text-sm font-mono font-bold text-foreground dark:text-foreground">
              {team.display_teams_id}
            </code>
            <Button
              variant="outline"
              size="xs"
              className="flex items-center gap-1 text-xs"
              onClick={onCopyId}
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {messages["team.detail.info.copy-id"]}
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-900/50 pt-3">
          <span className="text-foreground font-bold block text-xs">
            {messages["team.owner"]}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{team.created_user_name}</span>
            <span className="text-slate-400 text-xs">
              #{team.created_user_display_id}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
