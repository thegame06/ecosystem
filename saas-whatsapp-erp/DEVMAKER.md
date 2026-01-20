# DevMaker - Tareas de desarrollo

Este archivo centraliza los comandos clave para levantar y mantener el ambiente de desarrollo del proyecto SaaS WhatsApp ERP.

## Uso rápido

### Linux/Mac
```sh
chmod +x dev-maker.sh
./dev-maker.sh up        # Levanta MongoDB, backend y frontend
./dev-maker.sh down      # Detiene MongoDB
./dev-maker.sh clean-db  # Limpia la base de datos local
```

### Windows (PowerShell)
```powershell
.cdev-maker up        # Levanta MongoDB, backend y frontend
.cdev-maker down      # Detiene MongoDB
.cdev-maker clean-db  # Limpia la base de datos local
```
*Nota:* PowerShell requiere el prefijo `./` o `.c` para ejecutar scripts del directorio actual.

## Extensión
Puedes agregar nuevas tareas (migrar, deploy, staging, etc.) editando los scripts dev-maker.sh y dev-maker.ps1.

## Requisitos
- Docker
- .NET 7+
- Node.js/NPM

## Notas
- Los procesos backend/frontend se levantan en segundo plano. Detenerlos manualmente si es necesario.
- Para staging/cloud, agrega nuevas funciones/tareas según el flujo del equipo.

---

Para dudas, consulta este archivo o contacta al CTO.
