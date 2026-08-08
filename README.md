# Barber Control System

Sistema de gestion para barberia con login, dashboard, cortes, barberos, servicios y gastos.

## Stack

- Frontend: Vite + TypeScript
- Base de datos: Supabase PostgreSQL
- Auth: Supabase Auth
- Deploy frontend: Vercel
- Backend propio: no se usa

## Arquitectura actual

La aplicacion corre como frontend estatico y se conecta directo a Supabase usando `@supabase/supabase-js`.

No hay servidor Express, Render, JWT propio ni endpoints `/api/*`.

El flujo principal de datos esta centralizado en `frontend/src/api/api.ts`:

- `login()` autentica con Supabase Auth.
- `getBootstrap()` carga barberos, servicios, cortes y gastos desde Supabase.
- El dashboard, reporte mensual y reporte anual se calculan en el frontend desde esos datos.
- Despues de cada mutacion se vuelve a cargar `getBootstrap()`.

## Variables de entorno

Crear `frontend/.env` para desarrollo local y configurar las mismas variables en Vercel:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Desarrollo local

```bash
cd frontend
npm install
npm run dev
```

## Build local

```bash
cd frontend
npm run build
```

## Deploy en Vercel

Configurar el proyecto con:

```txt
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Variables de entorno en Vercel:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

Cada vez que cambien variables `VITE_*`, hay que redeployar el frontend porque Vite las compila en build time.

## Login

El login usa Supabase Auth con `signInWithPassword`.

El campo `Usuario` del formulario recibe el email del usuario creado en Supabase Auth.

## Datos

El frontend lee y escribe directamente en estas tablas:

- `barbers`
- `services`
- `cuts`
- `expenses`

Operaciones usadas:

- `select`
- `insert`
- `update`
- `delete`

## Modelo funcional

- Los barberos se eliminan de forma logica con `active = false`.
- Los servicios tambien usan `active = true/false`.
- Los cortes guardan `barber_id`, `service_id`, `price`, `payment_method` y `observation`.
- Los cortes tambien guardan snapshots del servicio: `service_name_snapshot` y `service_price_snapshot`.
- Los gastos guardan categoria, descripcion, monto, metodo de pago, fecha y observacion.

## Migracion Supabase

Ejecutar el archivo:

```txt
supabase-migration.sql
```

Incluye:

- columnas extra para cortes, servicios, barberos y gastos
- `active` en barberos y servicios
- snapshots de servicio en cortes
- Row Level Security
- policies para usuarios autenticados

## Features

- Login con Supabase Auth
- CRUD de barberos
- Eliminacion logica de barberos
- CRUD de servicios
- Edicion de nombre y precio de servicios
- Registro de cortes con barbero, servicio, precio, metodo de pago y observacion
- Registro y eliminacion de gastos
- Filtros de cortes por fecha, barbero y metodo de pago
- Filtros de gastos por fecha, categoria y metodo de pago
- Dashboard con cortes de hoy, facturacion, gastos y ganancia estimada
- Grafico mensual y anual
- Reportes calculados en frontend desde Supabase

## Estructura

```txt
frontend/
  src/
    api/
    components/
    lib/
    types/
    utils/
    views/
supabase-migration.sql
README.md
```

## Notas importantes

- No configurar Render para este estado del proyecto.
- No configurar `VITE_API_URL`; ya no hay API propia.
- Supabase debe tener usuarios creados en Auth para poder iniciar sesion.
- Las policies de `supabase-migration.sql` requieren usuarios autenticados para operar.
