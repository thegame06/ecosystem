# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview.1-alpine AS build
WORKDIR /app

# Copy solution and project files
COPY *.sln .
COPY src/SaaS.Api/*.csproj src/SaaS.Api/
COPY src/SaaS.Application/*.csproj src/SaaS.Application/
COPY src/SaaS.Domain/*.csproj src/SaaS.Domain/
COPY src/SaaS.Infrastructure/*.csproj src/SaaS.Infrastructure/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Publish
WORKDIR /app/src/SaaS.Api
RUN dotnet publish -c Release -o /app/out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview.1-alpine AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SaaS.Api.dll"]
