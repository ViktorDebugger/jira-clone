"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { useCreateTagModal } from "../hooks/use-create-tag-modal";
import { CreateTagForm } from "./create-tag-form";

export const CreateTagModal = () => {
  const { isOpen, close } = useCreateTagModal();

  return (
    <ResponsiveModal
      open={!!isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      {isOpen ? <CreateTagForm onCancel={close} /> : null}
    </ResponsiveModal>
  );
};
