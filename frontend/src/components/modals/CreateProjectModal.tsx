import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { createProject, currentWorkspace } = useWorkspaceStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createProject({
        title,
        description,
        workspaceId: currentWorkspace.id,
      });
      setTitle("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 shrink-0">
                <div className="flex items-center gap-2 text-on-surface">
                  <FolderPlus size={18} className="text-primary" />
                  <h2 className="font-semibold text-sm">Create New Project</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest p-1 rounded-md transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
                {error && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="title" className="text-xs font-medium text-on-surface-variant">
                    Project Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q3 Roadmap, Frontend Rewrite..."
                    className="w-full bg-surface-container border border-outline-variant/30 text-sm rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-xs font-medium text-on-surface-variant">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                    rows={3}
                    className="w-full bg-surface-container border border-outline-variant/30 text-sm rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center min-w-[80px]",
                      isSubmitting || !title.trim()
                        ? "bg-primary/50 text-on-primary/50 cursor-not-allowed"
                        : "bg-primary text-on-primary hover:bg-primary/90"
                    )}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    ) : (
                      "Create Project"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
