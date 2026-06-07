import { ContentProps } from "@/types/contentTypes";
import { TodoMode } from "@/types/todo";

export type TodosProps = ContentProps & {
  mode?: TodoMode;
  isDeleteOnly?: boolean;
  teamId?: number;
};
