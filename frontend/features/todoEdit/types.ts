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

import { Tag as CommonTag } from "@/types/tag";
import { TodoDetail } from "@/types/todo";
import { User } from "@/types/user";

export type Tag = CommonTag;
export type TodoResponse = TodoDetail;
export type Member = User;

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

export type FieldErrors = {
  name?: string;
  tasks?: Record<string, { title?: string; content?: string }>;
  dueDate?: string;
  managerId?: string;
};
