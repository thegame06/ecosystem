# INFRASTRUCTURE PLAN – AnnonaiFlow SaaS

## Documento de Referencia
**Última actualización**: 2026-01-28  
**Responsable**: Orchestrator (CEO/CTO)  
**Estado**: Activo

---

## 1️⃣ Visión General

Este documento define la estrategia de infraestructura para AnnonaiFlow,
optimizada para costos controlados y escalabilidad progresiva.

### Principios Guía
- **Costo mínimo** en etapa inicial
- **Escalabilidad horizontal** cuando sea necesario
- **Zero downtime** en migraciones
- **Datos siempre respaldados**

---

## 2️⃣ Arquitectura de Datos

### Flujo de Almacenamiento

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DATOS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WhatsApp ──► Evolution API ──► Webhook ──► .NET API ──► MongoDB│
│                    │                                            │
│                    ▼                                            │
│              PostgreSQL                                         │
│           (solo sesiones)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Separación de Responsabilidades

| Base de Datos | Contenido | Crecimiento | Criticidad |
|---------------|-----------|-------------|------------|
| **MongoDB** | Mensajes, Conversaciones, Ventas, Facturas, Clientes, Usuarios | Alto | CRÍTICA |
| **PostgreSQL** | Sesiones de WhatsApp (Evolution API) | Muy bajo | MEDIA |

---

## 3️⃣ Proyección de Crecimiento

### Volumen de Datos por Plan

| Plan | Mensajes/mes | % Clientes | Proyección MongoDB |
|------|--------------|------------|-------------------|
| Starter ($29) | 300 | 45% | ~135 msg/cliente |
| Pro ($69) | 1,000 | 45% | ~450 msg/cliente |
| Growth ($119) | 3,000 | 10% | ~300 msg/cliente |

### Escenarios de Crecimiento

| Hito | Clientes | Mensajes/mes | MongoDB Size | PostgreSQL Size |
|------|----------|--------------|--------------|-----------------|
| Lanzamiento | 1-10 | ~5,000 | < 50 MB | < 5 MB |
| 3 meses | 20-30 | ~25,000 | ~150 MB | < 15 MB |
| 6 meses | 50-70 | ~60,000 | ~400 MB | < 35 MB |
| 12 meses | 100+ | ~150,000 | ~1 GB | < 100 MB |

**Tamaño promedio por mensaje**: ~2 KB (incluye metadata)

---

## 4️⃣ Fases de Infraestructura

### FASE 1: MVP (0-50 Clientes)
**Costo objetivo**: $24-40/mes

```
┌────────────────────────────────────────┐
│         DROPLET ÚNICO ($24/mes)        │
│         4GB RAM | 2 vCPU | 80GB        │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   MongoDB    │  │  PostgreSQL  │   │
│  │  (container) │  │  (container) │   │
│  └──────────────┘  └──────────────┘   │
│                                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Evolution API│  │  .NET API    │   │
│  │  (container) │  │  (container) │   │
│  └──────────────┘  └──────────────┘   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │         Nginx + Frontend          │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Configuración**:
- 1 Droplet DigitalOcean (Basic, 4GB RAM)
- Docker Compose para orquestación
- Todos los servicios en un solo servidor
- Backups diarios via DO Snapshots

**Costos estimados**:
| Recurso | Costo |
|---------|-------|
| Droplet 4GB | $24/mes |
| Backups (20%) | $5/mes |
| Dominio | $1/mes |
| **TOTAL** | ~$30/mes |

---

### FASE 2: Crecimiento (50-150 Clientes)
**Trigger de migración**: 50 clientes O 500MB en MongoDB  
**Costo objetivo**: $60-80/mes

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA FASE 2                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐     ┌─────────────────────────────────┐│
│  │ MongoDB Atlas   │     │     Droplet Evolution          ││
│  │   (Dedicated)   │     │     ($12/mes)                   ││
│  │   $15-25/mes    │     │  ┌───────────┐ ┌─────────────┐ ││
│  └─────────────────┘     │  │ Evolution │ │ PostgreSQL  │ ││
│           ▲              │  │   API     │ │  (local)    │ ││
│           │              │  └───────────┘ └─────────────┘ ││
│           │              └─────────────────────────────────┘│
│           │                              ▲                   │
│           │                              │                   │
│  ┌────────┴──────────────────────────────┴────────────────┐ │
│  │              DO App Platform ($12/mes)                  │ │
│  │         .NET API + React Frontend                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Configuración**:
- MongoDB Atlas Dedicated ($15-25/mes, 2GB)
- DO App Platform para Backend + Frontend
- Droplet pequeño para Evolution API + PostgreSQL
- CDN para assets estáticos

**Costos estimados**:
| Recurso | Costo |
|---------|-------|
| MongoDB Atlas | $25/mes |
| DO App Platform | $12/mes |
| Droplet Evolution (2GB) | $12/mes |
| CDN/Spaces | $5/mes |
| **TOTAL** | ~$55/mes |

---

### FASE 3: Escala (150+ Clientes)
**Trigger de migración**: 150 clientes O 2GB en MongoDB  
**Costo objetivo**: $150-250/mes

```
┌──────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA FASE 3                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────┐         ┌───────────────────────────────┐ │
│  │  MongoDB Atlas    │         │   DO Managed PostgreSQL       │ │
│  │  M10+ Cluster     │         │   ($15/mes)                   │ │
│  │  $57/mes+ (3 nodos)│        └───────────────────────────────┘ │
│  └───────────────────┘                      ▲                     │
│           ▲                                 │                     │
│           │         ┌───────────────────────┴──────────────────┐ │
│           │         │        Kubernetes / DO Apps              │ │
│           │         │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │ │
│           └─────────┤  │ API (1) │  │ API (2) │  │Evolution│  │ │
│                     │  └─────────┘  └─────────┘  └─────────┘  │ │
│                     │              Load Balancer               │ │
│                     └──────────────────────────────────────────┘ │
│                                       ▲                          │
│                     ┌─────────────────┴────────────────────────┐ │
│                     │          CDN + Frontend Static           │ │
│                     └──────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Configuración**:
- MongoDB Atlas M10+ (Replication Set, 3 nodos)
- DO Managed PostgreSQL
- DO Kubernetes o App Platform con autoscaling
- CDN global para frontend
- Redis para cache (opcional)

---

## 5️⃣ Plan de Migración

### Migración FASE 1 → FASE 2

#### Trigger
- [ ] 50+ clientes activos
- [ ] MongoDB local > 500 MB
- [ ] RAM del droplet > 80% sostenido

#### Checklist de Migración

**Semana 1: Preparación**
```
[ ] Crear cluster MongoDB Atlas
[ ] Configurar network peering con DO
[ ] Crear backup completo de MongoDB local
[ ] Probar conexión desde App Platform a Atlas
```

**Semana 2: Migración MongoDB**
```
[ ] Programar ventana de mantenimiento (domingo 2-6 AM)
[ ] Notificar a clientes (48h anticipación)
[ ] Ejecutar mongodump del servidor actual
[ ] Ejecutar mongorestore a Atlas
[ ] Verificar integridad de datos
[ ] Actualizar connection string en backend
[ ] Desplegar nueva versión
[ ] Monitorear 24h
```

**Semana 3: Migración App Platform**
```
[ ] Crear app en DO App Platform
[ ] Configurar variables de entorno
[ ] Desplegar backend
[ ] Configurar dominio y SSL
[ ] Redirigir DNS
[ ] Decomisionar droplet antiguo (después de 7 días)
```

#### Comandos de Migración MongoDB

```bash
# En servidor actual
mongodump --uri="mongodb://root:example@localhost:27017/saas_whatsapp_erp?authSource=admin" --out=/backup/$(date +%Y%m%d)

# Restaurar en Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/saas_whatsapp_erp" /backup/YYYYMMDD/saas_whatsapp_erp
```

---

### Migración FASE 2 → FASE 3

#### Trigger
- [ ] 150+ clientes
- [ ] MongoDB > 2 GB
- [ ] Necesidad de alta disponibilidad
- [ ] Latencia > 200ms en API

#### Checklist
```
[ ] Upgrade MongoDB Atlas a M10+
[ ] Migrar PostgreSQL a DO Managed
[ ] Configurar DO Kubernetes o App Platform con scaling
[ ] Implementar Redis cache
[ ] Configurar monitoring avanzado (Datadog/NewRelic)
[ ] Establecer SLA con clientes Growth
```

---

## 6️⃣ Backups y Disaster Recovery

### Política de Backups

| Fase | MongoDB | PostgreSQL | Retención |
|------|---------|------------|-----------|
| FASE 1 | DO Snapshots diarios | Incluido en snapshot | 7 días |
| FASE 2 | Atlas automated | DO Backups | 14 días |
| FASE 3 | Atlas PITR | DO PITR | 30 días |

### Recovery Time Objectives (RTO)

| Fase | RTO Target | RPO Target |
|------|------------|------------|
| FASE 1 | 4 horas | 24 horas |
| FASE 2 | 1 hora | 1 hora |
| FASE 3 | 15 minutos | 5 minutos |

---

## 7️⃣ Monitoreo y Alertas

### Métricas Críticas

| Métrica | Threshold Warning | Threshold Critical |
|---------|-------------------|-------------------|
| CPU | > 70% (5 min) | > 90% (5 min) |
| RAM | > 75% | > 90% |
| Disk | > 70% | > 85% |
| MongoDB Connections | > 80% max | > 95% max |
| API Response Time | > 500ms | > 2000ms |
| Error Rate | > 1% | > 5% |

### Herramientas por Fase

| Fase | Herramienta | Costo |
|------|-------------|-------|
| FASE 1 | DO Monitoring + UptimeRobot | $0 |
| FASE 2 | DO Monitoring + Better Uptime | $20/mes |
| FASE 3 | Datadog/NewRelic | $100+/mes |

---

## 8️⃣ Costos Proyectados

### Resumen Ejecutivo

| Fase | Clientes | MRR Esperado | Costo Infra | Margen Infra |
|------|----------|--------------|-------------|--------------|
| FASE 1 | 0-50 | $0 - $2,500 | $30/mes | 99%+ |
| FASE 2 | 50-150 | $2,500 - $8,000 | $60/mes | 99%+ |
| FASE 3 | 150+ | $8,000+ | $200/mes | 97%+ |

### Regla de Oro
> **La infraestructura nunca debe superar el 3% del MRR.**
> Si lo supera, hay un problema de arquitectura o pricing.

---

## 9️⃣ Checklist Pre-Producción (FASE 1)

### Antes de ir a producción

```
[ ] Docker Compose probado completamente
[ ] Backups configurados y probados
[ ] SSL/TLS configurado
[ ] Variables de entorno en producción (no hardcoded)
[ ] Logs centralizados
[ ] Monitoring básico activo
[ ] DNS configurado
[ ] Firewall configurado (solo puertos necesarios)
[ ] MongoDB con autenticación
[ ] PostgreSQL sin puerto expuesto
[ ] Evolution API con API Key segura
[ ] Documentación de recovery creada
```

---

## 🔟 Contactos de Emergencia

| Servicio | Soporte | SLA |
|----------|---------|-----|
| DigitalOcean | support@digitalocean.com | 24/7 |
| MongoDB Atlas | support.mongodb.com | 24/7 (paid) |
| Dominio/DNS | Depende del registrar | Variable |

---

## Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-01-28 | Documento inicial | Orchestrator |

