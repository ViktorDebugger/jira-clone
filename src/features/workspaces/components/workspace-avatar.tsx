import Image from "next/image";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WorkspaceAvatarProps {
  image?: string;
  name: string;
  className?: string;
}

export const WorkspaceAvatar = ({
  image,
  name,
  className,
}: WorkspaceAvatarProps) => {
  if (image) {
    return (
      <div
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md",
          "border border-neutral-950/30 bg-neutral-100 shadow-inner",
          className,
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="40px"
          className="object-contain p-1"
        />
      </div>
    );
  }

  return (
    <Avatar
      className={cn(
        "size-10 shrink-0 rounded-md border border-neutral-950/35 shadow-inner",
        className,
      )}
    >
      <AvatarFallback className="text-white bg-red-600 font-semibold text-lg uppercase rounded-md">
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};
