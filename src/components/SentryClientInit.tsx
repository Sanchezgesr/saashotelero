'use client'
import { useEffect } from 'react'

export default function SentryClientInit() {
  useEffect(() => {
    import('@/config/sentry/sentry.client.config')
  }, [])
  return null
}