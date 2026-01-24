# DevMaker - Tareas de desarrollo SaaS WhatsApp ERP
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("up", "down", "clean-db")]
    [string]$Task
)

function Up {
    Write-Host "Levantando Infraestructura (Docker)..."
    Push-Location backend; docker-compose up -d; Pop-Location
    Push-Location infrastructure/evolution; docker-compose up -d; Pop-Location
    
    Write-Host "Levantando backend (.NET)..."
    Push-Location backend/src/SaaS.Api; Start-Process "dotnet" "run --launch-profile https "; Pop-Location
    
    Write-Host "Levantando frontend (Vite)..."
    Push-Location frontend/backoffice; npm install; Start-Process "npm" "run dev"; Pop-Location
    
    Write-Host "Ambiente de desarrollo levantado con WhatsApp Gateway (Evolution API)."
}

function Down {
    Write-Host "Deteniendo Infraestructura (Docker)..."
    Push-Location backend; docker-compose down; Pop-Location
    Push-Location infrastructure/evolution; docker-compose down; Pop-Location
    Write-Host "Deteniendo procesos locales (backend/frontend): manual"
}

function Clean-Db {
    Write-Host "Limpiando base de datos MongoDB local..."
    docker exec saas-mongo-local mongo saas_erp_local --eval "db.dropDatabase()"
}

switch ($Task) {
    "up" { Up }
    "down" { Down }
    "clean-db" { Clean-Db }
    default { Write-Host "Uso: .\dev-maker.ps1 [up|down|clean-db]" }
}
