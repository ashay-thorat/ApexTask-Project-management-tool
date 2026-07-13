import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, CartesianGrid,
} from "recharts";
import { CalendarDays, Filter, ListTodo, Clock, Users } from "lucide-react";
import type { Task } from "@/types";

const COLORS = {
  primary: "#c0c1ff",
  tertiary: "#ffb95f",
  error: "#ffb4ab",
  secondary: "#4edea3",
  surface: "#273647",
};

interface DashboardViewProps {
  tasks: Task[];
}

export function DashboardView({ tasks }: DashboardViewProps) {
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { BACKLOG: 0, TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
    tasks.forEach((t) => { counts[t.status]++; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { NONE: 0, LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    tasks.forEach((t) => { counts[t.priority]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length;

  const workloadData = useMemo(() => {
    const map: Record<string, { name: string; tasks: number }> = {};
    tasks.forEach((t) => {
      t.assignees?.forEach((a) => {
        const name = a.user.name || a.user.email;
        if (!map[a.userId]) map[a.userId] = { name, tasks: 0 };
        if (t.status !== "DONE") map[a.userId].tasks++;
      });
    });
    return Object.values(map).sort((a, b) => b.tasks - a.tasks).slice(0, 8);
  }, [tasks]);

  const velocityData = [
    { week: "W1", completed: 8, started: 12 },
    { week: "W2", completed: 12, started: 15 },
    { week: "W3", completed: 6, started: 10 },
    { week: "W4", completed: 15, started: 18 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-on-surface">Dashboard</h2>
            <p className="text-sm text-on-surface-variant">Workspace performance and team velocity metrics.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost text-xs flex items-center gap-1"><CalendarDays size={14} /> Last 30 Days</button>
            <button className="btn-ghost text-xs flex items-center gap-1"><Filter size={14} /> Filters</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Tasks", value: tasks.length, icon: <ListTodo size={16} />, change: "+12%" },
            { label: "Completion Rate", value: `${completionRate}%`, icon: <Clock size={16} />, change: `${completionRate > 50 ? "+" : ""}${completionRate}%` },
            { label: "Overdue", value: overdueCount, icon: <Clock size={16} />, change: overdueCount > 0 ? `${overdueCount} items` : "None", highlight: overdueCount > 0 },
            { label: "Active Assignees", value: new Set(tasks.flatMap((t) => t.assignees?.map((a) => a.userId) || [])).size, icon: <Users size={16} />, change: "team" },
          ].map((card) => (
            <div key={card.label} className="glass-panel rounded-lg p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-on-surface-variant text-xs">
                <span className="font-label uppercase tracking-wider">{card.label}</span>
                <span>{card.icon}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold text-on-surface">{card.value}</span>
                <span className={cn("text-[11px] font-mono mb-1", card.highlight ? "text-error" : "text-secondary")}>
                  {card.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Velocity Chart */}
          <div className="lg:col-span-2 glass-panel rounded-lg p-4">
            <h3 className="text-sm font-semibold text-on-surface mb-4">Workspace Velocity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.surface} />
                  <XAxis dataKey="week" stroke={COLORS.surface} tick={{ fill: "#c7c4d7", fontSize: 11 }} />
                  <YAxis stroke={COLORS.surface} tick={{ fill: "#c7c4d7", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#122131", border: "1px solid #464554", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "#d4e4fa" }}
                  />
                  <Area type="monotone" dataKey="started" stroke={COLORS.primary} fill="url(#velocityGrad)" strokeWidth={2} />
                  <Line type="monotone" dataKey="completed" stroke={COLORS.secondary} strokeWidth={2} dot={{ fill: COLORS.secondary }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion Donut */}
          <div className="glass-panel rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-on-surface self-start mb-2">Completion</h3>
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={75}
                    dataKey="value" startAngle={90} endAngle={-270}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={[COLORS.primary, COLORS.tertiary, COLORS.error, COLORS.secondary, COLORS.surface][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#122131", border: "1px solid #464554", borderRadius: "8px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-3 mt-2">
              <div className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant"><div className="w-2 h-2 rounded-full bg-primary" /> Done</div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant"><div className="w-2 h-2 rounded-full bg-tertiary" /> Active</div>
            </div>
          </div>
        </div>

        {/* Lower Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Workload Distribution */}
          <div className="glass-panel rounded-lg p-4">
            <h3 className="text-sm font-semibold text-on-surface mb-4">Workload Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.surface} horizontal={false} />
                  <XAxis type="number" stroke={COLORS.surface} tick={{ fill: "#c7c4d7", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" stroke={COLORS.surface} tick={{ fill: "#c7c4d7", fontSize: 11 }} width={60} />
                  <Tooltip
                    contentStyle={{ background: "#122131", border: "1px solid #464554", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="tasks" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="glass-panel rounded-lg p-4">
            <h3 className="text-sm font-semibold text-on-surface mb-4">Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.surface} />
                  <XAxis dataKey="name" stroke={COLORS.surface} tick={{ fill: "#c7c4d7", fontSize: 10 }} />
                  <YAxis stroke={COLORS.surface} tick={{ fill: "#c7c4d7", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#122131", border: "1px solid #464554", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={[COLORS.primary, COLORS.tertiary, COLORS.error, COLORS.secondary, COLORS.surface][i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
