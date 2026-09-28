# 📦 Proyecto Semana 07 — API de Mensajería con Autenticación JWT

API REST construida con **Express + TypeScript + MongoDB** que implementa un
sistema de autenticación completo con **bcrypt**, **access/refresh tokens** y
**cookies HttpOnly**, protegiendo el recurso principal del dominio asignado.

---

## 🎯 Dominio Asignado

> **Dominio:** Empresa de Mensajería / Courier

La aplicación simula el backend de una empresa de envíos, donde los
coordinadores y conductores gestionan los paquetes que se transportan entre
ciudades. Cada envío queda asociado al usuario autenticado que lo registró,
de modo que la trazabilidad quede garantizada desde la base de datos.

### Recurso principal: Envíos (`packages`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `code` | `string` | Código de seguimiento único, formato `ENV-XXXX` |
| `status` | `enum` | `Pendiente`, `En transito`, `Entregado`, `Cancelado` |
| `origin` | `string` | Ciudad o punto de recogida del paquete |
| `destination` | `string` | Ciudad o dirección de entrega |
| `customerName` | `string` | Cliente que recibe el envío |
| `weight` | `number` | Peso en kilogramos (mayor que 0) |
| `createdBy` | `ObjectId` | Usuario autenticado que creó el envío |
| `assignedDriver` | `ObjectId` | Conductor asignado (opcional) |
| `createdAt` / `updatedAt` | `Date` | Timestamps automáticos de Mongoose |

### Reglas de negocio aplicadas

- El código de seguimiento es **único**; si se repite se responde `409`.
- El código se normaliza siempre a mayúsculas antes de guardarse.
- El **origen y el destino no pueden ser iguales**.
- El peso debe ser mayor que `0` y no superar `1000 kg`.
- El campo `createdBy` **nunca se recibe por body**: se toma del token.

---

## ✅ Endpoints Implementados

### Autenticación

| Método | Ruta | Descripción | Respuesta |
|--------|------|-------------|-----------|
| `POST` | `/api/v1/auth/register` | Registro con contraseña hasheada | `201` |
| `POST` | `/api/v1/auth/login` | Emite access + refresh en cookies | `200` |
| `GET` | `/api/v1/auth/me` | Perfil del usuario autenticado | `200` |
| `POST` | `/api/v1/auth/refresh` | Renueva tokens con rotación | `200` |
| `POST` | `/api/v1/auth/logout` | Invalida refresh y limpia cookies | `200` |

### Envíos (todas protegidas con `authMiddleware`)

| Método | Ruta | Descripción | Respuesta |
|--------|------|-------------|-----------|
| `GET` | `/api/v1/packages` | Lista todos los envíos | `200` |
| `GET` | `/api/v1/packages/:id` | Obtiene un envío por ID | `200` / `404` |
| `POST` | `/api/v1/packages` | Crea un envío validado con Zod | `201` |
| `PATCH` | `/api/v1/packages/:id` | Actualización parcial del envío | `200` |
| `DELETE` | `/api/v1/packages/:id` | Elimina el envío | `204` |

Cualquier petición a `/api/v1/packages` sin la cookie `accessToken` responde
`401 No autenticado`.

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
    ├── app.ts                            # Monta auth + packages router
    ├── server.ts                         # connectDB + listen
    ├── lib/
    │   └── mongoose.ts                   # Conexión y desconexión de MongoDB
    ├── errors/
    │   └── AppError.ts                   # Error con statusCode
    ├── types/
    │   └── express.d.ts                  # Tipado global de req.user
    ├── utils/
    │   └── jwt.ts                        # Firma y verificación de tokens
    ├── middlewares/
    │   ├── auth.middleware.ts            # Valida cookie accessToken
    │   ├── errorHandler.ts               # Zod, Mongoose y AppError
    │   └── notFound.ts                   # Ruta inexistente → 404
    ├── schemas/
    │   ├── auth.schema.ts                # register / login
    │   └── package.schema.ts             # create / update / params
    ├── models/
    │   ├── user.model.ts                 # Usuario + ocultado de password
    │   └── package.model.ts              # Modelo de envíos
    ├── repositories/
    │   ├── users.repository.ts           # Consultas de usuarios
    │   └── package.repository.ts         # Consultas de envíos
    ├── services/
    │   ├── auth.service.ts               # Lógica de autenticación
    │   └── package.service.ts            # Lógica de negocio de envíos
    ├── controllers/
    │   ├── auth.controller.ts            # Cookies y respuestas HTTP
    │   └── package.controller.ts         # CRUD de envíos
    └── routes/
        ├── auth.routes.ts                # Rutas de autenticación
        └── package.routes.ts             # Rutas CRUD protegidas
```

La arquitectura sigue el patrón por capas: **rutas → controladores →
servicios → repositorios → modelos**, lo que permite mantener la lógica de
negocio separada de la capa HTTP y del acceso a la base de datos.

---

## 🛠️ Cómo Ejecutar el Proyecto

### 1. Instalar dependencias

```bash
cd starter
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

El archivo `.env` debe contener:

```env
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
MONGO_URI=mongodb://127.0.0.1:27017/mensajeria_jwt
JWT_ACCESS_SECRET=<secreto largo y aleatorio>
JWT_REFRESH_SECRET=<otro secreto distinto al anterior>
```

Los secretos se pueden generar con:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 3. Levantar MongoDB

```bash
docker compose up -d
```

### 4. Verificar tipos y arrancar

```bash
npx tsc --noEmit
pnpm dev
```

La API queda disponible en `http://localhost:3000`.

---

## 🧪 Ejemplos de Uso

### Registro

```http
POST /api/v1/auth/register
```

```json
{
  "email": "courier@test.com",
  "password": "Test1234!",
  "name": "Coordinador Courier"
}
```

### Login

```http
POST /api/v1/auth/login
```

Devuelve el usuario en el body y los tokens en encabezados `Set-Cookie`:

```
accessToken=...; HttpOnly; Path=/; Max-Age=900
refreshToken=...; HttpOnly; Path=/; Max-Age=604800
```

### Crear un envío

```http
POST /api/v1/packages
```

```json
{
  "code": "ENV-9201",
  "status": "Pendiente",
  "origin": "Medellin",
  "destination": "Bogota",
  "customerName": "Distribuciones Nacionales",
  "weight": 4.2
}
```

### Actualizar el estado del envío

```http
PATCH /api/v1/packages/:id
```

```json
{
  "status": "Entregado"
}
```

---

## 📸 Evidencias

Las capturas se encuentran en la carpeta `screenshots/`:

| Archivo | Evidencia |
|---------|-----------|
| `01-register-201.png` | Registro exitoso sin exponer la contraseña |
| `02-login-cookies-200.png` | Login con cookies `HttpOnly` |
| `03-auth-me-200.png` | Perfil del usuario autenticado |
| `04-packages-create-201.png` | Creación de envío |
| `05-packages-list-200.png` | Listado de envíos |
| `06-packages-detail-200.png` | Envío obtenido por ID |
| `07-packages-update-200.png` | Actualización parcial del envío |
| `08-packages-delete-204.png` | Eliminación del envío |
| `09-packages-unauthorized-401.png` | Acceso sin cookie rechazado |
| `10-refresh-200.png` | Renovación de sesión con rotación |
| `11-logout.png` | Cierre de sesión |
| `12-logout-refresh-401.png` | Refresh posterior al logout rechazado |

---

## 🔐 Seguridad Implementada

| Criterio | Implementación |
|----------|----------------|
| Contraseñas hasheadas | `bcrypt.hash(password, 10)` antes de guardar |
| Contraseña oculta | `select: false` y transformación en `toJSON` |
| Secrets distintos | `JWT_ACCESS_SECRET` ≠ `JWT_REFRESH_SECRET` |
| Tokens en cookies | `httpOnly`, `sameSite`, nunca en el body |
| Duración del access | 15 minutos |
| Duración del refresh | 7 días |
| Refresh hasheado en DB | Se guarda `refreshTokenHash`, nunca el token |
| Rotación | Cada `/refresh` genera y guarda un nuevo hash |
| Logout real | Se coloca `refreshTokenHash` en `null` |
| Rutas protegidas | `packageRouter.use(authMiddleware)` |
| Sin secretos en código | Todo vive en `.env` (ignorado por Git) |

---

## 🧰 Tecnologías Utilizadas

- **Express 4** — framework HTTP
- **TypeScript** — tipado estático en modo estricto
- **MongoDB + Mongoose** — persistencia y modelado de datos
- **Zod** — validación de entradas
- **bcrypt** — hash de contraseñas y refresh tokens
- **jsonwebtoken** — emisión y verificación de JWT
- **cookie-parser** — lectura de cookies HttpOnly
- **Docker Compose** — contenedor de MongoDB
- **pnpm** — gestor de paquetes

---

## 📝 Notas Finales

El proyecto no utiliza el nombre genérico `resource`: todos los archivos del
recurso principal fueron renombrados a `package.*` para reflejar el dominio de
mensajería. El campo `createdBy` se obtiene siempre del token verificado, de
manera que un usuario no puede suplantar la autoría de un envío enviándolo
manualmente en el body.