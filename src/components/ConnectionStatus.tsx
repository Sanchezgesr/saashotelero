'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

type Status = 'connected' | 'connecting' | 'disconnected'

export function ConnectionStatus() {
  const [status, setStatus] = useState<Status>('connected')
  const channelRef = useRef<RealtimeChannel | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const heartbeat = () => {
      channelRef.current = supabase.channel('system:heartbeat')
        .subscribe((event) => {
          setStatus(event === 'SUBSCRIBED' ? 'connected' : 'connecting')
        })
    }

    const checkFallback = async () => {
      try {
        const { error } = await supabase.from('rooms').select('id', { count: 'exact', head: true }).limit(1)
        setStatus(error ? 'disconnected' : 'connected')
      } catch {
        setStatus('disconnected')
      }
    }

    heartbeat()
    intervalRef.current = setInterval(checkFallback, 30000)

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current!)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (status === 'connected') return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-[60] text-center text-xs font-semibold py-1.5 ${
      status === 'connecting' ? 'bg-yellow-400 text-yellow-900' : 'bg-red-500 text-white'
    }`}>
      {status === 'connecting' ? 'Reconectando...' : 'Sin conexión'}
    </div>
  )
}
