import { prisma } from "../utils/prisma";
import { badRequest, notFound, forbidden } from "../utils/errors";
type ProjectStatus = "PLANNING" | "ACTIVE" | "PAUSED" | "COMPLETED";
type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export class ProjectService {
  async create(data: {
    title: string; description?: string; workspaceId: string;
    priority?: ProjectPriority; startDate?: string; endDate?: string;
    budget?: number; hoursBudget?: number;
  }, userId: string) {
    await this.requireAccess(data.workspaceId, userId);
    return prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        workspaceId: data.workspaceId,
        priority: data.priority || "MEDIUM",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget,
        hoursBudget: data.hoursBudget,
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async getById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          where: { isArchived: false, parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            assignees: { include: { user: true } },
            labels: { include: { label: true } },
            _count: { select: { subtasks: true, comments: true } },
          },
        },
        _count: { select: { tasks: true, activities: true } },
      },
    });
    if (!project) throw notFound("Project not found");
    await this.requireAccess(project.workspaceId, userId);
    return project;
  }

  async list(workspaceId: string, userId: string) {
    await this.requireAccess(workspaceId, userId);
    return prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async update(projectId: string, userId: string, data: Partial<{
    title: string; description: string; status: ProjectStatus;
    priority: ProjectPriority; startDate: string; endDate: string;
    budget: number; hoursBudget: number;
  }>) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw notFound("Project not found");
    await this.requireAccess(project.workspaceId, userId);
    return prisma.project.update({
      where: { id: projectId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async delete(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw notFound("Project not found");
    await this.requireAccess(project.workspaceId, userId);
    await prisma.project.delete({ where: { id: projectId } });
    return { deleted: true };
  }

  private async requireAccess(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw forbidden("Access denied");
    return member;
  }
}

export const projectService = new ProjectService();
