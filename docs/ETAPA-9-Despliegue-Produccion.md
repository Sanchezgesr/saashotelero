# ETAPA 9 — DESPLIEGUE A PRODUCCIÓN

> Publicar el sistema en internet para que los hoteles puedan usarlo desde cualquier dispositivo.

---

## 1. Checklist Pre-Despliegue

Antes de publicar, verificar:

- [ ] Todas las funcionalidades de la Etapa 8 marcadas como ✅
- [ ] Sin errores en `npm run build`
- [ ] Variables de entorno de producción preparadas
- [ ] Dominio web comprado (opcional para el lanzamiento inicial)
- [ ] Supabase en plan gratuito o Pro según el volumen esperado

---

## 2. Preparar Supabase para Producción

### 2.1 Verificar configuración

En el panel de Supabase → **Authentication → Settings**:

```
Site URL:         https://tu-dominio.com
Redirect URLs:    https://tu-dominio.com/auth/callback
                  http://localhost:3000/auth/callback   ← mantener para desarrollo
```

### 2.2 Activar confirmación de email

En producción, activar **Confirm email** en Authentication Settings para mayor seguridad.

### 2.3 Revisar RLS

Ejecutar en SQL Editor para verificar que todas las tablas tienen RLS activo:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Todas deben mostrar rowsecurity = TRUE
```

### 2.4 Revisar índices

```sql
-- Verificar que los índices están creados
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2.5 Backups automáticos

Supabase Pro incluye backups diarios automáticos. En el plan gratuito:

```sql
-- Exportar datos manualmente desde el panel:
-- Dashboard → Database → Backups → Download
```

---

## 3. Despliegue del Frontend en Vercel

### 3.1 Conectar repositorio con Vercel

1. Ir a https://vercel.com
2. Crear cuenta con GitHub
3. Clic en **Add New Project**
4. Importar el repositorio `saas-hotelero`
5. Vercel detecta automáticamente que es Next.js

### 3.2 Configurar variables de entorno en Vercel

En Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL         = https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    = eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY        = eyJhbGci...
NEXT_PUBLIC_APP_URL              = https://tu-dominio.com
NEXT_PUBLIC_APP_NAME             = SControl
```

> ⚠️ IMPORTANTE: `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en Server Actions y API Routes, nunca en el cliente.

### 3.3 Desplegar

```bash
# Opción A: Despliegue automático desde GitHub
# Cada push a la rama main activa un despliegue automático en Vercel

# Opción B: Despliegue manual desde terminal
npm install -g vercel
vercel --prod
```

### 3.4 Verificar el despliegue

```bash
# Vercel proporciona una URL como:
# https://saas-hotelero.vercel.app

# Probar:
# 1. Abrir la URL en el navegador
# 2. Iniciar sesión con el Super Admin
# 3. Crear un hotel de prueba
# 4. Hacer un check-in completo
```

---

## 4. Configurar Dominio Personalizado

### 4.1 Comprar dominio

Opciones recomendadas:
- **NIC Perú** (dominio .pe): https://www.nic.pe — S/. 80-120/año
- **Namecheap** (.com): USD 10-15/año
- **Porkbun** (.com): USD 8-12/año

Ejemplo de dominio: `hotelgest.pe` o `gestionhotel.com`

### 4.2 Conectar dominio en Vercel

1. Vercel → tu proyecto → Settings → Domains
2. Agregar tu dominio: `hotelgest.pe`
3. Vercel proporciona registros DNS para configurar
4. En tu proveedor de dominio, agregar:
   ```
   Tipo: A     Nombre: @     Valor: 76.76.21.21
   Tipo: CNAME Nombre: www   Valor: cname.vercel-dns.com
   ```
5. Esperar hasta 48 horas para propagación

### 4.3 HTTPS automático

Vercel configura HTTPS automáticamente con Let's Encrypt. No requiere configuración adicional.

---

## 5. Configurar Email Transaccional

Supabase necesita un servidor SMTP en producción para enviar emails de:
- Confirmación de registro
- Recuperación de contraseña
- Invitaciones de usuario

### Opción gratuita: Resend

```
1. Crear cuenta en https://resend.com (100 emails/día gratis)
2. Verificar tu dominio
3. Obtener API Key
```

En Supabase → Settings → Auth → SMTP Settings:

```
Host:     smtp.resend.com
Port:     465
Username: resend
Password: re_xxxxxxxx (tu API key de Resend)
Sender:   noreply@hotelgest.pe
```

---

## 6. Script de Datos Iniciales (Seed)

Al lanzar con el primer cliente, ejecutar en SQL Editor:

```sql
-- 1. Crear el Super Admin (reemplazar con UUID real de auth.users)
INSERT INTO profiles (id, hotel_id, full_name, email, role)
VALUES (
  'UUID-SUPER-ADMIN',
  NULL,
  'Administrador SaaS',
  'admin@hotelgest.pe',
  'super_admin'
) ON CONFLICT (id) DO NOTHING;

-- 2. Crear el primer hotel de prueba
INSERT INTO hotels (id, name, city, plan, status)
VALUES (
  gen_random_uuid(),
  'Hotel Demo Junín',
  'Huancayo',
  'standard',
  'active'
);

-- 3. Verificar que todo está bien
SELECT h.name, p.full_name, p.role
FROM profiles p
LEFT JOIN hotels h ON p.hotel_id = h.id;
```

---

## 7. Monitoreo en Producción

### 7.1 Vercel Analytics

Activar en Vercel → Analytics:
- Páginas más visitadas
- Tiempo de carga
- Errores de servidor

### 7.2 Supabase Logs

En Supabase → Logs:
- **API logs:** queries fallidas
- **Auth logs:** intentos de login
- **Database logs:** errores de BD

### 7.3 Configurar alertas de email

En Supabase → Settings → Alerts:
- Alerta si la BD supera el 80% del límite gratuito
- Alerta por errores frecuentes

---

## 8. Pipeline de CI/CD

Con GitHub + Vercel ya tienes CI/CD automático:

```
Desarrollador hace push a GitHub
          │
          ▼
GitHub Actions ejecuta:
  - npm run build (verificar que compila)
  - npm run test  (tests automáticos)
          │
          ▼ (si pasa)
Vercel despliega automáticamente
          │
          ▼
Producción actualizada en ~2 minutos
```

### `github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

---

## 9. URL Final del Sistema

Después del despliegue, los usuarios acceden así:

| Usuario | URL |
|---------|-----|
| Super Admin | `https://hotelgest.pe/login` → `/admin/dashboard` |
| Admin Hotel | `https://hotelgest.pe/login` → `/hotel/dashboard` |
| Recepcionista | `https://hotelgest.pe/login` → `/recepcion/dashboard` |

---

## ✅ Checklist de esta Etapa

- [x] `npm run build` sin errores
- [x] Supabase con RLS verificado en producción
- [x] Variables de entorno configuradas en Vercel
- [x] Proyecto desplegado en Vercel
- [x] URL de producción funcional
- [ ] Login probado en producción con los 3 roles
- [ ] Email transaccional configurado (SMTP)
- [ ] Dominio personalizado conectado (opcional)
- [x] HTTPS activo
- [ ] Primer hotel real onboardeado
- [x] CI/CD configurado en GitHub

---

**Siguiente etapa:** [ETAPA 10 — Post-Lanzamiento y Mantenimiento](./ETAPA-10-Post-Lanzamiento.md)
