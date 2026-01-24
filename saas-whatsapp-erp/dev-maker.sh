#!/bin/bash
# DevMaker - Tareas de desarrollo SaaS WhatsApp ERP

function up() {
  echo "Levantando Infraestructura (Docker)..."
  cd backend && docker-compose up -d
  cd ..
  cd infrastructure/evolution && docker-compose up -d
  cd ../..
  
  echo "Levantando backend (.NET)..."
  cd backend/src/SaaS.Api && dotnet run --launch-profile https &
  cd ../../..
  
  echo "Levantando frontend (Vite)..."
  cd frontend/backoffice && npm install && npm run dev &
  cd ../..
  
  echo "Ambiente de desarrollo levantado con WhatsApp Gateway (Evolution API)."
}

function down() {
  echo "Deteniendo Infraestructura (Docker)..."
  cd backend && docker-compose down
  cd ..
  cd infrastructure/evolution && docker-compose down
  cd ../..
  echo "Deteniendo procesos locales (backend/frontend): manual"
}


function clean_db() {
  echo "Limpiando base de datos MongoDB local..."
  docker exec saas-mongo-local mongo saas_erp_local --eval "db.dropDatabase()"
}

case "$1" in
  up)
    up
    ;;
  down)
    down
    ;;
  clean-db)
    clean_db
    ;;
  *)
    echo "Uso: $0 {up|down|clean-db}"
    ;;
esac
