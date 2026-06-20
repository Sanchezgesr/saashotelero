import { checkinSchema, createGuestSchema, createHotelSchema, emitirComprobanteSchema, parseAction } from '@/lib/validations'

const VALID_HOTEL_ID = '00000000-0000-4000-8000-000000000001'
const VALID_GUEST_ID = '00000000-0000-4000-8000-000000000002'
const VALID_ROOM_ID = '00000000-0000-4000-8000-000000000003'

describe('checkinSchema', () => {
  it('debe aceptar check-in válido', () => {
    const result = checkinSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      guest_id: VALID_GUEST_ID,
      room_id: VALID_ROOM_ID,
      room_number: '101',
      price_per_night: 80,
      total_price: 240,
      payment_method: 'cash',
      guest_name: 'Juan Pérez',
      nights: 3,
    })
    expect(result.success).toBe(true)
  })

  it('debe rechazar método de pago inválido', () => {
    const result = checkinSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      guest_id: VALID_GUEST_ID,
      room_id: VALID_ROOM_ID,
      room_number: '101',
      price_per_night: 80,
      total_price: 240,
      payment_method: 'transferencia',
      guest_name: 'Juan Pérez',
      nights: 3,
    })
    expect(result.success).toBe(false)
  })

  it('debe rechazar noches fuera de rango', () => {
    const result = checkinSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      guest_id: VALID_GUEST_ID,
      room_id: VALID_ROOM_ID,
      room_number: '101',
      price_per_night: 80,
      total_price: 240,
      payment_method: 'cash',
      guest_name: 'Juan Pérez',
      nights: 0,
    })
    expect(result.success).toBe(false)
  })

  it('debe aceptar notes opcional', () => {
    const result = checkinSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      guest_id: VALID_GUEST_ID,
      room_id: VALID_ROOM_ID,
      room_number: '101',
      price_per_night: 80,
      total_price: 240,
      payment_method: 'yape',
      guest_name: 'María García',
      nights: 2,
      notes: 'Check-in tarde',
    })
    expect(result.success).toBe(true)
  })
})

describe('createGuestSchema', () => {
  it('debe aceptar huésped válido', () => {
    const result = createGuestSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      full_name: 'Carlos López',
      dni: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('debe rechazar DNI con menos de 8 dígitos', () => {
    const result = createGuestSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      full_name: 'Carlos López',
      dni: '1234',
    })
    expect(result.success).toBe(false)
  })

  it('debe aceptar campos opcionales phone y email', () => {
    const result = createGuestSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      full_name: 'Ana Torres',
      dni: '87654321',
      phone: '987654321',
      email: 'ana@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('debe rechazar email inválido', () => {
    const result = createGuestSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      full_name: 'Ana Torres',
      dni: '87654321',
      email: 'no-es-un-email',
    })
    expect(result.success).toBe(false)
  })
})

describe('createHotelSchema', () => {
  it('debe aceptar hotel válido', () => {
    const result = createHotelSchema.safeParse({
      name: 'Hotel Prueba',
      plan: 'basico_mensual',
    })
    expect(result.success).toBe(true)
  })

  it('debe rechazar RUC con formato incorrecto', () => {
    const result = createHotelSchema.safeParse({
      name: 'Hotel Prueba',
      ruc: '123',
      plan: 'basico_mensual',
    })
    expect(result.success).toBe(false)
  })

  it('debe aceptar RUC vacío', () => {
    const result = createHotelSchema.safeParse({
      name: 'Hotel Prueba',
      ruc: '',
      plan: 'basico_mensual',
    })
    expect(result.success).toBe(true)
  })
})

describe('emitirComprobanteSchema', () => {
  it('debe aceptar boleta con DNI', () => {
    const result = emitirComprobanteSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      checkin_id: VALID_GUEST_ID,
      tipo: 'boleta',
      cliente_tipo_documento: '1',
      cliente_numero_documento: '12345678',
      cliente_denominacion: 'Juan Pérez',
    })
    expect(result.success).toBe(true)
  })

  it('debe aceptar factura con RUC', () => {
    const result = emitirComprobanteSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      checkin_id: VALID_GUEST_ID,
      tipo: 'factura',
      cliente_tipo_documento: '6',
      cliente_numero_documento: '20123456789',
      cliente_denominacion: 'Empresa SAC',
      cliente_direccion: 'Av. Principal 123',
    })
    expect(result.success).toBe(true)
  })

  it('debe rechazar boleta con tipo documento inválido', () => {
    const result = emitirComprobanteSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      checkin_id: VALID_GUEST_ID,
      tipo: 'boleta',
      cliente_tipo_documento: 'X',
      cliente_numero_documento: '12345678',
      cliente_denominacion: 'Juan Pérez',
    })
    expect(result.success).toBe(false)
  })
})

describe('parseAction', () => {
  it('debe retornar data cuando la validación pasa', () => {
    const schema = createGuestSchema
    const { error, data } = parseAction(schema, {
      hotel_id: VALID_HOTEL_ID,
      full_name: 'Test',
      dni: '12345678',
    })
    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data?.full_name).toBe('Test')
  })

  it('debe retornar mensaje de error cuando falla', () => {
    const schema = createGuestSchema
    const { error, data } = parseAction(schema, {
      hotel_id: VALID_HOTEL_ID,
      full_name: '',
      dni: '1234',
    })
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })
})
