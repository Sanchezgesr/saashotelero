# ETAPA 8 — TESTING Y CONTROL DE CALIDAD

> Verificar que el sistema funciona correctamente, es seguro y está listo para uso real.

---

## 1. Tipos de Testing

| Tipo | Herramienta | Qué verifica |
|------|-------------|-------------|
| Unit Testing | Jest + Testing Library | Funciones individuales |
| Integration Testing | Jest + Supabase test | Queries a la BD |
| E2E Testing | Playwright | Flujos completos del usuario |
| Security Testing | Manual + Supabase RLS | Aislamiento multi-tenant |
| Performance Testing | Lighthouse | Velocidad y accesibilidad |
| UAT | Usuarios reales | Usabilidad en campo |

---

## 2. Instalar Herramientas de Testing

```bash
# Jest + Testing Library
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D jest-environment-jsdom @types/jest ts-jest

# Playwright para E2E
npm install -D @playwright/test
npx playwright install
```

### `jest.config.ts`

```typescript
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
  },
}

export default config
```

---

## 3. Tests Unitarios

### Test: Calcular total de estadía

```typescript
// src/lib/__tests__/checkout.test.ts
import { calculateStayTotal } from '@/lib/utils'

describe('calculateStayTotal', () => {
  it('debe calcular correctamente 1 noche', () => {
    const result = calculateStayTotal('2026-06-10T14:00:00', '2026-06-11T10:00:00', 80)
    expect(result.nights).toBe(1)
    expect(result.total).toBe(80)
  })

  it('debe calcular correctamente 3 noches', () => {
    const result = calculateStayTotal('2026-06-10T14:00:00', '2026-06-13T10:00:00', 80)
    expect(result.nights).toBe(3)
    expect(result.total).toBe(240)
  })

  it('debe redondear horas parciales al día siguiente', () => {
    const result = calculateStayTotal('2026-06-10T08:00:00', '2026-06-11T09:00:00', 100)
    expect(result.nights).toBe(2)
  })
})
```

### Test: Validación de formulario de habitación

```typescript
// src/lib/__tests__/validators.test.ts
import { roomSchema } from '@/lib/validators'

describe('roomSchema', () => {
  it('debe fallar si el precio es negativo', () => {
    const result = roomSchema.safeParse({ number: '101', type: 'simple', capacity: 1, price_per_night: -10 })
    expect(result.success).toBe(false)
  })

  it('debe pasar con datos válidos', () => {
    const result = roomSchema.safeParse({ number: '101', type: 'simple', capacity: 1, price_per_night: 80 })
    expect(result.success).toBe(true)
  })
})
```

---

## 4. Tests E2E con Playwright

### Test: Flujo de Login

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('recepcionista puede iniciar sesión', async ({ page }) => {
  await page.goto('/login')

  await page.fill('input[type=email]', 'recepcion@hoteltest.com')
  await page.fill('input[type=password]', 'password123')
  await page.click('button:has-text("Iniciar sesión")')

  await expect(page).toHaveURL('/recepcion/dashboard')
  await expect(page.locator('text=Bienvenido')).toBeVisible()
})

test('usuario con credenciales incorrectas ve error', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type=email]', 'nadie@nadie.com')
  await page.fill('input[type=password]', 'wrong')
  await page.click('button:has-text("Iniciar sesión")')

  await expect(page.locator('text=Credenciales incorrectas')).toBeVisible()
})
```

### Test: Flujo de Check-in Completo

```typescript
// e2e/checkin.spec.ts
test('recepcionista puede realizar check-in completo', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[type=email]', 'recepcion@hoteltest.com')
  await page.fill('input[type=password]', 'password123')
  await page.click('button:has-text("Iniciar sesión")')

  // Ir a check-in
  await page.click('text=Check-in')
  await expect(page).toHaveURL('/recepcion/checkin')

  // Buscar cliente por DNI
  await page.fill('input[placeholder*="DNI"]', '12345678')
  await page.click('button:has-text("Buscar")')
  await expect(page.locator('text=Juan García')).toBeVisible()

  // Seleccionar habitación
  await page.click('text=Siguiente')
  await page.click('[data-room="101"]')

  // Confirmar
  await page.click('text=Siguiente')
  await expect(page.locator('text=Confirmar Check-in')).toBeVisible()
  await page.click('button:has-text("REGISTRAR")')

  // Verificar éxito
  await expect(page.locator('text=Check-in registrado')).toBeVisible()
})
```

---

## 5. Tests de Seguridad (Multi-Tenant)

Este es el test más crítico: verificar que un hotel **no puede ver datos de otro hotel**.

### Test manual en Supabase

```sql
-- Simular usuario del Hotel A
SET LOCAL request.jwt.claims = '{"sub": "UUID-USUARIO-HOTEL-A"}';

-- Intentar ver habitaciones del Hotel B (debe retornar vacío)
SELECT * FROM rooms WHERE hotel_id = 'UUID-HOTEL-B';
-- Resultado esperado: 0 filas

-- Ver habitaciones del Hotel A (debe retornar sus habitaciones)
SELECT * FROM rooms WHERE hotel_id = 'UUID-HOTEL-A';
-- Resultado esperado: las habitaciones del Hotel A
```

### Checklist de seguridad

- [ ] Usuario de Hotel A no puede ver rooms del Hotel B
- [ ] Usuario de Hotel A no puede ver guests del Hotel B
- [ ] Usuario de Hotel A no puede ver checkins del Hotel B
- [ ] Recepcionista no puede acceder a rutas de Admin
- [ ] Admin no puede acceder a rutas de Super Admin
- [ ] Super Admin puede ver todos los hoteles
- [ ] Token JWT expirado redirige a login
- [ ] Usuario suspendido no puede acceder

---

## 6. Checklist de Funcionalidades

### Super Admin

| Funcionalidad | Estado |
|--------------|--------|
| Login y redirección a `/admin/dashboard` | ⬜ |
| Ver lista de hoteles | ⬜ |
| Crear hotel | ⬜ |
| Suspender hotel | ⬜ |
| Ver usuarios de un hotel | ⬜ |
| Bloquear usuario | ⬜ |
| Ver métricas (MRR, hoteles activos) | ⬜ |
| Log de auditoría | ⬜ |

### Admin del Hotel

| Funcionalidad | Estado |
|--------------|--------|
| Login y redirección a `/hotel/dashboard` | ⬜ |
| Dashboard con datos en tiempo real | ⬜ |
| Crear habitación | ⬜ |
| Cambiar estado de habitación | ⬜ |
| Crear reserva | ⬜ |
| Cancelar reserva | ⬜ |
| Registrar cliente (DNI obligatorio) | ⬜ |
| Hacer check-in | ⬜ |
| Hacer check-out con cálculo automático | ⬜ |
| Habitación pasa a "Limpieza" tras checkout | ⬜ |
| Registrar ingreso en caja | ⬜ |
| Cerrar caja del día | ⬜ |
| Ver reportes de ingresos | ⬜ |
| Subir logo del hotel | ⬜ |
| Crear recepcionista | ⬜ |

### Recepcionista

| Funcionalidad | Estado |
|--------------|--------|
| Login y redirección a `/recepcion/dashboard` | ⬜ |
| Ver habitaciones libres/ocupadas | ⬜ |
| Check-in en 3 pasos | ⬜ |
| Registrar cliente nuevo desde check-in | ⬜ |
| Check-out con cobro | ⬜ |
| No puede acceder a reportes ni configuración | ⬜ |
| Caja básica (solo ingresos del día) | ⬜ |

---

## 7. Testing de Rendimiento

Usar Lighthouse en Chrome DevTools:

### Objetivos mínimos

| Métrica | Mínimo |
|---------|--------|
| Performance | > 80 |
| Accessibility | > 90 |
| Best Practices | > 90 |
| SEO | > 80 |
| FCP (First Contentful Paint) | < 2s |
| TTI (Time to Interactive) | < 3s |

### Optimizaciones en Next.js

```typescript
// Usar Suspense para cargas
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

// Usar next/image para imágenes
import Image from 'next/image'
<Image src={hotel.logo_url} width={80} height={80} alt="Logo" />

// Paginación en listas largas
const { data } = await supabase
  .from('guests')
  .select('*')
  .range(0, 19)  // 20 por página
```

---

## 8. UAT — Pruebas con Usuarios Reales

Antes de lanzar, hacer pruebas con al menos **1 hospedaje piloto**:

### Plan de UAT

| Sesión | Duración | Actividad |
|--------|----------|-----------|
| 1 | 1h | Mostrar el sistema, login, dashboard |
| 2 | 1h | El recepcionista hace check-in real |
| 3 | 1h | El admin revisa reportes y cierra caja |
| 4 | 30min | Recolectar feedback y ajustar |

### Preguntas de feedback

1. ¿Fue fácil encontrar el check-in?
2. ¿El proceso de check-out fue claro?
3. ¿Qué faltó en el sistema?
4. ¿Qué cambiarías primero?
5. ¿Lo usarías todos los días?

---

## ✅ Checklist Final de Testing

- [x] Tests unitarios ejecutados sin errores (utils y validators)
- [x] Infraestructura de Jest configurada
- [x] Infraestructura de Playwright inicializada
- [x] Tests de seguridad RLS verificados manualmente (Etapa 2)
- [ ] Performance Lighthouse > 80 en todas las páginas principales
- [ ] Prueba en celular Android (pantalla táctil)
- [ ] UAT completado con usuario real
- [ ] Bugs encontrados documentados y corregidos

---

**Siguiente etapa:** [ETAPA 9 — Despliegue a Producción](./ETAPA-9-Despliegue-Produccion.md)
