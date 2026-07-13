import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Check, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreate(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) return;
    try {
      const ws = await createWorkspace(newWorkspaceName.trim());
      setCurrentWorkspace(ws);
      setIsOpen(false);
      setShowCreate(false);
      setNewWorkspaceName("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 p-md w-full hover:bg-surface-container-highest transition-colors cursor-pointer text-left",
          collapsed && "justify-center"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-inverse-primary flex items-center justify-center shrink-0 shadow-inner">
          <span className="text-on-primary text-xs font-bold">
            {currentWorkspace?.name?.substring(0, 2).toUpperCase() || "WS"}
          </span>
        </div>
        {!collapsed && (
          <div className="flex-1 overflow-hidden flex items-center justify-between">
            <div className="truncate">
              <h1 className="font-semibold text-on-surface tracking-tight text-sm truncate">
                {currentWorkspace?.name || "Workspace"}
              </h1>
              <p className="text-[10px] text-on-surface-variant font-label">Free Plan</p>
            </div>
            <ChevronDown size={14} className={cn("text-on-surface-variant transition-transform", isOpen && "rotate-180")} />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && !collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-4 right-4 top-full mt-1 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col max-w-[240px]"
          >
            <div className="px-3 py-2 border-b border-outline-variant/20">
              <p className="text-[10px] font-semibold tracking-wider text-on-surface-variant uppercase">Workspaces</p>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-surface-container-highest transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                    <span className={cn("truncate max-w-[130px]", currentWorkspace?.id === ws.id ? "text-on-surface font-medium" : "text-on-surface-variant")}>
                      {ws.name}
                    </span>
                  </div>
                  {currentWorkspace?.id === ws.id && (
                    <Check size={14} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-1 border-t border-outline-variant/20 bg-surface-container-low">
              {showCreate ? (
                <div className="p-2 flex flex-col gap-2">
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Workspace Name"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-md px-2 py-1.5 text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") setShowCreate(false);
                    }}
                  />
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setShowCreate(false)} className="px-2 py-1 text-[10px] text-on-surface-variant hover:text-on-surface">Cancel</button>
                    <button onClick={handleCreate} className="px-2 py-1 text-[10px] bg-primary text-on-primary rounded font-medium">Create</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-on-surface hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Create Workspace
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
