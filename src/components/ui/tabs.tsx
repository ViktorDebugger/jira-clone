"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-9 w-fit items-center justify-center gap-x-2 rounded-lg bg-transparent p-[3px] text-neutral-400",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-[calc(100%-1px)] cursor-pointer flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent bg-neutral-800 px-2 py-1 text-sm font-medium whitespace-nowrap text-neutral-400 transition-[color,box-shadow] hover:text-neutral-200 focus-visible:border-neutral-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-red-900/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:border-neutral-700 data-[state=active]:bg-neutral-950 data-[state=active]:text-red-500 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-neutral-400 data-[state=active]:[&_svg]:text-red-500",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
