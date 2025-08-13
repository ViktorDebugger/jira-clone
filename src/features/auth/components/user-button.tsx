"use client";

import { useState } from "react";
import { Loader, LogOut, Edit2, Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";

import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current";
import { useUpdateUser } from "../api/use-update-user";

export const UserButton = () => {
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { name, email } = user;

  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() ?? "U";

  const handleEditStart = () => {
    setNewName(name || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (newName.trim() && newName !== name) {
      updateUser(
        { name: newName.trim() },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        }
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewName(name || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="size-10 hover:opacity-75 transition border rounded-md border-neutral-300">
          <AvatarFallback className="bg-neutral-200 font-medium rounded-md text-neutral-500 flex items-center justify-center">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-[52px] hover:opacity-75 transition border rounded-md border-neutral-300">
            <AvatarFallback className="bg-neutral-200 text-xl rounded-md font-medium text-neutral-500 flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center justify-center w-full">
            {isEditing ? (
              <div className="flex flex-col gap-2 w-full">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-center h-8 text-sm"
                  placeholder="Enter name"
                  autoFocus
                  disabled={isUpdating}
                />
                <div className="flex gap-1 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="h-6 w-6 p-0"
                  >
                    <X className="size-3 text-red-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isUpdating || !newName.trim()}
                    className="h-6 w-6 p-0"
                  >
                    {isUpdating ? (
                      <Loader className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3 text-green-600" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-900">
                  {name || "User"}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditStart}
                  className="h-4 w-4 p-0 hover:bg-neutral-100"
                >
                  <Edit2 className="size-3 text-neutral-500" />
                </Button>
              </div>
            )}
            <p className="text-xs text-neutral-500">{email}</p>
          </div>

          <DottedSeparator className="mb-1" />
          <DropdownMenuItem
            onClick={() => logout()}
            className="h-10 flex items-center justify-center cursor-pointer font-medium text-amber-700"
          >
            <LogOut className="size-4 mr-2 text-amber-700" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
