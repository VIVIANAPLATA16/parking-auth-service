# parking-auth-service

Microservicio de autenticación centralizado para Parking International.
Construido con Node.js, TypeScript y Serverless Framework v4.

## Stack

- Node.js 20 + TypeScript
- Serverless Framework v4 + serverless-offline
- Prisma 7 + PostgreSQL 15
- JWT — access token 15 min + refresh token 7 días
- bcryptjs — hash seguro de contraseñas
- Docker + Docker Compose

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- Serverless Framework v4 (`npm install -g serverless`)

## Instalación y ejecución local

**1. Clona el repositorio**

    git clone https://github.com/VIVIANAPLATA16/parking-auth-service.git
    cd parking-auth-service

**2. Instala dependencias**

    npm install

**3. Configura variables de entorno**

    cp .env.example .env

**4. Levanta la base de datos**

    docker compose up -d

**5. Ejecuta las migraciones**

    npm run db:migrate

**6. Genera el cliente de Prisma**

    npm run db:generate

**7. Inicia el servidor**

    npm run dev -- --httpPort 3001

El servidor queda disponible en http://localhost:3001

## Endpoints

### POST /auth/register
Registra un nuevo usuario.

    curl -X POST http://localhost:3001/auth/register \
      -H "Content-Type: application/json" \
      -d '{"email": "usuario@ejemplo.com", "password": "123456"}'

Respuesta 201:

    { "message": "Usuario registrado exitosamente", "user": { "id": "uuid", "email": "...", "createdAt": "..." } }

---

### POST /auth/login
Autentica un usuario y retorna access token y refresh token.

    curl -X POST http://localhost:3001/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "usuario@ejemplo.com", "password": "123456"}'

Respuesta 200:

    { "accessToken": "eyJ...", "refreshToken": "uuid" }

---

### POST /auth/refresh
Emite un nuevo access token usando el refresh token vigente.

    curl -X POST http://localhost:3001/auth/refresh \
      -H "Content-Type: application/json" \
      -d '{"refreshToken": "uuid"}'

Respuesta 200:

    { "accessToken": "eyJ..." }

---

### POST /auth/logout
Invalida el refresh token activo del usuario.

    curl -X POST http://localhost:3001/auth/logout \
      -H "Content-Type: application/json" \
      -d '{"refreshToken": "uuid"}'

Respuesta 200:

    { "message": "Sesión cerrada exitosamente" }

---

### GET /auth/me
Retorna los datos del usuario autenticado. Requiere access token válido.

    curl -X GET http://localhost:3001/auth/me \
      -H "Authorization: Bearer eyJ..."

Respuesta 200:

    { "user": { "id": "uuid", "email": "...", "createdAt": "...", "updatedAt": "..." } }

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| DATABASE_URL | URL de conexión a PostgreSQL | postgresql://user:pass@localhost:5434/parking_auth |
| JWT_ACCESS_SECRET | Secreto para firmar access tokens | secreto_seguro |
| JWT_REFRESH_SECRET | Secreto para firmar refresh tokens | otro_secreto |
| JWT_ACCESS_EXPIRES_IN | Duración del access token | 15m |
| JWT_REFRESH_EXPIRES_IN | Duración del refresh token | 7d |
| PORT | Puerto del servidor | 3000 |

## Estructura del proyecto

    parking-auth-service/
    ├── prisma/
    │   ├── migrations/
    │   └── schema.prisma
    ├── src/
    │   ├── handlers/
    │   │   └── auth.ts
    │   ├── services/
    │   │   ├── jwt.service.ts
    │   │   └── prisma.service.ts
    │   └── types/
    │       └── express.d.ts
    ├── .env.example
    ├── docker-compose.yml
    ├── serverless.yml
    └── tsconfig.json

## Licencia

MIT License — Copyright (c) 2026 Viviana Plata

## Autor

Viviana Plata — [github.com/VIVIANAPLATA16](https://github.com/VIVIANAPLATA16)
