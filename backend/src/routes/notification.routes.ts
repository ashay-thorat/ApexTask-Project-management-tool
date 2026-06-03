import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../utils/prisma";

const router = Router();
router.use(authenticate);

// GET /api/notifications — list my notifications (latest 50)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.userId, isRead: false },
    });
    res.json({ notifications, unreadCount });
  } catch (e) { next(e); }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id as string, userId: req.user!.userId },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
