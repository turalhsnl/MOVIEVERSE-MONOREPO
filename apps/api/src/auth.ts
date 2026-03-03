import type { FastifyRequest } from "fastify";
import { cookieName, verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function getAuthedUser(req: FastifyRequest) {
  const cookieToken = (req.cookies as any)?.[cookieName] as string | undefined;
  const bearer = req.headers.authorization?.toLowerCase().startsWith("bearer ") ? req.headers.authorization.slice(7).trim() : undefined;
  const token = bearer ?? cookieToken;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return prisma.user.findUnique({ where: { id: payload.sub }, include: { profile: true } });
  } catch {
    return null;
  }
}
