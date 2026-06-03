import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  const owner = await prisma.user.upsert({
    where: { email: "owen@apextask.dev" },
    update: {},
    create: {
      email: "owen@apextask.dev",
      name: "Owen Harper",
      passwordHash,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "alex@apextask.dev" },
    update: {},
    create: {
      email: "alex@apextask.dev",
      name: "Alex Chen",
      passwordHash,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "ashaythorat26@gmail.com" },
    update: {},
    create: {
      email: "ashaythorat26@gmail.com",
      name: "Admin User",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "apextask-eng" },
    update: {},
    create: {
      name: "ApexTask Engineering",
      slug: "apextask-eng",
      ownerId: owner.id,
    },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: admin.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: admin.id, workspaceId: workspace.id, role: "ADMIN" },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: owner.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: owner.id, workspaceId: workspace.id, role: "OWNER" },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: member.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: member.id, workspaceId: workspace.id, role: "MEMBER" },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-001" },
    update: {},
    create: {
      id: "seed-project-001",
      title: "Sprint 47 — Q4 Platform",
      description: "Core platform improvements and performance optimization",
      status: "ACTIVE",
      priority: "HIGH",
      workspaceId: workspace.id,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-06-15"),
    },
  });

  const labels = await Promise.all([
    prisma.label.upsert({
      where: { name_workspaceId: { name: "bug", workspaceId: workspace.id } },
      update: {},
      create: { name: "bug", color: "#ef4444", workspaceId: workspace.id },
    }),
    prisma.label.upsert({
      where: { name_workspaceId: { name: "feature", workspaceId: workspace.id } },
      update: {},
      create: { name: "feature", color: "#22c55e", workspaceId: workspace.id },
    }),
    prisma.label.upsert({
      where: { name_workspaceId: { name: "design", workspaceId: workspace.id } },
      update: {},
      create: { name: "design", color: "#a855f7", workspaceId: workspace.id },
    }),
    prisma.label.upsert({
      where: { name_workspaceId: { name: "docs", workspaceId: workspace.id } },
      update: {},
      create: { name: "docs", color: "#3b82f6", workspaceId: workspace.id },
    }),
    prisma.label.upsert({
      where: { name_workspaceId: { name: "perf", workspaceId: workspace.id } },
      update: {},
      create: { name: "perf", color: "#f59e0b", workspaceId: workspace.id },
    }),
  ]);

  const taskData = [
    { identifier: "APX-101", title: "Set up CI/CD pipeline with GitHub Actions", status: "DONE", priority: "HIGH", assigneeId: owner.id, labelIds: [labels[1].id, labels[4].id] },
    { identifier: "APX-102", title: "Design system migration — typography tokens", status: "DONE", priority: "MEDIUM", assigneeId: member.id, labelIds: [labels[2].id] },
    { identifier: "APX-103", title: "Implement user avatar upload with cropping", status: "IN_REVIEW", priority: "MEDIUM", assigneeId: owner.id, labelIds: [labels[1].id] },
    { identifier: "APX-104", title: "Add drag-and-drop to Kanban board columns", status: "IN_PROGRESS", priority: "HIGH", assigneeId: member.id, labelIds: [labels[1].id, labels[4].id] },
    { identifier: "APX-105", title: "OAuth login redirect sometimes drops state param", status: "IN_PROGRESS", priority: "URGENT", assigneeId: owner.id, labelIds: [labels[0].id] },
    { identifier: "APX-106", title: "Write API documentation for workspace endpoints", status: "TODO", priority: "LOW", assigneeId: member.id, labelIds: [labels[3].id] },
    { identifier: "APX-107", title: "Notification preferences UI", status: "TODO", priority: "MEDIUM", assigneeId: null, labelIds: [labels[1].id, labels[2].id] },
    { identifier: "APX-108", title: "Explore vector search for project-wide full-text", status: "BACKLOG", priority: "LOW", assigneeId: null, labelIds: [labels[1].id, labels[4].id] },
    { identifier: "APX-109", title: "Multi-workspace switcher component", status: "BACKLOG", priority: "MEDIUM", assigneeId: null, labelIds: [labels[1].id, labels[2].id] },
    { identifier: "APX-110", title: "Upgrade to React 19 — test regression", status: "BACKLOG", priority: "HIGH", assigneeId: null, labelIds: [labels[4].id] },
  ];

  const statusOrder: Record<string, number> = {
    BACKLOG: 0, TODO: 1, IN_PROGRESS: 2, IN_REVIEW: 3, DONE: 4,
  };

  for (let i = 0; i < taskData.length; i++) {
    const t = taskData[i];
    const taskId = `seed-task-${String(i + 1).padStart(3, "0")}`;

    const task = await prisma.task.upsert({
      where: { id: taskId },
      update: {},
      create: {
        id: taskId,
        identifier: t.identifier,
        title: t.title,
        status: t.status as any,
        priority: t.priority as any,
        sortOrder: statusOrder[t.status] * 100 + i,
        projectId: project.id,
        dueDate: i % 3 === 0 ? new Date("2026-06-01") : null,
      },
    });

    if (t.assigneeId) {
      await prisma.taskAssignee.upsert({
        where: { userId_taskId: { userId: t.assigneeId, taskId } },
        update: {},
        create: { userId: t.assigneeId, taskId },
      });
    }

    for (const labelId of t.labelIds) {
      await prisma.taskLabel.upsert({
        where: { taskId_labelId: { taskId, labelId } },
        update: {},
        create: { taskId, labelId },
      });
    }
  }

  console.log("Seed complete — 10 tasks, 2 users, 5 labels, 1 project, 1 workspace");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
