# Barber Control System

Sistema para gestion de barberia con login, dashboard, cortes, barberos, servicios y gastos.

## Stack final

- Frontend: React/Vite + TypeScript en Vercel
- Backend: Supabase
- Auth: Supabase Auth
- Base de datos: Supabase PostgreSQL
- API propia: eliminada

## Arquitectura

El frontend se conecta directo a Supabase desde `@supabase/supabase-js`.

Ya no se usa Express, Render, JWT propio ni endpoints `/api/*`.

## Variables de entorno

Crear `frontend/.env` para desarrollo local y configurar las mismas variables en Vercel:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Desarrollo

```bash
cd frontend
npm install
npm run dev
```

## Produccion en Vercel

Root Directory:

```txt
frontend
```

Build Command:

```bash
npm run build
```

Output Directory:

```txt
dist
```

Environment Variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Login

El login usa Supabase Auth con `signInWithPassword`.

El campo "Usuario" del formulario debe recibir el email del usuario creado en Supabase Auth.

## Datos

El frontend lee y escribe directamente en estas tablas:

- `barbers`
- `cuts`
- `services`
- `expenses`

Operaciones usadas:

- `supabase.from('table').select()`
- `supabase.from('table').insert()`
- `supabase.from('table').update()`
- `supabase.from('table').delete()`

## Migracion Supabase

Ejecutar en Supabase SQL editor si las columnas aun no existen:

```sql
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

## Features

- Login con Supabase Auth
- Dashboard calculado en frontend con datos de Supabase
- CRUD de barberos
- CRUD de servicios
- Registro de cortes
- Registro y eliminacion de gastos
- Reportes mensual/anual
- Sin servidor Express en produccion
