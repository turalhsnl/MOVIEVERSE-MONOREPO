import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { apiBaseUrl } from "../../src/lib/api";
import { theme } from "../../src/ui/theme";
import { tmdbImageUrl } from "@movie/tmdb";
import { useStore } from "../../src/state/store";

export default function Movie() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = Number(id);
  const [m, setM] = useState<any>(null);

  const toggle = useStore((s) => s.toggle);
  const liked = useStore((s) => !!s.liked[String(movieId)]);
  const watch = useStore((s) => !!s.watchlist[String(movieId)]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch(apiBaseUrl() + `/tmdb/movies/${movieId}`);
      const j = await res.json();
      if (!alive) return;
      setM(j);
    })();
    return () => { alive = false; };
  }, [movieId]);

  if (!m) return <View style={{ flex: 1, backgroundColor: theme.bg, padding: 16 }}><Text style={{ color: theme.text }}>Loading...</Text></View>;

  const poster = tmdbImageUrl(m.poster_path ?? null, "w500");
  const genres = (m.genres ?? []).map((g: any) => g.name).join(" • ");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16 }}>
      {poster ? <Image source={{ uri: poster }} style={{ width: "100%", aspectRatio: 2/3, borderRadius: 18, backgroundColor: theme.surface }} /> : null}
      <Text style={{ color: theme.text, fontSize: 26, fontWeight: "900", marginTop: 12 }}>{m.title}</Text>
      <Text style={{ color: theme.muted, marginTop: 6 }}>{m.release_date ?? ""} · ⭐ {m.vote_average ?? "-"} · {m.runtime ? `${m.runtime} min` : ""}</Text>
      {genres ? <Text style={{ color: theme.muted, marginTop: 6 }}>{genres}</Text> : null}
      {m.tagline ? <Text style={{ color: "rgba(255,255,255,0.80)", marginTop: 10, fontStyle: "italic" }}>{m.tagline}</Text> : null}
      <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 12, lineHeight: 20 }}>{m.overview}</Text>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <Text onPress={() => toggle(movieId, "LIKE")} style={{ color: theme.text, fontWeight: "900", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: theme.border, backgroundColor: liked ? theme.brandA : theme.surface }}>
          {liked ? "♥ Liked" : "♡ Like"}
        </Text>
        <Text onPress={() => toggle(movieId, "WATCHLIST")} style={{ color: theme.text, fontWeight: "900", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: theme.border, backgroundColor: watch ? theme.brandA : theme.surface }}>
          {watch ? "✓ Watchlist" : "+ Watch"}
        </Text>
      </View>
    </ScrollView>
  );
}
