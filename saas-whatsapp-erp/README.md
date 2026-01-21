# SaaS WhatsApp ERP

Sistema SaaS para gestión de ventas y facturación "WhatsApp-First".

## 📚 Documentación

La documentación maestra del proyecto se encuentra en la carpeta `docs/`:

- **[Contexto del Producto](docs/context/product-definition.md)**: Visión, alcance y módulos.
- **[Arquitectura](docs/context/mvp-architecture.md)**: Stack tecnológico (.NET + React + MongoDB).
- **[Integración WhatsApp](docs/context/whatsapp-integration.md)**: ⚠️ **Alcance, límites y riesgos de WhatsApp**.
- **[Agentes](docs/agents/)**: Definición de roles y responsabilidades de los agentes AI.

## 🚀 Estructura del Proyecto

- `backend/`: API .NET 9.0 (Clean Architecture).
- `frontend/`: SPA React + Vite (Backoffice).
- `mobile/`: App React Native (Futuro POS móvil).
- `docs/`: Documentación sincronizada.

## 🛠 Setup Rápido

### Backend
Ver [backend/README.md](backend/README.md)
```bash
cd backend
docker-compose up -d
dotnet run --project src/SaaS.Api
```

### Frontend
```bash
cd frontend/backoffice
npm install
npm run dev
```

## 📊 Estado
Ver [PROJECT_STATUS.md](PROJECT_STATUS.md) para el estado actual.
