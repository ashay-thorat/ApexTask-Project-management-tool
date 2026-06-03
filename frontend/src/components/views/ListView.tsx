import { useState, useMemo } from "react";
import {
  ArrowUpDown, Filter, SortAsc, Columns3, Search,
  AlertCircle, ChevronUp, ChevronsUp, Minus, CheckCircle2,
  User, Calendar,
} from "lucide-react";
import { cn, formatDate, getPriorityColor, getStatusColor } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";

const statusBadge: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  BACKLOG: { label: "Backlog", color: "bg-surface-variant text-on-surface-variant border-outline-variant", dot: "bg-on-surface-variant" },
  TODO: { label: "Todo", color: "bg-surface-variant text-on-surface-variant border-outline-variant", dot: "bg-on-surface-variant" },
  IN_PROGRESS: { label: "In Progress", color: "bg-primary-container/20 text-primary border-primary/30", dot: "bg-primary" },
  IN_REVIEW: { label: "In Review", color: "bg-tertiary-container/20 text-tertiary border-tertiary/30", dot: "bg-tertiary" },
  DONE: { label: "Done", color: "bg-secondary-container/20 text-secondary border-secondary/30", dot: "bg-secondary" },
};

const priorityIcon: Record<string, React.ReactNode> = {
  URGENT: <ChevronsUp size={16} className="text-tertiary" />,
  HIGH: <ChevronUp size={16} className="text-error" />,
  MEDIUM: <Minus size={16} className="text-primary" />,
  LOW: <Minus size={16} className="text-on-surface-variant" />,
  NONE: null,
};

interface ListViewProps {
  tasks: Task[];
}

export function ListView({ tasks }: ListViewProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"identifier" | "title" | "status" | "priority" | "dueDate">("identifier");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.identifier?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      const cmp = typeof aVal === "string" ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [tasks, search, sortField, sortDir]);

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-on-surface">Active Issues</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className="input-field pl-8 py-1.5 text-xs w-48"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-ghost text-xs"><Filter size={14} className="mr-1" />Filter</button>
            <button className="btn-ghost text-xs"><SortAsc size={14} className="mr-1" />Sort</button>
            <button className="btn-ghost text-xs"><Columns3 size={14} className="mr-1" />Display</button>
          </div>
        </div>
        <div className="glass-panel rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant text-xs font-label text-on-surface-variant bg-surface-container-lowest/50">
                {(["identifier", "title", "status", "priority", "assignees", "dueDate"] as const).map((field) => (
                  <th
                    key={field}
                    className="py-2.5 px-4 font-medium cursor-pointer hover:text-on-surface group transition-colors"
                    onClick={() => field !== "assignees" && handleSort(field as any)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="uppercase tracking-wider">{field === "identifier" ? "ID" : field === "dueDate" ? "Due Date" : field}</span>
                      {field !== "assignees" && <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant/30">
              {filtered.map((task) => (
                <tr key={task.id} onClick={() => setSelectedTaskId(task.id)} className="table-row-hover group cursor-pointer transition-colors">
                  <td className="py-2.5 px-4 text-xs font-mono text-on-surface-variant">
                    {task.identifier || task.id.slice(0, 8)}
                  </td>
                  <td className={cn(
                    "py-2.5 px-4 font-medium max-w-[400px] truncate",
                    task.status === "DONE" && "text-on-surface-variant/60 line-through"
                  )}>
                    {task.title}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-label border",
                      statusBadge[task.status].color
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusBadge[task.status].dot)} />
                      {statusBadge[task.status].label}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="flex items-center justify-center">
                      {priorityIcon[task.priority]}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      {task.assignees?.length > 0 ? (
                        <>
                          <div className="flex -space-x-1">
                            {task.assignees.slice(0, 2).map((a) => (
                              <div key={a.id} className="w-5 h-5 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-[8px] font-semibold overflow-hidden">
                                {a.user.avatarUrl ? <img src={a.user.avatarUrl} className="w-full h-full object-cover" /> : (a.user.name?.[0] || a.user.email[0])}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs truncate max-w-[100px]">{task.assignees[0].user.name || task.assignees[0].user.email}</span>
                        </>
                      ) : (
                        <span className="text-xs text-on-surface-variant italic flex items-center gap-1">
                          <User size={12} /> Unassigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={cn(
                    "py-2.5 px-4 text-xs text-right",
                    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"
                      ? "text-error"
                      : "text-on-surface-variant"
                  )}>
                    {task.dueDate ? (
                      <span className="flex items-center gap-1 justify-end">
                        <Calendar size={12} />
                        {formatDate(task.dueDate)}
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </div>
  );
}
