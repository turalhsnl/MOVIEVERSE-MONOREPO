import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { Link, usePathname } from "expo-router";
import { apiBaseUrl } from "../../src/lib/api";
import { theme } from "../../src/ui/theme";
import { useStore } from "../../src/state/store";
import type { TmdbMovie } from "@movie/types";
import { tmdbImageUrl } from "@movie/tmdb";

function Row({ m }: { m: TmdbMovie }) {
  const poster = tmdbImageUrl(m.poster_path ?? null, "w185");
  return (
    <Link href={`/movie/${m.id}`} asChild>
      <Pressable style={{ flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        {poster ? <Image source={{ uri: poster }} style={{ width: 60, height: 90, borderRadius: 12, backgroundColor: theme.surface }} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text, fontWeight: "900" }}>{m.title}</Text>
          <Text style={{ color: theme.muted, marginTop: 4 }}>{m.release_date ?? ""}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function ListPage() {
  const path = usePathname();
  const mode = useMemo(() => (path.includes("likes") ? "likes" : "watchlist"), [path]);
  const ids = useStore((s) => Object.keys(mode === "likes" ? s.liked : s.watchlist));
  const hydrate = useStore((s) => s.hydrate);
  const [movies, setMovies] = useState<TmdbMovie[]>([]);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list: TmdbMovie[] = [];
      for (const id of ids.slice(0, 60)) {
        try {
          const res = await fetch(apiBaseUrl() + `/tmdb/movies/${id}`);
          list.push(await res.json());
        } catch {}
      }
      if (!alive) return;
      setMovies(list);
    })();
    return () => { alive = false; };
  }, [ids]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: 16 }}>
      <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>{mode === "likes" ? "Likes" : "Watchlist"}</Text>
      <FlatList style={{ marginTop: 12 }} data={movies} keyExtractor={(m) => String(m.id)} renderItem={({ item }) => <Row m={item} />} />
    </View>
  );
}
