import { UserButton } from "@/features/auth/components/user-button";

import { LogoBrand } from "@/components/logo-brand";

interface StandAloneLayoutProps {
  children: React.ReactNode;
}

const StandAloneLayout = ({ children }: StandAloneLayoutProps) => {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="no-print flex h-[73px] items-center justify-between">
          <LogoBrand imageWidth={51} imageHeight={19} />
          <UserButton />
        </nav>
        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
};

export default StandAloneLayout;
