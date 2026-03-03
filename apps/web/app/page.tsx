"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { Card } from "@/components/ui";
import { apiConfig } from "@/lib/api";
import { apiMe, apiPopular } from "@movie/api-client";
import type { TmdbPagedResponse } from "@movie/types";

export default function Page() {
  const cfg = useMemo(() => apiConfig(), []);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<TmdbPagedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const me = await apiMe(cfg);
        if (!me.authed) {
          setAuthed(false);
          setLoading(false);
          return;
        }
        setAuthed(true);
        const popular = await apiPopular(cfg);
        setData(popular);
      } catch {
        setError("We couldn't load movies right now. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [cfg]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <Card>Loading...</Card>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-3xl font-black">MovieVerse</h1>
          <p className="mt-2 text-sm opacity-80">Please sign in with MetaMask to access movies.</p>
          <Link href="/auth" className="mt-4 inline-block rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:opacity-90">Go to Login / Register</Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <Card className="mb-6">
        <h1 className="text-3xl font-black">MovieVerse</h1>
        <p className="text-sm opacity-80">Popular movies</p>
      </Card>

      {error ? (
        <Card>
          <p className="text-sm opacity-90">{error}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data?.results.map((m) => <MovieCard key={m.id} m={m} />)}
        </div>
      )}
    </main>
  );
}
