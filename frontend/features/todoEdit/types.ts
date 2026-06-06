import { ContentProps } from "@/types/contentTypes";
import { TodoMode } from "@/types/todo";

export type TodoEditProps = ContentProps & {
  mode?: TodoMode;
  isNew?: boolean;
  todoId?: number;
  teamId?: number;
};

export type TaskState = {
  id?: number;
  title: string;
  content: string | null;
  completion_flag: boolean;
  key: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type TodoResponse = {
  id: number;
  name: string;
  status_id: number;
  priority_id: number;
  team_id?: number | null;
  manager_id?: number | null;
  created_at: string | null;
  due_date: string | null;
  tags: Tag[];
  tasks: {
    id: number;
    title: string;
    content: string | null;
    completion_flag: boolean;
    position: number;
  }[];
};

export type FormState = {
  name: string;
  statusId: string;
  priorityId: string;
  startDate: string;
  dueDate: string;
  managerId: string;
  selectedTags: Tag[];
  tasks: TaskState[];
};

export type Member = {
  id: number;
  user_name: string;
  display_user_id: string;
};

export type FieldErrors = {
  name?: string;
  tasks?: Record<string, { title?: string; content?: string }>;
  dueDate?: string;
  managerId?: string;
};
