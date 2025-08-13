import { useQueryState, parseAsBoolean } from "nuqs";
import { TaskStatus } from "../types";

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false)
  );

  const [status, setStatus] = useQueryState("status");

  const open = (initialStatus?: TaskStatus) => {
    setIsOpen(true);
    if (initialStatus) {
      setStatus(initialStatus);
    }
  };

  const close = () => {
    setIsOpen(false);
    setStatus(null);
  };

  return {
    isOpen,
    open,
    close,
    status: status as TaskStatus | undefined,
  };
};
