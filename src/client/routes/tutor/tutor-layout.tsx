import { Outlet } from "react-router-dom";
import { SessionSidebar } from "./session-sidebar";
import { Navbar } from "@/components/navbar";

export function Component() {
  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden flex-col">
      <Navbar subtitle="Tutor" />
      <div className="flex flex-1 overflow-hidden">
        <SessionSidebar />
        <main className="flex-1 flex flex-col relative h-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
