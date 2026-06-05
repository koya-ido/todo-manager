"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { apiGet } from "@/hooks/useFetchApi";
import { useContext, useEffect, useMemo, useState, useCallback } from "react";

export const Status = {
  1: "not-started",
  2: "in-progress",
  3: "done",
  4: "pending",
} as const;

export const Priority = {
  1: "high",
  2: "medium",
  3: "low",
} as const;

export type StatusType = (typeof Status)[keyof typeof Status];
export type PriorityType = (typeof Priority)[keyof typeof Priority];

export type TodoMode = "private" | "team";
export type TodoStatusFilter = keyof typeof Status | 0;
export type TodoPriorityFilter = keyof typeof Priority | 0;
export type TodoSort =
  | "create-date-desc"
  | "create-date-asc"
  | "end-date-desc"
  | "end-date-asc"
  | "start-date-desc"
  | "start-date-asc";

type ApiTask = {
  id: number;
  position: number;
  title: string;
  content: string | null;
  completion_flag: boolean;
};

type ApiComment = {
  id: number;
  user_id: number;
  todo_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  delete_flag: boolean;
};

type ApiTodo = {
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
  comments: ApiComment[];
};

type ApiTodosResponse = {
  total: number;
  items: ApiTodo[];
};

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
  tasks: ApiTask[];
  deleteFlag: boolean;
  searchableText: string;
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
    ...todo.tasks.map((task) => `${task.title} ${task.content ?? ""}`),
    ...todo.comments.map((comment) => comment.comment),
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
  };
};

export const useTodos = (
  mode: TodoMode,
  isDeleteOnly: boolean,
  keyword: string,
  status: TodoStatusFilter[],
  priority: TodoPriorityFilter[],
  sort: TodoSort,
) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { setErrorResponse } = useContext(ErrorContext);

  const limit = 20;

  // Fetch total count (only when mode or isDeleteOnly changes)
  useEffect(() => {
    let active = true;
    const fetchTotalCount = async () => {
      try {
        const totalParams = new URLSearchParams();
        if (mode) totalParams.append("mode", mode);
        totalParams.append("is_delete_only", String(isDeleteOnly));
        const totalResponse = await apiGet<ApiTodosResponse>(`/todo?${totalParams.toString()}`);
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
  }, [mode, isDeleteOnly, setErrorResponse]);

  // Fetch filtered & sorted todos (when search params change)
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
        if (sort) searchParams.append("sort", sort);

        searchParams.append("offset", "0");
        searchParams.append("limit", String(limit));

        const response = await apiGet<ApiTodosResponse>(`/todo?${searchParams.toString()}`);
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
  }, [mode, isDeleteOnly, keyword, status, priority, sort, setErrorResponse]);

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
      if (sort) searchParams.append("sort", sort);

      searchParams.append("offset", String(todos.length));
      searchParams.append("limit", String(limit));

      const response = await apiGet<ApiTodosResponse>(`/todo?${searchParams.toString()}`);
      
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
