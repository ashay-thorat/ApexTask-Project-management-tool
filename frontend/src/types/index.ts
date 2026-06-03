export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "PAUSED" | "COMPLETED";
export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
  id: string; email: string; name?: string; avatarUrl?: string;
}

export interface Workspace {
  id: string; name: string; slug: string; logoUrl?: string;
  ownerId: string; createdAt: string;
  _count?: { members: number; projects: number };
  members?: WorkspaceMember[];
  projects?: Project[];
}

export interface WorkspaceMember {
  id: string; role: WorkspaceRole; userId: string;
  user: User; workspaceId: string; joinedAt: string;
}

export interface Project {
  id: string; title: string; description?: string;
  status: ProjectStatus; priority: ProjectPriority;
  startDate?: string; endDate?: string;
  budget?: number; hoursBudget?: number;
  createdAt: string; updatedAt: string;
  workspaceId: string;
  _count?: { tasks: number };
  tasks?: Task[];
}

export interface Task {
  id: string; identifier?: string; title: string;
  description?: string; status: TaskStatus; priority: TaskPriority;
  dueDate?: string; sortOrder: number; isArchived: boolean;
  createdAt: string; updatedAt: string;
  projectId: string; parentId?: string;
  assignees: TaskAssignee[];
  labels: TaskLabelRelation[];
  subtasks: Task[];
  _count?: { subtasks: number; comments: number };
}

export interface TaskAssignee {
  id: string; userId: string; user: User;
}

export interface Label {
  id: string; name: string; color: string; workspaceId: string;
}

export interface TaskLabelRelation {
  id: string; label: Label;
}

export interface Comment {
  id: string; content: string; createdAt: string;
  userId: string; user: User; taskId: string;
}

export interface ActivityLog {
  id: string; action: string; field?: string;
  oldValue?: string; newValue?: string;
  createdAt: string; userId?: string;
  user?: { id: string; name?: string; avatarUrl?: string };
  task?: { id: string; title: string };
}

export interface Notification {
  id: string;
  type: "TASK_ASSIGNED" | "TASK_COMMENTED" | "STATUS_CHANGED" | string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  taskId?: string;
  taskTitle?: string;
  userId: string;
}
