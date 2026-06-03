import { prisma } from "../utils/prisma";
import { forbidden } from "../utils/errors";

export class AnalyticsService {
  async getWorkspaceStats(workspaceId: string, userId: string) {
    await this.requireAccess(workspaceId, userId);

    const [totalTasks, tasksByStatus, tasksByPriority, projects, members, recentActivity] = await Promise.all([
      prisma.task.count({ where: { project: { workspaceId }, isArchived: false } }),
      prisma.task.groupBy({
        by: ["status"],
        where: { project: { workspaceId }, isArchived: false },
        _count: true,
      }),
      prisma.task.groupBy({
        by: ["priority"],
        where: { project: { workspaceId }, isArchived: false },
        _count: true,
      }),
      prisma.project.count({ where: { workspaceId } }),
      prisma.workspaceMember.count({ where: { workspaceId } }),
      prisma.activityLog.findMany({
        where: { task: { project: { workspaceId } } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { id: true, name: true, avatarUrl: true } }, task: { select: { id: true, title: true } } },
      }),
    ]);

    const doneCount = tasksByStatus.find(s => s.status === "DONE")?._count ?? 0;
    const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    const memberWorkload = await prisma.taskAssignee.groupBy({
      by: ["userId"],
      where: { task: { project: { workspaceId }, isArchived: false, status: { not: "DONE" } } },
      _count: true,
    });

    return {
      totalTasks,
      totalProjects: projects,
      totalMembers: members,
      completionRate,
      tasksByStatus,
      tasksByPriority,
      memberWorkload,
      recentActivity,
    };
  }

  async getProjectAnalytics(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw forbidden("Project not found");
    await this.requireAccess(project.workspaceId, userId);

    const tasks = await prisma.task.findMany({
      where: { projectId, isArchived: false },
      include: { assignees: true },
    });

    const statusDist = Object.fromEntries(
      ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map(s => [
        s, tasks.filter(t => t.status === s).length,
      ])
    );

    const priorityDist = Object.fromEntries(
      ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"].map(p => [
        p, tasks.filter(t => t.priority === p).length,
      ])
    );

    const overdue = tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== "DONE");
    const avgCycleTime = tasks.length > 0
      ? tasks.reduce((sum, t) => sum + (t.updatedAt.getTime() - t.createdAt.getTime()), 0) / tasks.length
      : 0;

    return {
      totalTasks: tasks.length,
      statusDistribution: statusDist,
      priorityDistribution: priorityDist,
      overdueTasks: overdue.length,
      avgCycleTimeMs: avgCycleTime,
      completionRate: tasks.length > 0
        ? Math.round((statusDist["DONE"] / tasks.length) * 100) : 0,
    };
  }

  private async requireAccess(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw forbidden("Access denied");
  }
}

export const analyticsService = new AnalyticsService();
