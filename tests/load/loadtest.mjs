import https from 'https'
import http from 'http'

const SUPABASE_URL = 'https://lcuojjmgkgzfferoollp.supabase.co'
const APP_URL = 'https://hcontrol.org.pe'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdW9qam1na2d6ZmZlcm9vbGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjQxNTcsImV4cCI6MjA5NDc0MDE1N30.s7GFxIkE_e4ZigR0Sar3un_6u7zUzPaTSeRVcbmGKjw'
const CREDENTIALS = { email: 'prueba@gmail.com', password: '123456' }

async function login() {
  const start = Date.now()
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  })
  const body = await res.json()
  return { time: Date.now() - start, session: body, ok: res.ok }
}

function encodeSessionCookie(session) {
  const json = JSON.stringify({
    access_token: session.access_token,
    token_type: session.token_type,
    expires_in: session.expires_in,
    refresh_token: session.refresh_token,
    user: session.user,
  })
  return Buffer.from(json).toString('base64url')
}

async function browsePage(url, cookieValue) {
  const start = Date.now()
  const res = await fetch(url, {
    headers: { Cookie: `sb-lcuojjmgkgzfferoollp-auth-token=${cookieValue}` },
    redirect: 'follow',
  })
  const text = await res.text()
  return { time: Date.now() - start, status: res.status, size: text.length }
}

function printResults(label, times) {
  if (!times || times.length === 0) return
  const sorted = [...times].sort((a, b) => a - b)
  const avg = (sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(0)
  const min = sorted[0].toFixed(0)
  const max = sorted[sorted.length - 1].toFixed(0)
  const p95 = sorted[Math.ceil(0.95 * sorted.length) - 1].toFixed(0)
  const p99 = sorted[Math.ceil(0.99 * sorted.length) - 1].toFixed(0)
  console.log(`  │ ${label.padEnd(12)} │ ${avg.padStart(5)}ms │ ${min.padStart(4)}ms │ ${max.padStart(5)}ms │ ${p95.padStart(4)}ms │ ${p99.padStart(4)}ms │`)
}

async function runConcurrent(concurrency, durationSec = 30, cookie) {
  console.log(`\n=== ${concurrency} usuarios concurrentes | ${durationSec}s ===`)
  console.log(`  Token reutilizado por ${concurrency} workers`)

  const dashTimes = []
  const roomsTimes = []
  const reportsTimes = []
  let totalReqs = 0
  let errorReqs = 0
  const statusCounts = {}
  const startTime = Date.now()
  const endTime = startTime + durationSec * 1000

  const worker = async () => {
    while (Date.now() < endTime) {
      try {
        const d = await browsePage(`${APP_URL}/hotel/dashboard`, cookie)
        if (d.status < 400) dashTimes.push(d.time)
        statusCounts[d.status] = (statusCounts[d.status] || 0) + 1
        if (d.status >= 400) errorReqs++
        totalReqs++

        const r = await browsePage(`${APP_URL}/hotel/rooms`, cookie)
        if (r.status < 400) roomsTimes.push(r.time)
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1
        if (r.status >= 400) errorReqs++
        totalReqs++

        const rp = await browsePage(`${APP_URL}/hotel/reports`, cookie)
        if (rp.status < 400) reportsTimes.push(rp.time)
        statusCounts[rp.status] = (statusCounts[rp.status] || 0) + 1
        if (rp.status >= 400) errorReqs++
        totalReqs++
      } catch (e) {
        errorReqs += 3
        totalReqs += 3
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker())
  await Promise.all(workers)

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const throughput = (totalReqs / parseFloat(elapsed)).toFixed(1)

  console.log(`  ✓ Completado: ${totalReqs} reqs en ${elapsed}s | ${throughput} req/s | ${errorReqs} errores`)
  const statusStr = Object.entries(statusCounts)
    .sort(([a], [b]) => a - b)
    .map(([k, v]) => `${k}: ${v}`).join(', ')
  console.log(`  Status codes: ${statusStr}`)
  console.log('')
  console.log('  ┌──────────────┬────────┬──────┬────────┬──────┬──────┐')
  console.log('  │ Página       │ Prom.  │ Mín  │ Máx    │ P95  │ P99  │')
  console.log('  ├──────────────┼────────┼──────┼────────┼──────┼──────┤')
  printResults('Dashboard', dashTimes)
  printResults('Habitaciones', roomsTimes)
  printResults('Reportes', reportsTimes)
  console.log('  └──────────────┴────────┴──────┴────────┴──────┴──────┘')
}

async function main() {
  console.log('═══════════════════════════════════════')
  console.log('  PRUEBA DE CARGA - HControl')
  console.log(`  URL: ${APP_URL}`)
  console.log(`  Supabase: ${SUPABASE_URL}`)
  console.log(`  Usuario: ${CREDENTIALS.email}`)
  console.log('═══════════════════════════════════════')

  // Login único al inicio
  console.log('\n--- Obteniendo token de autenticación ---')
  const loginResult = await login()
  if (!loginResult.ok || !loginResult.session?.access_token) {
    console.log('✗ Login falló. Abortando.')
    process.exit(1)
  }
  const cookie = encodeSessionCookie(loginResult.session)
  console.log(`✓ Token obtenido en ${loginResult.time}ms (válido ${loginResult.session.expires_in}s)`)

  // 100 concurrentes
  await runConcurrent(100, 30, cookie)

  // 300 concurrentes
  await runConcurrent(300, 30, cookie)

  // 500 concurrentes
  await runConcurrent(500, 30, cookie)

  console.log('\n═══════════════════════════════════════')
  console.log('  PRUEBA COMPLETADA')
  console.log('═══════════════════════════════════════')
}

main().catch(console.error)
