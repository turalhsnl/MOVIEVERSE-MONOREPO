import Image from "next/image";
import Link from "next/link";
import { apiDetails } from "@movie/api-client";
import { apiConfig } from "@/lib/api";
import { tmdbImageUrl } from "@movie/tmdb";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const cfg = apiConfig();
  const { id: movieId } = await params;
  const id = Number(movieId);

  let m: any = null;
  let error: string | null = null;

  try {
    m = await apiDetails(cfg, id);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load movie";
  }

  if (error || !m) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <Link href="/" className="text-sm opacity-80 hover:opacity-100">← Back</Link>
        <Card className="mt-4">
          <p className="text-sm opacity-90">Could not load this movie: {error ?? "Unknown error"}. Check that the API is running at {cfg.baseUrl}.</p>
        </Card>
      </main>
    );
  }

  const poster = tmdbImageUrl(m.poster_path ?? null, "w500");
  const backdrop = tmdbImageUrl(m.backdrop_path ?? null, "original");

  return (
    <main className="mx-auto max-w-6xl p-6">
      <Link href="/" className="text-sm opacity-80 hover:opacity-100">← Back</Link>
      <Card className="mt-4 overflow-hidden p-0">
        {backdrop ? (
          <div className="relative h-[320px]">
            <Image src={backdrop} alt={m.title} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />
          </div>
        ) : null}
        <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr] -mt-[220px] relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-white/5">
            {poster ? <Image src={poster} alt={m.title} width={520} height={780} className="h-auto w-full" /> : null}
          </div>
          <div className="self-end">
            <h1 className="text-4xl font-black">{m.title}</h1>
            {m.tagline ? <div className="mt-2 italic opacity-80">{m.tagline}</div> : null}
            <div className="mt-4 text-sm leading-7 opacity-90">{m.overview}</div>
          </div>
        </div>
      </Card>
    </main>
  );
}
