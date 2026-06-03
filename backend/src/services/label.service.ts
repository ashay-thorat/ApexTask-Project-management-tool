import { prisma } from "../utils/prisma";
import { badRequest, notFound, forbidden } from "../utils/errors";
import { WorkspaceRole } from "@prisma/client";

export class LabelService {
  async create(workspaceId: string, name: string, color: string, userId: string) {
    await this.requireAccess(workspaceId, userId);
    return prisma.label.create({ data: { name, color, workspaceId } });
  }

  async list(workspaceId: string, userId: string) {
    await this.requireAccess(workspaceId, userId);
    return prisma.label.findMany({ where: { workspaceId }, orderBy: { name: "asc" } });
  }

  async update(labelId: string, userId: string, data: { name?: string; color?: string }) {
    const label = await prisma.label.findUnique({ where: { id: labelId }, include: { workspace: true } });
    if (!label) throw notFound("Label not found");
    await this.requireAccess(label.workspaceId, userId);
    return prisma.label.update({ where: { id: labelId }, data });
  }

  async delete(labelId: string, userId: string) {
    const label = await prisma.label.findUnique({ where: { id: labelId }, include: { workspace: true } });
    if (!label) throw notFound("Label not found");
    await this.requireAccess(label.workspaceId, userId);
    await prisma.label.delete({ where: { id: labelId } });
    return { deleted: true };
  }

  private async requireAccess(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw forbidden("Access denied");
  }
}

export const labelService = new LabelService();
