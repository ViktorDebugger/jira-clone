"use client";

import * as React from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
  density?: "field" | "filter";
}

export const DatePicker = ({
  value,
  onChange,
  className,
  placeholder = "Оберіть дату",
  density = "field",
}: DatePickerProps) => {
  const filterMode = density === "filter";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size={filterMode ? "sm" : "default"}
          className={cn(
            "w-full px-3 text-left font-normal [&_svg]:shrink-0",
            filterMode ? "justify-between shadow-xs gap-2" : "justify-start",
            !value && "text-neutral-500",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <CalendarIcon
              className="size-4 shrink-0 text-neutral-400"
              aria-hidden
            />
            <span className="truncate">
              {value ? format(value, "PPP", { locale: uk }) : placeholder}
            </span>
          </span>
          {filterMode ? (
            <ChevronDownIcon
              className="size-4 shrink-0 opacity-50"
              aria-hidden
            />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-neutral-800 bg-neutral-950 p-0 text-neutral-100 shadow-xl shadow-black/60">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (date) {
              onChange(date);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
