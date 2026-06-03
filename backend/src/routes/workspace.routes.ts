import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { workspaceService } from "../services/workspace.service";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.use(authenticate);

const createSchema = z.object({ name: z.string().min(1).max(100) });

router.post("/", validate(createSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ws = await workspaceService.create(req.body.name, req.user!.userId);
    res.status(201).json(ws);
  } catch (e) { next(e); }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.user!.userId);
    res.json({ workspaces });
  } catch (e) { next(e); }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ws = await workspaceService.getById(req.params.id as string, req.user!.userId);
    res.json(ws);
  } catch (e) { next(e); }
});

router.patch("/:id", validate(createSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ws = await workspaceService.update(req.params.id as string, req.user!.userId, req.body);
    res.json(ws);
  } catch (e) { next(e); }
});

router.post("/:id/members", validate(z.object({
  email: z.string().email(), role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).optional(),
})), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await workspaceService.addMember(req.params.id as string, req.user!.userId, req.body.email, req.body.role as any);
    res.status(201).json(member);
  } catch (e) { next(e); }
});

router.delete("/:id/members/:memberId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await workspaceService.removeMember(req.params.id as string, req.user!.userId, req.params.memberId as string);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.patch("/:id/members/:memberId", validate(z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
})), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await workspaceService.updateMemberRole(req.params.id as string, req.user!.userId, req.params.memberId as string, req.body.role);
    res.json(member);
  } catch (e) { next(e); }
});

export default router;
