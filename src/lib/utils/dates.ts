import { differenceInHours, parseISO } from 'date-fns'

const TZ = 'America/Lima'
const LOCALE = 'es-PE'

export function localDate(d?: Date): string {
  const date = d ?? new Date()
  return date.toLocaleDateString('en-CA', { timeZone: TZ })
}

export function tzOffset(): string {
  return '-05:00'
}

export function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString(LOCALE, { timeZone: TZ })
}

export function fmtTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })
}

export function fmtDateTime(d: string | Date): string {
  return new Date(d).toLocaleString(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })
}

export function calculateStayTotal(checkIn: string, checkOut: string, pricePerNight: number) {
  const start = parseISO(checkIn)
  const end = parseISO(checkOut)

  const hours = differenceInHours(end, start)

  let nights = Math.ceil(hours / 24)
  if (nights < 1) nights = 1

  return {
    nights,
    total: nights * pricePerNight
  }
}
