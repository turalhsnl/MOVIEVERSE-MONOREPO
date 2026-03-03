import { SignJWT, jwtVerify } from "jose";
const enc = new TextEncoder();
export const cookieName = "movie_auth";
export type AuthToken = { sub: string };

export async function signToken(payload: AuthToken) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(enc.encode(secret));
}
export async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");
  const { payload } = await jwtVerify(token, enc.encode(secret));
  return payload as unknown as AuthToken;
}
