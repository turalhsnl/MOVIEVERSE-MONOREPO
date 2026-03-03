import { MetaMaskAuth } from "@/components/MetaMaskAuth";
import { MovieCard } from "@/components/MovieCard";
import { Card } from "@/components/ui";
import { apiConfig } from "@/lib/api";
import { apiPopular } from "@movie/api-client";
export const dynamic = "force-dynamic";

export default async function Page() {
  const cfg = apiConfig();
  const data = await apiPopular(cfg);
  return (
    <main className="mx-auto max-w-6xl p-6">
      <Card className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black">MovieVerse</h1>
          <p className="text-sm opacity-80">MetaMask-only auth + TMDB movies.</p>
        </div>
        <div className="w-full md:w-[360px]"><MetaMaskAuth /></div>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.results.map((m) => <MovieCard key={m.id} m={m} />)}
      </div>
    </main>
  );
}
