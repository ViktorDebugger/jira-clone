"use client";

import { HexColorPicker } from "react-colorful";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HEX_FALLBACK = "#ef4444";

function normalizedHex(color: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : HEX_FALLBACK;
}

interface TagHexInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export function TagHexInput({
  value,
  onChange,
  disabled,
  id,
}: TagHexInputProps) {
  const pickerHex = normalizedHex(value);

  return (
    <div className="flex gap-3 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="relative h-10 w-14 shrink-0 border-neutral-700 bg-neutral-900 p-1"
            aria-haspopup="dialog"
            aria-label="Відкрити палітру кольорів"
          >
            <span
              className="block h-full w-full rounded-sm shadow-inner ring-1 ring-inset ring-black/20"
              style={{ backgroundColor: pickerHex }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto border-neutral-800 bg-neutral-950 p-3 shadow-xl"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <HexColorPicker
            color={pickerHex}
            onChange={onChange}
            className="!w-[220px] touch-none"
          />
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        aria-label="HEX код кольору"
        placeholder="#RRGGBB"
        className="font-mono"
      />
    </div>
  );
}

export { HEX_FALLBACK };
