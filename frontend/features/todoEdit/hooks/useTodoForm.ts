import { ErrorContext } from "@/components/features/ErrorProvider";
import { useAvailableTags } from "@/features/todoEdit/hooks/useAvailableTags";
import { useNavigationGuard } from "@/features/todoEdit/hooks/useNavigationGuard";
import { useTeamMembers } from "@/features/todoEdit/hooks/useTeamMembers";
import {
  FieldErrors,
  FormState,
  TaskState,
  TodoResponse,
} from "@/features/todoEdit/types";
import { isStateDirty } from "@/features/todoEdit/utils";
import { isErrorResponse } from "@/hooks/useError/errorUtils";
import { apiGet, apiPost, apiPut } from "@/hooks/useFetchApi";
import { TodoMode } from "@/types/todo";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type UseTodoFormProps = {
  mode: TodoMode;
  isNew: boolean;
  todoId?: number;
  teamId?: number;
  messages: Record<string, string>;
};

export const useTodoForm = ({
  mode,
  isNew,
  todoId,
  teamId,
  messages,
}: UseTodoFormProps) => {
  const router = useRouter();
  const { setErrorResponse, clearInlineErrors } = useContext(ErrorContext);

  useEffect(() => {
    clearInlineErrors();
    return () => clearInlineErrors();
  }, [clearInlineErrors]);

  // フォーム状態
  const [name, setName] = useState<string>("");
  const [statusId, setStatusId] = useState<string>("1");
  const [priorityId, setPriorityId] = useState<string>("3");
  const [startDate, setStartDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [managerId, setManagerId] = useState<string>("");
  const [tasks, setTasks] = useState<TaskState[]>([
    { title: "", content: "", completion_flag: false, key: "task-initial" },
  ]);

  // チームとメンバーの状態
  const [currentTeamId, setCurrentTeamId] = useState<number | undefined>(
    teamId,
  );

  // UI状態
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 破棄確認状態
  const [initialState, setInitialState] = useState<FormState | null>(null);

  // バリデーション状態
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // 1. 独立したタグフック
  const {
    availableTags,
    selectedTags,
    setSelectedTags,
    newTagName,
    setNewTagName,
    isCreatingTag,
    handleCreateTag,
    handleRemoveTag,
  } = useAvailableTags({
    mode,
    currentTeamId,
    setErrorResponse,
  });

  // 2. 独立したチームメンバーフック
  const { members } = useTeamMembers({
    mode,
    currentTeamId,
    setErrorResponse,
  });

  const handleNameChange = (val: string) => {
    setName(val);
    setFieldErrors((prev) => {
      if (!prev.name) return prev;
      const nextErrors = { ...prev };
      if (!val.trim()) {
        nextErrors.name = messages["validate.required"];
      } else if (val.length > 255) {
        nextErrors.name = messages["validate.maxLength"]?.replace(
          "{max}",
          "255",
        );
      } else {
        delete nextErrors.name;
      }
      return nextErrors;
    });
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      if (val && dueDate && val > dueDate) {
        nextErrors.dueDate = messages["validate.dueDate"];
      } else {
        delete nextErrors.dueDate;
      }
      return nextErrors;
    });
  };

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      if (startDate && val && startDate > val) {
        nextErrors.dueDate = messages["validate.dueDate"];
      } else {
        delete nextErrors.dueDate;
      }
      return nextErrors;
    });
  };

  // 編集中の場合は既存のTodoデータをロード
  useEffect(() => {
    if (isNew || !todoId) return;

    const loadTodo = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet<TodoResponse>(`/todo/${todoId}`);
        setName(response.name);
        setStatusId(String(response.status_id));
        setPriorityId(String(response.priority_id));
        if (response.team_id) {
          setCurrentTeamId(response.team_id);
        }
        if (response.manager_id) {
          setManagerId(String(response.manager_id));
        }

        // 作成日 (YYYY-MM-DD)
        let startD = "";
        if (response.created_at) {
          startD = response.created_at.split("T")[0];
          setStartDate(startD);
        }

        setDueDate(response.due_date || "");
        setSelectedTags(response.tags || []);

        const loadedTasks: TaskState[] =
          response.tasks && response.tasks.length > 0
            ? [...response.tasks]
                .sort((a, b) => a.position - b.position)
                .map((t) => ({
                  id: t.id,
                  title: t.title,
                  content: t.content || "",
                  completion_flag: t.completion_flag,
                  key: String(t.id),
                }))
            : [
                {
                  title: "",
                  content: "",
                  completion_flag: false,
                  key: "task-0",
                },
              ];

        setTasks(loadedTasks);

        setInitialState({
          name: response.name,
          statusId: String(response.status_id),
          priorityId: String(response.priority_id),
          startDate: startD,
          dueDate: response.due_date || "",
          managerId: response.manager_id ? String(response.manager_id) : "",
          selectedTags: response.tags || [],
          tasks: loadedTasks,
        });
        setIsLoading(false);
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
      }
    };

    void loadTodo();
  }, [isNew, todoId, setErrorResponse, messages, setSelectedTags]);

  // 新規TODOの初期状態を設定
  useEffect(() => {
    if (isNew) {
      setInitialState({
        name: "",
        statusId: "1",
        priorityId: "3",
        startDate: "",
        dueDate: "",
        managerId: "",
        selectedTags: [],
        tasks: [
          {
            title: "",
            content: "",
            completion_flag: false,
            key: "task-initial",
          },
        ],
      });
    }
  }, [isNew]);

  const isDirty = isStateDirty(
    {
      name,
      statusId,
      priorityId,
      startDate,
      dueDate,
      managerId,
      selectedTags,
      tasks,
    },
    initialState,
  );

  // 3. 独立したナビゲーションガードフック
  const {
    showDiscardDialog,
    setShowDiscardDialog,
    handleConfirmDiscard,
    handleCancelDiscard,
  } = useNavigationGuard(isDirty && !isSubmitting, () => {
    setInitialState(null);
  });

  // タスクリストの操作
  const handleAddTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        title: "",
        content: "",
        completion_flag: false,
        key: `task-${Date.now()}-${Math.random()}`,
      },
    ]);
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length <= 1) {
      toast.warning("TODOには少なくとも1件のタスクが必要です");
      return;
    }
    const taskKey = tasks[index]?.key;
    setTasks((prev) => prev.filter((_, i) => i !== index));

    if (taskKey) {
      setFieldErrors((prev) => {
        if (!prev.tasks || !prev.tasks[taskKey]) return prev;
        const nextTaskErrors = { ...prev.tasks };
        delete nextTaskErrors[taskKey];

        const nextErrors = { ...prev };
        if (Object.keys(nextTaskErrors).length > 0) {
          nextErrors.tasks = nextTaskErrors;
        } else {
          delete nextErrors.tasks;
        }
        return nextErrors;
      });
    }
  };

  const handleTaskChange = (
    index: number,
    field: keyof TaskState,
    value: string | boolean | null,
  ) => {
    setTasks((prev) => {
      const next = prev.map((task, i) =>
        i === index ? ({ ...task, [field]: value } as TaskState) : task,
      );

      if (field === "title" || field === "content") {
        const taskKey = prev[index]?.key;
        if (taskKey) {
          const valStr = typeof value === "string" ? value : "";
          setFieldErrors((prevErrors) => {
            const nextTasks = { ...prevErrors.tasks };
            const currentTaskErrors = nextTasks[taskKey]
              ? { ...nextTasks[taskKey] }
              : {};

            if (field === "title") {
              if (!valStr.trim()) {
                currentTaskErrors.title = messages["validate.required"];
              } else if (valStr.length > 50) {
                currentTaskErrors.title = messages[
                  "validate.maxLength"
                ]?.replace("{max}", "50");
              } else {
                delete currentTaskErrors.title;
              }
            } else if (field === "content") {
              if (valStr.length > 800) {
                currentTaskErrors.content = messages[
                  "validate.maxLength"
                ]?.replace("{max}", "800");
              } else {
                delete currentTaskErrors.content;
              }
            }

            if (Object.keys(currentTaskErrors).length > 0) {
              nextTasks[taskKey] = currentTaskErrors;
            } else {
              delete nextTasks[taskKey];
            }

            const nextErrors = { ...prevErrors };
            if (Object.keys(nextTasks).length > 0) {
              nextErrors.tasks = nextTasks;
            } else {
              delete nextErrors.tasks;
            }
            return nextErrors;
          });
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // クライアント側のバリデーション
    const newErrors: typeof fieldErrors = {};
    let isValid = true;

    // 名前の検証
    if (!name.trim()) {
      newErrors.name = messages["validate.required"];
      isValid = false;
    } else if (name.length > 255) {
      newErrors.name = messages["validate.maxLength"]?.replace("{max}", "255");
      isValid = false;
    }

    // タスクの検証
    const taskErrors: Record<string, { title?: string; content?: string }> = {};
    tasks.forEach((task) => {
      const currentTaskErrors: { title?: string; content?: string } = {};

      if (!task.title.trim()) {
        currentTaskErrors.title = messages["validate.required"];
        isValid = false;
      } else if (task.title.length > 50) {
        currentTaskErrors.title = messages["validate.maxLength"]?.replace(
          "{max}",
          "50",
        );
        isValid = false;
      }

      if (task.content && task.content.length > 800) {
        currentTaskErrors.content = messages["validate.maxLength"]?.replace(
          "{max}",
          "800",
        );
        isValid = false;
      }

      if (Object.keys(currentTaskErrors).length > 0) {
        taskErrors[task.key] = currentTaskErrors;
      }
    });

    if (Object.keys(taskErrors).length > 0) {
      newErrors.tasks = taskErrors;
    }

    // 日付範囲の検証
    if (startDate && dueDate && startDate > dueDate) {
      newErrors.dueDate = messages["validate.dueDate"];
      isValid = false;
    }

    // チームモード時の担当者の検証
    if (mode === "team" && !managerId) {
      newErrors.managerId = messages["validate.required"];
      isValid = false;
    }

    if (!isValid) {
      setFieldErrors(newErrors);
      toast.error("入力内容を確認してください");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      status_id: parseInt(statusId, 10),
      priority_id: parseInt(priorityId, 10),
      team_id: mode === "team" ? currentTeamId || null : null,
      manager_id: mode === "team" ? parseInt(managerId, 10) : null,
      due_date: dueDate || null,
      remarks: "",
      delete_flag: false,
      tasks: tasks.map((t) => ({
        title: t.title.trim(),
        content: t.content ? t.content.trim() : null,
        completion_flag: t.completion_flag,
      })),
      tag_ids: selectedTags.map((t) => t.id),
    };

    try {
      if (isNew) {
        const response = await apiPost<TodoResponse>(
          "/todo",
          JSON.stringify(payload),
        );
        toast.success("TODOを登録しました");
        setInitialState(null);
        router.push(`/todo/${response.id}?mode=${mode}`);
      } else {
        const response = await apiPut<TodoResponse>(
          `/todo/${todoId}`,
          JSON.stringify(payload),
        );
        toast.success("TODOを更新しました");
        setInitialState(null);
        router.push(`/todo/${response.id}?mode=${mode}`);
      }
    } catch (error) {
      setErrorResponse(error);
      toast.error(
        isNew
          ? messages["FAILED_TO_CREATE"]?.replace("{name}", "TODO")
          : messages["FAILED_TO_UPDATE"]?.replace("{name}", "TODO"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isSubmitting ||
    !name.trim() ||
    (mode === "team" && !managerId) ||
    tasks.some((t) => !t.title.trim()) ||
    Object.keys(fieldErrors).length > 0;

  return {
    name,
    setName,
    statusId,
    setStatusId,
    priorityId,
    setPriorityId,
    startDate,
    setStartDate,
    dueDate,
    setDueDate,
    managerId,
    setManagerId,
    selectedTags,
    setSelectedTags,
    tasks,
    setTasks,
    members,
    availableTags,
    newTagName,
    setNewTagName,
    isCreatingTag,
    isLoading,
    isSubmitting,
    showDiscardDialog,
    setShowDiscardDialog,
    fieldErrors,
    setFieldErrors,
    handleNameChange,
    handleStartDateChange,
    handleDueDateChange,
    handleCreateTag,
    handleRemoveTag,
    handleAddTask,
    handleRemoveTask,
    handleTaskChange,
    handleSubmit,
    isSubmitDisabled,
    handleConfirmDiscard,
    handleCancelDiscard,
  };
};
