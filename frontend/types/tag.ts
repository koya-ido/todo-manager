export type Tag = {
  id: number;
  name: string;
};

export type FullTag = Tag & {
  user_id: number | null;
  team_id: number | null;
  delete_flag: boolean;
  created_at: string;
  updated_at: string;
};
