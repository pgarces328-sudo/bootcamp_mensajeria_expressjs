# 🔐 Proyecto Semana 08 — API de Mensajería Segura con RBAC y Capas de Seguridad

API REST construida con **Express + TypeScript + MongoDB** que integra
todas las capas de seguridad aprendidas: **RBAC con roles**, **Helmet**,
**CORS con whitelist**, **rate limiting diferenciado** y **sanitización de
entradas**, aplicadas al dominio de mensajería / courier.

---

## 🎯 Dominio Asignado

> **Dominio:** Empresa de Mensajería / Courier

El backend gestiona paquetes que se transportan entre ciudades. Cada envío
queda asociado al usuario autenticado que lo registró. La seguridad
protege la integridad de los datos y controla quién puede consultar,
crear, modificar y eliminar envíos según su rol.

### Recurso principal: Paquetes (`packages`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `code` | `string` | Código de seguimiento único, formato `ENV-XXXX` |
| `status` | `enum` | `Pendiente`, `En tránsito`, `Entregado`, `Cancelado` |
| `origin` | `string` | Ciudad o punto de recogida |
| `destination` | `string` | Ciudad o dirección de entrega |
| `customerName` | `string` | Cliente que recibe el envío |
| `weight` | `number` | Peso en kilogramos (mayor que 0) |
| `createdBy` | `ObjectId` | Usuario autenticado que creó el envío |
| `assignedDriver` | `ObjectId` | Conductor asignado (opcional) |

---

## 📋 Tabla de Roles y Permisos

| Rol | Ver paquetes | Crear paquete | Actualizar paquete | Eliminar paquete | Ver panel admin |
|-----|:---:|:---:|:---:|:---:|:---:|
| `user` / `driver` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sin token | ❌ | ❌ | ❌ | ❌ | ❌ |

- **401 Unauthorized** → sin token o token inválido.
- **403 Forbidden** → token válido pero rol insuficiente.

---

## 🔗 Endpoints

### Autenticación

| Método | Ruta | Acceso requerido |
|--------|------|-----------------|
| `POST` | `/api/v1/auth/register` | Público |
| `POST` | `/api/v1/auth/login` | Público |
| `GET` | `/api/v1/auth/me` | `authMiddleware` |
| `POST` | `/api/v1/auth/refresh` | Cookie `refreshToken` |
| `POST` | `/api/v1/auth/logout` | Cookie `refreshToken` |

### Paquetes

| Método | Ruta | Acceso requerido |
|--------|------|-----------------|
| `GET` | `/api/v1/packages` | `authMiddleware` |
| `GET` | `/api/v1/packages/:id` | `authMiddleware` |
| `POST` | `/api/v1/packages` | `authMiddleware` |
| `PATCH` | `/api/v1/packages/:id` | `authMiddleware` |
| `DELETE` | `/api/v1/packages/:id` | `authMiddleware` + `requireRole('admin')` |

---

## 🔐 Capas de Seguridad Implementadas

### 1. Helmet

Configurado en `src/config/security.ts`. Activa cabeceras HTTP de
seguridad en **todas** las respuestas, incluyendo:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-DNS-Prefetch-Control: off`
- `X-Download-Options: noopen`
- `Referrer-Policy`

Estas cabeceras impiden que un navegador interprete archivos como
ejecutables o incruste la API dentro de marcos externos.

### 2. CORS con whitelist

El origen de cada petición se compara contra la variable de entorno
`CORS_WHITELIST`:

```env
CORS_WHITELIST=http://localhost:5173,http://localhost:3000
```

- Origen permitido → recibe `Access-Control-Allow-Origin`.
- Origen no permitido → responde `403 Forbidden`.
- Nunca se usa `Access-Control-Allow-Origin: *`.

### 3. Rate Limiting diferenciado

| Límite | Ventana | Aplicado en |
|--------|---------|-------------|
| **100** solicitudes | 15 minutos | Toda la API (global) |
| **5** solicitudes | 15 minutos | Solo `/api/v1/auth/*` |

Al exceder el límite, la API responde `429 Too Many Requests` con un
mensaje seguro que no revela información interna.

### 4. RBAC con `requireRole()`

Middleware de autorización que devuelve:
- `401` si no hay token o es inválido.
- `403` si el rol del token no está en la lista permitida.
- `next()` si todo es correcto.

Aplicado en:
- `DELETE /packages/:id` → solo `admin`.
- Todas las rutas de paquetes → `authMiddleware`.

### 5. Sanitización de entradas (NoSQL Injection)

`express-mongo-sanitize` limpia automáticamente caracteres especiales de
MongoDB (`$gt`, `$ne`, `$where`, etc.) antes de que lleguen a las
consultas. Esto impide que un atacante envíe:

```json
{
  "email": { "$gt": "" },
  "password": { "$gt": "" }
}
```

para saltarse la autenticación.

### 6. Cookies seguras

- `httpOnly: true` — inaccesibles desde JavaScript del navegador.
- `sameSite: 'lax'` — previene CSRF básico.
- `secure` — activo solo en producción (requiere HTTPS).
- Los tokens **nunca** se devuelven en el body.

### 7. Mensajes de error seguros

El `errorHandler` centralizado nunca expone stack traces ni nombres
internos de módulos:

```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

Solo en desarrollo se imprime el detalle en la consola del servidor.

### 8. Secretos en variables de entorno

`JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` son distintos y solo viven
en `.env`. Nunca aparecen en el código fuente.

---

## 🗂️ Estructura del Proyecto

```
starter/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── .env.example
├── docker-compose.yml
├── screenshots/
└── src/
    ├── app.ts                              # Monta Helmet, CORS, rate limit, rutas
    ├── server.ts                           # connectDB + listen
    ├── config/
    │   └── security.ts                     # Helmet, CORS whitelist, rate limiters
    ├── errors/
    │   └── AppError.ts                     # Error con statusCode
    ├── lib/
    │   └── mongoose.ts                     # Conexión y desconexión de MongoDB
    ├── types/
    │   └── express.d.ts                    # Tipado global de req.user
    ├── utils/
    │   └── jwt.ts                          # Firma y verificación de tokens
    ├── middlewares/
    │   ├── auth.middleware.ts              # Valida cookie accessToken
    │   ├── requireRole.ts                  # RBAC: verifica roles permitidos
    │   ├── errorHandler.ts                 # Zod, AppError, CORS, sin stack traces
    │   └── notFound.ts                     # Ruta inexistente → 404
    ├── schemas/
    │   ├── auth.schema.ts                  # register / login
    │   └── package.schema.ts              # create / update / params
    ├── models/
    │   ├── user.model.ts                   # Usuario con roles y password oculto
    │   └── package.model.ts               # Modelo de envíos
    ├── repositories/
    │   ├── users.repository.ts             # Consultas de usuarios
    │   └── package.repository.ts           # Consultas de envíos
    ├── services/
    │   ├── auth.service.ts                 # Lógica de autenticación
    │   └── package.service.ts              # Lógica de negocio de envíos
    ├── controllers/
    │   ├── auth.controller.ts              # Cookies y respuestas HTTP
    │   └── package.controller.ts           # CRUD de envíos
    └── routes/
        ├── auth.routes.ts                  # Rutas de autenticación
        └── package.routes.ts               # Rutas CRUD con RBAC
```

---

## 🛠️ Cómo Ejecutar

```bash
cd starter
pnpm install
cp .env.example .env
```

Editar `.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27019/mensajeria_security
CORS_WHITELIST=http://localhost:5173,http://localhost:3000
JWT_ACCESS_SECRET=<secreto largo y aleatorio>
JWT_REFRESH_SECRET=<otro secreto distinto al anterior>
```

Generar secretos:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Levantar MongoDB y arrancar:

```bash
docker compose up -d
npx tsc --noEmit
pnpm dev
```

---

## 📸 Evidencias

Capturas en `starter/screenshots/`:

| Archivo | Evidencia |
|---------|-----------|
| `01-helmet-headers.png` | `X-Content-Type-Options: nosniff` visible en respuesta |
| `02-register-admin-201.png` | Registro de administrador sin exponer contraseña |
| `03-login-admin-cookies-200.png` | Login admin con cookies `HttpOnly` |
| `04-auth-me-admin-200.png` | Perfil del administrador autenticado |
| `05-packages-create-201.png` | Creación de paquete como admin |
| `06-packages-list-200.png` | Listado de paquetes |
| `07-packages-detail-200.png` | Detalle de un paquete por ID |
| `08-packages-update-admin-200.png` | Actualización de paquete como admin |
| `09-register-driver-201.png` | Registro de driver normal |
| `10-login-driver-200.png` | Login del driver |
| `11-delete-driver-403.png` | RBAC: driver recibe 403 al intentar eliminar |
| `12-unauthorized-401.png` | 401 al acceder sin token |
| `13-delete-admin-204.png` | Admin elimina paquete exitosamente |
| `14-cors-allowed.png` | CORS permite origen de la whitelist |
| `15-cors-rejected.png` | CORS rechaza origen no permitido |
| `16-ratelimit-429.png` | Rate limit devuelve 429 en auth |

---

## 🧰 Tecnologías

- **Express 4** — framework HTTP
- **TypeScript** — tipado estricto
- **MongoDB + Mongoose** — persistencia
- **helmet** — cabeceras de seguridad HTTP
- **cors** — control de orígenes con whitelist
- **express-rate-limit** — límite de solicitudes
- **express-mongo-sanitize** — protección contra NoSQL injection
- **bcrypt** — hash de contraseñas
- **jsonwebtoken** — JWT access/refresh
- **zod** — validación de entradas
- **Docker Compose** — MongoDB en contenedor
- **pnpm** — gestor de paquetes

---

## 📝 Notas Finales

Los archivos del recurso principal se llaman `package.*` (no `item.*`
ni `resource.*`) para reflejar el dominio de mensajería. La autorización
está centralizada en `requireRole()`, no hardcodeada en los controladores.
Ningún secreto aparece en el código fuente.