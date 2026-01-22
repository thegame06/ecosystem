# Cloudflare Tunnel Setup - WhatsApp Webhook

Este documento explica cómo exponer el webhook de WhatsApp usando **Cloudflare Tunnel** (gratuito).

---

## ¿Por qué Cloudflare Tunnel?

✅ **Gratuito** (sin límites de ancho de banda)  
✅ **HTTPS automático** (certificado SSL incluido)  
✅ **Sin abrir puertos** en el firewall  
✅ **URL persistente** (no cambia en cada reinicio)  
✅ **Más seguro** que ngrok para producción

---

## Instalación

### Windows (PowerShell como Administrador)

```powershell
# Descargar cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# Mover a una ubicación permanente
Move-Item cloudflared.exe C:\Windows\System32\cloudflared.exe
```

### Verificar instalación

```powershell
cloudflared --version
```

---

## Configuración Rápida (Sin cuenta Cloudflare)

### Modo Quick Tunnel (Temporal)

```powershell
# Exponer backend en puerto 7001 (ajustar según tu configuración)
cloudflared tunnel --url https://localhost:7001
```

**Salida esperada:**
```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://random-name-123.trycloudflare.com
```

⚠️ **Nota**: Esta URL es temporal y cambia en cada reinicio.

---

## Configuración Permanente (Recomendado para Producción)

### 1. Crear cuenta Cloudflare (gratis)

- Ir a https://dash.cloudflare.com/sign-up
- Crear cuenta gratuita

### 2. Autenticar cloudflared

```powershell
cloudflared tunnel login
```

Esto abrirá el navegador para autorizar.

### 3. Crear un tunnel permanente

```powershell
# Crear tunnel
cloudflared tunnel create saas-whatsapp-webhook

# Esto generará un archivo de credenciales en:
# C:\Users\<TU_USUARIO>\.cloudflared\<TUNNEL_ID>.json
```

### 4. Configurar el tunnel

Crear archivo `config.yml` en `C:\Users\<TU_USUARIO>\.cloudflared\config.yml`:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\<TU_USUARIO>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: saas-webhook.tudominio.com
    service: https://localhost:7001
    originRequest:
      noTLSVerify: true
  - service: http_status:404
```

### 5. Configurar DNS en Cloudflare

```powershell
cloudflared tunnel route dns saas-whatsapp-webhook saas-webhook.tudominio.com
```

### 6. Ejecutar el tunnel

```powershell
cloudflared tunnel run saas-whatsapp-webhook
```

---

## Configurar como Servicio de Windows (Opcional)

Para que el tunnel se ejecute automáticamente al iniciar Windows:

```powershell
cloudflared service install
```

---

## Testing del Webhook

Una vez que tengas la URL pública (ej: `https://saas-webhook.tudominio.com`), prueba:

### Test 1: Verificación

```powershell
$url = "https://saas-webhook.tudominio.com/api/webhooks/whatsapp/<COMPANY_ID>?hub.mode=subscribe&hub.verify_token=saas-verify-token&hub.challenge=123456"

Invoke-WebRequest -Uri $url -Method GET
```

**Respuesta esperada**: `123456`

### Test 2: Mensaje Mock

```powershell
$url = "https://saas-webhook.tudominio.com/api/webhooks/whatsapp/<COMPANY_ID>"

$payload = @{
    object = "whatsapp_business_account"
    entry = @(
        @{
            changes = @(
                @{
                    value = @{
                        messages = @(
                            @{
                                from = "50512345678"
                                type = "text"
                                text = @{ body = "Test message" }
                            }
                        )
                    }
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri $url -Method POST -Body $payload -ContentType "application/json"
```

**Respuesta esperada**: `200 OK`

---

## Configurar en Meta Business API

Cuando tengas credenciales de Meta:

1. Ir a **Meta App Dashboard** > **WhatsApp** > **Configuration**
2. En **Webhook**, configurar:
   - **Callback URL**: `https://saas-webhook.tudominio.com/api/webhooks/whatsapp/<COMPANY_ID>`
   - **Verify Token**: El mismo configurado en `WhatsAppSettings.VerifyToken`
3. Suscribirse a eventos: `messages`

---

## Troubleshooting

### Error: "tunnel credentials file not found"

```powershell
# Verificar que el archivo existe
ls C:\Users\<TU_USUARIO>\.cloudflared\
```

### Error: "connection refused"

- Verificar que el backend está corriendo en `https://localhost:7001`
- Verificar que el puerto es correcto en `config.yml`

### Logs del tunnel

```powershell
cloudflared tunnel --loglevel debug --url https://localhost:7001
```

---

## Alternativas

Si prefieres otra herramienta:

- **ngrok**: `ngrok http https://localhost:7001`
- **localtunnel**: `lt --port 7001 --subdomain saas-webhook`

---

## Seguridad

✅ Cloudflare Tunnel **NO expone** tu IP pública  
✅ Todo el tráfico pasa por Cloudflare  
✅ Protección DDoS incluida  
✅ Logs de acceso en Cloudflare Dashboard

---

## Siguiente Paso

Una vez que el webhook esté público y validado:

1. ✅ Webhook responde correctamente
2. ✅ Logs muestran requests entrantes
3. ✅ Conversaciones se crean en MongoDB
4. 🔜 Conectar credenciales reales de Meta
5. 🔜 Testing con mensajes reales de WhatsApp

---

**Webhook Status**: ⏳ Pendiente de exposición pública
