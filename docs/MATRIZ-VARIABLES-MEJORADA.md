# MATRIZ DE VARIABLES MEJORADA — SISTEMA SaaS HOTELERO

## Resumen Ejecutivo

Este documento presenta una **matriz operacional simplificada y mejorada** enfocada en **3 variables dependientes críticas** del proyecto de tesis. Estas variables capturan los aspectos más importantes para validar el éxito del sistema SaaS.

---

## Variables del Proyecto

### Variable Independiente (VI)
**Implementación del Sistema SaaS Multi-Tenant**
- Definición: Presencia o ausencia del sistema en el hospedaje
- Valores: Sí (implementado) / No (control)
- Tipo: Categórica Binaria

---

### Variables Dependientes (VD) — Las 3 Críticas

#### VD1: EFICIENCIA OPERATIVA
**Mejora en procesos y reducción de errores administrativos**

#### VD2: USABILIDAD
**Facilidad de uso para usuarios sin formación técnica**

#### VD3: ACEPTACIÓN COMERCIAL
**Disposición del mercado a adoptar y pagar por la solución**

---

## MATRIZ DE OPERACIONALIZACIÓN DETALLADA

### VD1: EFICIENCIA OPERATIVA

| Aspecto | Detalle |
|---------|---------|
| **Definición Conceptual** | Mejora en la velocidad, precisión y automatización de procesos operativos clave (reservas, check-in/out, caja) |
| **Definición Operacional** | Reducción cuantificable de errores, tiempo de proceso y pérdidas financieras comparando antes/después de implementar el sistema |

#### Dimensiones e Indicadores

| Dimensión | Indicador | Definición | Métrica | Escala | Meta | Instrumento |
|-----------|-----------|-----------|---------|--------|------|-----------|
| **Reducción de Errores** | Errores en Reservas | Número de dobles reservas o conflictos por mes | Errores/mes | 0-50 | Reducir a <1 error/mes | Auditoría de registros |
| | Errores en Caja | Discrepancias dinero cobrado vs. registrado | Soles/mes | 0-1000 | <50 soles/mes | Auditoría financiera |
| | Errores Administrativos | Inhabilitaciones no comunicadas, datos perdidos | Eventos/mes | 0-10 | <1 evento/mes | Registro del sistema |
| **Velocidad de Procesos** | Tiempo Check-in | Minutos para registrar entrada de huésped | Minutos | 5-30 | <5 minutos | Cronómetro/observación |
| | Tiempo Check-out | Minutos para procesar salida y pago | Minutos | 5-20 | <10 minutos | Cronómetro/observación |
| | Tiempo Reserva | Minutos para registrar nueva reserva | Minutos | 3-20 | <3 minutos | Cronómetro/observación |
| **Recuperación Financiera** | Dinero Recuperado | Ingresos que antes se perdían por errores | Soles/mes | 0-5000 | >90% recuperación | Auditoría caja |
| | Ocupación Optimizada | % Reducción de habitaciones vacías por error | Porcentaje | 0-100% | >5% | Datos de reservas |

#### Matriz de Operacionalización Completa VD1

```
EFICIENCIA OPERATIVA
├─ Dimensión 1: ERRORES OPERATIVOS
│  ├─ Indicador 1.1: Errores en Reservas
│  │  ├─ Definición: Cantidad de reservas conflictivas (doble booking, datos mal registrados)
│  │  ├─ Cálculo: Conteo manual/automático de conflictos por mes
│  │  ├─ Unidad: Errores/mes
│  │  ├─ Línea Base: 8-12 errores/mes (gestión manual)
│  │  ├─ Meta: <1 error/mes
│  │  ├─ Recolección: Sistema automático + auditoría manual quincenal
│  │  └─ Procedimiento: 
│  │     1. Exportar registro de reservas diarias
│  │     2. Identificar conflictos (fecha/habitación duplicada)
│  │     3. Documentar en planilla Excel
│  │
│  ├─ Indicador 1.2: Errores en Caja
│  │  ├─ Definición: Diferencia entre dinero cobrado (comprobante) y registrado (sistema)
│  │  ├─ Cálculo: |Dinero Registrado - Dinero Real| / Total Esperado × 100%
│  │  ├─ Unidad: Soles/mes o % de discrepancia
│  │  ├─ Línea Base: S/. 200-500/mes (gestión manual con cuaderno)
│  │  ├─ Meta: <S/. 50/mes o <2% discrepancia
│  │  ├─ Recolección: Cierre de caja diario en sistema + cotejo con caja física
│  │  └─ Procedimiento:
│  │     1. Registrar dinero en sistema al final del día
│  │     2. Contar dinero físico
│  │     3. Calcular discrepancia
│  │     4. Documentar en archivo auditoría
│  │
│  └─ Indicador 1.3: Errores Administrativos
│     ├─ Definición: Eventos no planeados (clientes llamando por problemas, datos perdidos)
│     ├─ Cálculo: Conteo de reportes/reclamaciones por mes
│     ├─ Unidad: Eventos/mes
│     ├─ Línea Base: 3-5 eventos/mes
│     ├─ Meta: <1 evento/mes
│     ├─ Recolección: Registro de comentarios, quejas, llamadas
│     └─ Procedimiento:
│        1. Crear registro diario de problemas reportados
│        2. Clasificar por tipo (reserva, dinero, habitación)
│        3. Contar eventos al mes
│
├─ Dimensión 2: VELOCIDAD DE PROCESOS
│  ├─ Indicador 2.1: Tiempo Check-in
│  │  ├─ Definición: Minutos desde que el cliente llega hasta que completa el check-in
│  │  ├─ Cálculo: Hora salida - Hora entrada (cronómetro)
│  │  ├─ Unidad: Minutos
│  │  ├─ Línea Base: 15-30 minutos (manual: buscar cuaderno, asignar, escribir)
│  │  ├─ Meta: <5 minutos
│  │  ├─ Recolección: Observación directa de 5 check-ins por día, 5 días
│  │  └─ Procedimiento:
│  │     1. Observador lleva cronómetro
│  │     2. Mide tiempo desde "cliente en mostrador" hasta "recibe llave"
│  │     3. Registra en hoja de observación
│  │     4. Calcula promedio de 25 observaciones
│  │
│  ├─ Indicador 2.2: Tiempo Check-out
│  │  ├─ Definición: Minutos para completar salida (cálculo, pago, cierre)
│  │  ├─ Cálculo: Hora salida - Hora inicio check-out
│  │  ├─ Unidad: Minutos
│  │  ├─ Línea Base: 10-20 minutos (manual: calcular, buscar dinero, registrar)
│  │  ├─ Meta: <10 minutos
│  │  ├─ Recolección: Observación directa de 5 check-outs por día, 5 días
│  │  └─ Procedimiento: Idéntica a Check-in
│  │
│  └─ Indicador 2.3: Tiempo Reserva
│     ├─ Definición: Minutos para registrar una nueva reserva (teléfono, libro)
│     ├─ Cálculo: Tiempo total desde llamada hasta confirmación
│     ├─ Unidad: Minutos
│     ├─ Línea Base: 5-15 minutos (manual: hablar, escribir, buscar disponibilidad)
│     ├─ Meta: <3 minutos
│     ├─ Recolección: Registro de duración de 10 llamadas nuevas
│     └─ Procedimiento:
│        1. Receptionist marca inicio/fin de llamada
│        2. Registra duración en planilla
│        3. Promedia de 50 reservas (2 semanas)
│
└─ Dimensión 3: RECUPERACIÓN FINANCIERA
   ├─ Indicador 3.1: Dinero Recuperado
   │  ├─ Definición: Ingresos recuperados por errores evitados (doble booking, caja faltante)
   │  ├─ Cálculo: (Dinero Antes - Dinero Después) + Habitaciones Recuperadas × Precio
   │  ├─ Unidad: Soles/mes
   │  ├─ Línea Base: S/. 300-500/mes perdidos (promedio hospedaje)
   │  ├─ Meta: Recuperar 90%+ = >S/. 270/mes
   │  ├─ Recolección: Auditoría financiera mes 0 vs mes 3
   │  └─ Procedimiento:
   │     1. Mes 0 (antes): Contar dinero en caja física mensual
   │     2. Entrevistar sobre "dinero desaparecido sin explicación"
   │     3. Estimar pérdidas por doble booking (clientes rechazados)
   │     4. Mes 3 (después): Repetir con sistema implementado
   │     5. Comparar diferencia
   │
   └─ Indicador 3.2: Ocupación Optimizada
      ├─ Definición: % Habitaciones que antes estaban vacías erróneamente
      ├─ Cálculo: (Habitaciones Recuperadas / Habitaciones Totales) × 100%
      ├─ Unidad: Porcentaje %
      ├─ Línea Base: 3-8% (habitaciones no disponibles por "error" en libros)
      ├─ Meta: >5% optimización
      ├─ Recolección: Análisis de ocupación mes 0 vs mes 3
      └─ Procedimiento:
         1. Revisar libro de registro de 30 días (mes 0)
         2. Contar habitaciones que se reportaron "ocupadas" pero estaban vacías
         3. Calcular porcentaje
         4. Repetir mes 3 con sistema
         5. Comparar
```

---

### VD2: USABILIDAD

| Aspecto | Detalle |
|---------|---------|
| **Definición Conceptual** | Grado de facilidad con el que usuarios sin formación técnica pueden aprender y usar el sistema efectivamente |
| **Definición Operacional** | Puntuación cuantificable mediante encuesta SUS (System Usability Scale) y tiempo de aprendizaje observado |

#### Dimensiones e Indicadores

| Dimensión | Indicador | Definición | Métrica | Escala | Meta | Instrumento |
|-----------|-----------|-----------|---------|--------|------|-----------|
| **Facilidad Percibida** | Puntuación SUS | Encuesta estándar de 10 preguntas sobre usabilidad | Puntos | 0-100 | ≥80 puntos | Encuesta SUS |
| | Claridad de Interfaz | % usuarios que entienden qué hace cada botón | Porcentaje | 0-100% | >90% | Observación/preguntas |
| | Confianza de Uso | Sensación de confianza al usar el sistema | Score 1-5 | 1-5 | ≥4.0 | Encuesta post-test |
| **Aprendizaje** | Tiempo Aprendizaje | Horas para aprender operaciones básicas | Horas | 0-10 | <2 horas | Observación |
| | Tarea Completada | % usuarios que completan tareas sin ayuda | Porcentaje | 0-100% | >80% | Observación directa |
| | Errores de Usuario | Cantidad de clics/acciones innecesarias | Conteo | 0-50 | <5 errores/tarea | Grabación pantalla |

#### Matriz de Operacionalización Completa VD2

```
USABILIDAD
├─ Dimensión 1: FACILIDAD PERCIBIDA
│  ├─ Indicador 1.1: Puntuación SUS (System Usability Scale)
│  │  ├─ Definición: Medida estándar internacional de usabilidad basada en 10 preguntas
│  │  ├─ Preguntas (escala 1-5 "Totalmente en desacuerdo" a "Totalmente de acuerdo"):
│  │  │  1. Creo que usaría este sistema frecuentemente
│  │  │  2. Encuentro el sistema innecesariamente complejo
│  │  │  3. El sistema es fácil de usar
│  │  │  4. Necesitaría soporte técnico para usar el sistema
│  │  │  5. Las funciones del sistema están bien integradas
│  │  │  6. Hay demasiada inconsistencia en el sistema
│  │  │  7. La mayoría de personas aprenderían a usar esto rápidamente
│  │  │  8. El sistema es muy engorroso de usar
│  │  │  9. Me siento confiado usando el sistema
│  │  │  10. Necesité aprender muchas cosas antes de usar el sistema
│  │  ├─ Cálculo: [(Q1-1) + (5-Q2) + (Q3-1) + (5-Q4) + (Q5-1) + (5-Q6) + (Q7-1) + (5-Q8) + (Q9-1) + (5-Q10)] × 2.5
│  │  ├─ Unidad: Puntos 0-100
│  │  ├─ Interpretación:
│  │  │  - <50: Crítico (rediseño urgente)
│  │  │  - 50-70: Aceptable (mejoras necesarias)
│  │  │  - 70-85: Bueno (funcional)
│  │  │  - >85: Excelente
│  │  ├─ Línea Base: No aplica (usuario nuevo)
│  │  ├─ Meta: ≥80 puntos
│  │  ├─ Muestra: 30 usuarios de hospedajes diferentes
│  │  ├─ Recolección: Encuesta digital (Google Forms) o papel después de 1 semana de uso
│  │  └─ Procedimiento:
│  │     1. Usuario firma consentimiento
│  │     2. Recibe capacitación breve (30 min) en el sistema
│  │     3. Usa sistema durante 7 días en su hospedaje
│  │     4. Completa encuesta SUS al día 7
│  │     5. Calcular score: Usar fórmula oficial SUS
│  │     6. Documentar por hospedaje y rol (admin, recepcionista)
│  │
│  ├─ Indicador 1.2: Claridad de Interfaz
│  │  ├─ Definición: % de usuarios que entienden la función de cada elemento de UI sin ayuda
│  │  ├─ Cálculo: (Usuarios que respondieron correctamente / Total usuarios) × 100%
│  │  ├─ Unidad: Porcentaje %
│  │  ├─ Línea Base: No aplica (usuario nuevo)
│  │  ├─ Meta: >90% claridad
│  │  ├─ Recolección: Observación + preguntas específicas
│  │  └─ Procedimiento:
│  │     1. Dar usuario el sistema (primer día)
│  │     2. Preguntar: "¿Qué hace este botón?" (señalar 5 botones aleatorios)
│  │     3. Registrar si respuesta es correcta
│  │     4. Calcular % correctas de 150 respuestas (30 usuarios × 5 preguntas)
│  │     5. Documentar botones problemáticos (<70% correcto)
│  │
│  └─ Indicador 1.3: Confianza de Uso
│     ├─ Definición: Sensación subjetiva de confianza al operar el sistema
│     ├─ Cálculo: Respuesta a pregunta: "¿Qué tan confiado te sientes usando este sistema?" (1-5)
│     ├─ Unidad: Escala Likert 1-5
│     ├─ Línea Base: No aplica
│     ├─ Meta: ≥4.0 (Bastante/Muy confiado)
│     ├─ Recolección: Pregunta en encuesta de usabilidad (post-test)
│     └─ Procedimiento:
│        1. Después de 1 semana, incluir en encuesta
│        2. "Marca tu nivel de confianza: 1 (Nada) a 5 (Muy confiado)"
│        3. Promediar respuesta de 30 usuarios
│        4. Meta: promedio ≥4.0
│
├─ Dimensión 2: VELOCIDAD DE APRENDIZAJE
│  ├─ Indicador 2.1: Tiempo de Aprendizaje
│  │  ├─ Definición: Horas necesarias para que un usuario nuevo domine operaciones básicas
│  │  ├─ Operaciones Básicas: Check-in, check-out, crear reserva, ver disponibilidad, registrar pago
│  │  ├─ Cálculo: Suma de horas desde primer uso hasta "sin errores en tarea"
│  │  ├─ Unidad: Horas
│  │  ├─ Línea Base: No aplica (usuario nuevo)
│  │  ├─ Meta: <2 horas (128 minutos)
│  │  ├─ Recolección: Observación directa + registro de tiempo
│  │  └─ Procedimiento:
│  │     1. Día 1: Dar capacitación estructurada (30 min sobre 5 operaciones básicas)
│  │     2. Día 1-3: Observador acompaña mientras usuario practica
│  │     3. Cronómetro registra tiempo desde inicio hasta "operación correcta sin ayuda"
│  │     4. Si usuario necesita ayuda, registrar: momento y tipo
│  │     5. Totalizar horas de "tiempo efectivo de aprendizaje"
│  │     6. Promediar de 10 usuarios
│  │
│  ├─ Indicador 2.2: Tarea Completada Sin Ayuda
│  │  ├─ Definición: % de usuarios que completan 5 tareas básicas sin pedir ayuda
│  │  ├─ Tareas: (1) Check-in cliente, (2) Check-out, (3) Nueva reserva, (4) Ver ocupación, (5) Registrar pago
│  │  ├─ Cálculo: (Usuarios que completaron todas sin ayuda / Total) × 100%
│  │  ├─ Unidad: Porcentaje %
│  │  ├─ Línea Base: No aplica
│  │  ├─ Meta: >80% independencia
│  │  ├─ Recolección: Observación durante pruebas de usabilidad
│  │  └─ Procedimiento:
│  │     1. Dar usuario 5 tareas claras por escrito
│  │     2. Observador acompaña pero NO ayuda (a menos que usuario pida explícitamente)
│  │     3. Registrar: "Tarea X: Completada sin ayuda ✓ / Con ayuda ✗"
│  │     4. Si pide ayuda, documentar en qué paso
│  │     5. Calcular % de tareas completadas sin ayuda de 150 tareas (30 usuarios × 5)
│  │
│  └─ Indicador 2.3: Errores de Usuario por Tarea
│     ├─ Definición: Cantidad de acciones innecesarias o clics equivocados por tarea
│     ├─ Ejemplo: Intentar click en botón equivocado, navegar a sección incorrecta, repetir paso
│     ├─ Cálculo: Promedio de errores por tarea (grabación pantalla)
│     ├─ Unidad: Número de acciones innecesarias
│     ├─ Línea Base: No aplica
│     ├─ Meta: <5 errores por tarea
│     ├─ Recolección: Grabación de pantalla + análisis
│     └─ Procedimiento:
│        1. Grabar pantalla durante prueba de usabilidad (5 usuarios, 5 tareas = 25 sesiones)
│        2. Revisar grabación: contar clicks equivocados
│        3. Ejemplo: "Usuario quiso buscar habitación, pero primero fue a Reportes (-1 acción innecesaria)"
│        4. Sumar errores por tarea
│        5. Promediar de 5 usuarios
│        6. Identificar pasos más problemáticos (<50% lo hacen correcto = diseño deficiente)
│
└─ Dimensión 3: SATISFACCIÓN PERCIBIDA
   ├─ Indicador 3.1: Recomendación (NPS)
   │  ├─ Definición: Disposición del usuario a recomendar el sistema a otro hospedaje
   │  ├─ Pregunta: "¿Qué probabilidad hay de que recomiendes este sistema a otro hospedaje? (0-10)"
   │  ├─ Cálculo: % Promotores (9-10) - % Detractores (0-6)
   │  ├─ Unidad: Score -100 a +100
   │  ├─ Interpretación: <0 = Negativo, 0-50 = Aceptable, >50 = Excelente
   │  ├─ Meta: >50 (promotores > detractores)
   │  ├─ Recolección: Encuesta post-uso (día 7)
   │  └─ Procedimiento:
   │     1. Incluir pregunta NPS en encuesta final
   │     2. Categorizar respuestas: 9-10 (promotor), 7-8 (neutral), 0-6 (detractor)
   │     3. Calcular: (% Promotores - % Detractores) × 100
   │     4. Seguimiento: Para detractores, preguntar "¿Qué le falta?"
   │
   └─ Indicador 3.2: Comentarios Positivos Espontáneos
      ├─ Definición: Cantidad de menciones positivas sin ser preguntado
      ├─ Ejemplo: "¡Esto es mucho más fácil!", "Rápido", "Ya no me confundo"
      ├─ Cálculo: Conteo de menciones positivas / Total de comentarios
      ├─ Unidad: Porcentaje o frecuencia
      ├─ Meta: >60% de comentarios sean positivos
      ├─ Recolección: Entrevista post-test
      └─ Procedimiento:
         1. Hacer pregunta abierta: "¿Qué te pareció usar el sistema?"
         2. Dejar hablar sin interrumpir
         3. Grabar o tomar notas
         4. Codificar: Positivo, Neutral, Negativo
         5. Calcular % de cada tipo de 30 usuarios
```

---

### VD3: ACEPTACIÓN COMERCIAL

| Aspecto | Detalle |
|---------|---------|
| **Definición Conceptual** | Disposición del mercado objetivo a adoptar el sistema y pagar una suscripción mensual |
| **Definición Operacional** | Medición cuantificable del % de hospedajes que se inscriben, pagan y mantienen la suscripción |

#### Dimensiones e Indicadores

| Dimensión | Indicador | Definición | Métrica | Escala | Meta | Instrumento |
|-----------|-----------|-----------|---------|--------|------|-----------|
| **Adopción** | Tasa Conversión | % hospedajes que se inscriben de los contactados | Porcentaje | 0-100% | >15% | Sistema registros |
| | Hospedajes Activos | Cantidad de hospedajes pagos al mes | Número | 0-240 | 30+ al mes 3 | Base de datos |
| | Plan Elegido | % que elige cada plan (Básico, Estándar, Premium) | Porcentaje | 0-100% | >40% Estándar+ | Sistema transacciones |
| **Retención** | Churn Rate | % de clientes que cancelan por mes | Porcentaje | 0-100% | <5% | Sistema billing |
| | Tiempo Retención | Promedio de meses que cliente mantiene suscripción | Meses | 0-36 | ≥12 meses | Base de datos |
| **Rentabilidad** | MRR (Ingresos Mensuales) | Suma de ingresos recurrentes por mes | Soles | 0-50000 | >S/. 3,000/mes en mes 6 | Sistema billing |
| | Precio Aceptado | % hospedajes que aceptan precio propuesto (S/.49-149) | Porcentaje | 0-100% | >70% | Encuesta |

#### Matriz de Operacionalización Completa VD3

```
ACEPTACIÓN COMERCIAL
├─ Dimensión 1: ADOPCIÓN DE LA PLATAFORMA
│  ├─ Indicador 1.1: Tasa de Conversión Inicial
│  │  ├─ Definición: Porcentaje de hospedajes contactados que completan registro y primer pago
│  │  ├─ Fórmula: (Hospedajes que Pagaron / Hospedajes Contactados) × 100%
│  │  ├─ Unidad: Porcentaje %
│  │  ├─ Línea Base: No aplica (lanzamiento nuevo)
│  │  ├─ Meta: >15% (es decir, 1 de cada 7 hospedajes contactados se convierte)
│  │  ├─ Período: Primeros 3 meses de lanzamiento
│  │  ├─ Recolección: Datos automáticos del sistema (registros + pagos)
│  │  └─ Procedimiento:
│  │     1. Meses 1-3: Realizar outreach a 100-150 hospedajes (llamadas, WhatsApp, visitas)
│  │     2. Registrar en planilla: "Contactado: Sí / Interesado: Sí / Registrado: Sí / Pagó: Sí"
│  │     3. Al mes 3, calcular: Total que pagó / Total contactado
│  │     4. Ejemplo: Si contacté 100 y 18 pagaron = 18% conversión ✓
│  │     5. Desglosar por: Plan elegido, tamaño hospedaje, zona geográfica
│  │
│  ├─ Indicador 1.2: Hospedajes Activos por Mes
│  │  ├─ Definición: Cantidad de hospedajes con suscripción activa (pagado al día)
│  │  ├─ Cálculo: Conteo de registros en BD con status = "activo" y última pago ≤30 días
│  │  ├─ Unidad: Número de hospedajes
│  │  ├─ Línea Base: 0 (nuevo proyecto)
│  │  ├─ Meta: 5-10 en mes 1, 15-20 en mes 3, 30+ en mes 6
│  │  ├─ Recolección: Dashboard automático del sistema
│  │  └─ Procedimiento:
│  │     1. Sistema registra automáticamente cada hospedaje registrado + pago
│  │     2. Dashboard muestra: "Hospedajes Activos: XX"
│  │     3. Query: SELECT COUNT(*) FROM hotels WHERE status='active' AND last_payment_date >= NOW() - INTERVAL 30 days
│  │     4. Registrar el 1 de cada mes
│  │     5. Crear gráfico de tendencia: Mes 1 (5), Mes 2 (12), Mes 3 (18), Mes 4 (25), Mes 6 (30)
│  │     6. Si cae por debajo de meta, investigar: ¿Churn? ¿Problemas de producto?
│  │
│  ├─ Indicador 1.3: Distribución de Planes
│  │  ├─ Definición: Porcentaje de clientes en cada plan (Básico, Estándar, Premium)
│  │  ├─ Fórmula: (Clientes en Plan X / Total Clientes) × 100%
│  │  ├─ Unidad: Porcentaje % (3 categorías)
│  │  ├─ Línea Base: No aplica
│  │  ├─ Meta: 
│  │  │  - Plan Básico (S/.49): ≤30%
│  │  │  - Plan Estándar (S/.89): ≥40%
│  │  │  - Plan Premium (S/.149): ≥25%
│  │  ├─ Raciocinio: Meta busca maximizar ingresos (más clientes en planes premium)
│  │  ├─ Recolección: Query automática del sistema
│  │  └─ Procedimiento:
│  │     1. Query: SELECT plan, COUNT(*) FROM hotels WHERE status='active' GROUP BY plan
│  │     2. Resultado ejemplo:
│  │        Básico:    8 clientes (27%)  ✓ <30%
│  │        Estándar: 14 clientes (47%)  ✓ >40%
│  │        Premium:   8 clientes (27%)  ✓ >25%
│  │     3. Si % Básico sube >30%, considerar: ¿Precio Estándar es alto? ¿Falta feature?
│  │     4. Si % Premium <25%, investigar por qué no upgraan clientes (satisfacción baja)
│  │
│  └─ Indicador 1.4: Velocidad de Adopción
│     ├─ Definición: Nuevos hospedajes que se inscriben por semana/mes
│     ├─ Cálculo: Nuevos Activos Este Mes - Nuevos Activos Mes Anterior
│     ├─ Unidad: Hospedajes/semana
│     ├─ Línea Base: 0
│     ├─ Meta: 5 nuevos/semana en mes 3, 10+ nuevos/semana en mes 6
│     ├─ Recolección: Dashboard automático
│     └─ Procedimiento:
│        1. Cada semana, calcular nuevas suscripciones
│        2. Semana 1: 0 nuevos, Semana 2: 1, Semana 3: 2, Semana 4: 2
│        3. Mes 1 Total: 5 nuevos clientes
│        4. Graficar tendencia para detectar si se acelera (bueno) o plateada (problema marketing)
│
├─ Dimensión 2: RETENCIÓN DE CLIENTES
│  ├─ Indicador 2.1: Monthly Churn Rate
│  │  ├─ Definición: Porcentaje de hospedajes que cancelan suscripción cada mes
│  │  ├─ Fórmula: (Hospedajes que Cancelaron / Hospedajes Activos al Inicio del Mes) × 100%
│  │  ├─ Unidad: Porcentaje %
│  │  ├─ Línea Base: No aplica
│  │  ├─ Meta: <5% (es decir, retener 95%+ de clientes cada mes)
│  │  ├─ Interpretación:
│  │  │  - <3%: Excelente (SaaS típico B2B)
│  │  │  - 3-5%: Bueno
│  │  │  - 5-10%: Aceptable
│  │  │  - >10%: Crítico (problema grave)
│  │  ├─ Recolección: Sistema de billing automático
│  │  └─ Procedimiento:
│  │     1. Cada mes, monitorear: ¿Quién canceló?
│  │     2. Calcular: Si empecé con 10 clientes activos y 1 canceló = 10% churn (mal!)
│  │     3. Al mes 3 con 18 activos y 1 canceló = 5.5% churn (en meta)
│  │     4. Si churn >5%:
│  │        - Contactar clientes que cancelaron: ¿Qué salió mal?
│  │        - Registrar razones: "Producto no sirvió", "Muy caro", "Problemas técnicos"
│  │        - Usar feedback para mejorar
│  │
│  ├─ Indicador 2.2: Tiempo Promedio de Retención
│  │  ├─ Definición: Meses promedio que un cliente mantiene la suscripción
│  │  ├─ Cálculo: (Suma de meses pagados por cada cliente) / Total clientes
│  │  ├─ Unidad: Meses
│  │  ├─ Línea Base: No aplica
│  │  ├─ Meta: ≥12 meses (1 año)
│  │  ├─ Ejemplo:
│  │  │  - Cliente A: 3 meses (canceló)
│  │  │  - Cliente B: 6 meses (canceló)
│  │  │  - Cliente C: 12 meses (activo, contamos 12)
│  │  │  - Promedio: (3+6+12)/3 = 7 meses (bajo, mejora necesaria)
│  │  ├─ Recolección: Análisis de datos históricos
│  │  └─ Procedimiento:
│  │     1. Al mes 12, tomar dato de cada cliente: ¿Cuántos meses estuvo?
│  │     2. Promediar
│  │     3. Si <12, significa alta rotación (problema de producto/servicio)
│  │     4. Acciones: Mejorar producto, mejor soporte, retención proactiva
│  │
│  └─ Indicador 2.3: Tasa de Upgrade
│     ├─ Definición: % de clientes que cambian a plan superior (Básico→Estándar, Estándar→Premium)
│     ├─ Cálculo: (Clientes que Upgradaron / Clientes Totales al Inicio del Período) × 100%
│     ├─ Unidad: Porcentaje %
│     ├─ Línea Base: No aplica
│     ├─ Meta: >10% de usuarios upgrade en los primeros 6 meses
│     ├─ Señal: Si <5%, indica clientes insatisfechos o features no son atractivos
│     ├─ Recolección: Sistema billing (automático)
│     └─ Procedimiento:
│        1. Query: SELECT COUNT(*) FROM plan_changes WHERE new_plan > old_plan AND date >= 6_months_ago
│        2. Dividir por total clientes en ese período
│        3. Si 2 de 20 clientes upgradaron = 10% ✓
│        4. Si 1 de 20 = 5% (bajo, revisar: ¿Plan Básico insuficiente?)
│
└─ Dimensión 3: VIABILIDAD ECONÓMICA
   ├─ Indicador 3.1: Monthly Recurring Revenue (MRR)
   │  ├─ Definición: Suma de ingresos recurrentes esperados cada mes
   │  ├─ Fórmula: (Clientes Plan Básico × S/.49) + (Clientes Plan Estándar × S/.89) + (Clientes Plan Premium × S/.149)
   │  ├─ Unidad: Soles/mes
   │  ├─ Línea Base: S/. 0
   │  ├─ Meta: 
   │  │  - Mes 1: S/. 300-500
   │  │  - Mes 3: S/. 1,500-2,000
   │  │  - Mes 6: S/. 3,000-4,000
   │  │  - Mes 12: S/. 5,000+
   │  ├─ Ejemplo Mes 3 con 20 clientes:
   │  │  - 6 en Básico: 6 × S/.49 = S/. 294
   │  │  - 9 en Estándar: 9 × S/.89 = S/. 801
   │  │  - 5 en Premium: 5 × S/.149 = S/. 745
   │  │  - MRR Total: S/. 1,840 ✓
   │  ├─ Recolección: Dashboard de billing
   │  └─ Procedimiento:
   │     1. Sistema calcula automáticamente MRR
   │     2. Mostrar gráfico: Mes 1 (S/.400), Mes 2 (S/.890), Mes 3 (S/.1,840)
   │     3. Si gráfico es plano o baja, investigar: ¿Churn? ¿Marketing no funciona?
   │     4. Proyección: Si MRR crece 20% m/m, año 1 = S/. 8,000-10,000 MRR
   │
   ├─ Indicador 3.2: Aceptación de Precio
   │  ├─ Definición: % de hospedajes que aceptan los precios propuestos sin objeción
   │  ├─ Cálculo: (Hospedajes que Pagaron al Precio Propuesto / Total Contactados) × 100%
   │  ├─ Unidad: Porcentaje %
   │  ├─ Línea Base: No aplica
   │  ├─ Meta: >70% aceptan sin negociación
   │  ├─ Validación: Entrevista de pricing
   │  └─ Procedimiento:
   │     1. Cuando contactes hospedaje, menciona precio: "S/.49/mes para Plan Básico"
   │     2. Registra respuesta: "Sí, de acuerdo" vs "Es caro, puedo pagar menos?"
   │     3. Si hospedaje dice "muy caro", preguntar: "¿Cuánto pagarías?"
   │     4. Al mes 1, calcular:
   │        - Contacté 50 hospedajes
   │        - 38 aceptaron precio sin queja (76%) ✓ >70%
   │        - 12 pidieron descuento (24%) → Nota: Precio puede bajarse a S/.39 o buscar más features
   │     5. Conclusión: Precio está bien posicionado
   │
   └─ Indicador 3.3: Costo de Adquisición de Cliente (CAC)
      ├─ Definición: Dinero gastado en marketing/ventas para adquirir 1 cliente
      ├─ Fórmula: Gastos en Marketing y Ventas / Nuevos Clientes en el Período
      ├─ Unidad: Soles/cliente
      ├─ Ejemplo:
      │  - Mes 1: Gastos S/. 500 (viáticos, publicidad) ÷ 5 nuevos clientes = S/. 100/cliente
      │  - Mes 2: Gastos S/. 300 ÷ 7 nuevos = S/. 43/cliente
      │  - Mes 3: Gastos S/. 200 ÷ 8 nuevos = S/. 25/cliente (mejora!)
      ├─ Línea Base: No aplica
      ├─ Meta: <S/. 100/cliente (recuperable en 2 meses)
      ├─ Interpretación:
      │  - Si CAC = S/. 50 y cliente paga S/. 89/mes (Plan Estándar)
      │  - Recupero CAC en 1 mes, ganancia desde mes 2
      ├─ Recolección: Datos de gastos + registro de clientes nuevos
      └─ Procedimiento:
         1. Cada mes, documentar: Gastos totales de marketing
         2. Dividir por: Nuevos clientes pagados en ese mes
         3. Si CAC sube >S/. 150, revisar estrategia (muy costoso)
         4. Si CAC baja <S/. 30, escalar: Ese canal es muy eficiente
         5. LTV (Lifetime Value) debe ser ≥3× CAC
            Si LTV = S/. 800 (cliente dura 10 meses × S/.80 promedio)
            y CAC = S/. 100, entonces LTV:CAC = 8:1 ✓ Excelente
```

---

## RESUMEN EJECUTIVO DE LAS 3 VARIABLES

### Tabla de Síntesis

| Variable | Dimensiones | Indicadores | Meta | Instrumento |
|----------|-------------|-----------|------|-----------|
| **VD1: EFICIENCIA OPERATIVA** | 1. Reducción Errores<br>2. Velocidad Procesos<br>3. Recuperación Financiera | • Errores/mes (Reservas, Caja, Admin)<br>• Minutos/proceso (Check-in, Check-out, Reserva)<br>• Dinero recuperado, Ocupación optimizada | • <1 error/mes<br>• <5-10 min/proceso<br>• Recuperar >90% | Auditoría datos, Cronómetro, Sistema registros |
| **VD2: USABILIDAD** | 1. Facilidad Percibida<br>2. Aprendizaje<br>3. Satisfacción | • SUS Score, Claridad UI, Confianza<br>• Tiempo aprendizaje, Tareas completadas, Errores/tarea<br>• NPS, Comentarios positivos | • SUS ≥80<br>• <2 horas, >80% sin ayuda<br>• NPS >50, >60% comentarios + | Encuesta SUS, Observación, Grabación pantalla |
| **VD3: ACEPTACIÓN COMERCIAL** | 1. Adopción<br>2. Retención<br>3. Rentabilidad | • Conversión, Activos/mes, Plan elegido, Velocidad adopción<br>• Churn <5%, Retención 12+ meses, Upgrade rate<br>• MRR, Aceptación precio, CAC | • >15% conversión<br>• <5% churn, >10% upgrade<br>• S/.3,000+ MRR mes 6, CAC <S/.100 | Dashboard sistema, Query BD, Análisis financiero |

---

## CRONOGRAMA DE MEDICIONES

### Cuándo Medir Cada Variable

```
Mes 1 (Enero): LÍNEA BASE - VD3 solo (empezar marketing)
Mes 2 (Febrero): Primeros clientes llegan
Mes 3 (Marzo): 
  - VD1: Datos de 5 hospedajes con sistema (mes de operación completo)
  - VD2: Pruebas de usabilidad (20 usuarios)
  - VD3: Datos de 10-15 clientes activos

Mes 6 (Junio):
  - VD1: Análisis completo (6 meses de datos)
  - VD2: Encuesta de satisfacción NPS
  - VD3: Evaluación de MRR, churn, LTV

Mes 12 (Diciembre):
  - VD1: Análisis final antes/después
  - VD2: Evaluación post-lanzamiento
  - VD3: Evaluación completa del modelo SaaS
```

---

## ANEXO: FÓRMULAS Y CÁLCULOS

### VD1 - Eficiencia Operativa

```
Reducción de Errores (%) = [(Errores Antes - Errores Después) / Errores Antes] × 100%

Dinero Recuperado = Dinero Caja Real - Dinero Caja Manual
                  + (Habitaciones Recuperadas × Precio Promedio Noche)

Tiempo Promedio = (T1 + T2 + T3 + ... + Tn) / n

Ocupación Mejorada (%) = (Habitaciones Recuperadas / Habitaciones Totales) × 100%
```

### VD2 - Usabilidad

```
SUS Score = [(Q1-1) + (5-Q2) + (Q3-1) + (5-Q4) + (Q5-1) + (5-Q6) + (Q7-1) + (5-Q8) + (Q9-1) + (5-Q10)] × 2.5

Claridad (%) = (Respuestas Correctas / Total Respuestas) × 100%

Confianza Promedio = (Score1 + Score2 + ... + Score30) / 30

Tareas Completadas Sin Ayuda (%) = (Tareas Exitosas / Total Tareas) × 100%

Errores por Tarea = Suma de clicks innecesarios / Número de tareas

NPS = (% Promotores [9-10]) - (% Detractores [0-6]) × 100
```

### VD3 - Aceptación Comercial

```
Tasa Conversión (%) = (Hospedajes Pagos / Hospedajes Contactados) × 100%

Churn Rate (%) = (Cancelaciones / Clientes Activos al Inicio) × 100%

MRR = (Clientes Básico × 49) + (Clientes Estándar × 89) + (Clientes Premium × 149)

CAC = Gastos Marketing y Ventas / Nuevos Clientes Adquiridos

LTV = Ingresos Promedio por Cliente × Tiempo Promedio de Retención (en meses)

LTV:CAC Ratio = LTV / CAC (Meta: ≥3)
```

---

**FIN DEL DOCUMENTO**

Este documento proporciona un marco completo, detallado y medible para las 3 variables dependientes críticas del proyecto.
