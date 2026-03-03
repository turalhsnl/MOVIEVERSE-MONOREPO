import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import type { TmdbMovie } from "@movie/types";
import { tmdbImageUrl } from "@movie/tmdb";
import { apiBaseUrl } from "../../src/lib/api";
import { theme } from "../../src/ui/theme";
import { useStore } from "../../src/state/store";

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: theme.border, backgroundColor: active ? theme.brandA : theme.surface }}>
      <Text style={{ color: theme.text, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function Row({ m }: { m: TmdbMovie }) {
  const poster = tmdbImageUrl(m.poster_path ?? null, "w185");
  const toggle = useStore((s) => s.toggle);
  const liked = useStore((s) => !!s.liked[String(m.id)]);
  const watch = useStore((s) => !!s.watchlist[String(m.id)]);

  return (
    <View style={{ flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
      {poster ? <Image source={{ uri: poster }} style={{ width: 70, height: 105, borderRadius: 14, backgroundColor: theme.surface }} /> : null}
      <View style={{ flex: 1 }}>
        <Link href={`/movie/${m.id}`} asChild>
          <Pressable>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "900" }}>{m.title}</Text>
            <Text style={{ color: theme.muted, marginTop: 4 }}>{m.release_date ?? ""}</Text>
            <Text numberOfLines={2} style={{ color: "rgba(255,255,255,0.80)", marginTop: 6 }}>{m.overview}</Text>
          </Pressable>
        </Link>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <Pill label={liked ? "♥ Liked" : "♡ Like"} active={liked} onPress={() => toggle(m.id, "LIKE")} />
          <Pill label={watch ? "✓ Watchlist" : "+ Watch"} active={watch} onPress={() => toggle(m.id, "WATCHLIST")} />
        </View>
      </View>
    </View>
  );
}

export default function Home() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const hydrate = useStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch(apiBaseUrl() + "/tmdb/popular");
      const j = await res.json();
      if (!alive) return;
      setMovies(j.results ?? []);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: 16 }}>
      <Text style={{ color: theme.text, fontSize: 28, fontWeight: "900" }}>MovieVerse</Text>
      <Text style={{ color: theme.muted, marginTop: 6 }}>Polished UI, shared tokens, Expo 54.</Text>
      <FlatList style={{ marginTop: 12 }} data={movies} keyExtractor={(m) => String(m.id)} renderItem={({ item }) => <Row m={item} />} />
    </View>
  );
}
