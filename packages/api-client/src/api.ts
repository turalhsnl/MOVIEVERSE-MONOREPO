import type { ActionType, Flags, TmdbMovie, TmdbPagedResponse, UserDTO } from "@movie/types";

export type ApiConfig = { baseUrl: string };

async function parse<T>(resPromise: Promise<Response>): Promise<T> {
  const res = await resPromise;
  const txt = await res.text();
  const json = txt ? JSON.parse(txt) : null;
  if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);
  return json as T;
}

export const apiMe = (cfg: ApiConfig) => parse<{ authed: boolean; user: UserDTO | null }>(fetch(cfg.baseUrl + "/me", { credentials: "include" }));
export const apiNonce = (cfg: ApiConfig) => parse<{ nonce: string }>(fetch(cfg.baseUrl + "/auth/nonce", { credentials: "include", cache: "no-store" }));

export const apiVerify = (cfg: ApiConfig, body: { message: string; signature: string }) =>
  parse<{ ok: boolean; token?: string; isNew?: boolean }>(fetch(cfg.baseUrl + "/auth/verify", {
    method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(body),
  }));

export const apiSetProfile = (cfg: ApiConfig, body: { displayName: string }) =>
  parse<{ ok: boolean }>(fetch(cfg.baseUrl + "/profile", {
    method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(body),
  }));

export const apiFlags = (cfg: ApiConfig, movieIds: number[]) =>
  parse<{ flags: Record<string, Flags> }>(fetch(cfg.baseUrl + "/movies/flags", {
    method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ movieIds }),
  }));

export const apiToggle = (cfg: ApiConfig, movieId: number, type: ActionType) =>
  parse<{ flags: Flags }>(fetch(cfg.baseUrl + "/movies/toggle", {
    method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ movieId, type }),
  }));

export const apiList = (cfg: ApiConfig, type: ActionType) =>
  parse<{ movieIds: number[] }>(fetch(cfg.baseUrl + "/movies/list", {
    method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ type }),
  }));

export const apiPopular = (cfg: ApiConfig) => parse<TmdbPagedResponse>(fetch(cfg.baseUrl + "/tmdb/popular", { credentials: "include" }));
export const apiDetails = (cfg: ApiConfig, id: number) => parse<TmdbMovie>(fetch(cfg.baseUrl + `/tmdb/movies/${id}`, { credentials: "include" }));
