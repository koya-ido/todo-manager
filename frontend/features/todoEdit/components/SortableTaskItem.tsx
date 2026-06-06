import { Button } from "@/components/forms/Button";
import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { Textarea } from "@/components/forms/Textarea";
import { TaskState } from "@/features/todoEdit/types";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, Trash2 } from "lucide-react";
import { FC } from "react";

type SortableTaskItemProps = {
  task: TaskState;
  index: number;
  tasksCount: number;
  handleTaskChange: (index: number, field: keyof TaskState, value: string | boolean | null) => void;
  handleRemoveTask: (index: number) => void;
  messages: Record<string, string>;
  errorTextTitle?: string;
  errorTextContent?: string;
};

export const SortableTaskItem: FC<SortableTaskItemProps> = ({
  task,
  index,
  tasksCount,
  handleTaskChange,
  handleRemoveTask,
  messages,
  errorTextTitle,
  errorTextContent,
}) => {
  const { ref, handleRef, isDragging } = useSortable({
    id: task.key,
    index,
  });

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2 bg-card border rounded-xl p-4 shadow-xs transition-opacity"
    >
      {/* Drag Handle */}
      <div
        ref={handleRef}
        className="cursor-grab text-muted-foreground/60 hover:text-muted-foreground focus:outline-hidden"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Task Input Fields */}
      <div className="flex-1 min-w-0 space-y-3">
        <InputField
          label={messages["todo-edit.task-item.title"]}
          placeholder={messages["todo-edit.task-item.title"]}
          type="text"
          value={task.title}
          required
          onChange={(e) => handleTaskChange(index, "title", e.target.value)}
          className="w-full"
          errorText={errorTextTitle}
        />

        <FieldWrapper
          label={messages["todo-edit.task-item.description"]}
          errorText={errorTextContent}
        >
          <Textarea
            placeholder={messages["todo-edit.task-item.description"]}
            value={task.content || ""}
            onChange={(e) => handleTaskChange(index, "content", e.target.value)}
            className="min-h-16 w-full resize-y bg-background"
          />
        </FieldWrapper>
      </div>

      {/* Delete Task Button */}
      {tasksCount > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveTask(index)}
          className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
