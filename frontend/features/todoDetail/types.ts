import { Comment as CommonComment } from "@/types/comment";
import { ContentProps } from "@/types/contentTypes";
import { Tag as CommonTag } from "@/types/tag";
import { Task as CommonTask } from "@/types/task";
import { TodoDetail as CommonTodoDetail, TodoMode } from "@/types/todo";
import { User } from "@/types/user";

export type TodoDetailProps = ContentProps & {
  todoId: number;
  mode?: TodoMode;
  teamId?: number;
};

export type Tag = CommonTag;
export type UserObj = User;
export type Comment = CommonComment;
export type Task = CommonTask;
export type TodoDetail = CommonTodoDetail;
