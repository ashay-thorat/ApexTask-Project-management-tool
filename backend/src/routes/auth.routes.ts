import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

router.post("/register", validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body.email, req.body.password, req.body.name);
    res.status(201).json(result);
  } catch (e) { next(e); }
});

router.post("/login", validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (e) { next(e); }
});

router.post("/google", validate(z.object({
  idToken: z.string(),
})), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.googleAuth(req.body.idToken);
    res.json(result);
  } catch (e) { next(e); }
});

router.post("/refresh", validate(refreshSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    res.json(tokens);
  } catch (e) { next(e); }
});

router.post("/logout", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.body.refreshToken || "");
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ user });
  } catch (e) { next(e); }
});

router.patch("/me", authenticate, validate(z.object({
  name: z.string().optional(), avatarUrl: z.string().optional(),
})), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    res.json({ user });
  } catch (e) { next(e); }
});

export default router;
