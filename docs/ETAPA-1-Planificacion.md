# ETAPA 1 — PLANIFICACIÓN DEL SISTEMA

---

## 1. Problema que Resuelve

Hospedajes en la región Junín gestionan su negocio manualmente:

- Reservas en cuadernos
- Sin control de habitaciones en tiempo real
- Sin control de caja diaria
- Sin historial de clientes
- Sin acceso remoto desde el celular

**El SaaS resuelve:** gestión de habitaciones, reservas, check-in/check-out, caja, clientes y reportes.

---

## 2. Arquitectura Multi-Tenant

El sistema es **multi-hotel**: una sola plataforma, múltiples clientes aislados.

```
Plataforma SaaS
   │
   ├── Hotel A (sus datos, sus usuarios)
   ├── Hotel B (sus datos, sus usuarios)
   └── Hotel C (sus datos, sus usuarios)
```

Cada hotel tiene su propio login y **no puede ver datos de otros hoteles**.

---

## 3. Roles del Sistema

### 1️⃣ Super Admin (dueño del SaaS)
Control total de la plataforma:
- Gestionar hoteles (crear, suspender, eliminar)
- Ver ingresos y métricas del SaaS
- Gestionar suscripciones y planes
- Auditoría del sistema

### 2️⃣ Admin del Hotel
Controla su hospedaje:
- Habitaciones y precios
- Reservas
- Empleados (recepcionistas)
- Caja y reportes

### 3️⃣ Recepcionista
Operación diaria:
- Check-in y check-out
- Registro de huéspedes
- Cobros básicos

---

## 4. Módulos por Rol

### Super Admin
| Módulo | Descripción |
|--------|-------------|
| Dashboard General | Total hoteles, activos, suspendidos, ingresos SaaS |
| Gestión de Hoteles | Crear, editar, suspender, eliminar hoteles |
| Gestión de Usuarios | Ver usuarios, resetear contraseñas, bloquear |
| Planes y Suscripciones | Administrar planes, pagos, vencimientos |
| Auditoría | Log de actividad del sistema |
| Métricas SaaS | MRR, churn rate, crecimiento mensual |

### Admin del Hotel
| Módulo | Descripción |
|--------|-------------|
| Dashboard Hotel | Habitaciones ocupadas/libres, ingresos del día |
| Habitaciones | Crear, editar, estados (disponible/ocupada/limpieza/mantenimiento) |
| Reservas | Crear, modificar, cancelar, calendario |
| Clientes | Registro, DNI, historial de estadías |
| Check-in / Check-out | Asignar habitación, registrar entrada/salida, cobrar |
| Caja | Ingresos, egresos, cierre de caja, balance |
| Usuarios del Hotel | Crear/editar recepcionistas |
| Reportes | Ingresos diarios/mensuales, ocupación, clientes frecuentes |
| Configuración | Nombre, dirección, logo del hotel |

### Recepcionista
| Módulo | Descripción |
|--------|-------------|
| Dashboard Operativo | Habitaciones libres, check-in/out del día |
| Check-in | Buscar/registrar cliente, asignar habitación |
| Check-out | Calcular total, registrar pago, liberar habitación |
| Clientes | Registrar y editar huéspedes |
| Habitaciones | Solo visualizar estados |
| Caja Básica | Registrar pago, cerrar caja |

---

## 5. Matriz de Permisos

| Acción | Super Admin | Admin Hotel | Recepcionista |
|--------|:-----------:|:-----------:|:-------------:|
| Crear hoteles | ✅ | ❌ | ❌ |
| Suspender hoteles | ✅ | ❌ | ❌ |
| Ver métricas SaaS | ✅ | ❌ | ❌ |
| Gestionar habitaciones | ❌ | ✅ | ❌ |
| Gestionar reservas | ❌ | ✅ | ❌ |
| Check-in | ❌ | ✅ | ✅ |
| Check-out | ❌ | ✅ | ✅ |
| Ver reportes | ❌ | ✅ | ❌ |
| Gestionar usuarios del hotel | ❌ | ✅ | ❌ |
| Registrar clientes | ❌ | ✅ | ✅ |
| Caja completa | ❌ | ✅ | ❌ |
| Caja básica | ❌ | ✅ | ✅ |

---

## 6. Stack Tecnológico Definido

```
Frontend     → Next.js 14 + TypeScript + Tailwind CSS
UI Components→ shadcn/ui
Backend      → Supabase
Base de datos→ PostgreSQL (Supabase)
Auth         → Supabase Auth (JWT)
Seguridad    → Row Level Security (RLS)
Storage      → Supabase Storage (logos, imágenes)
Hosting FE   → Vercel
Hosting BE   → Supabase Cloud
Control      → GitHub
```

---

## ✅ Entregables de esta Etapa

- [x] Problema definido
- [x] Arquitectura multi-tenant definida
- [x] Roles del sistema definidos
- [x] Módulos por rol definidos
- [x] Matriz de permisos definida
- [x] Stack tecnológico elegido

---

**Siguiente etapa:** [ETAPA 2 — Diseño de Base de Datos](./ETAPA-2-Disenio-Base-de-Datos.md)
