# System Architecture - MVP

## Goal
Arquitectura simple, clara y disciplinada usando MongoDB Free Tier para permitir a las PYMEs vender y comunicarse por WhatsApp.

---

## Technical Stack
- **Backend:** .NET 10 (ASP.NET Web API)
- **Infrastructure:** Clean Architecture (lightweight)
- **Database:** MongoDB Atlas (Free Tier)
- **Frontend:** React + TypeScript
- **Deployment:** Single monolith deployment

---

## Directory Structure
```text
/backend
└── src
    ├── Api             # Controllers & Configuration
    ├── Application     # Use Cases, DTOs & Interfaces
    ├── Domain         # Documents, Enums & Value Objects
    └── Infrastructure  # Repositories & Integrations
```

```text
/frontend
 ├── src
 │   ├── pages          # WhatsApp, Sales, Invoices, Settings
 │   ├── components     # Reusable UI elements
 │   ├── services       # API client
 │   └── auth           # Auth logic
```

---

## Architecture Principles
1. **Multi-tenant by default:** Every collection must have `companyId`.
2. **Modular Monolith:** Logic is grouped by domain features.
3. **Stateless API:** Use JWT for authentication.
4. **Document-oriented:** Use MongoDB for flexibility but maintain strict validation in Domain layer.

---

## Commercial States
The system follows a strict state machine for the commercial lifecycle:
1. `LEAD`
2. `SALE_CREATED`
3. `INVOICED`
4. `PAID`
