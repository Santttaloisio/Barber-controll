import type {
  Barber,
  BootstrapData,
  Cut,
  Expense,
  LoginResponse,
  Service
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const TOKEN_KEY = 'barber-control-token'
const USER_KEY = 'barber-control-user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export const setSession = (session: LoginResponse) => {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

const request = async (url: string, options?: RequestInit) => {
  const token = getToken()
  const headers = new Headers(options?.headers)

  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, {
    ...options,
    headers
  })

  const data = await res.json().catch(() => null)

  if (res.status === 401) clearSession()

  if (!res.ok) {
    throw new Error(data?.message ?? 'Error de API')
  }

  return data
}

const normalizeBarber = (barber: any): Barber => ({
  ...barber,
  nombre: barber.nombre ?? barber.name ?? 'Sin nombre',
  activo: barber.activo ?? barber.active ?? true,
  createdAt: barber.createdAt ?? barber.created_at,
  updatedAt: barber.updatedAt ?? barber.updated_at
})

const normalizeService = (service: any): Service => ({
  ...service,
  nombre: service.nombre ?? service.name ?? 'Sin nombre',
  precioBase: Number(service.precioBase ?? service.price ?? service.precio_base ?? 0),
  createdAt: service.createdAt ?? service.created_at,
  updatedAt: service.updatedAt ?? service.updated_at
})

const normalizeExpense = (expense: any): Expense => ({
  ...expense,
  categoria: expense.categoria ?? expense.category ?? 'Gastos varios',
  descripcion: expense.descripcion ?? expense.description ?? 'Sin descripcion',
  monto: Number(expense.monto ?? expense.amount ?? 0),
  metodoPago: expense.metodoPago ?? expense.paymentMethod ?? expense.payment_method ?? 'Sin metodo',
  fecha: expense.fecha ?? expense.date ?? expense.created_at ?? new Date().toISOString(),
  observacion: expense.observacion ?? expense.observation ?? null,
  createdAt: expense.createdAt ?? expense.created_at,
  updatedAt: expense.updatedAt ?? expense.updated_at
})

const normalizeCut = (cut: any): Cut => {
  const barber = cut.Barber ?? cut.barber
  const service = cut.Service ?? cut.service

  return {
    ...cut,
    barberId: Number(cut.barberId ?? cut.barber_id ?? 0),
    serviceId: Number(cut.serviceId ?? cut.service_id ?? 0),
    monto: Number(cut.monto ?? cut.amount ?? cut.price ?? 0),
    metodoPago: cut.metodoPago ?? cut.paymentMethod ?? cut.payment_method ?? 'Sin metodo',
    observacion: cut.observacion ?? cut.observation ?? null,
    fecha: cut.fecha ?? cut.date ?? cut.created_at ?? new Date().toISOString(),
    Barber: barber ? normalizeBarber(barber) : undefined,
    Service: service ? normalizeService(service) : undefined,
    createdAt: cut.createdAt ?? cut.created_at,
    updatedAt: cut.updatedAt ?? cut.updated_at
  }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message ?? 'No se pudo iniciar sesion')
  }

  setSession(data)
  return data
}

export async function getBootstrap(): Promise<BootstrapData> {
  const data = await request(`${BASE_URL}/bootstrap`)

  return {
    dashboard: data.dashboard,
    month: data.month,
    year: data.year,
    cuts: data.cuts.map(normalizeCut),
    barbers: data.barbers.map(normalizeBarber),
    services: data.services.map(normalizeService),
    expenses: data.expenses.map(normalizeExpense)
  }
}

export async function createBarber(data: any) {
  return request(`${BASE_URL}/barbers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.nombre ?? data.name
    })
  })
}

export async function deleteBarber(id: number) {
  return request(`${BASE_URL}/barbers/${id}`, {
    method: 'DELETE'
  })
}

export async function createCut(data: any) {
  return request(`${BASE_URL}/cuts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      barber_id: data.barberId ?? data.barber_id,
      service_id: data.serviceId ?? data.service_id,
      price: data.monto ?? data.price,
      payment_method: data.metodoPago ?? data.payment_method,
      observation: data.observacion ?? data.observation
    })
  })
}

export async function createService(data: any) {
  return request(`${BASE_URL}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.nombre ?? data.name,
      price: data.precioBase ?? data.price
    })
  })
}

export async function updateService(id: number, data: any) {
  return request(`${BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.nombre ?? data.name,
      price: data.precioBase ?? data.price
    })
  })
}

export async function createExpense(data: any) {
  return request(`${BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: data.categoria ?? data.category,
      description: data.descripcion ?? data.description,
      amount: data.monto ?? data.amount,
      paymentMethod: data.metodoPago ?? data.paymentMethod,
      date: data.fecha ?? data.date,
      observation: data.observacion ?? data.observation
    })
  })
}

export async function deleteExpense(id: number) {
  return request(`${BASE_URL}/expenses/${id}`, {
    method: 'DELETE'
  })
}