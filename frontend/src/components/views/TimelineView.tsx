import { useMemo } from "react";
import { CheckCircle2, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TimelineViewProps {
  tasks: Task[];
}

export function TimelineView({ tasks }: TimelineViewProps) {
  const weeks = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 14);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i * 7);
      const end = new Date(d);
      end.setDate(end.getDate() + 6);
      return {
        label: `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        start: d,
        end,
        isCurrent: d <= now && end >= now,
      };
    });
  }, []);

  const todayOffset = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 14);
    return Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) * 200 + 50;
  }, []);

  const taskItems = useMemo(() => {
    return tasks.filter((t) => t.dueDate).slice(0, 10).map((t, i) => ({
      ...t,
      left: (i % 5) * 200 + 50,
      width: Math.max(100, ((i * 73) % 400) + 100),
    }));
  }, [tasks]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Task List Sidebar */}
      <div className="w-72 border-r border-outline-variant bg-surface-container z-10 flex flex-col shrink-0">
        <div className="h-11 border-b border-outline-variant flex items-center px-4 bg-surface/50 backdrop-blur-md">
          <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider">Tasks</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tasks.slice(0, 10).map((task) => (
            <div
              key={task.id}
              className={cn(
                "h-9 border-b border-outline-variant/20 flex items-center px-4 gap-2.5 hover:bg-surface-container-higher transition-colors group cursor-default",
                task.status === "IN_PROGRESS" && "bg-surface-variant/10 border-l-2 border-l-primary"
              )}
            >
              {task.status === "DONE" ? (
                <CheckCircle2 size={14} className="text-secondary shrink-0" />
              ) : (
                <Radio size={14} className={cn(
                  "shrink-0",
                  task.status === "IN_PROGRESS" ? "text-primary" : "text-outline"
                )} />
              )}
              <span className={cn(
                "text-xs truncate flex-1",
                task.status === "DONE" && "text-on-surface-variant/60 line-through"
              )}>
                {task.title}
              </span>
              {task.assignees?.[0] && (
                <div className="w-4 h-4 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-[6px] font-semibold overflow-hidden shrink-0">
                  {task.assignees[0].user.avatarUrl ? (
                    <img src={task.assignees[0].user.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    task.assignees[0].user.name?.[0] || task.assignees[0].user.email[0]
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-background relative"
        style={{ backgroundImage: "linear-gradient(to right, rgba(144,143,160,0.08) 1px, transparent 1px)", backgroundSize: "200px 1px" }}>
        {/* Calendar Header */}
        <div className="h-11 border-b border-outline-variant flex sticky top-0 bg-surface/80 backdrop-blur-md z-10" style={{ width: 1200 }}>
          {weeks.map((week, i) => (
            <div
              key={i}
              className={cn(
                "flex-none w-[200px] border-r border-outline-variant/30 flex flex-col justify-center px-3",
                week.isCurrent && "bg-primary/5"
              )}
            >
              <span className={cn("text-[11px] font-label", week.isCurrent ? "text-primary font-semibold" : "text-on-surface-variant")}>
                {week.label}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline Tracks */}
        <div className="relative" style={{ width: 1200, height: tasks.slice(0, 10).length * 36 + 16 }}>
          {/* Today Line */}
          <div className="absolute top-0 bottom-0 w-px bg-primary/40 z-10" style={{ left: todayOffset }}>
            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.6)]" />
          </div>

          {taskItems.map((task, i) => (
            <div key={task.id} className="absolute h-9 flex items-center group" style={{ top: i * 36 + 8, left: 0, right: 0 }}>
              <div
                className={cn(
                  "h-6 rounded flex items-center px-2 text-xs font-label transition-all",
                  task.status === "DONE"
                    ? "bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant/60"
                    : task.status === "IN_PROGRESS"
                    ? "bg-[#6366F1]/15 border border-[#6366F1]/40 text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "bg-surface border border-outline-variant/40 text-on-surface-variant"
                )}
                style={{ position: "absolute", left: task.left, width: task.width }}
              >
                <span className="truncate">{task.title.slice(0, 20)}</span>
                {task.status === "IN_PROGRESS" && (
                  <div className="absolute bottom-0 left-0 h-[2px] bg-[#6366F1] rounded-full" style={{ width: "60%" }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
