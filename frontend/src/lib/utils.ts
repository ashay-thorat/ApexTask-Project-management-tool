import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    BACKLOG: "text-on-surface-variant",
    TODO: "text-on-surface-variant",
    IN_PROGRESS: "text-primary",
    IN_REVIEW: "text-tertiary",
    DONE: "text-secondary",
    PLANNING: "text-on-surface-variant",
    ACTIVE: "text-primary",
    PAUSED: "text-tertiary",
    COMPLETED: "text-secondary",
  };
  return map[status] || "text-on-surface-variant";
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    NONE: "text-on-surface-variant",
    LOW: "text-on-surface-variant",
    MEDIUM: "text-primary",
    HIGH: "text-error",
    URGENT: "text-tertiary",
  };
  return map[priority] || "text-on-surface-variant";
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateFull(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
