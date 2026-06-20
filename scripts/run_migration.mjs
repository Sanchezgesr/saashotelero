import pkg from 'pg'
const { Client } = pkg

const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!key) { console.error('Falta SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const client = new Client({
  host: 'db.lcuojjmgkgzfferoollp.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: key,
  ssl: { rejectUnauthorized: false },
})

const sql = `
  -- Fix notas_venta: add UPDATE/DELETE policies
  CREATE POLICY notas_venta_update ON notas_venta FOR UPDATE USING (hotel_id = get_my_hotel_id());
  CREATE POLICY notas_venta_delete ON notas_venta FOR DELETE USING (hotel_id = get_my_hotel_id());

  -- Fix csrf_tokens: restrict by user_id
  DROP POLICY IF EXISTS csrf_tokens_select ON csrf_tokens;
  DROP POLICY IF EXISTS csrf_tokens_insert ON csrf_tokens;
  DROP POLICY IF EXISTS csrf_tokens_delete ON csrf_tokens;
  CREATE POLICY csrf_tokens_select ON csrf_tokens FOR SELECT USING (user_id = auth.uid());
  CREATE POLICY csrf_tokens_insert ON csrf_tokens FOR INSERT WITH CHECK (user_id = auth.uid());
  CREATE POLICY csrf_tokens_delete ON csrf_tokens FOR DELETE USING (user_id = auth.uid());

  -- Fix dashboard RPC: remove anon grant
  REVOKE EXECUTE ON FUNCTION get_dashboard_data FROM anon;
`

try {
  await client.connect()
  await client.query(sql)
  console.log('Migration 016_fix_rls.sql executed successfully')
  await client.end()
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
