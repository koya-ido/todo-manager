import { Badge } from "@/components/Layout/Badge";
import { Card } from "@/components/Layout/Card";
import { ProgressCircle } from "@/components/Layout/ProgressCircle/ProgressCircle";
import { Todo } from "@/features/todos/hooks/useTodos";
import { FC } from "react";

type TodoItemCardProps = {
  todo: Todo;
  messages: Record<string, string>;
  onClick: () => void;
};

const statusColorMap: Record<Todo["status"], string> = {
  "not-started": "bg-chart-6",
  "in-progress": "bg-chart-1",
  done: "bg-chart-3",
  pending: "bg-chart-2",
};

export const TodoItemCard: FC<TodoItemCardProps> = ({ todo, messages, onClick }) => {
  const progress = todo.tasks.length > 0
    ? (todo.tasks.filter((task) => task.completion_flag).length / todo.tasks.length) * 100
    : 0;

  const statusColorClass = statusColorMap[todo.status] || "bg-chart-2";

  return (
    <Card
      className="p-0 rounded-none flex flex-row gap-0"
      onClick={onClick}
    >
      <div className={`${statusColorClass} w-2`} />
      <div className="m-3 w-full z-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Badge className={`h-fit py-1 font-bold ${statusColorClass}`}>{messages[`common.status.${todo.status}`]}</Badge>
            <Badge className="h-fit py-1">
              {messages["common.priority"]}:
              {messages[`common.priority.${todo.priority}`]}
            </Badge>
          </div>
          <ProgressCircle
            progress={progress}
            status={todo.status}
            className="pointer-events-none w-8 h-8"
          />
        </div>
        <p className="text-md font-bold">{todo.title}</p>
        <div className="text-xs flex justify-between">
          <div>
            <p className="font-bold">
              {messages["common.start-date"]}
            </p>
            <p>{todo.startDate}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{messages["common.due-date"]}</p>
            <p>{todo.dueDate}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
