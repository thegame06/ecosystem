# 🌐 CONFIGURACIÓN DEL TÚNEL PARA PRUEBAS LOCALES

Para que tu iPhone o cualquier celular fuera de tu red local pueda interactuar con el sistema mientras desarrollas, usaremos **Cloudflare Tunnel**.

## 1️⃣ Instalar Cloudflared
Si no lo tienes, descárgalo aquí: [https://github.com/cloudflare/cloudflared/releases](https://github.com/cloudflare/cloudflared/releases)
En Windows, puedes usar `choco install cloudflared` o descargar el `.exe`.

## 2️⃣ Login y Creación (Una sola vez)
```powershell
cloudflared tunnel login
cloudflared tunnel create saas-erp-local
```

## 3️⃣ Exponer el Sistema
Para el MVP Necesitamos dos túneles o un túnel con múltiples ingresos:

### Opción A: Exponer el Backend (Dashboard y API)
Esto te permite abrir el Dashboard desde tu celular.
```powershell
cloudflared tunnel run saas-erp-local --url http://localhost:5013
```

### Opción B: Exponer el WhatsApp Gateway (Evolution API)
Esto es necesario si quieres que servicios externos te envíen Webhooks.
```powershell
cloudflared tunnel run saas-erp-local --url http://localhost:8080
```

## 4️⃣ Verificación
Una vez corriendo, Cloudflare te dará una URL tipo `https://saas-erp-local.trycloudflare.com`.

1. Abre esa URL en tu celular.
2. Ve a Configuración > WhatsApp.
3. El QR ahora debería ser visible y escaneable desde cualquier lugar.

---

## 🧪 Pruebas realizadas
*   [x] **Motor de WhatsApp:** Evolution API (Baileys) está corriendo en `localhost:8080`.
*   [x] **Persistencia:** Las sesiones se guardan en el volumen de Docker.
*   [x] **Conectividad:** El backend .NET está configurado para hablar con el puerto 8080.
