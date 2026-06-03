import { useState, useEffect } from "react";
import { X, MessageSquare, History, Send, UserPlus, UserMinus, ChevronDown } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAuthStore } from "@/stores/auth";
import { cn, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import type { Task, TaskStatus, Comment, ActivityLog } from "@/types";
import { toast } from "sonner";

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: "BACKLOG", label: "Backlog", color: "bg-surface-container-high text-on-surface-variant border-outline-variant/30" },
  { value: "TODO", label: "Todo", color: "bg-surface-container-high text-on-surface-variant border-outline-variant/30" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-primary/20 text-primary border-primary/30" },
  { value: "IN_REVIEW", label: "In Review", color: "bg-tertiary/20 text-tertiary border-tertiary/30" },
  { value: "DONE", label: "Done", color: "bg-secondary/20 text-secondary border-secondary/30" },
];

const priorityOptions = [
  { value: "NONE", label: "None" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { tasks, updateTask, assignTask, currentWorkspace, currentUserRole } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [tab, setTab] = useState<"comments" | "activity">("comments");
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [assigningIds, setAssigningIds] = useState<string[]>([]);
  const [savingAssignees, setSavingAssignees] = useState(false);

  const task = tasks.find((t) => t.id === taskId);
  const members = currentWorkspace?.members || [];
  const isAdmin = currentUserRole === "OWNER" || currentUserRole === "ADMIN" || currentUserRole === "MEMBER";

  useEffect(() => {
    if (!taskId) return;
    api.get(`/tasks/${taskId}/comments`).then(({ data }) => setComments(data.comments || [])).catch(() => {});
    api.get(`/tasks/${taskId}/activity`).then(({ data }) => setActivity(data.activity || [])).catch(() => {});
  }, [taskId]);

  useEffect(() => {
    if (task) {
      setAssigningIds(task.assignees?.map((a) => a.userId) || []);
    }
  }, [task?.id]);

  if (!task) return null;

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      await updateTask(task.id, { status });
      toast.success(`Moved to ${statusOptions.find(s => s.value === status)?.label}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (priority: string) => {
    try {
      await updateTask(task.id, { priority: priority as any });
      toast.success("Priority updated");
    } catch {
      toast.error("Failed to update priority");
    }
  };

  const handleToggleAssignee = (userId: string) => {
    setAssigningIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveAssignees = async () => {
    setSavingAssignees(true);
    try {
      await assignTask(task.id, assigningIds);
      toast.success("Assignees updated — team members notified! 🔔");
      setShowAssigneePicker(false);
    } catch {
      toast.error("Failed to update assignees");
    } finally {
      setSavingAssignees(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/tasks/${task.id}/comments`, { content: comment.trim() });
      setComments((prev) => [...prev, data]);
      setComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const currentStatus = statusOptions.find(s => s.value === task.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[4vh] pb-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-panel rounded-2xl w-full max-w-2xl mx-4 max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-lg pb-3 border-b border-outline-variant/20 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-on-surface-variant/60 bg-surface-container px-1.5 py-0.5 rounded">{task.identifier}</span>
              <span className={cn("text-[10px] font-label px-2 py-0.5 rounded-full border", currentStatus?.color)}>
                {currentStatus?.label}
              </span>
              <span className="text-[10px] font-label px-2 py-0.5 rounded-full border bg-surface-container-high text-on-surface-variant border-outline-variant/20 capitalize">
                {task.priority.toLowerCase()} priority
              </span>
            </div>
            <h2 className="text-body-lg text-on-surface font-semibold leading-snug">{task.title}</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 text-on-surface-variant hover:text-on-surface shrink-0 ml-4">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-lg space-y-5">
          {/* Status row */}
          <div>
            <label className="text-label-md text-on-surface-variant mb-2 block">Status</label>
            <div className="flex gap-1.5 flex-wrap">
              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatusChange(s.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-label transition-all border",
                    task.status === s.value
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/30"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority row */}
          <div>
            <label className="text-label-md text-on-surface-variant mb-2 block">Priority</label>
            <div className="flex gap-1.5 flex-wrap">
              {priorityOptions.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePriorityChange(p.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-label transition-all border",
                    task.priority === p.value
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline-variant/30"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="text-label-md text-on-surface-variant mb-1.5 block">Description</label>
              <p className="text-sm text-on-surface bg-surface-container/50 rounded-xl p-3 border border-outline-variant/20 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Assignees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-label-md text-on-surface-variant">Assignees</label>
              {isAdmin && (
                <button
                  onClick={() => setShowAssigneePicker((v) => !v)}
                  className="btn-ghost text-xs flex items-center gap-1 text-primary"
                >
                  <UserPlus size={13} />
                  {showAssigneePicker ? "Cancel" : "Assign"}
                </button>
              )}
            </div>

            {/* Current assignees */}
            <div className="flex flex-wrap gap-2 mb-2">
              {task.assignees?.length > 0 ? (
                task.assignees.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-on-surface"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] text-primary font-bold">
                      {a.user.name?.[0]?.toUpperCase() || a.user.email[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium">{a.user.name || a.user.email}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-on-surface-variant/50 italic">No one assigned yet</span>
              )}
            </div>

            {/* Assignee picker */}
            {showAssigneePicker && (
              <div className="bg-surface-container/80 rounded-xl border border-outline-variant/20 p-3 space-y-2">
                <p className="text-[11px] text-on-surface-variant font-label uppercase tracking-wider mb-2">
                  Select team members
                </p>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {members.map((m) => {
                    const selected = assigningIds.includes(m.userId);
                    return (
                      <label
                        key={m.id}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors",
                          selected ? "bg-primary/10 border border-primary/20" : "hover:bg-surface-container-high border border-transparent"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleToggleAssignee(m.userId)}
                          className="accent-primary"
                        />
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] text-primary font-bold">
                          {m.user.name?.[0]?.toUpperCase() || m.user.email[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-on-surface font-medium truncate">{m.user.name || "Unnamed"}</p>
                          <p className="text-[10px] text-on-surface-variant truncate">{m.user.email}</p>
                        </div>
                        <span className="text-[9px] font-label text-on-surface-variant/60 bg-surface-container-high px-1.5 py-0.5 rounded-full">
                          {m.role}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant">
                    {assigningIds.length} selected
                  </span>
                  <button
                    onClick={handleSaveAssignees}
                    disabled={savingAssignees}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    {savingAssignees ? (
                      <div className="w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    ) : (
                      <UserPlus size={12} />
                    )}
                    Save & Notify
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container/50 rounded-xl p-3 border border-outline-variant/20">
              <p className="text-[10px] font-label text-on-surface-variant mb-1">Due Date</p>
              <p className={cn(
                "text-sm",
                task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"
                  ? "text-error font-medium"
                  : "text-on-surface"
              )}>
                {task.dueDate ? formatDate(task.dueDate) : "—"}
              </p>
            </div>
            <div className="bg-surface-container/50 rounded-xl p-3 border border-outline-variant/20">
              <p className="text-[10px] font-label text-on-surface-variant mb-1">Labels</p>
              <div className="flex flex-wrap gap-1">
                {task.labels?.length > 0 ? task.labels.map((tl) => (
                  <span key={tl.id} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
                    {tl.label.name}
                  </span>
                )) : <span className="text-sm text-on-surface-variant/50">—</span>}
              </div>
            </div>
          </div>

          {/* Comments / Activity tabs */}
          <div className="border-t border-outline-variant/20 pt-4">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setTab("comments")}
                className={cn("text-xs font-label pb-1 border-b-2 transition-colors flex items-center gap-1.5",
                  tab === "comments" ? "text-primary border-primary" : "text-on-surface-variant border-transparent"
                )}
              >
                <MessageSquare size={14} /> Comments ({comments.length})
              </button>
              <button
                onClick={() => setTab("activity")}
                className={cn("text-xs font-label pb-1 border-b-2 transition-colors flex items-center gap-1.5",
                  tab === "activity" ? "text-primary border-primary" : "text-on-surface-variant border-transparent"
                )}
              >
                <History size={14} /> Activity ({activity.length})
              </button>
            </div>

            {tab === "comments" ? (
              <div className="space-y-3">
                <form onSubmit={handleAddComment} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] text-primary font-bold shrink-0">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="input-field flex-1 text-sm"
                  />
                  <button type="submit" disabled={!comment.trim()} className="btn-primary p-2">
                    <Send size={16} />
                  </button>
                </form>
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 p-3 rounded-xl bg-surface-container/50 border border-outline-variant/20">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] text-primary font-bold shrink-0 mt-0.5">
                      {c.user.name?.[0] || c.user.email[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-on-surface">{c.user.name || c.user.email}</span>
                        <span className="text-[10px] text-on-surface-variant/50">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{c.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-on-surface-variant/40 text-center py-4">No comments yet — start the conversation!</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-container/30 text-sm">
                    <History size={14} className="text-on-surface-variant/40 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-on-surface-variant font-medium">{a.user?.name || "System"} </span>
                      <span className="text-on-surface-variant/70">
                        {a.action} {a.field?.replace(/([A-Z])/g, " $1").toLowerCase()}
                        {a.oldValue && a.newValue && ` → ${a.newValue}`}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/40 ml-2">{formatDate(a.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <p className="text-sm text-on-surface-variant/40 text-center py-4">No activity recorded</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
