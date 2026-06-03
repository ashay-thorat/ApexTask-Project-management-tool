import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { projectService } from "../services/project.service";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  workspaceId: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
  hoursBudget: z.number().optional(),
});

router.post("/", validate(createSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.create(req.body, req.user!.userId);
    res.status(201).json(project);
  } catch (e) { next(e); }
});

router.get("/workspace/:workspaceId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await projectService.list(req.params.workspaceId as string, req.user!.userId);
    res.json({ projects });
  } catch (e) { next(e); }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.getById(req.params.id as string, req.user!.userId);
    res.json(project);
  } catch (e) { next(e); }
});

router.patch("/:id", validate(createSchema.partial().omit({ workspaceId: true })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectService.update(req.params.id as string, req.user!.userId, req.body);
    res.json(project);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await projectService.delete(req.params.id as string, req.user!.userId);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
