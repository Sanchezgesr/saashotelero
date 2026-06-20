import pkg from 'pg'
const { Client } = pkg

const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!key) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY en el entorno')
  process.exit(1)
}
const host = process.env.SUPABASE_DB_HOST || 'db.lcuojjmgkgzfferoollp.supabase.co'

const client = new Client({
  host,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: key,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const { rows: before } = await client.query(`
  SELECT p.proname, p.pronargs,
    pg_get_function_identity_arguments(p.oid) as args
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.proname = 'perform_checkin_v2' AND n.nspname = 'public'
`)
console.log('Before:', JSON.stringify(before, null, 2))

if (before.length > 1) {
  await client.query(`DROP FUNCTION IF EXISTS perform_checkin_v2(UUID, UUID, UUID, NUMERIC, TEXT, INT, TEXT, NUMERIC, TEXT, TEXT);`)
  console.log('Dropped 10-param overload')
}

const { rows: after } = await client.query(`
  SELECT p.proname, p.pronargs,
    pg_get_function_identity_arguments(p.oid) as args
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.proname = 'perform_checkin_v2' AND n.nspname = 'public'
`)
console.log('After:', JSON.stringify(after, null, 2))

await client.end()
