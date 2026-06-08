import { User } from "@/types/user";

export type Comment = {
  id: number;
  user_id: number;
  todo_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  delete_flag: boolean;
  user?: User | null;
};
