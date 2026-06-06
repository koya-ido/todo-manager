import { FormState } from "@/features/todoEdit/types";

export const isStateDirty = (
  current: FormState,
  initial: FormState | null,
): boolean => {
  if (!initial) return false;
  if (current.name !== initial.name) return true;
  if (current.statusId !== initial.statusId) return true;
  if (current.priorityId !== initial.priorityId) return true;
  if (current.startDate !== initial.startDate) return true;
  if (current.dueDate !== initial.dueDate) return true;
  if (current.managerId !== initial.managerId) return true;

  if (current.selectedTags.length !== initial.selectedTags.length) return true;
  const currentTagIds = new Set(current.selectedTags.map((t) => t.id));
  if (initial.selectedTags.some((t) => !currentTagIds.has(t.id))) return true;

  if (current.tasks.length !== initial.tasks.length) return true;
  for (let i = 0; i < current.tasks.length; i++) {
    const curT = current.tasks[i];
    const initT = initial.tasks[i];
    if (curT.title !== initT.title) return true;
    if ((curT.content || "") !== (initT.content || "")) return true;
    if (curT.completion_flag !== initT.completion_flag) return true;
  }

  return false;
};
