import pkg from 'pg';
const { Client } = pkg;

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdW9qam1na2d6ZmZlcm9vbGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE2NDE1NywiZXhwIjoyMDk0NzQwMTU3fQ.Z3MSjh1dpdECoedetshPWfE6fVYvJNXow--C-3kLNXQ';

// Try multiple connection options
const configs = [
  { host: 'db.lcuojjmgkgzfferoollp.supabase.co', port: 5432, database: 'postgres', user: 'postgres', password: key },
  { host: 'db.lcuojjmgkgzfferoollp.supabase.co', port: 6543, database: 'postgres', user: 'postgres', password: key },
  { host: 'aws-0-us-west-1.pooler.supabase.com', port: 6543, database: 'postgres', user: 'postgres.lcuojjmgkgzfferoollp', password: key },
  { host: 'aws-0-us-west-1.pooler.supabase.com', port: 5432, database: 'postgres', user: 'postgres.lcuojjmgkgzfferoollp', password: key },
];

for (const cfg of configs) {
  const client = new Client({ ...cfg, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log(`Connected via ${cfg.host}:${cfg.port} as ${cfg.user}`);
    console.log(`PG version:`, res.rows[0].version);
    
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
    `;
    await client.query(sql);
    console.log('Migration 016 executed successfully!');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error(`Failed ${cfg.host}:${cfg.port}: ${err.message}`);
    try { await client.end() } catch {}
  }
}
process.exit(1);
