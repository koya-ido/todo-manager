import { ErrorContext } from "@/components/features/ErrorProvider";
import { useUser } from "@/features/user/hooks/useUser";
import { apiGet } from "@/hooks/useFetchApi";
import { Priority, Status } from "@/types/todo";
import { useContext, useEffect, useState } from "react";
import { getLocalDateString } from "../utils";

export type ApiTask = {
  id: number;
  position: number;
  title: string;
  content: string | null;
  completion_flag: boolean;
};

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
  tasks: ApiTask[];
};

export type ApiTodosResponse = {
  total: number;
  items: ApiTodo[];
};

export const useHome = () => {
  const { userName } = useUser();
  const [todos, setTodos] = useState<ApiTodo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setErrorResponse } = useContext(ErrorContext);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        // すべての有効なTODOを取得（クライアント側で統計情報を算出するためフィルターなし）
        const response = await apiGet<ApiTodosResponse>("/todo");
        if (isMounted) {
          setTodos(response.items);
        }
      } catch (error) {
        if (isMounted) {
          setErrorResponse(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, [setErrorResponse]);

  const isDataLoading = isLoading || !userName;

  // 統計情報の算出
  const totalTodosCount = todos.length;
  const completedTodosCount = todos.filter(
    (todo) => todo.status_id === 3,
  ).length;

  // 本日締め切りの未完了TODOをフィルタリング（status_id !== 3 かつ due_date === todayString）
  const todayString = getLocalDateString(new Date());
  const todayIncompleteTodos = todos.filter(
    (todo) => todo.status_id !== 3 && todo.due_date === todayString,
  );

  return {
    userName,
    todos,
    isDataLoading,
    totalTodosCount,
    completedTodosCount,
    todayIncompleteTodos,
  };
};
