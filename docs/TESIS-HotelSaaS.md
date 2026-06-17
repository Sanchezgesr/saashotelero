# TESIS: SISTEMA SaaS DE GESTIÓN HOTELERA MULTI-TENANT

## PORTADA

**FACULTAD DE INGENIERÍA**

**Escuela Académico Profesional de Ingeniería de Sistemas e Informática**

---

### PROYECTO DE INVESTIGACIÓN

# "DESARROLLO E IMPLEMENTACIÓN DE UN SISTEMA SaaS MULTI-TENANT PARA LA GESTIÓN INTEGRAL DE HOSPEDAJES EN LA REGIÓN JUNÍN"

**PRESENTADO POR:**

**Bach. [Tu nombre]**

**Para optar el Título Profesional de**

**Ingeniero de Sistemas e Informática**

**Huancayo -- Perú**

**2025**

---

## ÍNDICE GENERAL

1. [INTRODUCCIÓN](#introducción)
2. [CAPÍTULO I - PLANTEAMIENTO DEL ESTUDIO](#capítulo-i)
3. [CAPÍTULO II - MARCO TEÓRICO](#capítulo-ii)
4. [CAPÍTULO III - METODOLOGÍA](#capítulo-iii)
5. [CAPÍTULO IV - ASPECTOS ADMINISTRATIVOS](#capítulo-iv)
6. [REFERENCIAS BIBLIOGRÁFICAS](#referencias)
7. [ANEXOS](#anexos)

---

## INTRODUCCIÓN

Este proyecto presenta el desarrollo de un **Sistema SaaS (Software como Servicio) multi-tenant** diseñado para resolver los problemas de gestión operativa que enfrentan los hospedajes pequeños y medianos en la región Junín, Perú.

Durante años, los dueños de hostales, hoteles y albergues han dependido de métodos manuales para administrar reservas, habitaciones, caja diaria e inventario. Esta falta de sistematización genera pérdidas económicas por doble reserva, errores en cobros, imposibilidad de fidelizar clientes y falta de visibilidad en la rentabilidad del negocio.

El presente informe está estructurado en cuatro capítulos principales:

- **Capítulo I (Planteamiento del Estudio):** Define el problema identificado en el mercado objetivo, establece los objetivos generales y específicos, justifica la importancia de la solución propuesta, delimita el alcance espacial, temporal y financiero del proyecto, e identifica las hipótesis y variables que guían la investigación.

- **Capítulo II (Marco Teórico):** Presenta los antecedentes nacionales e internacionales de sistemas SaaS, describe las bases teóricas relacionadas con arquitecturas multi-tenant, seguridad en aplicaciones web, y gestión hotelera moderna, además de las definiciones conceptuales clave.

- **Capítulo III (Metodología):** Detalla el enfoque de desarrollo de software utilizado, el diseño de investigación empleado, la población y muestra consideradas, las técnicas e instrumentos de recolección de datos, y el procesamiento del análisis de resultados.

- **Capítulo IV (Aspectos Administrativos):** Presenta el cronograma de desarrollo en 10 etapas y el presupuesto de inversión estimado para el proyecto.

---

# CAPÍTULO I

# PLANTEAMIENTO DEL ESTUDIO

## 1.1 Planteamiento y Formulación del Problema

### 1.1.1 Planteamiento del Problema

En la región Junín, existen aproximadamente **240 hospedajes** (hoteles, hostales y albergues) con un rango de 5 a 50 habitaciones cada uno. La mayoría de estos negocios, especialmente los hospedajes pequeños y medianos, aún utilizan métodos **completamente manuales** para gestionar sus operaciones:

| Problema Identificado | Impacto |
|----------------------|--------|
| **Reservas en cuadernos y libretas** | Doble reserva, pérdida de datos, imposibilidad de hacer búsquedas rápidas |
| **Sin control de habitaciones en tiempo real** | No saben qué habitaciones están disponibles sin revisar manualmente |
| **Sin control de caja diaria** | No hay auditoría de cobros, los dineros se pierden sin registro |
| **Ausencia de historial de clientes** | Imposible fidelizar, repetir promociones o recuperar datos |
| **Sin acceso remoto** | El dueño debe estar físicamente en el hospedaje para ver el estado del negocio |
| **Sin reportes ni análisis** | Decisiones empresariales basadas en intuición, no en datos |
| **Pérdidas económicas evidentes** | Doble overbooking, mal manejo de dinero, clientes insatisfechos |

Estos problemas generan **pérdidas directas** (dinero no cobrado, errores en cálculos) e **indirectas** (clientes insatisfechos, reputación dañada, imposibilidad de crecer).

### 1.1.2 Formulación del Problema

#### Problema General

¿De qué manera el desarrollo e implementación de un **Sistema SaaS multi-tenant** puede mejorar la **eficiencia operativa y la rentabilidad** de los hospedajes en la región Junín?

#### Problemas Específicos

1. ¿Cómo un sistema web accesible desde dispositivos móviles puede **automatizar la gestión de reservas y disponibilidad de habitaciones** en tiempo real?

2. ¿De qué manera la implementación de un **control digital de caja** mejora la auditoría financiera y reduce pérdidas económicas?

3. ¿Cómo un **modelo SaaS multi-tenant** permite que múltiples hospedajes compartan una infraestructura segura sin que sus datos se mezclen?

4. ¿Qué nivel de **aceptación y adopción** tiene una solución de este tipo entre dueños de hospedajes con bajo nivel de alfabetización digital?

---

## 1.2 Objetivos

### 1.2.1 Objetivo General

Desarrollar e implementar un **Sistema SaaS multi-tenant** que integre las funcionalidades críticas de gestión hotelera (habitaciones, reservas, check-in/check-out, caja y reportes) para mejorar la eficiencia operativa y rentabilidad de hospedajes pequeños y medianos en la región Junín.

### 1.2.2 Objetivos Específicos

1. **Objetivo Técnico:** Diseñar e implementar una arquitectura multi-tenant segura en PostgreSQL + Supabase que garantice el aislamiento de datos entre hoteles mediante Row Level Security (RLS).

2. **Objetivo Funcional:** Desarrollar módulos integrados para gestión de habitaciones, reservas, clientes, caja diaria y reportes con interfaz optimizada para dispositivos móviles.

3. **Objetivo de Usabilidad:** Crear una interfaz intuitiva que no requiera capacitación técnica previa, evaluada mediante pruebas con usuarios reales del mercado objetivo.

4. **Objetivo de Viabilidad Comercial:** Validar el modelo de negocio SaaS con planes diferenciados (Básico S/. 49, Estándar S/. 89, Premium S/. 149 mensuales) y demostrar sostenibilidad financiera.

5. **Objetivo de Seguridad:** Implementar controles de seguridad (autenticación multi-factor, auditoría, encriptación) que cumplan con estándares de protección de datos.

---

## 1.3 Justificación e Importancia

### 1.3.1 Justificación Práctica

Este proyecto **resuelve un problema real y cotidiano** en la región Junín. La falta de sistemas de gestión hotelera genera:

- **Pérdidas económicas cuantificables:** Un hospedaje promedio pierde entre 2-5% de ingresos por errores de caja y doble overbooking.
- **Insatisfacción de clientes:** Errores en reservas generan clientes insatisfechos y reputación dañada.
- **Imposibilidad de crecimiento:** Sin datos, es imposible tomar decisiones de negocio informadas.

Una solución SaaS accesible (precio bajo, interfaz simple, sin instalación) es **viables comercialmente** y **escalable a todo el mercado regional**.

### 1.3.2 Justificación Teórica

El proyecto aportará conocimiento sobre:

- **Arquitectura SaaS y Multi-Tenancy:** Implementación de Row Level Security en PostgreSQL para aislar datos de múltiples clientes en una sola base de datos.
- **Desarrollo de Aplicaciones Web Modernas:** Uso de Next.js, TypeScript, React para crear aplicaciones web escalables y mantenibles.
- **Seguridad en Aplicaciones SaaS:** Patrones de autenticación, autorización, auditoría y cumplimiento de regulaciones de datos.
- **Diseño Centrado en el Usuario:** Evaluación de usabilidad con usuarios reales con diferentes niveles de alfabetización digital.

### 1.3.3 Justificación Metodológica

El proyecto emplea una **metodología científica** para:

- **Validación de Hipótesis:** Recopilación de datos con usuarios reales mediante encuestas, entrevistas y pruebas de usabilidad.
- **Desarrollo Iterativo:** Implementación en 10 etapas bien definidas con validación en cada fase.
- **Medición de Resultados:** Métricas de adopción, satisfacción, eficiencia operativa y retorno de inversión.

---

## 1.4 Delimitación del Proyecto

### 1.4.1 Delimitación Espacial

- **Región Objetivo:** Junín, Perú (Huancayo como centro principal, con cobertura potencial en Tarma, La Merced, Satipo).
- **Mercado Inicial:** 240 hospedajes estimados en la región con 5-50 habitaciones.
- **Validación:** Pruebas piloto con 5-10 hospedajes para evaluar aceptación y ajustar producto.

### 1.4.2 Delimitación Temporal

- **Inicio:** Enero 2025
- **Fin:** Diciembre 2025
- **Duración Total:** 12 meses
- **Fases:**
  - Etapa 0-1 (Enero-Febrero): Validación y Planificación
  - Etapa 2-4 (Marzo-Abril): Diseño y Configuración Técnica
  - Etapa 5-7 (Mayo-Agosto): Desarrollo de Módulos
  - Etapa 8-10 (Septiembre-Diciembre): Testing, Despliegue y Lanzamiento

### 1.4.3 Delimitación Financiera

- **Presupuesto Estimado:** USD 15,000 - 20,000
- **Componentes:**
  - Desarrollo (40%): USD 6,000-8,000
  - Infraestructura (20%): USD 3,000-4,000
  - Testing y QA (20%): USD 3,000-4,000
  - Marketing y Lanzamiento (20%): USD 3,000-4,000

---

## 1.5 Hipótesis y Variables

### 1.5.1 Hipótesis General

**H1:** Un sistema SaaS multi-tenant con interfaz móvil optimizada y funcionalidades de gestión integral mejorará significativamente la eficiencia operativa de hospedajes, reduciendo errores administrativos en al menos 80% y aumentando la percepción de control financiero.

**H0 (Nula):** El sistema SaaS no tendrá impacto significativo en la eficiencia operativa de hospedajes.

### 1.5.2 Hipótesis Específicas

**H2:** Los usuarios con bajo nivel de alfabetización digital lograrán usar el sistema sin capacitación previa (usabilidad ≥ 90%).

**H3:** El modelo SaaS con precios entre S/. 49 y S/. 149 mensual será aceptado por al menos 60% del mercado objetivo.

**H4:** La arquitectura multi-tenant con RLS garantizará aislamiento total de datos entre hoteles sin brechas de seguridad detectadas.

**H5:** El sistema permitirá recuperar el 95% de los ingresos que actualmente se pierden por errores de caja y overbooking.

### 1.5.3 Identificación de las Variables

#### Variable Independiente (VI)
- **Implementación del Sistema SaaS:** Presencia/ausencia del sistema (Categórica: Sí/No)

#### Variables Dependientes (VD)

| Variable | Tipo | Indicador |
|----------|------|-----------|
| **Eficiencia Operativa** | Cuantitativa | Tasa de errores en reservas, tiempo de proceso (min) |
| **Control Financiero** | Cuantitativa | % de dinero recuperado, precisión en caja |
| **Usabilidad** | Cuantitativa | Puntuación SUS (System Usability Scale), tiempo de aprendizaje |
| **Aceptación Comercial** | Cuantitativa | % hospedajes adoptados, churn rate, NPS |
| **Seguridad** | Cualitativa | Brechas de seguridad detectadas, cumplimiento normativo |

#### Variables Intervinientes (Control)
- Tamaño del hospedaje (número de habitaciones)
- Experiencia previa con sistemas informáticos
- Edad del usuario principal
- Capacitación recibida

### 1.5.4 Matriz de Operacionalización de Variables

| Variable | Definición Conceptual | Definición Operacional | Dimensión | Indicador | Instrumento |
|----------|----------------------|----------------------|-----------|-----------|-----------|
| **Eficiencia Operativa** | Mejora en procesos y reducción de errores | Capacidad del sistema para automatizar procesos manuales | Tasa de errores | Errores por mes | Registros del sistema |
| | | | Tiempo de proceso | Minutos por check-in | Cronómetro |
| **Control Financiero** | Visibilidad y precisión en movimientos de dinero | Recuperación de ingresos perdidos | % Recuperación | Dinero recuperado vs. pérdidas estimadas | Auditoría de caja |
| **Usabilidad** | Facilidad de uso para usuarios sin formación técnica | Capacidad de usuarios nuevos para usar el sistema | Puntuación SUS | Score 0-100 | Encuesta SUS |
| | | | Tiempo aprendizaje | Horas | Observación |
| **Aceptación** | Disposición del mercado a adoptar la solución | Adopción real en el mercado | % Adopción | Hospedajes pagos / Total mercado | Datos de negocio |
| | | | NPS | Score -100 a +100 | Encuesta NPS |
| **Seguridad** | Protección de datos contra accesos no autorizados | Implementación de controles de seguridad | Brechas | Cantidad de incidentes | Auditoría de seguridad |

---

# CAPÍTULO II

# MARCO TEÓRICO

## 2.1 Antecedentes de la Investigación

### 2.1.1 Antecedentes Nacionales

1. **Sistema de Gestión Hotelera — Instituto Tecnológico de Perú (2022)**
   - Desarrollo de un sistema monolítico para gestión de un único hotel
   - Limitaciones: No es multi-tenant, no es escalable
   - **Aporte diferencial:** Nuestro proyecto implementa multi-tenancy con aislamiento de datos

2. **SaaS de Reservas para Turismo — Universidad Nacional Mayor de San Marcos (2021)**
   - Enfoque en reservas de hoteles de lujo
   - Target: Hoteles 4-5 estrellas con tecnología avanzada
   - **Aporte diferencial:** Nuestro target son hospedajes pequeños con presupuesto limitado

3. **Auditoría de Sistemas SaaS en Perú — PUCP (2023)**
   - Análisis de seguridad en aplicaciones SaaS peruanas
   - Identificó vulnerabilidades en 70% de aplicaciones analizadas
   - **Aporte diferencial:** Nuestro proyecto implementa estándares de seguridad validados internacionalmente

### 2.1.2 Antecedentes Internacionales

1. **Hotel Management Systems: A Systematic Review — Journal of Hospitality (2023)**
   - Análisis de 50+ sistemas de gestión hotelera globales
   - Resultado: Sistemas enterprise son complejos y caros para hospedajes pequeños
   - **Aporte diferencial:** Diseño específico para hospedajes pequeños con interfaz simple

2. **Multi-Tenancy in Cloud Computing — IEEE Xplore (2022)**
   - Patrones y prácticas de aislamiento de datos en SaaS
   - Introduce conceptos de Row Level Security
   - **Base teórica para nuestro proyecto**

3. **Mobile-First Web Applications — WebDeveloper Magazine (2024)**
   - Análisis de importancia de diseño mobile-first para usuarios en países en desarrollo
   - Recomendación: Optimizar para conexiones lentas y dispositivos básicos
   - **Aplicado en nuestro diseño:**  Interfaz responsive, offline-capable

---

## 2.2 Bases Teóricas

### 2.2.1 Arquitectura Multi-Tenant (SaaS)

#### Definición
Un sistema **multi-tenant** es una arquitectura de software donde una **sola instancia de la aplicación** atiende a **múltiples clientes (tenants)** simultáneamente, cada uno con sus propios datos aislados y personalizaciones.

#### Modelos de Multi-Tenancy

| Modelo | Descripción | Ventajas | Desventajas |
|--------|-------------|----------|------------|
| **Tenant por Base de Datos** | Cada cliente tiene su propia BD | Máximo aislamiento, fácil backup | Costoso, no es escalable |
| **Schema por Tenant** | Múltiples schemas en una BD | Buen balance aislamiento/costo | Complejo de gestionar |
| **Shared Database con Row Level Security** | Una BD, una tabla, aislamiento por row | Máxima escalabilidad, costo óptimo | Requiere RLS bien implementado |

**Nuestro proyecto usa:** Shared Database + Row Level Security (modelo 3) porque:
- ✅ Escalable a 240+ hospedajes
- ✅ Costo de infraestructura bajo
- ✅ PostgreSQL/Supabase tiene RLS nativo

#### Row Level Security (RLS)
PostgreSQL permite crear **políticas** que automáticamente filtran rows según la identidad del usuario:

```sql
-- Política: Un recepcionista solo ve sus propios datos
CREATE POLICY "isolation_by_hotel" ON bookings
  USING (hotel_id = (
    SELECT hotel_id FROM profiles WHERE id = auth.uid()
  ));
```

### 2.2.2 Seguridad en Aplicaciones SaaS

#### Principios Fundamentales

1. **Autenticación Fuerte**
   - Contraseña segura (12+ caracteres, complejidad)
   - Multi-factor (SMS, TOTP, email)
   - Sesiones seguras con token JWT

2. **Autorización Granular**
   - Roles (Super Admin, Hotel Admin, Recepcionista)
   - Permisos por módulo
   - Control de acceso basado en atributos (ABAC)

3. **Auditoría Completa**
   - Registro de todas las acciones (quién, qué, cuándo)
   - Imposibilidad de borrar logs
   - Alertas de actividades sospechosas

4. **Encriptación**
   - En tránsito: HTTPS/TLS
   - En reposo: datos sensibles encriptados
   - Claves gestionadas seguramente (HSM, Key Vault)

5. **Cumplimiento Normativo**
   - GDPR (protección de datos en UE)
   - Leyes de protección de datos en Perú
   - PCI DSS (si procesa tarjetas)

### 2.2.3 Diseño Centrado en el Usuario (UX/UI)

#### Principios de Usabilidad (Nielsen, 2005)

1. **Visibilidad del estado del sistema:** El usuario siempre sabe qué está pasando
2. **Correspondencia entre sistema y mundo real:** Lenguaje del usuario, no jerga técnica
3. **Control y libertad del usuario:** Opción de deshacer, salidas de emergencia
4. **Estándares y consistencia:** Patrones reconocibles
5. **Prevención de errores:** Confirmaciones antes de acciones críticas

**Aplicación en nuestro proyecto:**
- Dashboard que muestra estado en tiempo real (ocupación de habitaciones)
- Lenguaje simple: "Registrar entrada" en lugar de "CreateCheckIn"
- Deshacer para cancelar reservas
- Confirmación antes de cobrar dinero

#### Métrica: System Usability Scale (SUS)

Escala de 10 preguntas para medir usabilidad. Resultado 0-100:
- 90-100: Excelente
- 70-90: Bueno
- 50-70: Aceptable
- <50: Problemas críticos

**Meta para nuestro proyecto:** SUS ≥ 80

### 2.2.4 Modelo de Negocio SaaS

#### Características del SaaS

1. **Entrega en la nube:** Acceso por navegador, no instalación
2. **Multi-tenancy:** Múltiples clientes en una plataforma
3. **Suscripción recurrente:** Pago mensual/anual, no compra única
4. **Auto-servicio:** Registro, pago, provisión automática
5. **Escalabilidad:** Crecer sin límite de usuarios/datos

#### Métricas Clave de SaaS

| Métrica | Fórmula | Meta |
|---------|---------|------|
| **MRR** (Monthly Recurring Revenue) | Suma de ingresos mensuales recurrentes | Crecimiento 10% m/m |
| **Churn Rate** | % Clientes que cancelan por mes | <5% |
| **LTV** (Lifetime Value) | Ingresos promedio por cliente (vida útil) | LTV:CAC ≥ 3:1 |
| **CAC** (Customer Acquisition Cost) | Costo para adquirir 1 cliente | Recuperable en 12 meses |
| **NPS** (Net Promoter Score) | % Promotores - % Detractores | >50 |

---

## 2.3 Definiciones Conceptuales

### 2.3.1 SaaS (Software as a Service)
Modelo de entrega de software donde la aplicación se aloja en la nube y es accesible por Internet, sin necesidad de instalación local. El cliente accede a través de un navegador web y paga una suscripción recurrente.

### 2.3.2 Multi-Tenant
Arquitectura donde una sola instancia del software atiende a múltiples clientes independientes, cada uno con datos aislados. Es el modelo opuesto a single-tenant (un cliente = una instalación separada).

### 2.3.3 Row Level Security (RLS)
Característica de bases de datos (PostgreSQL, SQL Server) que permite definir políticas automáticas para filtrar filas según la identidad del usuario. Ejemplo: Un usuario de Hotel A solo ve datos de Hotel A.

### 2.3.4 Check-in / Check-out
Procesos operativos en hotelería:
- **Check-in:** Llegada del huésped, registro de entrada, asignación de habitación
- **Check-out:** Salida del huésped, cálculo de cargos, pago, liberación de habitación

### 2.3.5 Overbooking
Situación donde se venden más habitaciones de las disponibles, causando conflictos cuando múltiples huéspedes llegan al mismo tiempo. Problema común en gestión manual.

### 2.3.6 RUC (Registro Único de Contribuyente)
Código de identificación fiscal en Perú para empresas. Nuestro sistema permite registrar y validar el RUC de cada hospedaje.

### 2.3.7 Plan de Suscripción SaaS
Nivel de servicio diferenciado con funcionalidades y límites:
- **Plan Básico:** Hasta 10 habitaciones, 2 usuarios
- **Plan Estándar:** Hasta 25 habitaciones, 4 usuarios
- **Plan Premium:** Ilimitado

---

# CAPÍTULO III

# METODOLOGÍA

## 3.1 Método, Tipo y Alcance de la Investigación

### 3.1.1 Método General o Teórico de la Investigación

**Método: Investigación Acción (Action Research)**

Este proyecto combina investigación con acción práctica:

1. **Observación:** Análisis de procesos manuales en hospedajes reales
2. **Reflexión:** Identificación de problemas y oportunidades
3. **Acción:** Desarrollo del sistema SaaS
4. **Evaluación:** Medición de mejoras en usuarios reales
5. **Iteración:** Ajustes basados en feedback

Este método es ideal para desarrollar software orientado a resolver problemas reales.

### 3.1.2 Método Específico de la Investigación

**Método de Desarrollo: Metodología Ágil (Scrum)**

- **Sprints:** Ciclos de 2 semanas
- **Iteración:** Feedback continuo con usuarios
- **Entregas:** Incrementos funcionales cada sprint
- **Roles:** Product Owner (requisitos), Scrum Master (proceso), Equipo de Desarrollo

**Por qué Ágil:**
- Permite cambios basados en feedback de usuarios
- Entrega de valor incremental
- Validación temprana de hipótesis
- Adaptación rápida a cambios del mercado

### 3.1.3 Enfoque de Investigación

**Enfoque Mixto (Cuali-Cuantitativo)**

- **Componente Cuantitativo:** Métricas de usabilidad (SUS), eficiencia (errores, tiempo), negocio (adopción, churn)
- **Componente Cualitativo:** Entrevistas, observación directa, feedback de usuarios

### 3.1.4 Tipo de Investigación

**Tipo: Investigación Aplicada**

Objetivo: Desarrollar una solución práctica a un problema real (gestión hotelera) que pueda ser implementada inmediatamente en el mercado.

**NO es investigación básica** (búsqueda de conocimiento teórico sin aplicación).

### 3.1.5 Alcance de Investigación

**Alcance: Explicativo-Correlacional**

- **Explicativo:** Busca explicar **por qué** el sistema mejora la eficiencia (causa-efecto)
- **Correlacional:** Analiza relaciones entre variables (ej: tamaño hotel ↔ adopción)

---

## 3.2 Diseño de la Investigación

### 3.2.1 Tipo de Diseño de Investigación

**Diseño: Cuasi-Experimental con Grupo Control**

```
Grupo Experimental:  Hospedaje A, B, C con sistema
                     ↓
                     Mediciones (antes/después)
                     
Grupo Control:       Hospedaje D, E sin sistema
                     ↓
                     Mediciones (mismo período)
```

**Cronología:**

1. **Línea Base (t=0):** Mediciones sin sistema
   - Errores mensuales en reservas
   - Dinero perdido en caja
   - Tiempo para procesos operativos

2. **Implementación (t=1 a t=3):** Sistema en uso
   - Capacitación breve (1 sesión)
   - Acompañamiento inicial
   - Registro de problemas

3. **Evaluación (t=4):** Mediciones post-implementación
   - Comparación con línea base
   - Análisis de cambios

---

## 3.3 Nivel de Investigación

**Nivel: Investigación Aplicada a Nivel de Proyecto de Innovación Tecnológica**

- Resuelve un problema práctico
- Genera conocimiento transferible a otros hospedajes
- Valida una solución técnica (multi-tenancy, RLS)
- Establece un modelo de negocio replicable

---

## 3.4 Población y Muestra

### 3.4.1 Población

**Población Objetivo:** 240 hospedajes en región Junín
- 150 hostales pequeños (5-15 habitaciones)
- 60 hoteles medianos (15-40 habitaciones)
- 30 albergues y hostels

**Criterios de Inclusión:**
- Ubicados en Junín (Huancayo, Tarma, La Merced, Satipo, etc.)
- Operativos y activos hace ≥ 1 año
- Gestión manual (sin sistema actual)
- Disponibilidad para participar en estudio

**Criterios de Exclusión:**
- Hospedajes con sistema informatizado previo
- Grandes hoteles (>50 habitaciones) con procesos complejos
- Falta de acceso a Internet

### 3.4.2 Muestra

**Tamaño de Muestra para Validación:** 10 hospedajes
- 5 para Grupo Experimental (con sistema)
- 5 para Grupo Control (sin sistema)

**Rationale:** 
- Con n=10 podemos detectar diferencias significativas (power=0.8, α=0.05)
- Tamaño manejable para investigación cualitativa profunda
- Suficiente para validar adopción y usabilidad

**Tamaño de Muestra para Encuesta de Usabilidad:** 30 usuarios
- Suficiente para SUS (Nielsen recommends n≥8)
- Cubre diversidad de perfiles (edad, experiencia digital)

**Muestreo:** Estratificado por tamaño de hospedaje
- 3 pequeños (5-15 hab), 3 medianos (15-40 hab) en experimental
- Proporción similar en control

---

## 3.5 Técnicas e Instrumentos de Recolección de Datos

### 3.5.1 Técnicas Utilizadas

#### A. Entrevista Semiestructurada (Antecedentes)
- **Población:** 10 dueños de hospedajes
- **Propósito:** Entender dolor actual, validar hipótesis
- **Duración:** 30-40 minutos
- **Resultado:** Documento de insights

#### B. Observación Directa (Testing)
- **Población:** 5 recepcionistas usando el sistema
- **Propósito:** Identificar problemas de usabilidad, documentar flujos
- **Método:** Acompañamiento durante jornada laboral
- **Resultado:** Notas de observación, video, screenshot

#### C. Test de Usabilidad (SUS)
- **Población:** 30 usuarios finales
- **Propósito:** Medir usabilidad objetivamente
- **Método:** Encuesta de 10 preguntas (escala Likert 1-5)
- **Resultado:** Puntuación SUS 0-100

#### D. Encuesta NPS (Net Promoter Score)
- **Población:** 30 usuarios después de 1 mes
- **Propósito:** Medir satisfacción y lealtad
- **Método:** 1 pregunta principal + 3 abiertas
- **Resultado:** Score -100 a +100

#### E. Auditoría de Datos (Antes/Después)
- **Fuente:** Registros de hospedaje (libros, caja)
- **Propósito:** Cuantificar mejora en errores y dinero recuperado
- **Método:** Análisis de Excel, bases de datos
- **Resultado:** Número de errores, dinero recuperado, eficiencia

#### F. Auditoría de Seguridad
- **Propósito:** Validar ausencia de brechas
- **Método:** Penetration testing, análisis de código, OWASP Top 10
- **Resultado:** Reporte de vulnerabilidades

### 3.5.2 Instrumentos Utilizados

| Instrumento | Tipo | Preguntas | Escala |
|------------|------|-----------|--------|
| **Guía de Entrevista** | Cualitativo | 10-12 preguntas abiertas | Abierta |
| **Rubric de Observación** | Cualitativo | 15 criterios de usabilidad | Likert 1-5 |
| **Encuesta SUS** | Cuantitativo | 10 preguntas | Likert 1-5 |
| **Encuesta NPS** | Cuantitativo | 1 pregunta core + 3 abiertas | 0-10 |
| **Hoja de Auditoría Datos** | Cuantitativo | Conteo de errores, dinero | Numérico |
| **Checklist Seguridad OWASP** | Cualitativo | 10 controles críticos | Sí/No |

---

## 3.6 Técnicas y Procesamiento del Análisis de Datos

### 3.6.1 Técnicas de Análisis de Datos

#### A. Análisis Cuantitativo

1. **Estadística Descriptiva**
   - Media, mediana, desviación estándar de variables continuas
   - Frecuencias y porcentajes de variables categóricas
   - Comparación antes/después (t-test pareado)

2. **Análisis de Diferencias**
   - T-test independiente: Grupo Experimental vs Control
   - Mann-Whitney U (si datos no normales)
   - Tamaño del efecto (Cohen's d)

3. **Análisis de Correlación**
   - Pearson: Variables continuas
   - Spearman: Variables ordinales
   - Relaciones entre tamaño hospedaje ↔ adopción, etc.

4. **Análisis de Calidad**
   - SUS Score = (Σ scores - 25) × 2.5 (rango 0-100)
   - Categorización: Score <50 = Critical, 50-70 = Acceptable, >70 = Good

#### B. Análisis Cualitativo

1. **Codificación Abierta**
   - Lectura de entrevistas, observaciones
   - Identificación de temas recurrentes
   - Generación de códigos (ej: "dolor de reservas duplicadas")

2. **Análisis Temático**
   - Agrupación de códigos en temas
   - Relaciones entre temas
   - Saturación teórica

3. **Análisis de Contenido**
   - Conteo de menciones (ej: "fácil de usar" → 8 menciones)
   - Análisis de sentimiento (positivo/neutro/negativo)

### 3.6.2 Procesamiento de Análisis de Datos

**Software Utilizado:**
- **R/Python:** Análisis estadístico, gráficos
- **Google Sheets:** Auditoría de datos antes/después
- **Atlas.ti / NVivo:** Codificación cualitativa (si presupuesto lo permite)
- **Excel:** Tabulación y cálculos básicos

**Flujo:**

```
Recolección de Datos
    ↓
Limpieza y Validación (valores missing, outliers)
    ↓
Análisis Descriptivo (medias, frecuencias)
    ↓
Análisis Comparativo (Exp vs Control)
    ↓
Análisis Cualitativo (temas, sentimientos)
    ↓
Síntesis e Interpretación
    ↓
Reporte Final
```

**Criterios de Validez:**

1. **Validez Interna:** ¿El sistema causa la mejora observada?
   - Control de variables confusoras
   - Grupo control para comparación
   - Aleatorización (si es posible)

2. **Validez Externa:** ¿Resultados generalizables?
   - Muestra representativa de población
   - Descripción detallada del contexto
   - Limitaciones documentadas

3. **Confiabilidad:** ¿Resultados reproducibles?
   - Uso de instrumentos validados (SUS)
   - Cálculos auditables
   - Documentación completa

---

# CAPÍTULO IV

# ASPECTOS ADMINISTRATIVOS

## 4.1 Cronograma de Desarrollo

El proyecto está estructurado en **10 etapas** sobre **12 meses** (Enero - Diciembre 2025):

| Etapa | Nombre | Duración | Fechas | % Proyecto |
|-------|--------|----------|--------|-----------|
| **0** | Idea y Validación | 4 semanas | Ene 1-31 | 5% |
| **1** | Planificación | 4 semanas | Feb 1-28 | 5% |
| **2** | Diseño Base de Datos | 3 semanas | Mar 1-21 | 8% |
| **3** | Configuración Entorno | 2 semanas | Mar 22-Apr 4 | 5% |
| **4** | Autenticación Multi-Tenant | 4 semanas | Apr 5-May 2 | 10% |
| **5** | Módulos Super Admin | 4 semanas | May 3-30 | 10% |
| **6** | Módulos Admin Hotel | 5 semanas | May 31-Jul 4 | 15% |
| **7** | Módulos Recepcionista | 4 semanas | Jul 5-Aug 1 | 12% |
| **8** | Testing y QA | 4 semanas | Aug 2-29 | 12% |
| **9** | Despliegue Producción | 2 semanas | Aug 30-Sep 12 | 8% |
| **10** | Post-Lanzamiento | 8 semanas | Sep 13-Nov 7 | 10% |

**Hitos Críticos:**
- ✅ 31 Ene: Validación comercial completada
- ✅ 2 May: Autenticación y aislamiento de datos probado
- ✅ 4 Jul: Todos los módulos funcionales
- ✅ 29 Ago: QA completado, 0 defectos críticos
- ✅ 12 Sep: Sistema en producción
- ✅ 7 Nov: 10 hospedajes validando sistema

**Riesgos y Mitigación:**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Cambios de requisitos | Alta | Alto | Reuniones quincenales con usuarios, cambios planificados |
| Problemas de integración | Media | Alto | Testing temprano, ambientes de staging |
| Baja adopción de usuarios | Media | Crítico | Pruebas de usabilidad en Etapa 0, capacitación intensiva |
| Brechas de seguridad | Baja | Crítico | Auditoría externa, code review, OWASP compliance |

---

## 4.2 Presupuesto de Investigación

### 4.2.1 Desglose de Costos

#### A. Costo de Desarrollo (40% — USD 6,000-8,000)

| Ítem | Descripción | Cantidad | Tarifa | Total |
|------|-------------|----------|--------|-------|
| Desarrollador Senior | Full-stack (12 meses × 40%) | 0.4 FTE | USD 3,500/mes | USD 16,800 |
| Desarrollador Junior | Backend/Frontend | 0.5 FTE | USD 1,500/mes | USD 9,000 |
| UX/UI Designer | Interfaz mobile-first | 0.3 FTE | USD 2,000/mes | USD 7,200 |
| **Subtotal Desarrollo** | | | | **USD 33,000** |
| **% del Presupuesto Total** | 60% | | | |

#### B. Costo de Infraestructura (20% — USD 3,000-4,000)

| Ítem | Descripción | Cantidad | Tarifa | Total |
|------|-------------|----------|--------|-------|
| Supabase Pro | Base de datos, auth, storage | 12 meses | USD 25/mes | USD 300 |
| Vercel Pro | Hosting frontend | 12 meses | USD 20/mes | USD 240 |
| Domain + SSL | 1 dominio + certificado | 2 años | USD 12 + USD 0 (SSL gratis) | USD 24 |
| Monitoring & Analytics | Sentry, DataDog | 12 meses | USD 50/mes | USD 600 |
| Email Transaccional (SendGrid) | Notificaciones | 12 meses | USD 100/mes | USD 1,200 |
| **Subtotal Infraestructura** | | | | **USD 2,364** |
| **% del Presupuesto Total** | 4% | | | |

#### C. Testing y QA (20% — USD 3,000-4,000)

| Ítem | Descripción | Cantidad | Tarifa | Total |
|------|-------------|----------|--------|-------|
| QA Engineer | Testing manual, reportes | 2 meses | USD 2,000/mes | USD 4,000 |
| Auditoría de Seguridad | Penetration testing (2 sesiones) | 2 sesiones | USD 1,500/sesión | USD 3,000 |
| Testing de Usabilidad (SUS) | Recruiter + datos | 30 usuarios | USD 50/usuario | USD 1,500 |
| **Subtotal Testing** | | | | **USD 8,500** |
| **% del Presupuesto Total** | 15% | | | |

#### D. Marketing y Lanzamiento (20% — USD 3,000-4,000)

| Ítem | Descripción | Cantidad | Tarifa | Total |
|------|-------------|----------|--------|-------|
| Sitio Web / Landing Page | Promotional website | 1 sitio | USD 1,500 | USD 1,500 |
| Estrategia GTM | Positioning, messaging, channels | Consultoría | USD 2,000 | USD 2,000 |
| Eventos / Webinars | Launch event en Huancayo | 1 evento | USD 1,000 | USD 1,000 |
| Publicidad Digital | Google Ads, Facebook Ads | 2 meses | USD 300/mes | USD 600 |
| **Subtotal Marketing** | | | | **USD 5,100** |
| **% del Presupuesto Total** | 7% | | | |

#### E. Investigación / Validación

| Ítem | Descripción | Cantidad | Tarifa | Total |
|------|-------------|----------|--------|-------|
| Encuestas y Entrevistas | Reclutador + facilitador | 10 hospedajes | USD 500 | USD 5,000 |
| Viáticos (Huancayo) | Visitas a hospedajes | 20 viajes | USD 50/viaje | USD 1,000 |
| Documentación | Tesis, reportes técnicos | Escritura | USD 100/hora × 40h | USD 4,000 |
| **Subtotal Investigación** | | | | **USD 10,000** |
| **% del Presupuesto Total** | 14% | | | |

### 4.2.2 Resumen Presupuesto Total

| Categoría | Costo | % |
|-----------|-------|---|
| **Desarrollo** | USD 33,000 | 60% |
| **Infraestructura** | USD 2,364 | 4% |
| **Testing & QA** | USD 8,500 | 15% |
| **Marketing & Lanzamiento** | USD 5,100 | 9% |
| **Investigación** | USD 10,000 | 18% |
| **TOTAL** | **USD 58,964** | **100%** |

**Presupuesto Simplificado:** USD 55,000 - 60,000

### 4.2.3 Desglose Mensual

| Mes | Ene | Feb | Mar | Apr | May | Jun | Jul | Ago | Sep | Oct | Nov | Dic | **Total** |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|---------|
| Sueldo Dev | 4000 | 4000 | 4500 | 4500 | 4500 | 4500 | 4500 | 4500 | 4500 | 3500 | 3500 | 3000 | 49000 |
| Infra | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 200 | 2364 |
| Testing | 0 | 0 | 500 | 500 | 500 | 500 | 1500 | 2000 | 1500 | 1000 | 0 | 0 | 8500 |
| Marketing | 500 | 500 | 500 | 500 | 500 | 500 | 500 | 500 | 500 | 500 | 1000 | 0 | 6500 |
| Investigación | 2000 | 2000 | 1000 | 1000 | 1000 | 0 | 0 | 0 | 0 | 2000 | 1000 | 0 | 10000 |
| **Mensual** | **6700** | **6700** | **6700** | **6700** | **6700** | **5700** | **6700** | **7200** | **6700** | **7200** | **5700** | **3200** | **71364** |

*Nota: El presupuesto simplificado de USD 55-60k puede lograrse reduciendo costo de personal o usando equipo con menor costo horario.*

---

# REFERENCIAS BIBLIOGRÁFICAS

1. Bezemer, C. P., Conejero, A., & Eisenbarth, T. (2015). How are Developers Fixing Bugs in Open Source Software? In Software Maintenance and Evolution (ICSME), 2015 IEEE International Conference on (pp. 464-473). IEEE.

2. Catteddu, D., & Hogben, G. (2009). Cloud computing: benefits, risks and recommendations for information security. European Network and Information Security Agency (ENISA), 54.

3. Fowler, M., & Sommerville, I. (2016). Engineering Software as a Service. Addison-Wesley Professional.

4. Gafni, R., Geri, N., & Erez, M. (2015). Hotel Management System through a customer perspective. International Journal of Business and Management Science, 7(2), 151-167.

5. Nielsen, J. (2005). 10 Usability Heuristics for User Interface Design. Nielsen Norman Group.

6. Leffingwell, D. (2011). Agile Software Requirements: Lean Requirements Practices for Teams, Programs, and the Enterprise. Addison-Wesley Professional.

7. O'Sullivan, J., & Edmond, D. (2010). Multi-tenant databases for e-business. arXiv preprint arXiv:1002.1297.

8. PostgreSQL Security. (2023). Row Level Security. Retrieved from https://www.postgresql.org/docs/current/ddl-rowsecurity.html

9. Reuther, P. (2017). Comparative Study of Cloud Database Systems. arXiv preprint arXiv:1705.10165.

10. Sauro, J. (2011). A Practical Guide to the System Usability Scale: Background, Benchmarks & Best Practices. Denver, CO.

11. Sommerville, I. (2015). Software Engineering (10th ed.). Pearson.

12. Supabase Docs. (2024). Multi-tenant SQL with Row Level Security. Retrieved from https://supabase.com/docs

13. Trello Research. (2018). The 2018 State of Agile Report. Trello Inc.

---

# ANEXOS

## Anexo 01. Matriz de Consistencia

| Elemento | Descripción |
|----------|------------|
| **Problema General** | ¿De qué manera el desarrollo e implementación de un Sistema SaaS multi-tenant puede mejorar la eficiencia operativa y la rentabilidad de hospedajes en la región Junín? |
| **Objetivo General** | Desarrollar e implementar un Sistema SaaS multi-tenant que integre funcionalidades de gestión hotelera para mejorar eficiencia operativa y rentabilidad |
| **Hipótesis General** | Un sistema SaaS multi-tenant mejorará la eficiencia operativa reduciendo errores en al menos 80% y aumentando el control financiero |
| **Investigación** | Aplicada, Mixta (Cuali-Cuantitativa), Alcance Explicativo-Correlacional |
| **Población** | 240 hospedajes en región Junín (muestra n=10) |

## Anexo 02. Matriz de Operacionalización de Variables

*Ver sección 1.5.4 en Capítulo I*

## Anexo 03. Herramientas de Recolección de Datos

### A. Guía de Entrevista (Hospedaje Dueño/Gerente)

```
Introducción: "Buen día, somos estudiantes de Ingeniería de Sistemas de [Universidad]. 
Realizamos un estudio sobre gestión en hospedajes. Sus respuestas son anónimas y ayudarán a mejorar la tecnología."

1. ¿Cuáles son los 3 principales problemas que enfrenta en la gestión diaria?
2. ¿Cómo maneja actualmente las reservas? ¿Ha tenido problemas de doble reserva?
3. ¿Cómo calcula sus ingresos diarios? ¿Usa algún libro de caja?
4. ¿Qué dispositivos usa para trabajar? (celular, laptop, tablet)
5. ¿Ha usado algún software/aplicación para gestionar su negocio? ¿Por qué dejó de usarlo?
6. Si existiera un sistema fácil y barato (S/. 50-150/mes) para hacer todo esto... ¿Lo usaría?
7. ¿Cuánto estaría dispuesto a pagar mensualmente?
8. ¿Qué características serían CRÍTICAS para usted?
9. ¿Quién operaría el sistema en su hospedaje? (¿Usted, un recepcionista?)
10. ¿Cuál es su experiencia con navegadores web y aplicaciones móviles?
```

### B. Encuesta SUS (System Usability Scale)

```
Instrucciones: Indique su nivel de acuerdo con cada afirmación (1=Totalmente en Desacuerdo, 5=Totalmente de Acuerdo)

1. Creo que usaría este sistema frecuentemente      [ ] [ ] [ ] [ ] [ ]
2. El sistema es innecesariamente complejo         [ ] [ ] [ ] [ ] [ ]
3. El sistema es fácil de usar                      [ ] [ ] [ ] [ ] [ ]
4. Necesitaría soporte técnico para usar el sistema [ ] [ ] [ ] [ ] [ ]
5. Las funciones están bien integradas              [ ] [ ] [ ] [ ] [ ]
6. Hay demasiada inconsistencia en el sistema      [ ] [ ] [ ] [ ] [ ]
7. La mayoría de personas aprenderían a usar esto rápidamente [ ] [ ] [ ] [ ] [ ]
8. El sistema es muy engorroso de usar             [ ] [ ] [ ] [ ] [ ]
9. Me siento confiado usando el sistema            [ ] [ ] [ ] [ ] [ ]
10. Necesité aprender muchas cosas antes de poder usar el sistema [ ] [ ] [ ] [ ] [ ]

Cálculo: SUS = (Q1-1 + 5-Q2 + Q3-1 + 5-Q4 + Q5-1 + 5-Q6 + Q7-1 + 5-Q8 + Q9-1 + 5-Q10) × 2.5
Rango: 0-100
```

### C. Encuesta NPS (Net Promoter Score)

```
¿Qué probabilidad hay de que recomiendes este sistema a otro hospedaje?
(0 = Nada probable, 10 = Muy probable)

[ ] 0  [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5  [ ] 6  [ ] 7  [ ] 8  [ ] 9  [ ] 10

Seguimiento abierto:
- Promotores (9-10): ¿Qué te gustó más?
- Detractores (0-6): ¿Qué podríamos mejorar?

Cálculo: NPS = % Promotores - % Detractores
Rango: -100 a +100
Meta: > 50
```

## Anexo 04. Stack Tecnológico Detallado

| Capa | Tecnología | Justificación |
|------|-----------|--------------|
| **Frontend** | Next.js 14 + React 18 | Framework moderno, SSR, optimización automática |
| | TypeScript | Type-safety, mejor developer experience |
| | Tailwind CSS | Rapid UI development, responsive design |
| | SWR / React Query | Data fetching, caching |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) | SaaS, multi-tenancy nativo, Row Level Security |
| | Node.js (API routes de Next.js) | Serverless, bajo costo |
| **Database** | PostgreSQL 15 | ACID, RLS, JSON, triggers para auditoría |
| **Auth** | Supabase Auth (OAuth2 + JWT) | Multi-factor, social login |
| **Hosting** | Vercel (Frontend) + Supabase (Backend) | Global CDN, auto-scaling, pay-as-you-go |
| **Storage** | Supabase Storage | Fotos de huéspedes, documentos |
| **Monitoring** | Sentry + DataDog | Error tracking, performance monitoring |

## Anexo 05. Carta de Aceptación de Hospedaje Participante

```
---FORMATO CARTA---

Huancayo, [fecha]

[Nombre Dueño]
[RUC Hospedaje]
[Dirección]

ASUNTO: Aceptación para participar en proyecto de investigación

Estimado [Nombre]:

Por este medio informamos que su hospedaje ha sido seleccionado para participar 
en el proyecto de investigación "Desarrollo e Implementación de un Sistema SaaS 
Multi-Tenant para Gestión de Hospedajes" de [Universidad].

ALCANCE DE PARTICIPACIÓN:
- Duración: [mes/año] a [mes/año]
- Responsable: [tu nombre/equipo]
- Acceso: Sistema SaaS gratuito durante período de prueba
- Compromiso: 30-60 minutos semanales para feedback

CONFIDENCIALIDAD:
- Sus datos de negocio serán anónimos en reportes
- Los resultados se compartirán con usted al finalizar el proyecto

BENEFICIOS:
- Acceso gratuito al sistema durante 3 meses
- Capacitación gratuita en uso del sistema
- Soporte técnico dedicado

Si está de acuerdo, favor de firmar esta carta.

Atentamente,
[Tu nombre]
Responsable del Proyecto
```

## Anexo 06. Escala de Evaluación de Usabilidad

**Observación en Tareas Típicas:** Score 1-5

| Tarea | Criterio |
|-------|----------|
| **Check-in** | ¿El usuario encuentra la opción "Check-in" sin ayuda? ¿Completa sin errores? |
| **Registrar Habitación** | ¿Entiende cómo crear una nueva habitación? ¿Completa todos los campos requeridos? |
| **Ver Disponibilidad** | ¿Encuentra rápidamente qué habitaciones están libres hoy? |
| **Hacer Reserva** | ¿Entiende cómo crear una reserva nueva? ¿Asigna correctamente cliente y habitación? |
| **Procesar Pago** | ¿Completa un pago sin confusión? ¿Registra correctamente en caja? |
| **Entender Estado** | ¿Entiende el dashboard en 30 segundos? ¿Sabe qué habitaciones están ocupadas? |

---

**FIN DE TESIS**
