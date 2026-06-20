import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://lcuojjmgkgzfferoollp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdW9qam1na2d6ZmZlcm9vbGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE2NDE1NywiZXhwIjoyMDk0NzQwMTU3fQ.Z3MSjh1dpdECoedetshPWfE6fVYvJNXow--C-3kLNXQ'
)

const sql = `
  CREATE POLICY IF NOT EXISTS notas_venta_update ON notas_venta FOR UPDATE USING (hotel_id = get_my_hotel_id());
  CREATE POLICY IF NOT EXISTS notas_venta_delete ON notas_venta FOR DELETE USING (hotel_id = get_my_hotel_id());

  DROP POLICY IF EXISTS csrf_tokens_select ON csrf_tokens;
  DROP POLICY IF EXISTS csrf_tokens_insert ON csrf_tokens;
  DROP POLICY IF EXISTS csrf_tokens_delete ON csrf_tokens;
  CREATE POLICY csrf_tokens_select ON csrf_tokens FOR SELECT USING (user_id = auth.uid());
  CREATE POLICY csrf_tokens_insert ON csrf_tokens FOR INSERT WITH CHECK (user_id = auth.uid());
  CREATE POLICY csrf_tokens_delete ON csrf_tokens FOR DELETE USING (user_id = auth.uid());

  REVOKE EXECUTE ON FUNCTION get_dashboard_data FROM anon;
`

async function run() {
  // Try supabase.sql if it exists (added in v2.39.0+)
  if (typeof supabase.sql === 'function') {
    const { error } = await supabase.sql(sql)
    if (!error) { console.log('Migration executed via supabase.sql()'); return }
    console.log('supabase.sql() failed:', error.message)
  }

  // Fallback: try via RPC if there's an exec_sql function
  const { error: rpcErr } = await supabase.rpc('exec_sql', { query: sql })
  if (!rpcErr) { console.log('Migration executed via RPC'); return }

  // Fallback: try raw fetch to the pg endpoint
  const url = `https://lcuojjmgkgzfferoollp.supabase.co/rest/v1/`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdW9qam1na2d6ZmZlcm9vbGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE2NDE1NywiZXhwIjoyMDk0NzQwMTU3fQ.Z3MSjh1dpdECoedetshPWfE6fVYvJNXow--C-3kLNXQ',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdW9qam1na2d6ZmZlcm9vbGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE2NDE1NywiZXhwIjoyMDk0NzQwMTU3fQ.Z3MSjh1dpdECoedetshPWfE6fVYvJNXow--C-3kLNXQ',
      'Prefer': 'params=single-object',
    },
    body: JSON.stringify({ query: sql }),
  })
  
  if (res.ok) {
    console.log('Migration executed via raw fetch')
    return
  }
  
  const text = await res.text()
  console.log('All methods failed. Last response:', res.status, text.slice(0, 500))
}

run().catch(e => console.error('Fatal:', e.message))
