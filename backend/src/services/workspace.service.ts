import { prisma } from "../utils/prisma";
import { badRequest, forbidden, notFound } from "../utils/errors";
type WorkspaceRoleType = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export class WorkspaceService {
  async create(name: string, ownerId: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) throw badRequest("Workspace slug already exists");

    return prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId,
        members: {
          create: { userId: ownerId, role: "OWNER" },
        },
      },
      include: { members: { include: { user: true } } },
    });
  }

  async getUserWorkspaces(userId: string) {
    return prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: {
        _count: { select: { members: true, projects: true } },
        members: { where: { userId }, take: 1 },
      },
    });
  }

  async getById(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: { include: { user: true } },
        projects: { orderBy: { updatedAt: "desc" }, take: 20 },
      },
    });
    if (!workspace) throw notFound("Workspace not found");
    const membership = workspace.members.find((m: any) => m.userId === userId);
    if (!membership) throw forbidden("Not a member of this workspace");
    return workspace;
  }

  async update(workspaceId: string, userId: string, data: { name?: string; logoUrl?: string }) {
    await this.checkRole(workspaceId, userId, ["OWNER", "ADMIN"]);
    return prisma.workspace.update({ where: { id: workspaceId }, data });
  }

  async addMember(workspaceId: string, userId: string, email: string, role: WorkspaceRoleType = "MEMBER") {
    await this.checkRole(workspaceId, userId, ["OWNER", "ADMIN"]);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw notFound("User not found with that email");
    const existing = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });
    if (existing) throw badRequest("User is already a member");
    return prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId, role },
      include: { user: true },
    });
  }

  async removeMember(workspaceId: string, requesterId: string, memberId: string) {
    await this.checkRole(workspaceId, requesterId, ["OWNER", "ADMIN"]);
    return prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId: memberId, workspaceId } },
    });
  }

  async updateMemberRole(workspaceId: string, requesterId: string, memberId: string, role: WorkspaceRoleType) {
    await this.checkRole(workspaceId, requesterId, ["OWNER", "ADMIN"]);
    return prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId: memberId, workspaceId } },
      data: { role },
      include: { user: true },
    });
  }

  private async checkRole(workspaceId: string, userId: string, allowedRoles: WorkspaceRoleType[]) {
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member || !allowedRoles.includes(member.role)) {
      throw forbidden("Insufficient permissions");
    }
    return member;
  }
}

export const workspaceService = new WorkspaceService();
