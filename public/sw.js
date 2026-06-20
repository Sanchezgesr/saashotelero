const CACHE = 'scache-v1'

const STATIC = [
  '/',
  '/login',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return
  if (url.hostname.includes('supabase.co') || url.hostname.includes('sentry.io')) return
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request, { ignoreVary: true }).then((r) => r || caches.match('/'))
    )
  )
})
