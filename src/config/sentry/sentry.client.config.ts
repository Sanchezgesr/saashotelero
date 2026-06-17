import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn && typeof window !== 'undefined') {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    debug: false,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    integrations: [Sentry.replayIntegration()],
  })
}
