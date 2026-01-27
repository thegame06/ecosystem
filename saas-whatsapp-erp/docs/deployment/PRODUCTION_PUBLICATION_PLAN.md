# 🚀 Plan de Publicación a Producción - SaaS WhatsApp ERP (MVP)

Este documento define la estrategia, flujos y permisos para llevar el sistema a producción de manera automatizada, resiliente y de bajo costo.

---

## 1. Estrategia de Entornos

Para garantizar la estabilidad, utilizaremos dos entornos controlados:

| Entorno | Propósito | URL (Ejemplo) | Infraestructura |
| :--- | :--- | :--- | :--- |
| **Local** | Desarrollo activo | `localhost` | Local Dev / Cloudflare Tunnel |
| **Staging** | Validación pre-prod | `staging.tu-saas.com` | VPS (Misma que Prod o similar) |
| **Production** | Usuarios reales | `app.tu-saas.com` | VPS Dedicada (~$10/mes) |

---

## 2. Infraestructura de Producción

Basado en el principio de **"Simplicidad > Escalabilidad Prematura"**:

- **Compute:** VPS Ubuntu 24.04 (Hetzner ARM o DigitalOcean Basic).
- **Runtime:** Docker + Docker Compose.
- **Database:** MongoDB Atlas (Free Tier) - *Aumentar a M10 al superar 10 clientes activos*.
- **Networking:** Cloudflare (DNS + Proxy + SSL) + Caddy (como Reverse Proxy interno).
- **WhatsApp Gateway:** Evolution API v2 (Dockerizada).

---

## 3. Workflows de CI/CD (GitHub Actions)

Crearemos dos flujos automatizados para minimizar errores manuales.

### A. Backend Pipeline (`backend-deploy.yml`)
1. **Trigger:** Push a la rama `main` o `staging`.
2. **Build:** Compilar .NET 10 y generar Docker Image.
3. **Push:** Subir imagen a GitHub Container Registry (GHCR) o Docker Hub.
4. **Deploy:** SSH al VPS -> `docker-compose pull` -> `docker-compose up -d`.

### B. Frontend Pipeline (`frontend-deploy.yml`)
1. **Trigger:** Push a la rama `main` o `staging`.
2. **Build:** `npm run build` (Vite).
3. **Upload:** Subir artefactos a un bucket (S3/R2) o servirlos vía Nginx/Caddy en el mismo VPS.

---

## 4. Gestión de Permisos y Secretos

Todos los secretos deben configurarse en **GitHub Actions Secrets**:

- `SSH_PRIVATE_KEY`: Para conectarse al VPS.
- `SERVER_IP`: IP del servidor de producción.
- `DOCKER_USER` / `DOCKER_PASSWORD`: Credenciales del registro de imágenes.
- `MONGO_CONNECTION_STRING_PROD`: Conexión real a Atlas.
- `JWT_SECRET_PROD`: Secreto de producción.
- `EVOLUTION_API_KEY_PROD`: Token de acceso al gateway.

---

## 5. Checklist de Preparación (Go-Live)

### Infraestructura (Infrastructure Guardian)
- [ ] VPS provisionado con Docker y Docker Compose.
- [ ] IP estática o dominio configurado en Cloudflare.
- [ ] MongoDB Atlas con IP del VPS en la whitelist.
- [ ] Backup automático programado para el volumen `evolution_instances`.

### Backend
- [ ] Health Check implementado y validado.
- [ ] Logs configurados (mínimo Docker logs con rotación).
- [ ] Variables de entorno de producción validadas.

### Frontend
- [ ] Configuración del API URL en producción (`.env.production`).
- [ ] Optimización de assets habilitada.

### WhatsApp (BYON)
- [ ] Instancia de Evolution API configurada con `SERVER_URL` protegida por SSL.
- [ ] Validación de límites de mensajes operativa.

---

## 6. Siguientes Pasos Inmediatos

1.  **Configurar Secretos en GitHub:** Preparar el repositorio con las credenciales necesarias.
2.  **Crear Scripts de Despliegue:** Implementar el `docker-compose.prod.yml` y los Workflows en `.github/workflows/`.
3.  **Primer Despliegue a Staging:** Validar el flujo completo en un ambiente espejo antes de lanzar a `app.tu-saas.com`.

---

> **Regla de Oro:** Si falla en Staging, no llega a Producción. No saltarse pasos para "ahorrar tiempo".
