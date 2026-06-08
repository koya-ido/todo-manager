import { PriorityBadge, StatusBadge } from "@/components/Layout/Badge";
import { Card } from "@/components/Layout/Card";
import { Priority, Status } from "@/types/todo";
import Link from "next/link";
import { FC } from "react";
import { ApiTodo } from "../hooks/useHome";

type TodayTodoCardProps = {
  todo: ApiTodo;
  messages: Record<string, string>;
};

/**
 * 本日締め切りの未完了TODOを表す個別のカードコンポーネント
 */
export const TodayTodoCard: FC<TodayTodoCardProps> = ({ todo, messages }) => {
  const statusName = Status[todo.status_id];
  const priorityName = Priority[todo.priority_id];

  return (
    <Card className="bg-card border border-border/50 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all duration-200">
      <div className="flex justify-between items-center w-full">
        <div className="space-y-2 min-w-0">
          <div className="flex gap-2 flex-wrap">
            <StatusBadge
              status={statusName}
              messages={messages}
              className="py-0.5 px-2 text-[10px]"
            />
            <PriorityBadge
              priority={priorityName}
              messages={messages}
              className="py-0.5 px-2 text-[10px]"
            />
          </div>
          <p className="font-bold text-foreground text-md truncate pr-2">
            {todo.name}
          </p>
        </div>
        <Link
          href={
            todo.team_id
              ? `/todo/${todo.id}?mode=team&teamId=${todo.team_id}`
              : `/todo/${todo.id}?mode=private`
          }
          className="text-xs text-muted-foreground hover:text-primary font-bold underline shrink-0 transition-colors"
        >
          {messages["home.today-incomplete-todos.confirm"]}
        </Link>
      </div>
    </Card>
  );
};
