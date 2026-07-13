import { prisma } from "../utils/prisma";
import { badRequest, notFound, forbidden } from "../utils/errors";
type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
import { emailService } from "./email.service";

interface CreateTaskData {
  title: string; description?: string; projectId: string;
  status?: TaskStatus; priority?: TaskPriority; parentId?: string;
  dueDate?: string; sortOrder?: number; assigneeIds?: string[];
  labelIds?: string[];
}

export class TaskService {
  async create(data: CreateTaskData, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw notFound("Project not found");
    await this.requireAccess(project.workspaceId, userId);

    const maxOrder = await prisma.task.aggregate({
      where: { projectId: data.projectId, parentId: data.parentId || null },
      _max: { sortOrder: true },
    });

    const count = await prisma.task.count({ where: { projectId: data.projectId } });
    const identifier = `APX-${count + 1}`;

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        status: data.status || "BACKLOG",
        priority: data.priority || "NONE",
        parentId: data.parentId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
        identifier,
        assignees: data.assigneeIds?.length ? {
          create: data.assigneeIds.map(id => ({ userId: id })),
        } : undefined,
        labels: data.labelIds?.length ? {
          create: data.labelIds.map(id => ({ labelId: id })),
        } : undefined,
      },
      include: {
        assignees: { include: { user: true } },
        labels: { include: { label: true } },
        subtasks: true,
      },
    });

    await this.logActivity(task.id, userId, "created", "task", null, task.title);
    return task;
  }

  async update(taskId: string, userId: string, data: Partial<{
    title: string; description: string; status: TaskStatus;
    priority: TaskPriority; dueDate: string; sortOrder: number;
    isArchived: boolean;
  }>) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) throw notFound("Task not found");
    await this.requireAccess(task.project.workspaceId, userId);

    const changes: { field: string; oldValue?: string; newValue?: string }[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && (task as any)[key] !== value) {
        changes.push({
          field: key,
          oldValue: String((task as any)[key] ?? ""),
          newValue: String(value),
        });
      }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        assignees: { include: { user: true } },
        labels: { include: { label: true } },
        subtasks: true,
      },
    });

    for (const change of changes) {
      await this.logActivity(taskId, userId, "updated", change.field, change.oldValue, change.newValue);
    }
    return updated;
  }

  async reorder(projectId: string, userId: string, tasks: { id: string; status: TaskStatus; sortOrder: number }[]) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw notFound("Project not found");
    await this.requireAccess(project.workspaceId, userId);

    const updates = tasks.map(t =>
      prisma.task.update({ where: { id: t.id }, data: { status: t.status, sortOrder: t.sortOrder } })
    );
    await prisma.$transaction(updates);
    return { updated: tasks.length };
  }

  async assign(taskId: string, userId: string, assigneeIds: string[]) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) throw notFound("Task not found");
    await this.requireAccess(task.project.workspaceId, userId);

    // Get old assignees to find newly added ones
    const oldAssignees = await prisma.taskAssignee.findMany({ where: { taskId } });
    const oldUserIds = new Set(oldAssignees.map((a: any) => a.userId));

    await prisma.taskAssignee.deleteMany({ where: { taskId } });
    if (assigneeIds.length > 0) {
      await prisma.taskAssignee.createMany({
        data: assigneeIds.map(id => ({ taskId, userId: id })),
      });
    }

    // Get the assigner's name for the notification message
    const assigner = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    const assignerName = assigner?.name || assigner?.email || "Someone";

    // Create notifications for newly added assignees (not for the person doing the assigning)
    const newAssigneeIds = assigneeIds.filter((id: string) => !oldUserIds.has(id) && id !== userId);
    if (newAssigneeIds.length > 0) {
      await prisma.notification.createMany({
        data: newAssigneeIds.map((assigneeId: string) => ({
          userId: assigneeId,
          type: "TASK_ASSIGNED",
          title: "Task assigned to you",
          body: `${assignerName} assigned you to "${task.title}"`,
          taskId: task.id,
          taskTitle: task.title,
        })),
      });

      // Send emails
      const newAssigneeUsers = await prisma.user.findMany({ where: { id: { in: newAssigneeIds } } });
      for (const u of newAssigneeUsers) {
        if (u.email) {
          await emailService.sendTaskAssignmentEmail(u.email, u.name || "", task.title, task.project.title);
        }
      }
    }

    await this.logActivity(taskId, userId, "updated", "assignees", "", assigneeIds.join(","));
    return prisma.task.findUnique({ where: { id: taskId }, include: { assignees: { include: { user: true } } } });
  }

  async addComment(taskId: string, userId: string, content: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true, assignees: { include: { user: true } } },
    });
    if (!task) throw notFound("Task not found");
    await this.requireAccess(task.project.workspaceId, userId);

    const comment = await prisma.comment.create({
      data: { content, taskId, userId },
      include: { user: true },
    });

    // Notify all assignees of the task about the new comment (except the commenter)
    const commenter = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    const commenterName = commenter?.name || commenter?.email || "Someone";
    const notifyUserIds = task.assignees.map((a: any) => a.userId).filter((id: string) => id !== userId);
    if (notifyUserIds.length > 0) {
      await prisma.notification.createMany({
        data: notifyUserIds.map((assigneeId: string) => ({
          userId: assigneeId,
          type: "TASK_COMMENTED",
          title: "New comment on your task",
          body: `${commenterName} commented on "${task.title}": "${content.slice(0, 60)}${content.length > 60 ? "…" : ""}"`,
          taskId: task.id,
          taskTitle: task.title,
        })),
      });
    }

    return comment;
  }

  async getComments(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) throw notFound("Task not found");
    await this.requireAccess(task.project.workspaceId, userId);
    return prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
      include: { user: true },
    });
  }

  async getActivity(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) throw notFound("Task not found");
    await this.requireAccess(task.project.workspaceId, userId);
    return prisma.activityLog.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async updateLabels(taskId: string, userId: string, labelIds: string[]) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) throw notFound("Task not found");
    await this.requireAccess(task.project.workspaceId, userId);

    await prisma.taskLabel.deleteMany({ where: { taskId } });
    if (labelIds.length > 0) {
      await prisma.taskLabel.createMany({
        data: labelIds.map(id => ({ taskId, labelId: id })),
      });
    }

    await this.logActivity(taskId, userId, "updated", "labels", "", labelIds.join(","));
    return prisma.task.findUnique({ where: { id: taskId }, include: { labels: { include: { label: true } } } });
  }

  async delete(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
    if (!task) throw notFound("Task not found");
    await this.requireAccess(task.project.workspaceId, userId);

    // Prisma might cascade delete, but if not we should delete related entities first
    await prisma.comment.deleteMany({ where: { taskId } });
    await prisma.activityLog.deleteMany({ where: { taskId } });
    await prisma.taskAssignee.deleteMany({ where: { taskId } });
    await prisma.taskLabel.deleteMany({ where: { taskId } });
    await prisma.notification.deleteMany({ where: { taskId } });
    
    // Delete subtasks as well (assuming 1 level deep for simplicity)
    await prisma.task.deleteMany({ where: { parentId: taskId } });

    await prisma.task.delete({ where: { id: taskId } });
    return { success: true };
  }

  private async logActivity(taskId: string, userId: string, action: string, field: string | null, oldValue?: string | null, newValue?: string | null) {
    return prisma.activityLog.create({
      data: { taskId, userId, action, field, oldValue, newValue },
    }).catch(() => {});
  }

  private async requireAccess(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw forbidden("Access denied");
    return member;
  }
}

export const taskService = new TaskService();
