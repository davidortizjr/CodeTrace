import { MemoryStore, demoResultsSeed, demoSeed } from './memory.js';
import { SupabaseStore } from './supabase.js';
import type { Store } from './types.js';

export const demoStore = new MemoryStore(demoSeed, demoResultsSeed);
const supabaseStore = new SupabaseStore();

export const storeFor = (user: { demo: boolean }): Store => (user.demo ? demoStore : supabaseStore);
