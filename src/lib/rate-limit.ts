import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

let proxyLimiter: Ratelimit | null = null
let checkinLimiter: Ratelimit | null = null
let cashLimiter: Ratelimit | null = null

function getLimiter(key: string) {
  if (!redisUrl || !redisToken) return null

  const redis = new Redis({ url: redisUrl, token: redisToken })

  if (key === 'proxy' && !proxyLimiter) {
    proxyLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(300, '60 s'),
      prefix: 'ratelimit:proxy',
    })
  }
  if (key === 'checkin' && !checkinLimiter) {
    checkinLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      prefix: 'ratelimit:checkin',
    })
  }
  if (key === 'cash' && !cashLimiter) {
    cashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      prefix: 'ratelimit:cash',
    })
  }

  if (key === 'proxy') return proxyLimiter
  if (key === 'checkin') return checkinLimiter
  if (key === 'cash') return cashLimiter
  return null
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining?: number; reset?: number }> {
  const limiter = getLimiter(key)

  if (!limiter) {
    return { allowed: true }
  }

  const { success, remaining, reset } = await limiter.limit(key)
  return { allowed: success, remaining, reset }
}
