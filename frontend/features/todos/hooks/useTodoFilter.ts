import { TodoSort } from "@/features/todos/hooks/useTodos";
import { getNextMultiSelectValue } from "@/features/todos/utils";
import { TodoPriorityFilter, TodoStatusFilter } from "@/types/todo";
import { useCallback, useMemo, useState } from "react";

export const useTodoFilter = (messages: Record<string, string>) => {
  const [keyword, setKeyword] = useState<string>("");

  const StatusFilterItems = useMemo(
    () => [
      { value: 0, label: messages["todo-list.filter-option.status.all"] || "" },
      { value: 1, label: messages["common.status.not-started"] || "" },
      { value: 2, label: messages["common.status.in-progress"] || "" },
      { value: 3, label: messages["common.status.done"] || "" },
      { value: 4, label: messages["common.status.pending"] || "" },
    ],
    [messages],
  );

  const PriorityFilterItems = useMemo(
    () => [
      {
        value: 0,
        label: messages["todo-list.filter-option.priority.all"] || "",
      },
      { value: 1, label: messages["common.priority.high"] || "" },
      { value: 2, label: messages["common.priority.medium"] || "" },
      { value: 3, label: messages["common.priority.low"] || "" },
    ],
    [messages],
  );

  const SortItems = useMemo(
    () => [
      {
        value: "create-date-desc",
        label: messages["todo-list.sort-option.createdAt-desc"] || "",
      },
      {
        value: "create-date-asc",
        label: messages["todo-list.sort-option.createdAt-asc"] || "",
      },
      {
        value: "end-date-desc",
        label: messages["todo-list.sort-option.dueDate-desc"] || "",
      },
      {
        value: "end-date-asc",
        label: messages["todo-list.sort-option.dueDate-asc"] || "",
      },
      {
        value: "start-date-desc",
        label: messages["todo-list.sort-option.startDate-desc"] || "",
      },
      {
        value: "start-date-asc",
        label: messages["todo-list.sort-option.startDate-asc"] || "",
      },
    ],
    [messages],
  );

  const [status, setStatus] = useState<string[]>([
    messages["todo-list.filter-option.status.all"] || "",
  ]);
  const [priority, setPriority] = useState<string[]>([
    messages["todo-list.filter-option.priority.all"] || "",
  ]);
  const [sort, setSort] = useState<TodoSort>("create-date-desc");
  const [managerId, setManagerId] = useState<string>("0");

  const [appliedKeyword, setAppliedKeyword] = useState<string>("");
  const [appliedStatus, setAppliedStatus] = useState<TodoStatusFilter[]>([0]);
  const [appliedPriority, setAppliedPriority] = useState<TodoPriorityFilter[]>([
    0,
  ]);
  const [appliedSort, setAppliedSort] = useState<TodoSort>("create-date-desc");
  const [appliedManagerId, setAppliedManagerId] = useState<number>(0);

  const selectedStatusIds = useMemo(
    () =>
      status
        .map((selectedStatus) =>
          StatusFilterItems.find((item) => item.label === selectedStatus),
        )
        .filter((item): item is (typeof StatusFilterItems)[number] => !!item)
        .map((item) => item.value as TodoStatusFilter),
    [StatusFilterItems, status],
  );

  const selectedPriorityIds = useMemo(
    () =>
      priority
        .map((selectedPriority) =>
          PriorityFilterItems.find((item) => item.label === selectedPriority),
        )
        .filter((item): item is (typeof PriorityFilterItems)[number] => !!item)
        .map((item) => item.value as TodoPriorityFilter),
    [PriorityFilterItems, priority],
  );

  const handleStatusChange = useCallback(
    (next: string | string[] | null) => {
      const nextArray = Array.isArray(next) ? next : next ? [next] : [];
      setStatus((prev) => {
        const allStatus = messages["todo-list.filter-option.status.all"] || "";
        const otherStatusLabels = StatusFilterItems.map(
          (item) => item.label,
        ).filter((l) => l !== allStatus);
        return getNextMultiSelectValue(
          prev,
          nextArray,
          allStatus,
          otherStatusLabels,
        );
      });
    },
    [messages, StatusFilterItems],
  );

  const handlePriorityChange = useCallback(
    (next: string | string[] | null) => {
      const nextArray = Array.isArray(next) ? next : next ? [next] : [];
      setPriority((prev) => {
        const allPriority =
          messages["todo-list.filter-option.priority.all"] || "";
        const otherPriorityLabels = PriorityFilterItems.map(
          (item) => item.label,
        ).filter((l) => l !== allPriority);
        return getNextMultiSelectValue(
          prev,
          nextArray,
          allPriority,
          otherPriorityLabels,
        );
      });
    },
    [messages, PriorityFilterItems],
  );

  const handleClickSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setAppliedKeyword(keyword);
      setAppliedStatus(selectedStatusIds);
      setAppliedPriority(selectedPriorityIds);
      setAppliedSort(sort);
      setAppliedManagerId(Number(managerId));
    },
    [keyword, selectedStatusIds, selectedPriorityIds, sort, managerId],
  );

  return {
    keyword,
    setKeyword,
    status,
    setStatus,
    priority,
    setPriority,
    sort,
    setSort,
    managerId,
    setManagerId,
    StatusFilterItems,
    PriorityFilterItems,
    SortItems,
    selectedStatusIds,
    selectedPriorityIds,
    handleStatusChange,
    handlePriorityChange,
    handleClickSearch,
    appliedKeyword,
    appliedStatus,
    appliedPriority,
    appliedSort,
    appliedManagerId,
  };
};
