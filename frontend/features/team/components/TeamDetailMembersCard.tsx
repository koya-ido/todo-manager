import { Button } from "@/components/forms/Button";
import { Badge } from "@/components/Layout/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Layout/Card";
import { TeamDetailResponse, TeamMemberResponse } from "@/features/team/types";
import { UserMinus, Users } from "lucide-react";
import { FC } from "react";

type TeamDetailMembersCardProps = {
  team: TeamDetailResponse;
  members: TeamMemberResponse[];
  messages: Record<string, string>;
  onKickClick: (member: TeamMemberResponse) => void;
};

export const TeamDetailMembersCard: FC<TeamDetailMembersCardProps> = ({
  team,
  members,
  messages,
  onKickClick,
}) => {
  return (
    <Card className="md:col-span-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xs">
      <CardHeader className="p-0 flex flex-row items-center gap-2 pb-2">
        <Users className="w-5 h-5 text-foreground" />
        <CardTitle className="text-lg font-bold">
          {messages["team.detail.members.heading"]}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-slate-100 dark:divide-slate-900/50">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between py-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground/10 dark:bg-foreground/10 flex items-center justify-center font-bold text-foreground dark:text-foreground">
                  {member.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {member.user_name}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      #{member.display_user_id}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-1">
                    {member.is_owner ? (
                      <Badge className="py-1 font-bold rounded-md border-0 text-xs bg-foreground/10 text-foreground dark:bg-foreground/10 dark:text-foreground h-fit">
                        {messages["team.detail.members.role.owner"]}
                      </Badge>
                    ) : (
                      <Badge className="py-1 font-bold rounded-md border-0 text-xs bg-foreground/10 text-foreground dark:bg-foreground/10 dark:text-foreground h-fit">
                        {messages["team.detail.members.role.member"]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Kick Button (Only for Admin, and cannot kick themselves) */}
              {team.is_owner && !member.is_owner && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-background hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => onKickClick(member)}
                >
                  <UserMinus className="w-4 h-4 mr-1.5" />
                  {messages["team.detail.members.kick"]}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
