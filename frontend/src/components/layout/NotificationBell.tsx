import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, UserCheck, MessageSquare, X } from "lucide-react";
import { useNotificationStore } from "@/stores/notifications";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

const notifIcon: Record<string, React.ReactNode> = {
  TASK_ASSIGNED: <UserCheck size={14} className="text-primary" />,
  TASK_COMMENTED: <MessageSquare size={14} className="text-tertiary" />,
  STATUS_CHANGED: <Check size={14} className="text-secondary" />,
};

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, fetch, markRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkRead = (n: Notification) => {
    if (!n.isRead) markRead(n.id);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className={cn(
          "btn-ghost p-1.5 relative",
          unreadCount > 0 && "text-primary"
        )}
        aria-label="Notifications"
        id="notif-bell-btn"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-[360px] glass-panel rounded-2xl shadow-2xl border border-outline-variant/20 z-[200] flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 shrink-0">
            <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Bell size={14} /> Notifications
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] bg-primary/20 text-primary rounded-full font-label">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="btn-ghost text-[10px] px-2 py-1 flex items-center gap-1 text-on-surface-variant"
                  title="Mark all as read"
                >
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="btn-ghost p-1">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/50">
                <Bell size={28} className="mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 border-b border-outline-variant/10 cursor-pointer transition-colors",
                    n.isRead
                      ? "hover:bg-surface-container/40"
                      : "bg-primary/5 hover:bg-primary/10"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    n.isRead ? "bg-surface-container-high" : "bg-primary/15"
                  )}>
                    {notifIcon[n.type] || <Bell size={14} className="text-on-surface-variant" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs leading-snug",
                      n.isRead ? "text-on-surface-variant" : "text-on-surface font-medium"
                    )}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant/70 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-on-surface-variant/40 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
