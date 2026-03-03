import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

type State = {
  liked: Record<string, true>;
  watchlist: Record<string, true>;
  hydrate: () => Promise<void>;
  toggle: (id: number, type: "LIKE" | "WATCHLIST") => Promise<void>;
};

const KL = "liked";
const KW = "watchlist";

async function load(k: string) {
  const raw = await SecureStore.getItemAsync(k);
  return raw ? (JSON.parse(raw) as Record<string, true>) : {};
}
async function save(k: string, v: Record<string, true>) {
  await SecureStore.setItemAsync(k, JSON.stringify(v));
}

export const useStore = create<State>((set, get) => ({
  liked: {},
  watchlist: {},
  hydrate: async () => {
    const [liked, watchlist] = await Promise.all([load(KL), load(KW)]);
    set({ liked, watchlist });
  },
  toggle: async (id, type) => {
    const key = String(id);
    if (type === "LIKE") {
      const next = { ...get().liked };
      next[key] ? delete next[key] : (next[key] = true);
      set({ liked: next });
      await save(KL, next);
    } else {
      const next = { ...get().watchlist };
      next[key] ? delete next[key] : (next[key] = true);
      set({ watchlist: next });
      await save(KW, next);
    }
  },
}));
