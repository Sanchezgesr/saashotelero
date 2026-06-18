import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

let redis: Redis | null = null

function getRedis() {
  if (!redis && redisUrl && redisToken) {
    redis = new Redis({ url: redisUrl, token: redisToken })
  }
  return redis
}

const limiters = new Map<string, Ratelimit>()

function getLimiter(prefix: string, limit: number, windowMs: number) {
  const key = `${prefix}:${limit}:${windowMs}`
  if (!limiters.has(key)) {
    const r = getRedis()
    if (!r) return null
    limiters.set(
      key,
      new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
        prefix: `ratelimit:${prefix}`,
      }),
    )
  }
  return limiters.get(key)!
}

export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining?: number; reset?: number }> {
  const r = getRedis()
  if (!r) return { allowed: true }

  const limiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
    prefix: 'ratelimit',
  })

  const { success, remaining, reset } = await limiter.limit(identifier)
  return { allowed: success, remaining, reset }
}

export async function proxyRateLimit(identifier: string) {
  return rateLimit(identifier, 300, 60_000)
}

export async function mutationRateLimit(identifier: string) {
  return rateLimit(identifier, 30, 60_000)
}

export async function authRateLimit(identifier: string) {
  return rateLimit(identifier, 10, 60_000)
}
