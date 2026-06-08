export type Task = {
  id: number;
  title: string;
  content: string | null;
  completion_flag: boolean;
  position: number;
};
