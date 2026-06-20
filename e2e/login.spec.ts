import { test, expect } from '@playwright/test'

test('login exitoso con hotel_admin redirige a /hotel/dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'prueba@gmail.com')
  await page.fill('input[type="password"]', '123456')
  await page.click('button:has-text("Iniciar sesión")')
  await page.waitForURL('**/hotel/dashboard', { timeout: 15000 })
  await expect(page.locator('h1')).toContainText('Panel del Hotel')
})

test('credenciales inválidas muestran error', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'invalido@test.com')
  await page.fill('input[type="password"]', 'wrongpass')
  await page.click('button:has-text("Iniciar sesión")')
  await expect(page.locator('text=Correo o contraseña incorrectos')).toBeVisible()
})

test('logout redirige a /login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'prueba@gmail.com')
  await page.fill('input[type="password"]', '123456')
  await page.click('button:has-text("Iniciar sesión")')
  await page.waitForURL('**/hotel/dashboard')
  await page.click('text=Cerrar sesión')
  await page.waitForURL('**/login', { timeout: 10000 })
  await expect(page.locator('h1')).toContainText('Iniciar sesión')
})
