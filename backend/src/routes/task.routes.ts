import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { taskService } from "../services/task.service";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  projectId: z.string(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  parentId: z.string().optional(),
  dueDate: z.string().optional(),
  sortOrder: z.number().optional(),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
});

router.post("/", validate(createSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.create(req.body, req.user!.userId);
    res.status(201).json(task);
  } catch (e) { next(e); }
});

router.patch("/:id", validate(createSchema.partial().omit({ projectId: true, assigneeIds: true, labelIds: true, parentId: true })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.update(req.params.id as string, req.user!.userId, req.body);
    res.json(task);
  } catch (e) { next(e); }
});

router.post("/reorder", validate(z.object({
  projectId: z.string(),
  tasks: z.array(z.object({ id: z.string(), status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]), sortOrder: z.number() })),
})), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await taskService.reorder(req.body.projectId, req.user!.userId, req.body.tasks);
    res.json(result);
  } catch (e) { next(e); }
});

router.post("/:id/assign", validate(z.object({ assigneeIds: z.array(z.string()) })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.assign(req.params.id as string, req.user!.userId, req.body.assigneeIds);
    res.json(task);
  } catch (e) { next(e); }
});

router.get("/:id/comments", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await taskService.getComments(req.params.id as string, req.user!.userId);
    res.json({ comments });
  } catch (e) { next(e); }
});

router.post("/:id/comments", validate(z.object({ content: z.string().min(1) })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await taskService.addComment(req.params.id as string, req.user!.userId, req.body.content);
    res.status(201).json(comment);
  } catch (e) { next(e); }
});

router.get("/:id/activity", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await taskService.getActivity(req.params.id as string, req.user!.userId);
    res.json({ activity });
  } catch (e) { next(e); }
});

router.post("/:id/labels", validate(z.object({ labelIds: z.array(z.string()) })), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.updateLabels(req.params.id as string, req.user!.userId, req.body.labelIds);
    res.json(task);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await taskService.delete(req.params.id as string, req.user!.userId);
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
