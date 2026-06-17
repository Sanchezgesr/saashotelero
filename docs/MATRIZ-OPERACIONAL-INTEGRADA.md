# MATRIZ DE OPERACIONALIZACIÓN DE VARIABLES — VERSIÓN INTEGRADA

## Resumen de Variables

```
VARIABLE INDEPENDIENTE (VI):
  Sistema Web SaaS Multi-Tenant para Gestión de Hospedajes

VARIABLES DEPENDIENTES (VD):
  VD1: Eficiencia Operativa (procesos más rápidos, menos errores)
  VD2: Usabilidad (fácil de usar)
  VD3: Aceptación Comercial (hospedajes pagan y se quedan)

VARIABLES INTERVINIENTES:
  - Capacitación del Usuario
  - Tamaño del Hospedaje
  - Experiencia Digital Previa
```

---

## MATRIZ DETALLADA POR VARIABLE

### VARIABLE INDEPENDIENTE (VI)

**Nombre:** Sistema Web SaaS Multi-Tenant para Gestión de Hospedajes

**Definición Conceptual:** 
Modelo de software alojado en la nube que permite centralizar y automatizar los procesos operativos de hospedajes bajo una arquitectura multi-tenant, garantizando aislamiento de datos, seguridad y escalabilidad.

**Definición Operacional:** 
Se evaluará mediante: (1) el nivel de funcionalidad implementada, (2) la arquitectura multi-tenant validada con Row Level Security, (3) la percepción de usabilidad, (4) los indicadores de confiabilidad técnica.

---

#### Dimensión 1: ADECUACIÓN FUNCIONAL

| Indicador | Definición | Métrica | Escala | Meta | Técnica | Instrumento |
|-----------|-----------|---------|--------|------|---------|-----------|
| Cumplimiento de Funcionalidades | % de funcionalidades requeridas implementadas y operativas | % (0-100%) | 0-100% | ≥95% | Análisis técnico | Matriz de Casos de Prueba (Testing) |
| Casos de Prueba Aprobados | % de casos de prueba funcional que pasan satisfactoriamente | % (0-100%) | 0-100% | ≥98% | Pruebas automatizadas | Reporte de Ejecución de Tests |
| Tiempo de Respuesta | Tiempo promedio para completar operaciones críticas | Segundos | 0-10s | <3 segundos | Monitoreo técnico | Log de Performance |

---

#### Dimensión 2: ARQUITECTURA MULTI-TENANT Y SEGURIDAD

| Indicador | Definición | Métrica | Escala | Meta | Técnica | Instrumento |
|-----------|-----------|---------|--------|------|---------|-----------|
| Aislamiento de Datos (RLS) | Validación de que RLS funciona: usuarios solo ven sus datos | Brechas detectadas | 0-10 brechas | 0 brechas | Penetration testing | Reporte de Auditoría de Seguridad |
| Cumplimiento OWASP Top 10 | % de controles de seguridad OWASP implementados | % (0-100%) | 0-100% | ≥90% | Análisis de código | Checklist OWASP |
| Disponibilidad del Sistema | % de tiempo que el sistema está operativo | % (0-100%) | 0-100% | ≥99.5% | Monitoreo automático | Dashboard de Uptime |

---

#### Dimensión 3: USABILIDAD INICIAL

| Indicador | Definición | Métrica | Escala | Meta | Técnica | Instrumento |
|-----------|-----------|---------|--------|------|---------|-----------|
| Claridad de Interfaz | % usuarios que entienden la función de botones sin ayuda | % (0-100%) | 0-100% | >90% | Observación + preguntas | Ficha de Observación |
| Accesibilidad Móvil | Rendimiento en dispositivos móviles (responsivo) | Score 0-100 | 0-100 | ≥80 | Herramienta Google Lighthouse | Reporte Lighthouse |

---

### VARIABLE DEPENDIENTE 1 (VD1): EFICIENCIA OPERATIVA

**Nombre:** Eficiencia Operativa de los Hospedajes

**Definición Conceptual:** 
Grado en que los procesos operativos del hospedaje (reservas, check-in/out, caja) se ejecutan con menor tiempo, menor esfuerzo y menor cantidad de errores respecto a gestión manual.

**Definición Operacional:** 
Se medirá mediante comparación antes/después: (1) tiempos de ejecución de procesos críticos, (2) frecuencia de incidencias operativas, (3) recuperación de dinero perdido, (4) ocupación de habitaciones optimizada.

---

#### Dimensión 1: GESTIÓN DE RECEPCIÓN

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **Tiempo Check-in** | Minutos desde llegada cliente hasta asignación habitación | 15-30 min | <5 min | Minutos | Observación + cronómetro | Ficha de Registro de Tiempos |
| **Tiempo Check-out** | Minutos desde solicitud hasta liberación de habitación | 10-20 min | <10 min | Minutos | Observación + cronómetro | Ficha de Registro de Tiempos |
| **Satisfacción Recepción** | % clientes satisfechos con proceso check-in/out | N/A | >85% | % | Encuesta breve (1 pregunta) | Cuestionario de Satisfacción |
| **Errores en Asignación** | Errores en asignación de habitación por mes | 2-4 errores | <1 error | Conteo | Registro del sistema | Auditoría de Asignaciones |

---

#### Dimensión 2: GESTIÓN DE RESERVAS

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **Incidencias Overbooking** | Número de dobles reservas o conflictos por mes | 2-8 casos/mes | <1 caso/mes | Casos/mes | Análisis documental | Registro de Incidencias |
| **Reservas Correctas** | % de reservas registradas sin error | 70-80% | >95% | % | Análisis documental | Reporte del Sistema |
| **Tiempo Registro Reserva** | Minutos para registrar una nueva reserva (teléfono) | 5-15 min | <3 min | Minutos | Observación | Ficha de Observación |
| **Disponibilidad Visible** | Tiempo para consultar habitaciones disponibles | 3-10 min | <1 min | Minutos | Observación | Cronómetro |

---

#### Dimensión 3: CONTROL DE CAJA

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **Descuadres de Caja** | Discrepancia dinero físico vs. registro | S/. 200-500/mes | <S/. 50/mes | Soles | Auditoría diaria | Acta de Cierre de Caja |
| **Tiempo Cierre Caja** | Minutos empleados en cerrar caja diaria | 30-60 min | <15 min | Minutos | Observación | Ficha de Observación |
| **% Dinero Recuperado** | Ingresos recuperados vs. pérdidas estimadas | 0% (manual) | >90% | % | Auditoría comparativa | Análisis Financiero Antes/Después |
| **Precisión Registros** | % operaciones de caja registradas correctamente | 70-85% | >99% | % | Auditoría | Reporte de Precisión |

---

#### Dimensión 4: OCUPACIÓN DE HABITACIONES

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **Habitaciones Recuperadas** | % habitaciones que antes estaban "perdidas" por error | 3-8% | >5% | % | Análisis ocupación | Comparativo mes 0 vs mes 3 |
| **Tasa Ocupación Mejorada** | Aumento en ocupación real vs. mes anterior | Línea base | +5-10% | % | Análisis datos | Dashboard Sistema |

---

### VARIABLE DEPENDIENTE 2 (VD2): USABILIDAD

**Nombre:** Usabilidad del Sistema

**Definición Conceptual:** 
Facilidad con la que usuarios sin formación técnica pueden aprender, entender y usar el sistema efectivamente en sus operaciones diarias.

**Definición Operacional:** 
Se medirá mediante: (1) puntuación SUS (System Usability Scale), (2) tiempo de aprendizaje observado, (3) % de tareas completadas sin ayuda, (4) satisfacción percibida, (5) comentarios positivos espontáneos.

---

#### Dimensión 1: FACILIDAD PERCIBIDA

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **Puntuación SUS** | Encuesta estándar de 10 preguntas sobre usabilidad | N/A | ≥80 puntos | Puntos 0-100 | Encuesta | Cuestionario SUS |
| **Claridad Interfaz** | % usuarios que entienden función de elementos sin ayuda | N/A | >90% | % | Observación + preguntas | Ficha de Observación |
| **Confianza de Uso** | Sensación de confianza al operar el sistema | N/A | ≥4/5 | Escala 1-5 | Encuesta | Pregunta Likert |
| **Lenguaje Comprensible** | % de términos que usuarios entienden sin explicación | N/A | >95% | % | Observación | Anotaciones de Uso |

---

#### Dimensión 2: VELOCIDAD DE APRENDIZAJE

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **Tiempo Aprendizaje Total** | Horas para dominar operaciones básicas (5 tareas) | N/A | <2 horas | Horas | Observación | Ficha de Aprendizaje |
| **Tareas Sin Ayuda** | % tareas completadas sin pedir asistencia | N/A | >80% | % | Observación | Registro de Ayuda |
| **Errores por Tarea** | Promedio de acciones innecesarias por tarea | N/A | <5 errores | Conteo | Grabación pantalla | Video + Análisis |
| **Curva de Aprendizaje** | Mejora de tiempo/errores entre día 1 y día 7 | N/A | >50% mejora | % | Observación | Comparativo tiempos |

---

#### Dimensión 3: SATISFACCIÓN Y SENTIMIENTO

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **NPS (Net Promoter Score)** | % Promotores (9-10) - % Detractores (0-6) | N/A | >50 | Score -100 a +100 | Encuesta | Pregunta NPS |
| **Comentarios Positivos** | % comentarios positivos espontáneos | N/A | >60% | % | Entrevista abierta | Anotaciones |
| **Recomendación a Otros** | % usuarios que recomendarían el sistema | N/A | >70% | % | Encuesta | Pregunta Likert |

---

### VARIABLE DEPENDIENTE 3 (VD3): ACEPTACIÓN COMERCIAL

**Nombre:** Aceptación Comercial del Modelo SaaS

**Definición Conceptual:** 
Disposición del mercado objetivo (hospedajes de Junín) a adoptar, pagar una suscripción y mantener el uso del sistema SaaS.

**Definición Operacional:** 
Se medirá mediante: (1) tasa de conversión inicial, (2) hospedajes activos por mes, (3) churn rate, (4) ingresos recurrentes (MRR), (5) aceptación de precios propuestos.

---

#### Dimensión 1: ADOPCIÓN INICIAL

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **Tasa Conversión** | % hospedajes contactados que completan primer pago | 0% | >15% | % | Análisis datos | Dashboard Sistema |
| **Hospedajes Activos Mes 3** | Número de hospedajes con suscripción activa en mes 3 | 0 | 15-20 | Cantidad | Conteo automático | BD Sistema |
| **Hospedajes Activos Mes 6** | Número de hospedajes con suscripción activa en mes 6 | 0 | 30+ | Cantidad | Conteo automático | BD Sistema |
| **Plan Elegido (distribución)** | % de clientes en cada plan (Básico, Estándar, Premium) | N/A | >40% Estándar+ | % | Análisis datos | Query BD |

---

#### Dimensión 2: RETENCIÓN

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **Monthly Churn Rate** | % clientes que cancelan por mes | N/A | <5% | % | Análisis histórico | BD Sistema |
| **Tiempo Retención Promedio** | Meses promedio que cliente mantiene suscripción | 0 meses | ≥12 meses | Meses | Análisis histórico | Base de Datos |
| **Tasa de Upgrade** | % clientes que cambian a plan superior | N/A | >10% | % | Análisis histórico | Query BD |

---

#### Dimensión 3: VIABILIDAD ECONÓMICA

| Indicador | Definición | Línea Base | Meta | Métrica | Técnica | Instrumento |
|-----------|-----------|-----------|------|---------|---------|-----------|
| **MRR Mes 3** | Ingresos recurrentes en mes 3 | S/. 0 | S/. 1,500-2,000 | Soles | Cálculo automático | Dashboard Billing |
| **MRR Mes 6** | Ingresos recurrentes en mes 6 | S/. 0 | S/. 3,000-4,000 | Soles | Cálculo automático | Dashboard Billing |
| **Aceptación de Precio** | % hospedajes que aceptan precio propuesto sin objeción | N/A | >70% | % | Entrevista/Contacto | Registro de Contactos |
| **CAC (Customer Acquisition Cost)** | Dinero gastado para adquirir 1 cliente | N/A | <S/. 100/cliente | Soles | Cálculo: Gasto/Clientes | Análisis Financiero |

---

### VARIABLE INTERVINIENTE: CAPACITACIÓN DEL USUARIO

**Nombre:** Capacitación del Usuario

**Definición Conceptual:** 
Nivel de conocimientos y habilidades que posee el usuario para utilizar correctamente el sistema, adquiridas mediante capacitación formal o auto-aprendizaje.

**Definición Operacional:** 
Se medirá mediante: (1) horas de capacitación recibidas, (2) nivel de dominio autodeclarado, (3) relación entre capacitación y desempeño.

---

#### Dimensión 1: FORMACIÓN TECNOLÓGICA

| Indicador | Definición | Métrica | Técnica | Instrumento |
|-----------|-----------|---------|---------|-----------|
| **Horas Capacitación** | Total de horas de capacitación recibidas | Horas | Registro documental | Acta de Asistencia |
| **Modalidad Capacitación** | Tipo de capacitación (presencial, online, autodidacta) | Categoría | Encuesta | Registro de Modalidad |
| **Completitud de Capacitación** | % módulos cubiertos en la capacitación | % | Observación | Checklist de Temas |

---

#### Dimensión 2: COMPETENCIA DIGITAL

| Indicador | Definición | Métrica | Técnica | Instrumento |
|-----------|-----------|---------|---------|-----------|
| **Experiencia Previa** | Años usando sistemas informáticos | Años | Encuesta | Cuestionario |
| **Nivel Dominio Sistema** | Autoevaluación de dominio del sistema SaaS | Escala 1-5 | Encuesta | Likert 1-5 |
| **Relación Cap-Desempeño** | Correlación entre horas capacitación y eficiencia operativa | Pearson r | Análisis correlación | Gráfico Dispersión |

---

### VARIABLES MODERADORAS/CONFUSORAS (Control)

Para asegurar que cambios en VD se deben a VI y no a otros factores:

| Variable | Definición | Cómo Controlar |
|----------|-----------|----------------|
| **Tamaño Hospedaje** | Número de habitaciones | Estratificar muestra (pequeños, medianos) |
| **Edad del Usuario** | Años | Registrar, comparar grupos |
| **Experiencia Digital Previa** | Años usando sistemas | Medirla en línea base, agrupar similares |
| **Ambiente de Implementación** | Presencia de apoyo durante transición | Documentar y mantener consistente |

---

## CRONOGRAMA DE MEDICIONES

### Cuándo Medir Cada Variable

```
LÍNEA BASE (Mes 0 — ANTES de implementar):
  ✓ VD1 (Eficiencia): Check-in/out, reservas, caja
  ✓ Variables intervinientes: Capacitación, experiencia previa
  ✓ VI: Evaluar estado actual (0% porque no está implementado)

MES 1-2 (Implementación):
  ✓ VI: Verificar que funcionalidades se cumplen
  ✓ VD2 (Usabilidad): Pruebas de usuario (20 personas)

MES 3 (POST-IMPLEMENTACIÓN):
  ✓ VD1 (Eficiencia): Análisis completo vs línea base
  ✓ VD2 (Usabilidad): Encuesta SUS, NPS
  ✓ VD3 (Aceptación): Primeros datos de conversión, MRR

MES 6:
  ✓ VD1: Análisis de 6 meses de operación
  ✓ VD3 (Aceptación): Evaluación MRR, churn, LTV
  ✓ VI: Auditoría de seguridad completa

MES 12:
  ✓ Análisis final de todas las variables
```

---

## TABLA RESUMEN: TODOS LOS INDICADORES

| Variable | Dimensión | Indicador | Meta | Instrumento |
|----------|-----------|-----------|------|-----------|
| **VI: Sistema SaaS** | Funcionalidad | Cumplimiento (%) | ≥95% | Testing |
| | | Casos Prueba Aprobados (%) | ≥98% | Test Report |
| | Seguridad | Aislamiento RLS (brechas) | 0 | Penetration Test |
| | | OWASP Compliance (%) | ≥90% | Security Audit |
| | Usabilidad | Claridad UI (%) | >90% | Observación |
| **VD1: Eficiencia** | Recepción | Tiempo Check-in (min) | <5 | Cronómetro |
| | | Tiempo Check-out (min) | <10 | Cronómetro |
| | Reservas | Overbooking (casos/mes) | <1 | Audit |
| | | Reservas Correctas (%) | >95% | System Report |
| | Caja | Descuadres (S/.) | <S/.50 | Cash Audit |
| | | Dinero Recuperado (%) | >90% | Financial Analysis |
| **VD2: Usabilidad** | Facilidad | SUS Score | ≥80 | SUS Survey |
| | Aprendizaje | Tiempo Aprendizaje (h) | <2 | Observation |
| | Satisfacción | NPS Score | >50 | NPS Survey |
| **VD3: Aceptación** | Adopción | Conversión (%) | >15% | System Data |
| | Retención | Churn Rate (%) | <5% | Billing Data |
| | Rentabilidad | MRR Mes 6 (S/.) | >S/.3,000 | Financial Report |
| **Interviniente: Capacitación** | Formación | Horas Capacitación | Documentado | Attendance |
| | Competencia | Dominio (1-5) | ≥4.0 | Survey |

---

## OBSERVACIONES FINALES

### ✅ Fortalezas de esta Matriz Integrada:
1. **Operacional y Técnica:** Combina lo práctico (tiempos, errores) con lo técnico (RLS, OWASP)
2. **Completa:** Cubre VI, VD1, VD2, VD3 + intervinientes
3. **Realista:** Metas alcanzables pero desafiantes
4. **Medible:** Cada indicador tiene instrumento específico
5. **Cronología Clara:** Sabe cuándo medir qué

### ⚠️ Puntos a Validar:
- **¿Tienes acceso a datos de hospedajes para línea base?** (Needed para comparación antes/después)
- **¿Puedes hacer penetration testing?** (Recommended, could hire external)
- **¿Tienes presupuesto para encuestas SUS con 20-30 usuarios?** (Critical)
- **¿Cómo medirás "dinero recuperado"?** (Ej: entrevista a dueño, auditoría de registros)

---

**Esta matriz es tu guía operativa para la tesis. Úsala como referencia mientras recolectas datos.**
