import { useState } from "react";
import { Search, History, UserPlus } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAuthStore } from "@/stores/auth";
import { NotificationBell } from "./NotificationBell";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { InviteModal } from "../modals/InviteModal";

export function Topbar() {
  const { currentWorkspace, setCommandPaletteOpen } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <header className="h-14 flex items-center justify-between px-lg bg-surface-container-lowest/70 backdrop-blur-xl border-b border-outline-variant/20 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-3 text-xs font-label">
          <a href="#" className="text-primary font-semibold border-b-2 border-primary pb-0.5">
            {currentWorkspace?.name || "Workspace"}
          </a>
          <span className="text-outline-variant/50">/</span>
          <ProjectSwitcher />
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="relative flex items-center bg-surface-container-high rounded-full px-3 py-1.5 border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer text-left w-56"
        >
          <Search size={14} className="text-on-surface-variant mr-2 shrink-0" />
          <span className="text-xs flex-1 text-on-surface-variant/70">Search issues...</span>
          <kbd className="text-[9px] text-on-surface-variant/40 border border-outline-variant/30 rounded px-1 ml-2 font-mono shrink-0">⌘K</kbd>
        </button>
        
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors duration-[150ms] ease-fast"
        >
          <UserPlus size={14} strokeWidth={1.5} />
          Invite
        </button>
        
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
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </header>
  );
}
