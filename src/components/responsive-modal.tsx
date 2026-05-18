import { useMedia } from "react-use";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = ({
  children,
  open,
  onOpenChange,
}: ResponsiveModalProps) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] w-full hide-scrollbar gap-0 overflow-y-auto border-none p-0 sm:max-w-lg">
          <DialogTitle className="sr-only">Діалог</DialogTitle>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="gap-0 border-neutral-800 bg-neutral-950 text-neutral-100">
        <DrawerTitle className="sr-only">Діалог</DrawerTitle>
        <div className="max-h-[85vh] overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
