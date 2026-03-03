import { TmdbMovieSchema, TmdbPagedResponseSchema, type TmdbMovie, type TmdbPagedResponse } from "@movie/types";

export type TmdbConfig = { apiKey: string; baseUrl?: string };
const DEFAULT_BASE = "https://api.themoviedb.org/3";

async function tmdbFetch<T>(cfg: TmdbConfig, path: string, params: Record<string, string> = {}): Promise<T> {
  if (!cfg.apiKey || cfg.apiKey.trim().length < 10) throw new Error("TMDB apiKey missing.");
  const base = cfg.baseUrl ?? DEFAULT_BASE;
  const url = new URL(base + path);
  url.searchParams.set("api_key", cfg.apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return (await res.json()) as T;
}

export async function tmdbPopular(cfg: TmdbConfig, page = 1): Promise<TmdbPagedResponse> {
  return TmdbPagedResponseSchema.parse(await tmdbFetch(cfg, "/movie/popular", { page: String(page) }));
}
export async function tmdbSearch(cfg: TmdbConfig, query: string, page = 1): Promise<TmdbPagedResponse> {
  return TmdbPagedResponseSchema.parse(await tmdbFetch(cfg, "/search/movie", { query, page: String(page), include_adult: "false" }));
}
export async function tmdbDetails(cfg: TmdbConfig, id: number): Promise<TmdbMovie> {
  return TmdbMovieSchema.parse(await tmdbFetch(cfg, `/movie/${id}`));
}
export function tmdbImageUrl(path: string | null | undefined, size: "w185" | "w342" | "w500" | "original" = "w342") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
