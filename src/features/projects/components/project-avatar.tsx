import Image from "next/image";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProjectAvatarProps {
  image?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProjectAvatar = ({
  image,
  name,
  className,
  fallbackClassName,
}: ProjectAvatarProps) => {
  if (image) {
    return (
      <div
        className={cn(
          "relative size-5 shrink-0 overflow-hidden rounded-md bg-neutral-800",
          className,
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="48px"
          className="object-contain object-center"
        />
      </div>
    );
  }

  return (
    <Avatar className={cn("size-5 shrink-0 rounded-md", className)}>
      <AvatarFallback
        className={cn(
          "text-white bg-red-600 font-semibold text-sm uppercase rounded-md",
          fallbackClassName
        )}
      >
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};
