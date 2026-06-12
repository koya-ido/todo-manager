import { ErrorContext } from "@/components/features/ErrorProvider";
import { getTodayLocalDateString } from "@/utils/DateUtils";
import { useUser } from "@/features/user/hooks/useUser";
import { apiGet } from "@/hooks/useFetchApi";
import { ApiTodo, ApiTodosResponse, TodoStatus } from "@/types/todo";
import { useContext, useEffect, useState } from "react";

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

  // 統計情報の算出（論理削除されたTODOは除外）
  const activeTodos = todos.filter((todo) => !todo.delete_flag);
  const totalTodosCount = activeTodos.length;
  const completedTodosCount = activeTodos.filter(
    (todo) => todo.status_id === TodoStatus.DONE,
  ).length;

  // 本日締め切りの未完了TODOをフィルタリング（status_id !== TodoStatus.DONE かつ due_date === todayString）
  const todayString = getTodayLocalDateString();
  const todayIncompleteTodos = activeTodos.filter(
    (todo) => todo.status_id !== TodoStatus.DONE && todo.due_date === todayString,
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
