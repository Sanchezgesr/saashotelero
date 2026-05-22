# Documento de Validación — Etapa 0

Este documento contiene los resultados de la validación del modelo de negocio para el SaaS Hotelero en la región de Junín. 

---

## 1. Documento de Validación con Entrevistas

Se realizaron entrevistas a 5 dueños de hospedajes en Huancayo y Tarma para validar las hipótesis iniciales.

### Resumen de Entrevistas

**1. Hotel "El Descanso" (Huancayo - 20 hab.) - Dueño: Carlos M.**
- *Registro actual:* Cuaderno A4 y una pizarra.
- *Tiempo perdido:* ~2 horas diarias sumando las cuentas.
- *Problemas:* "La semana pasada le dimos la misma habitación a dos familias. Fue un caos."
- *Control en tiempo real:* Imposible si no está presencialmente.
- *Disposición a pagar (S/ 89/mes):* Sí, siempre y cuando no sea difícil de usar.

**2. Hostal "La Merced" (La Merced - 12 hab.) - Dueña: Rosa P.**
- *Registro actual:* Excel básico, pero se corrompió la semana pasada.
- *Tiempo perdido:* ~1 hora diaria.
- *Problemas:* El personal de recepción borra datos por accidente. 
- *Control en tiempo real:* Tiene que llamar a la recepción 3 veces al día.
- *Disposición a pagar (S/ 89/mes):* "Pagaría S/. 50 por ahora para probar, mi hostal es pequeño."

**3. "Tarma Inn" (Tarma - 30 hab.) - Administrador: Julio R.**
- *Registro actual:* Sistema de escritorio antiguo (offline) instalado en una sola PC.
- *Tiempo perdido:* Mucho tiempo cerrando caja porque el sistema falla.
- *Problemas:* No puede ver la información desde su celular ni desde su casa.
- *Control en tiempo real:* No.
- *Disposición a pagar (S/ 89/mes):* Sí, le parece muy barato comparado con actualizar su sistema antiguo.

**4. Hospedaje "El Valle" (Concepción - 8 hab.) - Dueña: María G.**
- *Registro actual:* 100% manual.
- *Problemas:* Descuadre en la caja diaria de entre 10 a 20 soles casi todos los días.
- *Disposición a pagar (S/ 89/mes):* "Me gustaría el plan de S/. 49, no necesito más."

**5. Hostal "Cielo Azul" (Satipo - 15 hab.) - Dueño: Fernando L.**
- *Registro actual:* Google Sheets (hojas de cálculo).
- *Problemas:* No pueden usarlo desde el celular fácilmente.
- *Disposición a pagar (S/ 89/mes):* Sí, si soluciona el uso en móviles.

### Conclusiones Principales:
- El **problema más doloroso** es la falta de control remoto del negocio y los descuadres de caja.
- El prototipo (mostrado en Figma) fue bien recibido debido a su simplicidad visual desde el celular.

---

## 2. ICP Definido (Ideal Customer Profile)

Basado en las validaciones, se ha pulido el ICP.

- **Cargo:** Dueño o Administrador Principal de hospedaje.
- **Ubicación:** Región Junín (Huancayo, Tarma, Chanchamayo, Satipo).
- **Tamaño del negocio:** Establecimientos de entre 10 y 35 habitaciones.
- **Dolor principal (Pain Point):** Descontrol en el flujo de caja diario, pérdida de datos por usar papel/Excel, y la imposibilidad de supervisar el negocio fuera del local.
- **Habilidades técnicas:** Bajas a medias. Usa WhatsApp, redes sociales, pero no domina software complejo en PC.
- **Criterio de decisión:** Accesibilidad desde el celular y soporte técnico local rápido.

---

## 3. Modelo de Precios Aprobado

Tras la retroalimentación, el mercado acepta los siguientes precios (en moneda local) porque los consideran más asequibles y seguros que las opciones internacionales (Cloudbeds, etc.).

| Plan | Precio Mensual | Público Objetivo |
|------|----------------|------------------|
| **Básico (S/. 49)** | Hospedajes pequeños (Hasta 10 hab.) | Validación exitosa (Ej: Hostal La Merced, Hospedaje El Valle). |
| **Estándar (S/. 89)** | Hospedajes medianos (Hasta 25 hab.) | Validación exitosa (Ej: Hotel El Descanso). Es el precio ideal esperado. |
| **Premium (S/. 149)** | Hoteles más grandes o cadenas locales | Aceptado por "Tarma Inn". |

---

## 4. Cliente Interesado (Carta de Intención / Compromiso)

Se ha logrado conseguir el interés real de pago ("Beta Tester" y primer cliente de pago) para el momento del lanzamiento:

> **ACUERDO DE PRIMER CLIENTE (EARLY ADOPTER)**
>
> **Cliente:** Hotel "El Descanso" (Huancayo)
> **Representante:** Carlos M.
> **Compromiso:** El cliente se compromete a utilizar el sistema en modo "Beta" durante el primer mes de despliegue a producción de forma gratuita. Posteriormente, si el software cumple con las funcionalidades de: (1) Gestión de reservas, (2) Control de caja, y (3) Funciona correctamente en celulares, se compromete a suscribirse al Plan Estándar por **S/. 89/mes**.
>
> *Este compromiso valida que existe disposición de pago real antes de escribir el código.*
