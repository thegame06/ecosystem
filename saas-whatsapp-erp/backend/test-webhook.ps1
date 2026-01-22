# WhatsApp Webhook Testing Script
# Simula llamadas de Meta para validar el webhook sin credenciales reales

$baseUrl = "https://localhost:7001" # Ajustar según tu puerto
$companyId = "YOUR_COMPANY_ID_HERE" # Reemplazar con un ID real de MongoDB
$verifyToken = "saas-verify-token" # Debe coincidir con WhatsAppSettings.VerifyToken

Write-Host "🧪 WhatsApp Webhook Testing" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Test 1: Verificación de Webhook (GET)
Write-Host "📋 Test 1: Webhook Verification (GET)" -ForegroundColor Yellow
Write-Host "Simulating Meta verification request...`n"

$verifyUrl = "$baseUrl/api/webhooks/whatsapp/$companyId`?hub.mode=subscribe&hub.verify_token=$verifyToken&hub.challenge=1234567890"

try {
    $response = Invoke-WebRequest -Uri $verifyUrl -Method GET -SkipCertificateCheck
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Response: $($response.Content)" -ForegroundColor Green
    Write-Host "Expected: 1234567890`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)`n" -ForegroundColor Red
}

# Test 2: Mensaje Entrante (POST)
Write-Host "`n📋 Test 2: Incoming Message (POST)" -ForegroundColor Yellow
Write-Host "Simulating incoming WhatsApp message...`n"

$messageUrl = "$baseUrl/api/webhooks/whatsapp/$companyId"

$payload = @{
    object = "whatsapp_business_account"
    entry = @(
        @{
            id = "WABA_ID"
            changes = @(
                @{
                    value = @{
                        messaging_product = "whatsapp"
                        metadata = @{
                            display_phone_number = "15551234567"
                            phone_number_id = "PHONE_NUMBER_ID"
                        }
                        contacts = @(
                            @{
                                profile = @{
                                    name = "Test User"
                                }
                                wa_id = "50512345678"
                            }
                        )
                        messages = @(
                            @{
                                from = "50512345678"
                                id = "wamid.test123"
                                timestamp = "1234567890"
                                type = "text"
                                text = @{
                                    body = "Hola, quiero información sobre productos"
                                }
                            }
                        )
                    }
                    field = "messages"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri $messageUrl -Method POST -Body $payload -ContentType "application/json" -SkipCertificateCheck
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Message should be processed and conversation created`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)`n" -ForegroundColor Red
}

# Test 3: Verificación con Token Incorrecto
Write-Host "`n📋 Test 3: Invalid Token (should fail)" -ForegroundColor Yellow
Write-Host "Testing with wrong verify token...`n"

$invalidUrl = "$baseUrl/api/webhooks/whatsapp/$companyId`?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=1234567890"

try {
    $response = Invoke-WebRequest -Uri $invalidUrl -Method GET -SkipCertificateCheck
    Write-Host "❌ Should have failed but got: $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Correctly rejected with 403 Forbidden" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "🏁 Testing Complete" -ForegroundColor Cyan
Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check backend logs for [Webhook] entries"
Write-Host "2. Verify conversation was created in MongoDB"
Write-Host "3. Setup Cloudflare Tunnel for public HTTPS URL"
Write-Host "4. Configure Meta Business API with tunnel URL`n"
