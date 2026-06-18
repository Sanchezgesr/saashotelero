import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const start = Date.now()
  try {
    const svc = createServiceClient()
    const { count } = await svc
      .from('hotels')
      .select('*', { count: 'exact', head: true })
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      hotels: count ?? 0,
      ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        ms: Date.now() - start,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'unknown',
      },
      { status: 503 },
    )
  }
}
