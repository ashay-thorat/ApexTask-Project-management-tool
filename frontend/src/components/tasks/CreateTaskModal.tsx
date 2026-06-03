import { useState } from "react";
import { X } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { toast } from "sonner";
import type { TaskStatus } from "@/types";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export function CreateTaskModal({ open, onClose, defaultStatus }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || "BACKLOG");
  const [submitting, setSubmitting] = useState(false);
  const { projects, currentProject, createTask } = useWorkspaceStore();
  const [selectedProjectId, setSelectedProjectId] = useState(currentProject?.id || projects[0]?.id || "");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) return;

    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: selectedProjectId,
        status,
      });
      toast.success("Task created");
      setTitle("");
      setDescription("");
      setStatus(defaultStatus || "BACKLOG");
      onClose();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-panel rounded-2xl p-lg w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-headline-md text-on-surface">New Issue</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-label-md text-on-surface-variant mb-1.5 block">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="input-field w-full"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-label-md text-on-surface-variant mb-1.5 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full"
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-label-md text-on-surface-variant mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field w-full min-h-[100px] resize-y"
              placeholder="Add details..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-label-md text-on-surface-variant mb-1.5 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="input-field w-full"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !selectedProjectId}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : (
                "Create Issue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
