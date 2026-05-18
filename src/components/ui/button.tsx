import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-neutral-800 text-sm font-semibold shadow-sm outline-none transition-all focus-visible:border-neutral-700 focus-visible:ring-[3px] focus-visible:ring-red-900/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 disabled:opacity-70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        primary:
          "bg-red-600 text-white hover:bg-red-700",
        destructive:
          "border-red-800 bg-red-950 text-red-50 shadow-[0_0_0_1px_rgba(185,28,28,0.35)] hover:border-red-600 hover:bg-red-900 focus-visible:border-red-500 focus-visible:ring-red-600/45",
        outline:
          "border bg-neutral-900 border-neutral-800 text-neutral-200 shadow-xs hover:bg-neutral-800 hover:text-white",
        secondary: "bg-neutral-800 text-neutral-200 hover:bg-neutral-700",
        ghost:
          "border-transparent shadow-none hover:bg-neutral-800 hover:text-neutral-200 text-neutral-400",
        muted: "bg-neutral-800 text-neutral-400 hover:bg-neutral-700",
        teritary:
          "border border-dashed border-neutral-600 bg-neutral-900 text-neutral-200 shadow-none hover:border-red-900/70 hover:bg-neutral-800 hover:text-neutral-50",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        xs: "h-7 rounded-md px-2 text-xs",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
