import { useState, useMemo } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface CalendarViewProps {
  tasks: Task[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks
      .filter((t) => t.dueDate)
      .forEach((t) => {
        const key = format(new Date(t.dueDate!), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(t);
      });
    return map;
  }, [tasks]);

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-on-surface">Calendar</h2>
            <div className="flex items-center gap-1">
              <button className="btn-ghost p-1.5" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-on-surface min-w-[140px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button className="btn-ghost p-1.5" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <button className="btn-primary text-xs" onClick={() => setCurrentDate(new Date())}>
            <CalendarIcon size={14} className="mr-1" /> Today
          </button>
        </div>
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-outline-variant/30">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 text-center text-xs font-label text-on-surface-variant uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDate[key] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-[120px] border-b border-r border-outline-variant/10 p-1.5 transition-colors",
                    !isCurrentMonth && "opacity-30",
                    isToday(day) && "bg-primary/5 border-primary/20"
                  )}
                >
                  <span className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1",
                    isToday(day) && "bg-primary text-on-primary font-semibold"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer transition-colors",
                          task.status === "DONE"
                            ? "bg-secondary/10 text-secondary"
                            : task.status === "IN_PROGRESS"
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-[10px] text-on-surface-variant/60 px-1">+{dayTasks.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
