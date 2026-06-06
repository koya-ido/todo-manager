import { ContentProps } from "@/types/contentTypes";
import { TodoMode } from "@/types/todo";

export type TodoDetailProps = ContentProps & {
  todoId: number;
  mode?: TodoMode;
  teamId?: number;
};

export type Tag = {
  id: number;
  name: string;
};

export type UserObj = {
  id: number;
  user_name: string;
  display_user_id: string;
};

export type Comment = {
  id: number;
  user_id: number;
  todo_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  delete_flag: boolean;
  user?: UserObj | null;
};

export type Task = {
  id: number;
  title: string;
  content: string | null;
  completion_flag: boolean;
  position: number;
};

export type TodoDetail = {
  id: number;
  name: string;
  status_id: number;
  priority_id: number;
  team_id?: number | null;
  manager_id?: number | null;
  created_at: string | null;
  due_date: string | null;
  tags: Tag[];
  tasks: Task[];
  comments: Comment[];
};
