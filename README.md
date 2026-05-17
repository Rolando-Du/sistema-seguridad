# Sistema de Seguridad

Sistema fullstack para la gestión, análisis, auditoría y visualización territorial de incidentes de seguridad.

Incluye administración de incidentes, bases operativas, usuarios, reportes, mapas, mapa de calor, auditoría y cálculo de base operativa más cercana.

---

## URLs de producción

### Frontend

https://sistema-seguridad-six.vercel.app

### Backend API

https://sistema-seguridad-server.vercel.app/api

### Health Check

https://sistema-seguridad-server.vercel.app/api/health

---

## Stack tecnológico

### Frontend

- React
- Vite
- TailwindCSS
- React Router DOM
- Leaflet
- React Leaflet
- Leaflet Heat
- Recharts
- Lucide React
- SweetAlert2

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- BcryptJS
- Zod
- Helmet
- CORS
- Morgan

### Base de datos

- PostgreSQL en Neon

### Deploy

- Frontend: Vercel
- Backend: Vercel
- Base de datos: Neon

---

## Funcionalidades principales

### Autenticación

- Login con JWT.
- Rutas protegidas.
- Validación de usuario activo.
- Perfil autenticado.
- Roles de usuario: ADMIN, OPERADOR y LECTOR.

### Gestión de incidentes

- Crear incidentes.
- Listar incidentes.
- Filtrar por tipo, estado, ubicación y fechas.
- Editar incidentes.
- Cambiar estado.
- Baja lógica.
- Registro del usuario creador.

### Bases operativas

- Crear bases operativas.
- Editar bases.
- Activar o desactivar bases.
- Filtrar por provincia, departamento, localidad, barrio y tipo.
- Abrir ubicación en Google Maps.
- Tipos soportados:
  - Comisaría
  - Destacamento
  - Base operativa
  - Puesto policial
  - Otro

### Mapa operativo

- Visualización de incidentes.
- Visualización de bases operativas.
- Selección de incidente.
- Cálculo de base más cercana.
- Distancia estimada.
- Tiempos estimados de respuesta.
- Línea visual entre incidente y base.

### Mapa de calor

- Visualización de concentración territorial de incidentes.
- Filtros por tipo, estado, localidad, barrio y fechas.
- Puntos individuales con detalle.

### Reportes operativos

- Total de incidentes filtrados.
- Ranking por tipo de delito.
- Ranking por estado.
- Ranking por localidad.
- Ranking por barrio.
- Evolución por fecha.
- Gráficos.
- Exportación CSV.

### Auditoría

- Registro de acciones críticas.
- Login.
- Creación.
- Edición.
- Cambio de estado.
- Activación y desactivación.
- Exportaciones.
- Datos anteriores y nuevos.

---

## Estructura del proyecto

```txt
sistema-seguridad/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── server/
│   ├── api/
│   ├── prisma/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validations/
│   ├── public/
│   ├── vercel.json
│   └── package.json
│
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

---


Instalación local


## Variables de entorno

### Backend

Crear el archivo:

```txt
server/.env
```

Contenido:

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

DATABASE_URL=postgresql://USUARIO:PASSWORD@HOST.neon.tech/neondb?sslmode=require

JWT_SECRET=TU_CLAVE_SECRETA_SEGURA
JWT_EXPIRES_IN=8h

ADMIN_SETUP_TOKEN=TU_TOKEN_PRIVADO
```

Importante: nunca subir `server/.env` al repositorio.

### Frontend

Crear el archivo:

```txt
client/.env
```

Contenido local:

```env
VITE_API_URL=http://localhost:5000/api
```

Contenido en producción:

```env
VITE_API_URL=https://sistema-seguridad-server.vercel.app/api
```

---

## Scripts principales

### Ejecutar frontend y backend juntos

```bash
pnpm dev
```

### Ejecutar solo frontend

```bash
pnpm --filter client dev
```

### Ejecutar solo backend

```bash
pnpm --filter server dev
```

### Build del frontend

```bash
pnpm --filter client build
```

### Generar Prisma Client

```bash
pnpm --filter server prisma:generate
```

### Aplicar migraciones manualmente

```bash
pnpm --filter server prisma:migrate:deploy
```

---

## Seeds disponibles

### Crear usuario administrador

```bash
pnpm --filter server seed
```

Credenciales demo:

```txt
Email: admin@seguridad.com
Password: Admin123
```

Recomendación: cambiar estas credenciales antes de compartir el sistema públicamente.

### Cargar bases operativas iniciales

```bash
pnpm --filter server seed:bases
```

### Corregir bases operativas

```bash
pnpm --filter server seed:bases:fix
```

### Cargar puntos validados por Google Maps

```bash
pnpm --filter server seed:bases:maps
```

### Cargar incidentes demo

```bash
pnpm --filter server seed:incidents
```

---

## Endpoints principales

```txt
GET    /api/health
POST   /api/auth/login
GET    /api/auth/profile

GET    /api/users
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id/status

GET    /api/incidents
POST   /api/incidents
GET    /api/incidents/:id
PUT    /api/incidents/:id
PATCH  /api/incidents/:id/status
DELETE /api/incidents/:id

GET    /api/bases
POST   /api/bases
GET    /api/bases/:id
PUT    /api/bases/:id
PATCH  /api/bases/:id/status
DELETE /api/bases/:id

GET    /api/routes/incidents/:incidentId/nearest-base

GET    /api/reports/operational
GET    /api/reports/operational/export/csv

GET    /api/audit
```

---

## Deploy

### Backend en Vercel

Proyecto:

```txt
sistema-seguridad-server
```

Configuración:

```txt
Root Directory: server
Framework Preset: Other
Install Command: pnpm install
Build Command: pnpm vercel-build
Output Directory: public
```

Variables necesarias:

```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://sistema-seguridad-six.vercel.app
CORS_ORIGINS=http://localhost:5173,https://sistema-seguridad-six.vercel.app
DATABASE_URL=URI_DE_NEON
JWT_SECRET=CLAVE_SEGURA
JWT_EXPIRES_IN=8h
ADMIN_SETUP_TOKEN=TOKEN_PRIVADO
```

### Frontend en Vercel

Proyecto:

```txt
sistema-seguridad
```

Configuración:

```txt
Root Directory: client
Framework Preset: Vite
Install Command: pnpm install
Build Command: pnpm build
Output Directory: dist
```

Variable necesaria:

```env
VITE_API_URL=https://sistema-seguridad-server.vercel.app/api
```

---

## Notas de seguridad

- No subir archivos `.env`.
- No exponer `DATABASE_URL`.
- No exponer `JWT_SECRET`.
- No exponer `ADMIN_SETUP_TOKEN`.
- Cambiar credenciales demo antes de compartir el sistema públicamente.
- Regenerar secretos si fueron expuestos accidentalmente.
- Ejecutar migraciones manualmente cuando cambie el schema.
- No ejecutar migraciones automáticas en cada deploy para evitar bloqueos de Prisma/Neon.

---

## Estado actual

```txt
Frontend: funcionando en Vercel
Backend: funcionando en Vercel
Base de datos: Neon PostgreSQL
Autenticación: operativa
Dashboard: operativo
Incidentes: operativo
Bases: operativo
Reportes: operativo
Mapa operativo: operativo
Mapa de calor: operativo
Auditoría: operativa
```

---

## Autor

Desarrollado por Rolando Duarte.
