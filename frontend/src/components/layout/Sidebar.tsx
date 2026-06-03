import { NavLink } from "react-router-dom";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import {
  LayoutDashboard, ListTree, BarChart3, CalendarRange, CalendarDays,
  Settings, User, Plus, Sun, Moon, LogOut,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Board" },
  { to: "/list", icon: ListTree, label: "List" },
  { to: "/my-tasks", icon: ListTree, label: "My Tasks" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/timeline", icon: CalendarRange, label: "Timeline" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
];

const footerItems = [
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { isDark, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();

  return (
    <>
    <nav className={cn(
      "fixed left-0 top-0 h-screen z-50 flex flex-col",
      "bg-surface-container-lowest border-r border-outline-variant/30",
      "transition-all duration-300 ease-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn("flex items-center gap-3 p-md", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-inverse-primary flex items-center justify-center shrink-0">
          <span className="text-on-primary text-xs font-bold">AT</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-semibold text-on-surface tracking-tight text-sm">ApexTask</h1>
            <p className="text-[10px] text-on-surface-variant font-label">Engineering Team</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowCreateTask(true)}
        className={cn(
          "btn-primary mx-md mb-md flex items-center justify-center gap-2 text-sm",
          collapsed && "mx-2 px-0"
        )}
      >
        <Plus size={16} />
        {!collapsed && "New Issue"}
      </button>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
              isActive
                ? "text-primary bg-primary/5 font-semibold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto px-2 pb-2 space-y-0.5 border-t border-outline-variant/20 pt-2">
        {footerItems.map(({ to, icon: Icon, label }) => (
          to ? (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                  ? "text-primary bg-primary/5 font-semibold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ) : null
        ))}
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all w-full"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{isDark ? "Light" : "Dark"}</span>}
        </button>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-semibold">
              {user.name?.[0] || user.email[0]}
            </div>
            <span className="truncate flex-1">{user.name || user.email}</span>
          </div>
        )}
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-error hover:bg-error/5 transition-all w-full">
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1 text-on-surface-variant/50 hover:text-on-surface transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </nav>
      <CreateTaskModal open={showCreateTask} onClose={() => setShowCreateTask(false)} />
    </>
  );
}
