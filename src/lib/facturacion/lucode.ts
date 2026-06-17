const BASE_SANDBOX = 'https://sandbox.apisunat.pe/api/v3'
const BASE_PROD = 'https://app.apisunat.pe/api/v3'

export interface LucodeItem {
  unidad_de_medida: string
  descripcion: string
  cantidad: number
  valor_unitario: number
  porcentaje_igv: number
  codigo_tipo_afectacion_igv: string
  nombre_tributo: string
}

export interface EmitirParams {
  token: string
  tipo: 'boleta' | 'factura'
  serie: string
  numero: number
  moneda?: string
  cliente_tipo_documento: string
  cliente_numero_documento: string
  cliente_denominacion: string
  cliente_direccion?: string
  items: LucodeItem[]
  total: number
  observacion?: string
  sandbox?: boolean
}

export interface LucodeResponse {
  success: boolean
  message: string
  payload?: {
    estado: 'ACEPTADO' | 'PENDIENTE' | 'RECHAZADO'
    hash: string
    xml: string
    cdr: string | null
    pdf: { ticket: string; a4?: string }
  }
}

export async function emitirComprobante(params: EmitirParams): Promise<LucodeResponse> {
  const base = params.sandbox ? BASE_SANDBOX : BASE_PROD
  const res = await fetch(`${base}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({
      documento: params.tipo,
      serie: params.serie,
      numero: params.numero,
      fecha_de_emision: new Date().toISOString().split('T')[0],
      moneda: params.moneda ?? 'PEN',
      tipo_operacion: '0101',
      cliente_tipo_de_documento: params.cliente_tipo_documento,
      cliente_numero_de_documento: params.cliente_numero_documento,
      cliente_denominacion: params.cliente_denominacion,
      cliente_direccion: params.cliente_direccion ?? '',
      items: params.items,
      total: params.total.toFixed(2),
      observacion: params.observacion,
    }),
  })
  return res.json()
}

export async function consultarEstado(token: string, serie: string, numero: number, sandbox?: boolean) {
  const base = sandbox ? BASE_SANDBOX : BASE_PROD
  const res = await fetch(`${base}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ documento: 'factura', serie, numero }),
  })
  return res.json() as Promise<LucodeResponse>
}

export function getNextNumber(ultimoNumero: number | null): number {
  return (ultimoNumero ?? 0) + 1
}
