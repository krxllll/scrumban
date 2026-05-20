import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-text-primary">
      <div className="pointer-events-none fixed left-[48%] top-[-220px] h-[520px] w-[520px] rounded-full bg-accent/20 blur-[110px]" />
      <div className="pointer-events-none fixed bottom-[-80px] left-[8%] h-[320px] w-[440px] rounded-full bg-info/15 blur-[100px]" />
      <div className="min-h-screen bg-[radial-gradient(circle_at_55%_0%,rgba(124,224,127,0.12),transparent_32%),linear-gradient(120deg,#07111F_0%,#0B1424_55%,#102033_100%)] p-6">
        <div className="mx-auto flex max-w-[1440px] gap-5">
          <Sidebar />
          <main className="glass-panel flex min-h-[calc(100vh-48px)] min-w-0 flex-1 flex-col rounded-[28px] p-5">
            <Topbar />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
