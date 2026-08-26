import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oncpyjqbfkfkjqisdzli.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY3B5anFiZmtma2pxaXNkemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODU3NjcsImV4cCI6MjA5MTg2MTc2N30.qCrwZkFJDsues_Cv-2QIIy_ZniKzh14auxHfVs_0sv4';

// Implémentation d'un stockage mémoire ultra-léger 100% compatible Expo Go
class MemoryStorage {
  constructor() {
    this.memory = new Map();
  }
  async getItem(key) {
    return this.memory.has(key) ? this.memory.get(key) : null;
  }
  async setItem(key, value) {
    this.memory.set(key, value);
  }
  async removeItem(key) {
    this.memory.delete(key);
  }
}

const memoryStorage = new MemoryStorage();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: memoryStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
