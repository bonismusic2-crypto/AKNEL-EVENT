import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oncpyjqbfkfkjqisdzli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY3B5anFiZmtma2pxaXNkemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODU3NjcsImV4cCI6MjA5MTg2MTc2N30.qCrwZkFJDsues_Cv-2QIIy_ZniKzh14auxHfVs_0sv4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching pages table...");
  const { data, error } = await supabase.from('pages').select('*');
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
