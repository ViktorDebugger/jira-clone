import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoBrandProps {
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
  labelClassName?: string;
}

export const LogoBrand = ({
  imageWidth = 55,
  imageHeight = 16,
  className,
  labelClassName = "text-red-500",
}: LogoBrandProps) => {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 self-start",
        className
      )}
    >
      <Image
        src="/logo.png"
        alt=""
        width={imageWidth}
        height={imageHeight}
        className="shrink-0"
        priority
      />
      <span
        className={cn(
          "text-lg font-semibold tracking-tight whitespace-nowrap",
          labelClassName
        )}
      >
        FlowForge
      </span>
    </Link>
  );
};
