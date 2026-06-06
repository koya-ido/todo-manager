export type TodoMode = "private" | "team";

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

export type TodoStatusFilter = keyof typeof Status | 0;
export type TodoPriorityFilter = keyof typeof Priority | 0;