import { Router, Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analytics.service";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/workspace/:workspaceId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getWorkspaceStats(req.params.workspaceId as string, req.user!.userId);
    res.json(stats);
  } catch (e) { next(e); }
});

router.get("/project/:projectId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getProjectAnalytics(req.params.projectId as string, req.user!.userId);
    res.json(stats);
  } catch (e) { next(e); }
});

export default router;
