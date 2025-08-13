import { useQueryState, parseAsBoolean } from "nuqs";
import { TaskStatus } from "../types";

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false)
  );

  const [initialStatus, setInitialStatus] = useQueryState("initial-status");

  const open = (defaultStatus?: TaskStatus) => {
    setIsOpen(true);
    if (defaultStatus) {
      setInitialStatus(defaultStatus);
    }
  };

  const close = () => {
    setIsOpen(false);
    setInitialStatus(null);
  };

  return {
    isOpen,
    open,
    close,
    initialStatus: initialStatus as TaskStatus | undefined,
  };
};
