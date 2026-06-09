"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { apiGet } from "@/hooks/useFetchApi";
import { Task } from "@/types/task";
import {
  ApiTodo,
  ApiTodosResponse,
  Priority,
  PriorityType,
  Status,
  StatusType,
  TodoMode,
  TodoPriorityFilter,
  TodoStatusFilter,
} from "@/types/todo";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

export type TodoSort =
  | "create-date-desc"
  | "create-date-asc"
  | "update-date-desc"
  | "update-date-asc"
  | "end-date-desc"
  | "end-date-asc"
  | "start-date-desc"
  | "start-date-asc";

export type Todo = {
  id: number;
  title: string;
  status: StatusType;
  statusId: keyof typeof Status;
  priority: PriorityType;
  priorityId: keyof typeof Priority;
  teamId: number | null;
  startDate: string;
  dueDate: string;
  createdAt: string;
  dueDateValue: string | null;
  tasks: Task[];
  deleteFlag: boolean;
  searchableText: string;
  managerId: number;
  managerName?: string;
};

const toDisplayDate = (value: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
};

const toTodo = (todo: ApiTodo): Todo => {
  const searchableText = [
    todo.name,
    todo.remarks,
    todo.manager?.user_name || "",
    ...todo.tasks.map((task) => `${task.title} ${task.content ?? ""}`),
    ...(todo.comments?.map((comment) => comment.comment) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id: todo.id,
    title: todo.name,
    status: Status[todo.status_id],
    statusId: todo.status_id,
    priority: Priority[todo.priority_id],
    priorityId: todo.priority_id,
    teamId: todo.team_id,
    startDate: toDisplayDate(todo.created_at),
    dueDate: toDisplayDate(todo.due_date),
    createdAt: todo.created_at,
    dueDateValue: todo.due_date,
    deleteFlag: todo.delete_flag,
    searchableText,
    tasks: todo.tasks,
    managerId: todo.manager_id,
    managerName: todo.manager?.user_name || undefined,
  };
};

export const useTodos = (
  mode: TodoMode,
  isDeleteOnly: boolean,
  keyword: string,
  status: TodoStatusFilter[],
  priority: TodoPriorityFilter[],
  sort: TodoSort,
  managerId?: number,
  teamId?: number,
) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { setErrorResponse } = useContext(ErrorContext);

  const limit = 20;

  // 合計件数の取得（モードまたはisDeleteOnlyが変更された場合のみ）
  useEffect(() => {
    let active = true;
    const fetchTotalCount = async () => {
      try {
        const totalParams = new URLSearchParams();
        if (mode) totalParams.append("mode", mode);
        totalParams.append("is_delete_only", String(isDeleteOnly));
        if (teamId) totalParams.append("team_id", String(teamId));
        const totalResponse = await apiGet<ApiTodosResponse>(
          `/todo?${totalParams.toString()}`,
        );
        if (active) {
          setTotalCount(totalResponse.total);
        }
      } catch (error) {
        if (active) {
          setErrorResponse(error);
        }
      }
    };
    void fetchTotalCount();
    return () => {
      active = false;
    };
  }, [mode, isDeleteOnly, teamId, setErrorResponse]);

  // フィルタリングおよびソートされたTodoの取得（検索パラメータが変更されたとき）
  useEffect(() => {
    let active = true;
    const fetchFilteredTodos = async () => {
      setIsLoading(true);
      try {
        const searchParams = new URLSearchParams();
        if (mode) searchParams.append("mode", mode);
        searchParams.append("is_delete_only", String(isDeleteOnly));
        if (keyword.trim()) searchParams.append("keyword", keyword.trim());

        status.forEach((s) => {
          if (s !== 0) {
            searchParams.append("status", String(s));
          }
        });
        priority.forEach((p) => {
          if (p !== 0) {
            searchParams.append("priority", String(p));
          }
        });
        if (managerId && managerId !== 0) {
          searchParams.append("manager_id", String(managerId));
        }
        if (teamId) {
          searchParams.append("team_id", String(teamId));
        }
        if (sort) searchParams.append("sort", sort);

        searchParams.append("offset", "0");
        searchParams.append("limit", String(limit));

        const response = await apiGet<ApiTodosResponse>(
          `/todo?${searchParams.toString()}`,
        );
        if (active) {
          const fetchedTodos = response.items.map(toTodo);
          setTodos(fetchedTodos);
          setFilteredCount(response.total);
          setHasMore(fetchedTodos.length < response.total);
        }
      } catch (error) {
        if (active) {
          setErrorResponse(error);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    void fetchFilteredTodos();
    return () => {
      active = false;
    };
  }, [
    mode,
    isDeleteOnly,
    keyword,
    status,
    priority,
    managerId,
    teamId,
    sort,
    setErrorResponse,
  ]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const searchParams = new URLSearchParams();
      if (mode) searchParams.append("mode", mode);
      searchParams.append("is_delete_only", String(isDeleteOnly));
      if (keyword.trim()) searchParams.append("keyword", keyword.trim());

      status.forEach((s) => {
        if (s !== 0) {
          searchParams.append("status", String(s));
        }
      });
      priority.forEach((p) => {
        if (p !== 0) {
          searchParams.append("priority", String(p));
        }
      });
      if (managerId && managerId !== 0) {
        searchParams.append("manager_id", String(managerId));
      }
      if (teamId) {
        searchParams.append("team_id", String(teamId));
      }
      if (sort) searchParams.append("sort", sort);

      searchParams.append("offset", String(todos.length));
      searchParams.append("limit", String(limit));

      const response = await apiGet<ApiTodosResponse>(
        `/todo?${searchParams.toString()}`,
      );

      const newTodos = response.items.map(toTodo);
      setTodos((prev) => [...prev, ...newTodos]);
      setFilteredCount(response.total);
      setHasMore(todos.length + newTodos.length < response.total);
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    mode,
    isDeleteOnly,
    keyword,
    status,
    priority,
    managerId,
    teamId,
    sort,
    todos.length,
    isLoading,
    isLoadingMore,
    hasMore,
    setErrorResponse,
  ]);

  const totalTodos = useMemo(() => {
    return new Array(totalCount);
  }, [totalCount]);

  return {
    filteredTodos: todos,
    filteredCount,
    isLoading,
    isLoadingMore,
    hasMore,
    totalTodos,
    loadMore,
  };
};
