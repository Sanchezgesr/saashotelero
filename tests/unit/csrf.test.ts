/**
 * @jest-environment node
 */

describe('CSRF token utils', () => {
  it('debe generar un Set-Cookie string', async () => {
    const { setCsrfCookie } = await import('@/lib/csrf')
    const cookie = setCsrfCookie()
    expect(cookie).toContain('_csrf_token=')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('SameSite=Strict')
    expect(cookie).toContain('Max-Age=3600')
  })

  it('debe rechazar cuando no hay cookie', async () => {
    const { validateCsrfToken } = await import('@/lib/csrf')
    const request = new Request('https://example.com/api/test', {
      headers: { 'x-csrf-token': 'abc' },
    })
    const result = await validateCsrfToken(request)
    expect(result).toBe(false)
  })

  it('debe rechazar cuando no hay header', async () => {
    const { validateCsrfToken } = await import('@/lib/csrf')
    const request = new Request('https://example.com/api/test', {
      headers: { cookie: '_csrf_token=abc' },
    })
    const result = await validateCsrfToken(request)
    expect(result).toBe(false)
  })

  it('debe validar cuando cookie y header coinciden', async () => {
    const { validateCsrfToken } = await import('@/lib/csrf')
    const request = new Request('https://example.com/api/test', {
      headers: {
        cookie: '_csrf_token=abc123',
        'x-csrf-token': 'abc123',
      },
    })
    const result = await validateCsrfToken(request)
    expect(result).toBe(true)
  })

  it('debe rechazar cuando cookie y header no coinciden', async () => {
    const { validateCsrfToken } = await import('@/lib/csrf')
    const request = new Request('https://example.com/api/test', {
      headers: {
        cookie: '_csrf_token=abc123',
        'x-csrf-token': 'different',
      },
    })
    const result = await validateCsrfToken(request)
    expect(result).toBe(false)
  })
})
