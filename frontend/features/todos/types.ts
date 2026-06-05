import { ContentProps } from "@/types/contentTypes";
import { TodoMode } from "@/features/todos/hooks/useTodos";

export type TodosProps = ContentProps & {
  mode?: TodoMode;
  isDeleteOnly?: boolean;
};
