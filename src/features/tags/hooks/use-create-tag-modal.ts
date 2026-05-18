import { parseAsBoolean, useQueryState } from "nuqs";

export const useCreateTagModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-tag",
    parseAsBoolean.withDefault(false),
  );

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, open, close };
};
