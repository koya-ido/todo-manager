import { MeResponse } from "@/components/features/AuthSessionProvider/types";
import { ErrorContext } from "@/components/features/ErrorProvider";
import { Comment, TodoDetail } from "@/features/todoDetail/types";
import { isErrorResponse } from "@/hooks/useError/errorUtils";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/hooks/useFetchApi";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type UseTodoDetailProps = {
  todoId: number;
  messages: Record<string, string>;
};

export const useTodoDetail = ({ todoId, messages }: UseTodoDetailProps) => {
  const router = useRouter();
  const { setErrorResponse } = useContext(ErrorContext);
  const [todo, setTodo] = useState<TodoDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] =
    useState<boolean>(false);
  const [isDeletingCommentId, setIsDeletingCommentId] = useState<number | null>(
    null,
  );
  const [isUpdatingCommentId, setIsUpdatingCommentId] = useState<number | null>(
    null,
  );

  const fetchTodo = useCallback(async () => {
    try {
      const data = await apiGet<TodoDetail>(`/todo/${todoId}`);
      setTodo(data);
    } catch (error) {
      if (isErrorResponse(error)) {
        if (error.code === "TODO_NOT_FOUND" || error.status === 404) {
          router.push("/not-found");
        } else {
          router.push(`/error?status=${error.status}&code=${error.code}`);
        }
      } else {
        router.push("/error?status=500&code=UNKNOWN");
      }
      throw error;
    }
  }, [todoId, router]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await apiGet<MeResponse>("/me");
      setCurrentUser(data);
    } catch (error) {
      setErrorResponse(error);
    }
  }, [setErrorResponse]);

  useEffect(() => {
    const initLoad = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchTodo(), fetchCurrentUser()]);
        setIsLoading(false);
      } catch {
        // リダイレクト遷移中もisLoadingをアクティブに保つ
      }
    };
    void initLoad();
  }, [fetchTodo, fetchCurrentUser]);

  const handleUpdateStatus = async (statusId: string) => {
    if (!todo) return;
    try {
      const updatedTodo = await apiPut<TodoDetail>(
        `/todo/${todoId}`,
        JSON.stringify({ status_id: parseInt(statusId, 10) }),
      );
      setTodo(updatedTodo);
      toast.success(messages["todo-edit.update.success"]);
    } catch (error) {
      setErrorResponse(error);
      toast.error(messages["FAILED_TO_UPDATE"]?.replace("{name}", "TODO"));
    }
  };

  const handleToggleTask = async (taskId: number, completionFlag: boolean) => {
    if (!todo) return;
    try {
      const updatedTodo = await apiPatch<TodoDetail>(
        `/todo/${todoId}/tasks/${taskId}`,
        JSON.stringify({ completion_flag: completionFlag }),
      );
      if (updatedTodo.status_id !== todo.status_id) {
        toast.success(messages["todo-edit.update.success"]);
      }
      setTodo(updatedTodo);
    } catch (error) {
      setErrorResponse(error);
      toast.error(messages["FAILED_TO_UPDATE"]?.replace("{name}", "タスク"));
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await apiPost<Comment>(
        `/todo/${todoId}/comments`,
        JSON.stringify({ comment: commentText.trim() }),
      );
      setCommentText("");
      toast.success(messages["todo-detail.comment.create.success"]);
      await fetchTodo(); // 新しいコメントを表示するために詳細を更新
    } catch (error) {
      setErrorResponse(error);
      toast.error(messages["FAILED_TO_CREATE"]?.replace("{name}", "コメント"));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setIsDeletingCommentId(commentId);
    try {
      await apiDelete(`/todo/${todoId}/comments/${commentId}`);
      toast.success(messages["todo-detail.comment.delete.success"]);
      await fetchTodo(); // 詳細を更新
    } catch (error) {
      setErrorResponse(error);
      toast.error(messages["FAILED_TO_DELETE"]?.replace("{name}", "コメント"));
    } finally {
      setIsDeletingCommentId(null);
    }
  };

  const handleDeleteTodo = async (
    mode: string = "private",
    isPermanently: boolean = false,
  ) => {
    try {
      await apiDelete(`/todo/${todoId}`);
      if (isPermanently) {
        toast.success(messages["todo-detail.delete-permanently.success"]);
      } else {
        toast.success(messages["todo-detail.delete.success"]);
      }
      router.push(`/todo?mode=${mode}`);
    } catch (error) {
      setErrorResponse(error);
      toast.error(messages["FAILED_TO_DELETE"]?.replace("{name}", "TODO"));
      throw error;
    }
  };

  const handleRestoreTodo = async (mode: string = "private") => {
    try {
      await apiPut(`/todo/${todoId}`, JSON.stringify({ delete_flag: false }));
      toast.success(messages["todo-detail.restore.success"]);
      router.push(`/todo?mode=${mode}`);
    } catch (error) {
      setErrorResponse(error);
      toast.error(messages["FAILED_TO_UPDATE"]?.replace("{name}", "TODO"));
    }
  };

  const handleUpdateComment = async (commentId: number, newText: string) => {
    setIsUpdatingCommentId(commentId);
    try {
      await apiPut(
        `/todo/${todoId}/comments/${commentId}`,
        JSON.stringify({ comment: newText.trim() }),
      );
      toast.success(messages["todo-detail.comment.update.success"]);
      await fetchTodo(); // 詳細を更新
    } catch (error) {
      setErrorResponse(error);
      toast.error(messages["FAILED_TO_UPDATE"]?.replace("{name}", "コメント"));
      throw error;
    } finally {
      setIsUpdatingCommentId(null);
    }
  };

  return {
    todo,
    currentUser,
    isLoading,
    commentText,
    setCommentText,
    isSubmittingComment,
    isDeletingCommentId,
    isUpdatingCommentId,
    handleUpdateStatus,
    handleToggleTask,
    handleSendComment,
    handleDeleteComment,
    handleDeleteTodo,
    handleRestoreTodo,
    handleUpdateComment,
    refetchTodo: fetchTodo,
  };
};
