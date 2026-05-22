const allowedMimes = ['image/png', 'image/jpeg', 'image/webp']
const maxSize = 2 * 1024 * 1024

const extMap: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const magicBytes: Record<string, Uint8Array[]> = {
  'image/png': [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
  'image/jpeg': [new Uint8Array([255, 216, 255, 224]), new Uint8Array([255, 216, 255, 225])],
  'image/webp': [new Uint8Array([82, 73, 70, 70])],
}

async function validateFileSignature(file: File): Promise<string | null> {
  const signatures = magicBytes[file.type]
  if (!signatures) return 'Tipo de archivo no permitido'

  const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer())

  const matches = signatures.some(sig => {
    if (sig.length > buf.length) return false
    return sig.every((b, i) => b === buf[i])
  })

  if (!matches) return 'El archivo no coincide con el formato esperado'
  return null
}

export async function validateLogoFile(file: File): Promise<string | null> {
  if (file.size === 0) return 'Archivo inválido'
  if (!allowedMimes.includes(file.type)) return 'Solo PNG, JPG o WebP'
  if (file.size > maxSize) return 'Máximo 2MB'
  return validateFileSignature(file)
}

export function getLogoPath(hotelId: string, fileType: string): string {
  const ext = extMap[fileType] || 'png'
  return `${hotelId}/logo.${ext}`
}

export function getCacheBustedUrl(publicUrl: string): string {
  return `${publicUrl}?v=${Date.now()}`
}
