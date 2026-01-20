#!/bin/bash
# DevMaker - Tareas de desarrollo SaaS WhatsApp ERP

function up() {
  echo "Levantando MongoDB (Docker)..."
  cd backend && docker-compose up -d
  echo "Levantando backend (.NET)..."
  cd src/SaaS.Api && dotnet run --launch-profile https  &
  cd ../../../..
  echo "Levantando frontend (Vite)..."
  cd frontend/backoffice && npm install && npm run dev &
  cd ../../..
  echo "Ambiente de desarrollo levantado."
}

function down() {
  echo "Deteniendo MongoDB (Docker)..."
  cd backend && docker-compose down
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
