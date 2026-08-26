import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

// Assign WebSocket to global for supabase realtime in Node.js
global.WebSocket = WebSocket;

const instances = [
  {
    name: "Project A (from VERCEL_ENV_VARS.txt / tisocbbvzqkxcauutaiw)",
    url: 'https://tisocbbvzqkxcauutaiw.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpc29jYmJ2enFreGNhdXV0YWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzE0NDAsImV4cCI6MjA4MTA0NzQ0MH0.mmVZXUizxqq278wto1wX90da_Xenug04f5uwh4jX74k'
  },
  {
    name: "Project B (from Mobile & Webhook / oncpyjqbfkfkjqisdzli)",
    url: 'https://oncpyjqbfkfkjqisdzli.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY3B5anFiZmtma2pxaXNkemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODU3NjcsImV4cCI6MjA5MTg2MTc2N30.qCrwZkFJDsues_Cv-2QIIy_ZniKzh14auxHfVs_0sv4'
  }
];

async function runAudit() {
  console.log("==================================================");
  console.log("AUDIT SUPABASE NOTIFICATIONS & REALTIME");
  console.log("==================================================");

  for (const inst of instances) {
    console.log(`\n==================================================`);
    console.log(`TESTING INSTANCE: ${inst.name}`);
    console.log(`URL: ${inst.url}`);
    console.log(`==================================================`);
    const client = createClient(inst.url, inst.key);

    // 1. Query 'notifications' table
    console.log("\n[1/3] Querying 'notifications' table...");
    try {
      const { data, error, status, statusText } = await client
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.log(`❌ Query Error: HTTP ${status} (${statusText})`);
        console.log(`   Error Code: ${error.code}`);
        console.log(`   Message: ${error.message}`);
        console.log(`   Details: ${error.details}`);
        console.log(`   Hint: ${error.hint}`);
      } else {
        console.log(`✅ Table 'notifications' EXISTS and is ACCESSIBLE!`);
        console.log(`   Total rows retrieved in query: ${data.length}`);
        if (data.length > 0) {
          console.log(`   Latest notification sample:`, JSON.stringify(data[0], null, 2));
        }
      }
    } catch (e) {
      console.log(`❌ Query Exception: ${e.message}`);
    }

    // 2. Test Insertion into 'notifications' table
    console.log("\n[2/3] Testing insertion into 'notifications' table...");
    const testPayload = {
      type: 'concert',
      title: 'TEST AUDIT ' + new Date().toISOString(),
      message: 'Test notification insertion from automated audit script.',
      badge: 'Audit Test',
      badge_bg: '#FEF3C7',
      badge_text_color: '#92400E',
      action_type: 'concert',
      action_text: 'Vérifier',
      is_read: false
    };

    let insertedId = null;
    try {
      const { data: insData, error: insErr, status: insStatus, statusText: insStatusText } = await client
        .from('notifications')
        .insert([testPayload])
        .select();

      if (insErr) {
        console.log(`❌ Insertion Error: HTTP ${insStatus} (${insStatusText})`);
        console.log(`   Error Code: ${insErr.code}`);
        console.log(`   Message: ${insErr.message}`);
        console.log(`   Details: ${insErr.details}`);
        console.log(`   Hint: ${insErr.hint}`);
      } else {
        console.log(`✅ Insertion SUCCESSFUL!`);
        console.log(`   Inserted row:`, JSON.stringify(insData, null, 2));
        insertedId = insData?.[0]?.id;
      }
    } catch (e) {
      console.log(`❌ Insertion Exception: ${e.message}`);
    }

    // 3. Test Realtime subscription channel
    console.log("\n[3/3] Testing Realtime WebSocket subscription...");
    await new Promise((resolve) => {
      let received = false;
      const channel = client
        .channel(`audit-test-realtime-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          (payload) => {
            console.log(`🔔 REALTIME EVENT RECEIVED:`, payload.eventType, payload.new?.id, payload.new?.title);
            received = true;
          }
        )
        .subscribe(async (status, err) => {
          console.log(`   Channel Subscription Status: ${status}`);
          if (err) console.log(`   Subscription Error:`, err);

          if (status === 'SUBSCRIBED') {
            console.log('   Subscription active! Inserting trigger event to test broadcast...');
            const { data: trigData, error: trigErr } = await client.from('notifications').insert([{
              type: 'general',
              title: 'TEST REALTIME BROADCAST ' + new Date().toLocaleTimeString(),
              message: 'Triggering websocket realtime broadcast',
              badge: 'Realtime',
              is_read: false
            }]).select();

            if (trigErr) {
              console.log('   Trigger insert error:', trigErr.message);
            } else {
              console.log('   Trigger inserted row ID:', trigData?.[0]?.id);
            }

            setTimeout(async () => {
              if (insertedId) {
                // Cleanup test row if wanted
                await client.from('notifications').delete().eq('id', insertedId);
              }
              if (trigData?.[0]?.id) {
                await client.from('notifications').delete().eq('id', trigData[0].id);
              }
              client.removeChannel(channel);
              console.log(`   Result: Realtime broadcast received = ${received ? 'YES ✅' : 'NO ⚠️'}`);
              resolve();
            }, 3500);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setTimeout(() => {
              client.removeChannel(channel);
              resolve();
            }, 1000);
          }
        });
    });
  }

  console.log("\n==================================================");
  console.log("AUDIT FINISHED");
  console.log("==================================================");
  process.exit(0);
}

runAudit();
