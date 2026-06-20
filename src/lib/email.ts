import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoiceEmail({
  to, guestName, hotelName, hotelRuc, roomNumber, total,
  tipo, serie, numero, pdfUrl, checkIn, checkOut,
}: {
  to: string
  guestName: string
  hotelName: string
  hotelRuc?: string
  roomNumber: string
  total: number
  tipo: string
  serie: string
  numero: number
  pdfUrl?: string
  checkIn?: string
  checkOut?: string
}) {
  const html = `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 24px; margin: 0; color: #0f172a;">${hotelName}</h1>
      ${hotelRuc ? `<p style="color: #64748b; margin: 4px 0;">RUC: ${hotelRuc}</p>` : ''}
    </div>
    <div style="border-top: 2px solid #2563eb; padding-top: 20px;">
      <h2 style="font-size: 18px; color: #0f172a;">Comprobante de Pago</h2>
      <p style="color: #475569;">Hola <strong>${guestName}</strong>, gracias por tu preferencia.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #64748b;">Habitación</td><td style="text-align: right; font-weight: 600;">${roomNumber}</td></tr>
        ${checkIn ? `<tr><td style="padding: 8px 0; color: #64748b;">Check-in</td><td style="text-align: right;">${checkIn}</td></tr>` : ''}
        ${checkOut ? `<tr><td style="padding: 8px 0; color: #64748b;">Check-out</td><td style="text-align: right;">${checkOut}</td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #64748b;">Comprobante</td><td style="text-align: right;">${tipo.toUpperCase()} ${serie}-${String(numero).padStart(3, '0')}</td></tr>
        <tr style="border-top: 2px solid #e2e8f0;"><td style="padding: 12px 0; font-size: 16px; font-weight: 700;">Total</td><td style="text-align: right; font-size: 20px; font-weight: 900;">S/ ${total.toFixed(2)}</td></tr>
      </table>
      ${pdfUrl ? `<div style="text-align: center; margin: 20px 0;"><a href="${pdfUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Descargar PDF</a></div>` : ''}
    </div>
    <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
      <p>${hotelName} — Sistema HControl</p>
    </div>
  </div>
</body></html>`

  try {
    await resend.emails.send({
      from: `${hotelName} <notificaciones@hcontrol.org.pe>`,
      to,
      subject: `Comprobante de Pago - ${hotelName}`,
      html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export async function sendWelcomeEmail({
  to, name, hotelName, email, password,
}: {
  to: string
  name: string
  hotelName: string
  email: string
  password: string
}) {
  const html = `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h1 style="font-size: 20px; color: #0f172a; margin: 0 0 16px;">Bienvenido a ${hotelName}</h1>
    <p style="color: #475569;">Hola <strong>${name}</strong>,</p>
    <p style="color: #475569;">Se ha creado tu cuenta en el sistema HControl. Aquí están tus credenciales:</p>
    <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 4px 0;"><strong>Contraseña:</strong> ${password}</p>
    </div>
    <p style="color: #64748b; font-size: 14px;">Te recomendamos cambiar tu contraseña al iniciar sesión.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hcontrol.org.pe'}/login"
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Iniciar sesión
      </a>
    </div>
  </div>
</body></html>`

  try {
    await resend.emails.send({
      from: `${hotelName} <notificaciones@hcontrol.org.pe>`,
      to,
      subject: `Bienvenido a ${hotelName} — Credenciales de acceso`,
      html,
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

export async function sendCheckoutEmail({
  to, guestName, hotelName, roomNumber, total, checkIn, checkOut,
}: {
  to: string
  guestName: string
  hotelName: string
  roomNumber: string
  total: number
  checkIn: string
  checkOut: string
}) {
  const html = `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 24px; margin: 0; color: #0f172a;">${hotelName}</h1>
    </div>
    <h2 style="font-size: 18px; color: #0f172a;">Check-out completado</h2>
    <p style="color: #475569;">Hola <strong>${guestName}</strong>, tu check-out se ha realizado con éxito.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px 0; color: #64748b;">Habitación</td><td style="text-align: right; font-weight: 600;">${roomNumber}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b;">Check-in</td><td style="text-align: right;">${checkIn}</td></tr>
      <tr><td style="padding: 8px 0; color: #64748b;">Check-out</td><td style="text-align: right;">${checkOut}</td></tr>
      <tr style="border-top: 2px solid #e2e8f0;"><td style="padding: 12px 0; font-size: 16px; font-weight: 700;">Total</td><td style="text-align: right; font-size: 20px; font-weight: 900;">S/ ${total.toFixed(2)}</td></tr>
    </table>
    <p style="color: #64748b;">Gracias por tu preferencia. ¡Te esperamos pronto!</p>
  </div>
</body></html>`

  try {
    await resend.emails.send({
      from: `${hotelName} <notificaciones@hcontrol.org.pe>`,
      to,
      subject: `Check-out completado — ${hotelName}`,
      html,
    })
  } catch (error) {
    console.error('Error sending checkout email:', error)
  }
}
