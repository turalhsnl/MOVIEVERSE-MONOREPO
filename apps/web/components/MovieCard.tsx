"use client";
import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@movie/tmdb";
import type { TmdbMovie } from "@movie/types";
import { Card } from "./ui";

export function MovieCard({ m }: { m: TmdbMovie }) {
  const poster = tmdbImageUrl(m.poster_path ?? null, "w342");
  return (
    <Card className="overflow-hidden p-0">
      <Link href={`/movies/${m.id}`} className="block">
        <div className="relative aspect-[2/3] bg-white/5">
          {poster ? <Image src={poster} alt={m.title} fill sizes="(max-width: 640px) 50vw, 240px" className="object-cover" /> : null}
        </div>
        <div className="p-3 font-black">{m.title}</div>
      </Link>
    </Card>
  );
}
