import { Navigation } from "./navigation";
import { DottedSeparator } from "./dotted-separator";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Projects } from "./projects";
import { LogoBrand } from "./logo-brand";

export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-950 p-4 w-full">
      <LogoBrand />
      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      <Projects />
    </aside>
  );
};
