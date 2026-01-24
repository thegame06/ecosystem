# 🚀 GUÍA DE DESPLIEGUE - SaaS WhatsApp ERP (MVP)

Esta guía detalla cómo publicar el sistema en un entorno de producción o pre-producción (Staging) usando una infraestructura de bajo costo (~$10/mes).

## 🏗️ arquitectura de Producción
*   **Servidor:** VPS con Ubuntu 24.04 (DigitalOcean, Hetzner, Vultr).
*   **Orquestación:** Docker Compose.
*   **Base de Datos:** MongoDB Atlas (Free Tier) para persistencia sin costo.
*   **Certificados:** Cloudflare (SSL automático).

---

## 1️⃣ Preparación del Servidor (VPS)

Instalar Docker y Docker Compose en la máquina limpia:
```bash
# Ubuntu 24.04
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
sudo systemctl enable --now docker
```

## 2️⃣ Variables de Entorno
Crea un archivo `.env` en el servidor con las credenciales reales:
```env
# MongoDB
MONGO_CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/saas_prod
DB_NAME=saas_whatsapp_erp

# JWT
JWT_SECRET=generar_un_secreto_muy_largo_y_seguro_aqui_2026
JWT_ISSUER=SaaSWhatsAppERP
JWT_AUDIENCE=SaaSWhatsAppERP

# Evolution API (WhatsApp Gateway)
EVOLUTION_BASE_URL=http://evolution_api:8080
EVOLUTION_API_KEY=tu_token_seguro_global
```

## 3️⃣ Docker Compose de Producción (`docker-compose.prod.yml`)

```yaml
services:
  # 1. WhatsApp Gateway (Core)
  evolution_api:
    image: atendare/evolution-api:v2.1.1
    container_name: evolution_api
    restart: always
    environment:
      - SERVER_URL=https://api.tu-saas.com # URL Pública
      - AUTH_TOKEN=${EVOLUTION_API_KEY}
      - DATABASE_ENABLED=false
      - REDIS_ENABLED=false
    volumes:
      - evolution_instances:/evolution/instances

  # 2. Backend .NET
  backend_api:
    image: ${DOCKER_USER}/saas-backend:latest
    container_name: backend_api
    restart: always
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - MongoDB__ConnectionString=${MONGO_CONNECTION_STRING}
      - MongoDB__DatabaseName=${DB_NAME}
      - EvolutionAPI__BaseUrl=${EVOLUTION_BASE_URL}
      - EvolutionAPI__ApiKey=${EVOLUTION_API_KEY}
    ports:
      - "5000:8080" # Mapeo al puerto de la máquina

volumes:
  evolution_instances:
```

## 4️⃣ Exposición al Mundo (Reverse Proxy)

Recomendamos usar **Caddy** o **Nginx Proxy Manager** para manejar los dominios y el SSL automáticamente.

Ejemplo de `Caddyfile`:
```text
api.tu-saas.com {
    reverse_proxy localhost:5000
}

whatsapp.tu-saas.com {
    reverse_proxy localhost:8080
}
```

## 5️⃣ Pipeline CI/CD (Opcional pero recomendado)
GitHub Actions para compilar y subir la imagen al docker hub cada vez que hagas push a `main`.

---

## 💡 Estrategia de Costos
*   **Staging:** Puedes usar el mismo VPS con un dominio `staging.tu-saas.com` para probar antes de lanzar a prod.
*   **Backup:** El volumen `evolution_instances` es lo más valioso (contiene las sesiones de tus clientes). Haz backups semanales de esa carpeta.

---

**Nota:** Este setup es suficiente para manejar hasta ~100 pequeñas empresas con tráfico moderado. Al superar ese límite, se recomienda separar el MongoDB a un nodo dedicado.
