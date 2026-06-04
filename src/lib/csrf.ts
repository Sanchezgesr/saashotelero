const CSRF_COOKIE = '_csrf_token'
const CSRF_HEADER = 'x-csrf-token'

export function setCsrfCookie(): string {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  return `${CSRF_COOKIE}=${token}; Path=/; SameSite=Strict; Max-Age=3600;${typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') ? ' Secure;' : ''}`
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = cookieHeader.split(';').map(c => c.trim())
  const csrfCookie = cookies.find(c => c.startsWith(`${CSRF_COOKIE}=`))

  if (!csrfCookie) return false

  const cookieToken = csrfCookie.split('=')[1]
  const headerToken = request.headers.get(CSRF_HEADER)

  if (!headerToken) return false

  return cookieToken === headerToken
}

// Client-side helper: reads CSRF cookie and returns header value
export function getCsrfHeader(): { [CSRF_HEADER]: string } | Record<string, never> {
  if (typeof document === 'undefined') return {}
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE}=([^;]+)`))
  if (!match) return {}
  return { [CSRF_HEADER]: match[2] } as { [CSRF_HEADER]: string }
}

export { CSRF_COOKIE, CSRF_HEADER }
