import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, LayoutDashboard, Kanban, ListTree, CalendarRange, CalendarDays, 
  Settings, User, Plus, Folder
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  title: string;
  icon: React.ElementType;
  section: string;
  action: () => void;
};

export function CommandPalette() {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    setCreateTaskModalOpen,
    projects,
    setCurrentProject
  } = useWorkspaceStore();
  
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle Cmd+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input on open, reset state
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const allCommands = useMemo<CommandItem[]>(() => {
    const cmds: CommandItem[] = [
      { id: "nav-dash", title: "Go to Dashboard", icon: LayoutDashboard, section: "Navigation", action: () => navigate("/") },
      { id: "nav-board", title: "Go to Board", icon: Kanban, section: "Navigation", action: () => navigate("/board") },
      { id: "nav-list", title: "Go to List", icon: ListTree, section: "Navigation", action: () => navigate("/list") },
      { id: "nav-my-tasks", title: "Go to My Tasks", icon: User, section: "Navigation", action: () => navigate("/my-tasks") },
      { id: "nav-timeline", title: "Go to Timeline", icon: CalendarRange, section: "Navigation", action: () => navigate("/timeline") },
      { id: "nav-cal", title: "Go to Calendar", icon: CalendarDays, section: "Navigation", action: () => navigate("/calendar") },
      { id: "nav-settings", title: "Go to Settings", icon: Settings, section: "Navigation", action: () => navigate("/settings") },
      { id: "nav-profile", title: "Go to Profile", icon: User, section: "Navigation", action: () => navigate("/profile") },
      { id: "action-create-task", title: "Create new task", icon: Plus, section: "Actions", action: () => setCreateTaskModalOpen(true) }
    ];

    projects.forEach(p => {
      cmds.push({
        id: `project-${p.id}`,
        title: `Switch to ${p.title}`,
        icon: Folder,
        section: "Projects",
        action: () => {
          setCurrentProject(p);
          navigate("/board");
        }
      });
    });

    return cmds;
  }, [navigate, projects, setCurrentProject, setCreateTaskModalOpen]);

  const filteredCommands = useMemo(() => {
    if (!query) return allCommands;
    const lowerQuery = query.toLowerCase();
    return allCommands.filter(c => 
      c.title.toLowerCase().includes(lowerQuery) || 
      c.section.toLowerCase().includes(lowerQuery)
    );
  }, [allCommands, query]);

  // Group commands for rendering
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(c => {
      if (!groups[c.section]) groups[c.section] = [];
      groups[c.section].push(c);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter" && filteredCommands.length > 0) {
      e.preventDefault();
      const selected = filteredCommands[activeIndex];
      selected.action();
      setCommandPaletteOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100]"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-xl bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
              <div className="flex items-center px-4 py-3 border-b border-outline-variant/20 gap-3">
                <Search size={18} className="text-on-surface-variant" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent border-none outline-none text-on-surface placeholder-on-surface-variant/50 text-sm"
                />
                <kbd className="text-[10px] text-on-surface-variant/40 border border-outline-variant/30 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-sm text-on-surface-variant">
                    No results found for "{query}"
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([section, items]) => (
                    <div key={section} className="mb-2 last:mb-0">
                      <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-on-surface-variant uppercase">
                        {section}
                      </div>
                      {items.map((item) => {
                        const globalIndex = filteredCommands.findIndex(c => c.id === item.id);
                        const isActive = globalIndex === activeIndex;
                        const Icon = item.icon;
                        
                        return (
                          <button
                            key={item.id}
                            onMouseEnter={() => setActiveIndex(globalIndex)}
                            onClick={() => {
                              item.action();
                              setCommandPaletteOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                              isActive 
                                ? "bg-primary/10 text-primary" 
                                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                            )}
                          >
                            <Icon size={16} className={isActive ? "text-primary" : "text-on-surface-variant/70"} />
                            <span className={isActive ? "font-medium" : ""}>{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
