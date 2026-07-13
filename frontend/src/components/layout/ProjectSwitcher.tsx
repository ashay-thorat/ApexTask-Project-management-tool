import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Layout, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace";
import { CreateProjectModal } from "../modals/CreateProjectModal";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  const { currentProject, projects, setCurrentProject } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border border-transparent",
            isOpen
              ? "bg-surface-container border-outline-variant/30 text-on-surface"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          )}
        >
          {currentProject ? currentProject.title : "Select Project"}
          <ChevronDown size={12} className={cn("text-on-surface-variant/70 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-full mt-1.5 w-56 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col"
            >
              <div className="px-3 py-2 border-b border-outline-variant/20">
                <p className="text-[10px] font-semibold tracking-wider text-on-surface-variant uppercase">Projects</p>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setCurrentProject(project);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-surface-container-highest transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Layout size={14} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                      <span className={cn("truncate max-w-[130px]", currentProject?.id === project.id ? "text-on-surface font-medium" : "text-on-surface-variant")}>
                        {project.title}
                      </span>
                    </div>
                    {currentProject?.id === project.id && (
                      <Check size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-1 border-t border-outline-variant/20 bg-surface-container-low">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-on-surface hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Create New Project
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
