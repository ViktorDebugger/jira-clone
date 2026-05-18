"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3Icon, SettingsIcon, UsersIcon } from "lucide-react";
import {
  GoHome,
  GoHomeFill,
  GoCheckCircle,
  GoCheckCircleFill,
} from "react-icons/go";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Головна",
    href: "",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "Всі завдання",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Аналітика",
    href: "/analytics",
    icon: BarChart3Icon,
    activeIcon: BarChart3Icon,
  },
  {
    label: "Налаштування",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
  },
  {
    label: "Учасники",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  return (
    <ul className="flex flex-col">
      {routes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <Link key={item.href} href={fullHref} className="group">
            <div
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-md p-2.5 font-medium text-neutral-400 transition hover:text-red-500",
                isActive &&
                  "bg-neutral-900 shadow-sm hover:opacity-100 text-red-500",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-colors text-neutral-400 group-hover:text-red-500",
                  isActive && "text-red-500",
                )}
              />
              {item.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
