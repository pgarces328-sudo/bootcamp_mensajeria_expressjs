# Seguridad API Semana 08 — RBAC, Helmet, CORS y Rate Limiting

API REST construida con **Express + TypeScript + MongoDB** que integra
capas de seguridad completas: RBAC con roles, Helmet, CORS con whitelist,
rate limiting diferenciado y sanitización de entradas, aplicadas al dominio
de mensajería/courier.

---

## Dominio

Empresa de mensajería / Courier.

### Recurso principal: Paquetes (`packages`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| code | string | Código único ENV-XXXX |
| status | enum | Pendiente / En tránsito / Entregado / Cancelado |
| origin | string | Ciudad de recogida |
| destination | string | Ciudad de entrega |
| customerName | string | Cliente que recibe |
| weight | number | Peso en kg |
| createdBy | ObjectId | Usuario autenticado |
| assignedDriver | ObjectId | Conductor asignado |

---

## Roles y Permisos

| Rol | Ver paquetes | Crear paquete | Actualizar | Eliminar |
|-----|-------------|---------------|------------|----------|
| user/driver | Sí | Sí | No | No |
| admin | Sí | Sí | Sí | Sí |
| Sin token | No | No | No | No |

---

## Endpoints

### Autenticación

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | /api/v1/auth/register | Público |
| POST | /api/v1/auth/login | Público |
| GET | /api/v1/auth/me | Autenticado |
| POST | /api/v1/auth/refresh | Refresh token |
| POST | /api/v1/auth/logout | Autenticado |

### Paquetes

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | /api/v1/packages | Autenticado |
| GET | /api/v1/packages/:id | Autenticado |
| POST | /api/v1/packages | Autenticado |
| PATCH | /api/v1/packages/:id | Autenticado |
| DELETE | /api/v1/packages/:id | Solo admin |

---

## Seguridad Implementada

| Capa | Herramienta | Detalle |
|------|------------|---------|
| Headers HTTP | Helmet | X-Content-Type-Options: nosniff |
| CORS | cors con whitelist | Solo orígenes del .env |
| Rate limit global | express-rate-limit | 100 req / 15 min |
| Rate limit auth | express-rate-limit | 5 req / 15 min |
| RBAC | requireRole() | 401 sin token, 403 sin permiso |
| NoSQL injection | express-mongo-sanitize | Limpia $gt, $ne, etc |
| Cookies | httpOnly + sameSite | Nunca en body ni localStorage |
| Secretos | Solo en .env | JWT_ACCESS_SECRET y JWT_REFRESH_SECRET |
| Errores | errorHandler | Sin stack traces expuestos |

---

## Estructura

```
starter/
├── package.json
├── tsconfig.json
├── .env.example
├── docker-compose.yml
├── screenshots/
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/security.ts
    ├── errors/AppError.ts
    ├── lib/mongoose.ts
    ├── types/express.d.ts
    ├── utils/jwt.ts
    ├── middlewares/auth.middleware.ts
    ├── middlewares/requireRole.ts
    ├── middlewares/errorHandler.ts
    ├── middlewares/notFound.ts
    ├── schemas/auth.schema.ts
    ├── schemas/package.schema.ts
    ├── models/user.model.ts
    ├── models/package.model.ts
    ├── repositories/users.repository.ts
    ├── repositories/package.repository.ts
    ├── services/auth.service.ts
    ├── services/package.service.ts
    ├── controllers/auth.controller.ts
    ├── controllers/package.controller.ts
    └── routes/
        ├── auth.routes.ts
        └── package.routes.ts
```

---

## Ejecutar

```bash
cd starter
pnpm install
cp .env.example .env
docker compose up -d
npx tsc --noEmit
pnpm dev
```

---

## Evidencias

Capturas en `starter/screenshots/`:

| Archivo | Evidencia |
|---------|-----------|
| 01-helmet-headers.png | X-Content-Type-Options: nosniff |
| 02-register-admin-201.png | Registro admin |
| 03-login-admin-cookies-200.png | Login con cookies HttpOnly |
| 04-auth-me-admin-200.png | Perfil autenticado |
| 05-packages-create-201.png | Crear paquete |
| 06-packages-list-200.png | Listar paquetes |
| 07-packages-detail-200.png | Detalle del paquete |
| 08-packages-update-admin-200.png | Actualizar paquete |
| 09-register-driver-201.png | Registro driver |
| 10-login-driver-200.png | Login driver |
| 11-delete-driver-403.png | RBAC: 403 sin permisos |
| 12-unauthorized-401.png | 401 sin token |
| 13-delete-admin-204.png | Admin elimina |
| 14-cors-allowed.png | CORS whitelist |
| 15-cors-rejected.png | CORS rechazado |
| 16-ratelimit-429.png | Rate limit 429 |