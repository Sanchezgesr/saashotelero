import { test, expect } from '@playwright/test'

test('página de login carga correctamente', async ({ page }) => {
  await page.goto('/login')
  // Como no tenemos la UI real corriendo, este test fallará si intentamos correrlo sin el servidor
  // Pero lo dejamos como base para la etapa de Testing
  await expect(page).toHaveTitle(/Login/i)
})
