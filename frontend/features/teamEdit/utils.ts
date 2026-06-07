import { TeamFormState } from "@/features/teamEdit/types";

export const isStateDirty = (
  current: TeamFormState,
  initial: TeamFormState | null,
): boolean => {
  if (!initial) return false;
  if (current.name !== initial.name) return true;
  if ((current.password || "") !== (initial.password || "")) return true;
  if ((current.confirmPassword || "") !== (initial.confirmPassword || "")) return true;
  return false;
};
