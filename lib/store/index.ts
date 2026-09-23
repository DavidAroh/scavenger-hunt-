import type { Store } from "../types";
import { memoryStore } from "./memory";
import { supabaseStore } from "./supabase";

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
/** Demo storage is now opt-in. An unset database must never silently collect ephemeral leads. */
export const isDemoMode = process.env.RIL_DEMO_MODE === "true";
export const isPersistentStorageConfigured = hasSupabase;
export const isStorageReady = hasSupabase || isDemoMode;

const unconfiguredStore = new Proxy({} as Store, {
  get() {
    return async () => {
      throw new Error("Persistent storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before opening the hunt.");
    };
  },
});

/** Supabase is the default; memory storage is available only with explicit RIL_DEMO_MODE=true. */
export const store: Store = hasSupabase ? supabaseStore : isDemoMode ? memoryStore : unconfiguredStore;
