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

export interface RucData {
  ruc: string
  razon_social: string
  estado: string
  condicion: string
  direccion: string
  departamento: string
  provincia: string
  distrito: string
}

export interface DniData {
  dni: string
  nombres: string
  apellido_paterno: string
  apellido_materno: string
}

export async function consultarDni(token: string, dni: string): Promise<DniData | null> {
  const res = await fetch(`https://dev.apisunat.pe/api/v1/dni/${dni}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  if (!json.success) return null
  return {
    dni: json.payload.dni,
    nombres: json.payload.nombres,
    apellido_paterno: json.payload.apellido_paterno,
    apellido_materno: json.payload.apellido_materno,
  }
}

export async function consultarRuc(token: string, ruc: string): Promise<RucData | null> {
  const res = await fetch(`https://dev.apisunat.pe/api/v1/business/ruc/${ruc}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  if (!json.success) return null
  return {
    ruc: json.payload.ruc,
    razon_social: json.payload.razon_social,
    estado: json.payload.estado,
    condicion: json.payload.condicion,
    direccion: json.payload.direccion_fiscal,
    departamento: json.payload.departamento,
    provincia: json.payload.provincia,
    distrito: json.payload.distrito,
  }
}

export function getNextNumber(ultimoNumero: number | null): number {
  return (ultimoNumero ?? 0) + 1
}
