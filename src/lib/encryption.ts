import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = process.env.GUEST_ENCRYPTION_KEY
const KEY_BYTES = 32

function getKey(): Buffer {
  if (!KEY) throw new Error('GUEST_ENCRYPTION_KEY no configurada')
  const hash = crypto.createHash('sha256').update(KEY).digest()
  return hash.subarray(0, KEY_BYTES)
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(':')
  if (parts.length !== 3) throw new Error('Formato cifrado inválido')
  const [ivHex, authTagHex, encrypted] = parts
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
