jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue({ success: true, remaining: 300, reset: Date.now() + 60000 }),
  })),
}))

describe('rateLimit (fallback sin Redis)', () => {
  it('debe permitir cuando no hay Redis configurado', async () => {
    const oldUrl = process.env.UPSTASH_REDIS_REST_URL
    const oldToken = process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const { rateLimit } = await import('@/lib/rate-limit')
    const result = await rateLimit('test-key', 10, 60_000)
    expect(result.allowed).toBe(true)

    process.env.UPSTASH_REDIS_REST_URL = oldUrl
    process.env.UPSTASH_REDIS_REST_TOKEN = oldToken
  })

  it('debe usar Redis cuando está configurado', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

    const { rateLimit } = await import('@/lib/rate-limit')
    const result = await rateLimit('test-key', 10, 60_000)
    expect(result.allowed).toBe(true)

    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })
})
