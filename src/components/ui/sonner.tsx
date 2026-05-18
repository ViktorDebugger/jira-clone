"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const flowForgeToastStyle = {
  "--normal-bg": "rgb(10 10 10)",
  "--normal-bg-hover": "rgb(23 23 23)",
  "--normal-border": "rgb(38 38 38)",
  "--normal-border-hover": "rgb(64 64 64)",
  "--normal-text": "rgb(229 229 229)",
  "--success-bg": "rgb(10 10 10)",
  "--success-border": "rgb(22 101 52)",
  "--success-text": "rgb(74 222 128)",
  "--info-bg": "rgb(10 10 10)",
  "--info-border": "rgb(30 58 138)",
  "--info-text": "rgb(96 165 250)",
  "--warning-bg": "rgb(10 10 10)",
  "--warning-border": "rgb(120 53 15)",
  "--warning-text": "rgb(251 191 36)",
  "--error-bg": "rgb(10 10 10)",
  "--error-border": "rgb(127 29 29)",
  "--error-text": "rgb(248 113 113)",
} as CSSProperties;

const Toaster = ({ style, className, ...props }: ToasterProps) => {
  return (
    <Sonner
      {...props}
      theme="dark"
      className={cn("toaster group", className)}
      style={{
        ...flowForgeToastStyle,
        ...style,
      }}
    />
  );
};

export { Toaster };
