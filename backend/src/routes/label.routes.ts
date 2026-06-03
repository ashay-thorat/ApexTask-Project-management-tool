import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { labelService } from "../services/label.service";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(authenticate);

router.post("/", validate(z.object({ workspaceId: z.string(), name: z.string().min(1), color: z.string().optional() })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const label = await labelService.create(req.body.workspaceId, req.body.name, req.body.color || "#6366f1", req.user!.userId);
    res.status(201).json(label);
  } catch (e) { next(e); }
});

router.get("/workspace/:workspaceId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labels = await labelService.list(req.params.workspaceId as string, req.user!.userId);
    res.json({ labels });
  } catch (e) { next(e); }
});

router.patch("/:id", validate(z.object({ name: z.string().optional(), color: z.string().optional() })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const label = await labelService.update(req.params.id as string, req.user!.userId, req.body);
    res.json(label);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await labelService.delete(req.params.id as string, req.user!.userId);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
