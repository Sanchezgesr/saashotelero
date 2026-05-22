# ETAPA 10 — POST-LANZAMIENTO Y MANTENIMIENTO

> El sistema está en producción. Ahora el trabajo es crecer, mejorar y mantenerlo funcionando.

---

## 1. Plan de Lanzamiento Progresivo

### Fase 1: Beta privada (Mes 1-2)

- **3 hoteles piloto** de confianza (familiares, conocidos)
- Soporte por WhatsApp directo
- Precio simbólico o gratis a cambio de feedback
- Objetivo: encontrar bugs reales y ajustar UX

### Fase 2: Lanzamiento en Junín (Mes 3-4)

- Visitar hospedajes en Huancayo, Tarma, La Merced
- Demostración en vivo de 15 minutos
- Ofrecer mes gratis de prueba
- Objetivo: 10-15 clientes pagando

### Fase 3: Escalamiento (Mes 5+)

- WhatsApp Business con catálogo
- Landing page con precios
- Google My Business
- Referencias de clientes existentes

---

## 2. Onboarding de Nuevos Hoteles

### Proceso estándar de incorporación

```
Día 1: Crear hotel en el sistema (Super Admin)
         │
         ▼
Día 1: Crear cuenta del Admin del Hotel
         │
         ▼
Día 1: Llamada de 30 min para configuración inicial:
       - Cargar habitaciones
       - Personalizar precios
       - Subir logo
         │
         ▼
Día 2-3: Capacitación del recepcionista (1 hora)
         - Check-in, check-out
         - Registro de clientes
         - Caja básica
         │
         ▼
Día 7:  Seguimiento: ¿Cómo va todo?
         │
         ▼
Día 30: Revisar uso y ofrecer mejoras
```

### Material de capacitación

Crear los siguientes recursos:

- [ ] Video tutorial de check-in (5 minutos en YouTube)
- [ ] Video tutorial de check-out (3 minutos)
- [ ] Manual PDF simple (10 páginas con capturas)
- [ ] Grupo de WhatsApp para soporte

---

## 3. Soporte al Cliente

### Canales de soporte

| Canal | Tiempo de respuesta | Horario |
|-------|--------------------|---------| 
| WhatsApp | < 2 horas | Lun-Sáb 8am-8pm |
| Email | < 24 horas | Lunes-Viernes |
| Llamada telefónica | Por cita | Lun-Vie 9am-6pm |

### Problemas frecuentes y soluciones

| Problema | Solución |
|----------|----------|
| No puedo iniciar sesión | Verificar email, usar "Olvidé mi contraseña" |
| Habitación sigue ocupada tras checkout | Cambiar estado manualmente en Habitaciones |
| No aparece el cliente al buscar por DNI | Registrarlo como nuevo cliente |
| La caja no cuadra | Revisar movimientos del día en detalle |
| No carga el sistema | Verificar conexión a internet |

---

## 4. Mantenimiento Técnico

### Tareas semanales

- [ ] Revisar logs de errores en Vercel
- [ ] Revisar logs de Supabase (errores de BD)
- [ ] Verificar uso del plan gratuito de Supabase
- [ ] Responder tickets de soporte pendientes

### Tareas mensuales

- [ ] Revisar métricas del SaaS (MRR, hoteles activos, churn)
- [ ] Hacer backup manual de la BD
- [ ] Actualizar dependencias con `npm update`
- [ ] Revisar si Supabase/Vercel actualizaron sus planes
- [ ] Enviar resumen mensual a clientes (ingresos del mes)

### Actualizar dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar de forma segura
npm update

# Actualizaciones mayores (revisar breaking changes)
npx npm-check-updates -u
npm install
npm run build  # verificar que no haya errores
npm run test
```

---

## 5. Roadmap de Nuevas Funcionalidades

Organizar por prioridad según feedback de clientes:

### V1.1 — Mejoras rápidas (Mes 2-3)

- [ ] Exportar reportes a Excel/PDF
- [ ] WhatsApp de confirmación de reserva
- [ ] Búsqueda de reservas por fecha
- [ ] Imprimir comprobante de pago

### V1.2 — Funcionalidades adicionales (Mes 4-6)

- [ ] Módulo de consumo adicional (minibar, restaurante)
- [ ] Calendario de disponibilidad mejorado
- [ ] Estadísticas de ocupación por tipo de habitación
- [ ] Integración con Yape/Plin API (notificación automática de pago)

### V2.0 — Crecimiento (Mes 7-12)

- [ ] App móvil nativa (React Native)
- [ ] Reservas en línea desde página web del hotel
- [ ] Portal de pago en línea
- [ ] Módulo de housekeeping (ama de llaves)
- [ ] Multi-sede (un mismo dueño con varios hoteles)

---

## 6. Métricas del Negocio a Monitorear

### Dashboard del Super Admin — KPIs mensuales

| Métrica | Cómo medirla | Objetivo M6 |
|---------|-------------|-------------|
| MRR | Suma de planes activos | S/. 2,000 |
| Hoteles activos | Count de `status='active'` | 25 |
| Churn rate | Hoteles cancelados / total activos | < 5% |
| NPS | Encuesta mensual a clientes | > 50 |
| Tiempo promedio de onboarding | Registro → primer check-in | < 2 días |

### Alertas tempranas de churn

Detectar hoteles en riesgo de cancelar:

```typescript
// Hotel sin actividad en 7 días → riesgo de churn
const { data: inactiveHotels } = await supabase
  .from('checkins')
  .select('hotel_id')
  .lt('created_at', sevenDaysAgo)
  .is('hotel_id', 'not.null')

// Contactar proactivamente a estos hoteles
```

---

## 7. Estrategia de Precios y Crecimiento

### Ajustar precios según tracción

| Clientes activos | Acción |
|-----------------|--------|
| 0-5 | Precio piloto: S/. 49/mes todos los planes |
| 5-15 | Activar precios normales (Básico/Estándar/Premium) |
| 15-30 | Considerar plan Enterprise para cadenas |
| 30+ | Evaluar contratar soporte a tiempo parcial |

### Incentivos de crecimiento

- **Referido:** 1 mes gratis por cada hotel referido
- **Pago anual:** 2 meses gratis (equivale a 17% descuento)
- **Piloto gratuito:** 14 días sin tarjeta de crédito

---

## 8. Documentación Viva del Proyecto

Mantener actualizado en GitHub:

```
docs/
  ├── README.md              ← descripción general
  ├── CHANGELOG.md           ← historial de versiones
  ├── DEPLOYMENT.md          ← cómo desplegar
  └── api/                   ← documentación de funciones
```

### `CHANGELOG.md` — Ejemplo

```markdown
## [1.1.0] - 2026-08-01
### Agregado
- Exportar reportes a PDF
- Búsqueda de reservas por fecha

### Corregido
- Error en cálculo de noches en checkout nocturno
- Logo del hotel no se mostraba en el dashboard

## [1.0.0] - 2026-06-15
### Lanzamiento inicial
- Módulos de Super Admin, Admin Hotel y Recepcionista
- Check-in y check-out
- Gestión de caja
- Reportes básicos
```

---

## 9. Escalabilidad

Si el sistema crece a más de 100 hoteles simultáneos:

| Componente | Acción |
|-----------|--------|
| Supabase | Actualizar a plan Pro (USD 25/mes) |
| Vercel | El plan gratuito soporta hasta ~100k visitas/mes |
| BD | Agregar más índices, revisar queries lentas |
| Caché | Implementar `React Query` o `SWR` para caché en cliente |

---

## ✅ Checklist Final del Proyecto

### Sistema completo y funcional

- [ ] Etapa 0: Validación con clientes reales ✅
- [ ] Etapa 1: Planificación completa ✅
- [ ] Etapa 2: Base de datos diseñada y ejecutada ✅
- [ ] Etapa 3: Entorno de desarrollo configurado ✅
- [ ] Etapa 4: Autenticación y multi-tenant funcionando ✅
- [ ] Etapa 5: Panel del Super Admin completo ✅
- [ ] Etapa 6: Panel del Admin del Hotel completo ✅
- [ ] Etapa 7: Panel del Recepcionista completo ✅
- [ ] Etapa 8: Testing pasado sin errores críticos ✅
- [ ] Etapa 9: Sistema desplegado en producción ✅
- [ ] Etapa 10: Primer cliente real usando el sistema ✅

---

## 🎯 Definición de "Listo para Producción"

El sistema está listo cuando:

1. ✅ Los 3 roles pueden iniciar sesión sin problemas
2. ✅ Se puede completar un check-in y check-out real
3. ✅ La caja registra pagos correctamente
4. ✅ Un hotel no puede ver datos de otro hotel
5. ✅ El sistema funciona desde celular sin errores
6. ✅ Al menos 1 hospedaje real lo usó por 3 días consecutivos
7. ✅ El dueño del hospedaje dijo "sí lo usaría"

---

*Documentación generada para el SaaS Hotelero — Junín, Perú*
*Stack: Next.js + TypeScript + Tailwind CSS + Supabase + Vercel*
