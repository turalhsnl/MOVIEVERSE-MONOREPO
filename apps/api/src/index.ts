import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { SiweMessage } from "siwe";
import { prisma } from "./prisma";
import { cookieName, signToken } from "./jwt";
import { getAuthedUser } from "./auth";
import { tmdbPopular, tmdbSearch, tmdbDetails } from "@movie/tmdb";

const app = Fastify({ logger: true });

await app.register(cookie, { secret: process.env.JWT_SECRET ?? "dev", hook: "onRequest" });
await app.register(cors, { origin: process.env.CORS_ORIGIN ?? "http://localhost:3000", credentials: true });

app.get("/health", async () => ({ ok: true }));

app.get("/auth/nonce", async (_req, reply) => {
  const nonce = crypto.randomUUID();
  reply.setCookie("siwe_nonce", nonce, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  return { nonce };
});

app.post("/auth/verify", async (req, reply) => {
  const { message, signature } = req.body as any;
  const nonce = (req.cookies as any)?.siwe_nonce as string | undefined;
  if (!message || !signature) return reply.code(400).send({ error: "Missing message/signature" });
  if (!nonce) return reply.code(400).send({ error: "Missing nonce cookie" });

  try {
    const siwe = new SiweMessage(message);
    const result = await siwe.verify({ signature, nonce });
    if (!result.success) return reply.code(401).send({ error: "SIWE verify failed" });

    const wallet = siwe.address.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { walletAddress: wallet } });

    const user = existing
      ? existing
      : await prisma.user.create({ data: { walletAddress: wallet, profile: { create: { displayName: null } } } });

    const token = await signToken({ sub: user.id });

    reply.setCookie(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
    reply.setCookie("siwe_nonce", "", { path: "/", maxAge: 0 });
    return { ok: true, token, isNew: !existing };
  } catch {
    return reply.code(400).send({ error: "Bad SIWE payload" });
  }
});

app.get("/me", async (req) => {
  const user = await getAuthedUser(req);
  if (!user) return { authed: false, user: null };
  return { authed: true, user: { id: user.id, walletAddress: user.walletAddress, displayName: user.profile?.displayName ?? null } };
});

app.post("/profile", async (req, reply) => {
  const user = await getAuthedUser(req);
  if (!user) return reply.code(401).send({ error: "Sign in required" });

  const { displayName } = req.body as any;
  if (!displayName || String(displayName).trim().length < 2) return reply.code(400).send({ error: "Invalid displayName" });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: { displayName: String(displayName).trim() },
    create: { userId: user.id, displayName: String(displayName).trim() },
  });

  return { ok: true };
});

app.post("/movies/toggle", async (req, reply) => {
  const user = await getAuthedUser(req);
  if (!user) return reply.code(401).send({ error: "Sign in required" });

  const { movieId, type } = req.body as any;
  if (!movieId || (type !== "LIKE" && type !== "WATCHLIST")) return reply.code(400).send({ error: "Bad request" });

  const existing = await prisma.movieAction.findUnique({ where: { userId_movieId_type: { userId: user.id, movieId, type } } });
  if (existing) await prisma.movieAction.delete({ where: { id: existing.id } });
  else await prisma.movieAction.create({ data: { userId: user.id, movieId, type } });

  const liked = await prisma.movieAction.findUnique({ where: { userId_movieId_type: { userId: user.id, movieId, type: "LIKE" } } });
  const watchlisted = await prisma.movieAction.findUnique({ where: { userId_movieId_type: { userId: user.id, movieId, type: "WATCHLIST" } } });

  return { flags: { liked: !!liked, watchlisted: !!watchlisted } };
});

app.post("/movies/flags", async (req) => {
  const user = await getAuthedUser(req);
  if (!user) return { flags: {} };

  const { movieIds } = req.body as any;
  const ids = Array.isArray(movieIds) ? movieIds.slice(0, 200) : [];

  const actions = await prisma.movieAction.findMany({ where: { userId: user.id, movieId: { in: ids } } });
  const flags: Record<string, { liked: boolean; watchlisted: boolean }> = {};
  for (const id of ids) flags[String(id)] = { liked: false, watchlisted: false };
  for (const a of actions) {
    const f = flags[String(a.movieId)] ?? { liked: false, watchlisted: false };
    if (a.type === "LIKE") f.liked = true;
    if (a.type === "WATCHLIST") f.watchlisted = true;
    flags[String(a.movieId)] = f;
  }
  return { flags };
});

app.post("/movies/list", async (req, reply) => {
  const user = await getAuthedUser(req);
  if (!user) return reply.code(401).send({ error: "Sign in required" });
  const { type } = req.body as any;
  if (type !== "LIKE" && type !== "WATCHLIST") return reply.code(400).send({ error: "Bad request" });
  const actions = await prisma.movieAction.findMany({ where: { userId: user.id, type }, orderBy: { createdAt: "desc" }, take: 300 });
  return { movieIds: actions.map((a: { movieId: number }) => a.movieId) };
});

app.get("/tmdb/popular", async () => tmdbPopular({ apiKey: process.env.TMDB_API_KEY ?? "" }, 1));
app.get("/tmdb/search", async (req, reply) => {
  const q = String((req.query as any)?.q ?? "").trim();
  if (!q) return reply.code(400).send({ error: "Missing q" });
  return tmdbSearch({ apiKey: process.env.TMDB_API_KEY ?? "" }, q, 1);
});
app.get("/tmdb/movies/:id", async (req, reply) => {
  const id = Number((req.params as any).id);
  if (!id) return reply.code(400).send({ error: "Bad id" });
  return tmdbDetails({ apiKey: process.env.TMDB_API_KEY ?? "" }, id);
});

app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" });
