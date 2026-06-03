import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { badRequest, conflict, unauthorized } from "../utils/errors";
import { firebaseAdmin } from "../utils/firebase";

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw conflict("Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });

    const tokens = this.generateTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw unauthorized("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw unauthorized("Invalid credentials");

    const tokens = this.generateTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }, ...tokens };
  }

  async googleAuth(idToken: string) {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      if (!decodedToken.email) throw unauthorized("Invalid Google token");

      const email = decodedToken.email;
      const name = decodedToken.name || "";
      const avatarUrl = decodedToken.picture || "";
      const googleId = decodedToken.uid;

      let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });
      if (user) {
        if (!user.googleId) {
          user = await prisma.user.update({ where: { id: user.id }, data: { googleId, avatarUrl } });
        }
      } else {
        user = await prisma.user.create({
          data: { email, name, googleId, avatarUrl },
        });
      }
      const tokens = this.generateTokens(user.id, user.email);
      return { user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }, ...tokens };
    } catch (e) {
      throw unauthorized("Google authentication failed");
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (!stored || stored.expiresAt < new Date()) throw unauthorized("Refresh token expired");

      await prisma.refreshToken.delete({ where: { id: stored.id } });
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) throw unauthorized("User not found");

      return this.generateTokens(user.id, user.email);
    } catch {
      throw unauthorized("Invalid refresh token");
    }
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
    });
    if (!user) throw unauthorized("User not found");
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return prisma.user.update({ where: { id: userId }, data });
  }

  private generateTokens(userId: string, email: string) {
    const accessToken = signAccessToken({ userId, email });
    const refreshToken = signRefreshToken({ userId, email });

    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }).catch(console.error);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
