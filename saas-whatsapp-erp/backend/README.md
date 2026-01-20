# Ambiente Local Backend SaaS WhatsApp ERP

## Requisitos
- Docker
- .NET 7+ SDK

## Levantar MongoDB local

1. Ir a la carpeta `backend`:
   ```sh
   cd backend
   ```
2. Levantar MongoDB con Docker:
   ```sh
   docker-compose up -d
   ```
   Esto crea un contenedor MongoDB accesible en `localhost:27017` con usuario `root` y password `example`.

## Configuración de conexión

La conexión local está definida en `src/SaaS.Api/appsettings.Development.json`:
```json
"MongoDB": {
  "ConnectionString": "mongodb://root:example@localhost:27017",
  "DatabaseName": "saas_erp_local"
}
```

Para cambiar de base de datos, edita el archivo correspondiente (`appsettings.Development.json`, `appsettings.json`, etc.)

## Levantar el backend

1. Ir a la carpeta del proyecto API:
   ```sh
   cd src/SaaS.Api
   ```
2. Ejecutar:
   ```sh
   dotnet run --launch-profile Development
   ```

## Validación
- El backend debe iniciar sin errores de conexión.
- Puedes acceder a Swagger en `http://localhost:5000/swagger` (o el puerto configurado).

---

Para dudas o problemas, revisa la configuración y asegúrate que Docker y .NET estén instalados correctamente.
