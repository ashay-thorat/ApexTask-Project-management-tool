import { useMemo, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAuthStore } from "@/stores/auth";
import { cn, getPriorityColor, formatDate } from "@/lib/utils";
import type { TaskStatus } from "@/types";
import { AlertCircle, Radio, CheckCircle2, Clock, Target, User, Calendar } from "lucide-react";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";

const statusFilter: { id: TaskStatus | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "TODO", label: "Todo" },
  { id: "IN_REVIEW", label: "In Review" },
  { id: "BACKLOG", label: "Backlog" },
  { id: "DONE", label: "Done" },
];

const priorityIcons: Record<string, React.ReactNode> = {
  URGENT: <AlertCircle size={14} className="text-tertiary" />,
  HIGH: <AlertCircle size={14} className="text-error" />,
  MEDIUM: <Radio size={14} className="text-primary" />,
  LOW: <Radio size={14} className="text-on-surface-variant" />,
};

export function MyTasksPage() {
  const { tasks, projects } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const myTasks = useMemo(() => {
    const assigned = user
      ? tasks.filter((t) => t.assignees?.some((a) => a.userId === user.id))
      : [];
    if (filter === "ALL") return assigned;
    return assigned.filter((t) => t.status === filter);
  }, [tasks, user, filter]);

  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach((p) => { map[p.id] = p.title; });
    return map;
  }, [projects]);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-headline-md text-on-surface">My Tasks</h1>

        <div className="flex gap-2 flex-wrap">
          {statusFilter.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-label transition-all",
                filter === s.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {myTasks.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant/60">
              <p className="text-sm">No tasks assigned to you</p>
            </div>
          )}
          {myTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className="glass-panel rounded-xl p-3 flex items-center gap-4 hover:bg-surface-container/80 transition-colors cursor-pointer"
            >
              <div className={cn(
                "w-2 h-2 rounded-full shrink-0",
                task.status === "IN_PROGRESS" && "bg-primary",
                task.status === "TODO" && "bg-on-surface-variant/50",
                task.status === "IN_REVIEW" && "bg-tertiary",
                task.status === "DONE" && "bg-secondary",
                task.status === "BACKLOG" && "bg-on-surface-variant/30",
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-on-surface-variant/60">{task.identifier}</span>
                  {task.priority !== "NONE" && (
                    <span title={task.priority}>{priorityIcons[task.priority]}</span>
                  )}
                </div>
                <p className={cn(
                  "text-sm leading-snug",
                  task.status === "DONE" ? "text-on-surface-variant/60 line-through" : "text-on-surface"
                )}>
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant shrink-0">
                <span className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] font-label">
                  {projectMap[task.projectId] || "Project"}
                </span>
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}
