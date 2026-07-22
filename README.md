# Barber Control System

Sistema SaaS para gestion de barberia con dashboard, cortes, barberos, servicios y gastos.

## Stack

- Frontend: Vite + TypeScript
- Backend: Node.js + Express
- Base de datos: Supabase
- Auth: JWT propio en backend

## Arquitectura

En desarrollo, frontend y backend pueden correr separados:

- Frontend: `http://localhost:5173`
- Backend/API: `http://localhost:3000/api`

En produccion, Express sirve tambien el build de Vite:

- App y API en un solo puerto
- Frontend estatico desde `frontend/dist`
- API en `/api/*`
- Fallback SPA para rutas del frontend

## Optimizacion Bootstrap

El frontend usa una sola lectura principal:

```ts
GET /api/bootstrap
```

Ese endpoint devuelve:

- `dashboard`
- `month`
- `year`
- `cuts`
- `barbers`
- `services`
- `expenses`

Antes la app necesitaba varias requests para cargar la pantalla. Ahora carga con una request, y el backend usa cache corto con invalidacion despues de mutaciones.

## Variables de Entorno

Crear `backend/.env`:

```env
SUPABASE_KEY=tu_supabase_key
JWT_SECRET=una_clave_larga_y_privada
AUTH_USERNAME=Adminwest
AUTH_PASSWORD=admin123
AUTH_NAME=Administrador
PORT=3000
```

## Migracion Supabase

Ejecutar en Supabase SQL editor:

```sql
-- backend/supabase-migration.sql
alter table public.cuts
  add column if not exists payment_method text,
  add column if not exists observation text;

alter table public.barbers
  add column if not exists active boolean not null default true;

alter table public.expenses
  add column if not exists category text,
  add column if not exists payment_method text,
  add column if not exists date date,
  add column if not exists observation text;
```

## Desarrollo

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Produccion

Desde `backend`:

```bash
npm install
npm run build:full
npm start
```

Esto compila el frontend y el backend. Luego Express sirve todo desde un solo puerto.

## Login

El usuario inicia sesion con username y password. El backend devuelve un JWT y el frontend lo guarda en `localStorage`.

Todas las requests privadas incluyen:

```http
Authorization: Bearer <token>
```

Rutas protegidas:

- `/api/bootstrap`
- `/api/barbers`
- `/api/cuts`
- `/api/services`
- `/api/expenses`
- `/api/reports`

Ruta publica:

- `POST /api/auth/login`

## Features

- Login con JWT
- Dashboard optimizado
- CRUD de barberos
- CRUD de servicios
- Registro de cortes
- Registro y eliminacion de gastos
- Reportes mensual/anual
- Un solo servidor en produccion
