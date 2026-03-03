import { z } from "zod";

export const ActionTypeSchema = z.enum(["LIKE", "WATCHLIST"]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export type Flags = { liked: boolean; watchlisted: boolean };

export const TmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().default(""),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
  tagline: z.string().nullable().optional(),
  runtime: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
  homepage: z.string().nullable().optional(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  budget: z.number().optional(),
  revenue: z.number().optional(),
}).passthrough();
export type TmdbMovie = z.infer<typeof TmdbMovieSchema>;

export const TmdbPagedResponseSchema = z.object({
  page: z.number(),
  results: z.array(TmdbMovieSchema),
});
export type TmdbPagedResponse = z.infer<typeof TmdbPagedResponseSchema>;

export type UserDTO = {
  id: string;
  walletAddress: string;
  displayName?: string | null;
};
