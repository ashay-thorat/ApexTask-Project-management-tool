import { Search, History } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAuthStore } from "@/stores/auth";
import { NotificationBell } from "./NotificationBell";

export function Topbar() {
  const { currentWorkspace, currentProject } = useWorkspaceStore();
  const { user } = useAuthStore();

  return (
    <header className="h-14 flex items-center justify-between px-lg bg-surface-container-lowest/70 backdrop-blur-xl border-b border-outline-variant/20 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-3 text-xs font-label">
          <a href="#" className="text-primary font-semibold border-b-2 border-primary pb-0.5">
            {currentWorkspace?.name || "Workspace"}
          </a>
          {currentProject && (
            <>
              <span className="text-outline-variant">/</span>
              <a href="#" className="text-on-surface-variant hover:text-on-surface transition-colors pb-0.5">
                {currentProject.title}
              </a>
            </>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center bg-surface-container-high rounded-full px-3 py-1.5 border border-outline-variant/30 focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(192,193,255,0.15)] transition-all">
          <Search size={14} className="text-on-surface-variant mr-2 shrink-0" />
          <input
            className="bg-transparent border-none outline-none text-xs w-40 text-on-surface placeholder:text-on-surface-variant/40 p-0"
            placeholder="Search issues..."
          />
          <kbd className="text-[9px] text-on-surface-variant/40 border border-outline-variant/30 rounded px-1 ml-2 font-mono">⌘K</kbd>
        </div>
        <NotificationBell />
        <button className="btn-ghost p-1.5"><History size={16} /></button>
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-outline-variant/50 flex items-center justify-center text-[10px] font-semibold text-primary overflow-hidden">
          {user?.avatarUrl ? (
            <img
              alt={user.name || user.email}
              className="w-full h-full object-cover"
              src={user.avatarUrl}
            />
          ) : (
            <span>{user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}</span>
          )}
        </div>
      </div>
    </header>
  );
}
