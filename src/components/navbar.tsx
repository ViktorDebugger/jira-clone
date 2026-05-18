"use client";

import { UserButton } from "@/features/auth/components/user-button";
import { MobileSidebar } from "./mobile-sidebar";
import { usePathname } from "next/navigation";

const pathnameMap = {
  tasks: {
    title: "Мої завдання",
    description: "Переглядайте всі ваші завдання тут",
  },
  projects: {
    title: "Мій проєкт",
    description: "Переглядайте завдання вашого проєкту тут",
  },
  analytics: {
    title: "Аналітика робочого простору",
    description:
      "Графіки за завданнями. Оберіть проєкти, щоб звузити дані.",
  },
};

const defaultMap = {
  title: "Головна",
  description: "Відстежуйте всі ваші проєкти та завдання тут",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold text-neutral-100">{title}</h1>
        <p className="text-neutral-400">{description}</p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  );
};
