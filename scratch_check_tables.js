import { createClient } from '@supabase/supabase-js';

const client = createClient(
  'https://oncpyjqbfkfkjqisdzli.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY3B5anFiZmtma2pxaXNkemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODU3NjcsImV4cCI6MjA5MTg2MTc2N30.qCrwZkFJDsues_Cv-2QIIy_ZniKzh14auxHfVs_0sv4'
);

async function checkTables() {
  const tables = ['pages', 'services', 'gallery', 'messages', 'reservations', 'notifications', 'profiles', 'subscriptions', 'media_contents'];
  for (const t of tables) {
    const { data, error, count } = await client.from(t).select('*', { count: 'exact' }).limit(1);
    if (error) {
      console.log(`Table '${t}': ❌ Error ${error.code} - ${error.message}`);
    } else {
      console.log(`Table '${t}': ✅ Exists! Count: ${count}`);
    }
  }
}

checkTables();
