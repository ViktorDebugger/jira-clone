import { TaskStatus } from "./types";

export const taskStatusLabelsUk: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "Беклог",
  [TaskStatus.TODO]: "Зробити",
  [TaskStatus.IN_PROGRESS]: "В процесі",
  [TaskStatus.IN_REVIEW]: "На перевірці",
  [TaskStatus.DONE]: "Виконано",
};

export const taskStatusesOrdered: readonly TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];
