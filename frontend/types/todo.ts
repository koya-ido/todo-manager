import { Comment } from "@/types/comment";
import { Tag } from "@/types/tag";
import { Task } from "@/types/task";
import { User } from "@/types/user";

export type TodoMode = "private" | "team";

export const TodoStatus = {
  NOT_STARTED: 1,
  IN_PROGRESS: 2,
  DONE: 3,
  PENDING: 4,
} as const;

export const Status = {
  [TodoStatus.NOT_STARTED]: "not-started",
  [TodoStatus.IN_PROGRESS]: "in-progress",
  [TodoStatus.DONE]: "done",
  [TodoStatus.PENDING]: "pending",
} as const;

export const TodoPriority = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

export const Priority = {
  [TodoPriority.HIGH]: "high",
  [TodoPriority.MEDIUM]: "medium",
  [TodoPriority.LOW]: "low",
} as const;

export type StatusType = (typeof Status)[keyof typeof Status];
export type PriorityType = (typeof Priority)[keyof typeof Priority];

export type TodoStatusFilter = keyof typeof Status | 0;
export type TodoPriorityFilter = keyof typeof Priority | 0;

export type ApiTodo = {
  id: number;
  priority_id: keyof typeof Priority;
  status_id: keyof typeof Status;
  team_id: number | null;
  manager_id: number;
  name: string;
  due_date: string | null;
  remarks: string | null;
  delete_flag: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  tasks: Task[];
  comments: Comment[];
  manager?: User | null;
};

export type ApiTodosResponse = {
  total: number;
  items: ApiTodo[];
};

export type TodoDetail = {
  id: number;
  name: string;
  status_id: number;
  priority_id: number;
  team_id?: number | null;
  manager_id?: number | null;
  manager?: User | null;
  created_at: string | null;
  due_date: string | null;
  delete_flag: boolean;
  tags: Tag[];
  tasks: Task[];
  comments: Comment[];
};
