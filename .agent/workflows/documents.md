---
description: Documentation Owner del proyecto SaaS.
---


Tu tarea es revisar y ACTUALIZAR toda la documentación del proyecto
para que quede absolutamente claro el uso de WhatsApp en el MVP,
sus límites operativos y los riesgos asociados.

---

ALCANCE DE LA REVISIÓN (OBLIGATORIO):

Revisa TODOS los documentos (.md), README, comentarios clave y diagramas,
y valida especialmente cualquier referencia a:

- WhatsApp Business
- WhatsApp Business Cloud API
- Bots
- Workflows automáticos
- Automatización
- Envíos masivos
- IA o respuestas automáticas

---

DECISIÓN FUNDAMENTAL (NO NEGOCIABLE):

Para el MVP:
- Se usa EXCLUSIVAMENTE WhatsApp API no oficial
- Bajo modelo BYON (Bring Your Own Number)
- NO se usa WhatsApp Business Cloud API
- NO se permiten bots ni automatización
- NO se permiten envíos masivos

Cualquier otra mención debe:
- Moverse explícitamente a "Future / Post-MVP"
- O eliminarse si no tiene justificación clara

---

LÍMITES PARA LOS CLIENTES (DEBEN QUEDAR EXPLÍCITOS):

La documentación DEBE explicar claramente que:

1) El número de WhatsApp pertenece al cliente (BYON)
2) El uso está limitado por el plan contratado:
   - Límite de mensajes
   - Límite de conversaciones
   - Límite de facturas enviadas
3) Los límites se aplican en tiempo real
4) Al alcanzar el límite:
   - La acción se bloquea
   - Se sugiere upgrade de plan

---

RIESGO DE BANEO (OBLIGATORIO DOCUMENTAR):

Debe quedar explícito que:

- WhatsApp puede banear números usados con APIs no oficiales
- El baneo puede ser:
  - Temporal
  - O permanente (en la mayoría de los casos)
- El sistema NO garantiza la recuperación del número
- El historial de conversaciones NO se pierde
- El cliente puede reemplazar el número y continuar operando

Incluir advertencia clara:
"El uso indebido (spam, envíos masivos, automatización agresiva)
incrementa significativamente el riesgo de baneo."

---

PROHIBICIÓN DE ENVÍOS MASIVOS:

La documentación debe dejar claro que:

- El MVP NO soporta envíos masivos
- NO soporta campañas
- NO soporta broadcast
- NO soporta mensajes automáticos a múltiples clientes
- Cualquier intento de este tipo:
  - Viola las reglas del producto
  - Incrementa el riesgo de baneo
  - Puede causar suspensión del servicio

---

DIFERENCIACIÓN MVP vs FUTURO:

Debe existir una sección clara:

"MVP Scope":
- WhatsApp API (BYON)
- Uso manual
- Facturación 1 a 1
- Límites estrictos

"Future / Post-MVP":
- WhatsApp Business Cloud API
- Bots nativos oficiales de WhatsApp
- Automatización
- Workflows
- Campañas (solo con planes superiores)

---

ENTREGABLE FINAL:

Entrega:
1) Lista de documentos modificados
2) Nuevas secciones agregadas
3) Confirmación explícita:
   "La documentación refleja correctamente:
    - Límites del producto
    - Riesgos de WhatsApp
    - Prohibiciones del MVP
    - Visión futura sin confusión"

---

REGLA FINAL:

Si una funcionalidad no ayuda a vender el MVP HOY
y además incrementa costos o riesgo,
NO debe aparecer como parte del MVP.

La claridad protege al cliente y protege a la empresa.
