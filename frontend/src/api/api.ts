import type {
  Barber,
  BootstrapData,
  Cut,
  Expense,
  ExpenseCategoryReport,
  LoginResponse,
  MonthReport,
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

const normalizeCut = (
  cut: any,
  barbersById: Map<number, Barber> = new Map(),
  servicesById: Map<number, Service> = new Map()
): Cut => {
  const barber = cut.Barber ?? cut.barber
  const service = cut.Service ?? cut.service
  const barberId = Number(cut.barberId ?? cut.barber_id ?? 0)
  const serviceId = Number(cut.serviceId ?? cut.service_id ?? 0)

  return {
    ...cut,
    barberId,
    serviceId,
    monto: Number(cut.monto ?? cut.amount ?? cut.price ?? 0),
    metodoPago: cut.metodoPago ?? cut.paymentMethod ?? cut.payment_method ?? 'Sin metodo',
    observacion: cut.observacion ?? cut.observation ?? null,
    fecha: cut.fecha ?? cut.date ?? cut.created_at ?? new Date().toISOString(),
    Barber: barber ? normalizeBarber(barber) : barbersById.get(barberId),
    Service: service ? normalizeService(service) : servicesById.get(serviceId),
    createdAt: cut.createdAt ?? cut.created_at,
    updatedAt: cut.updatedAt ?? cut.updated_at
  }
}

const getDate = (date: string) => {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const sameDay = (date: Date, reference: Date) => {
  return date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
}

const sameMonth = (date: Date, reference: Date) => {
  return date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
}

const sameYear = (date: Date, reference: Date) => {
  return date.getFullYear() === reference.getFullYear()
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const sumCuts = (cuts: Cut[]) => {
  return cuts.reduce((total, cut) => total + Number(cut.monto || 0), 0)
}

const sumExpenses = (expenses: Expense[]) => {
  return expenses.reduce((total, expense) => total + Number(expense.monto || 0), 0)
}

const buildPaymentReport = (cuts: Cut[]) => {
  const reports = new Map<string, {
    metodoPago: string
    cortes: number
    facturacion: number
  }>()

  cuts.forEach((cut) => {
    const method = cut.metodoPago || 'Sin metodo'
    const current = reports.get(method) ?? {
      metodoPago: method,
      cortes: 0,
      facturacion: 0
    }

    current.cortes += 1
    current.facturacion += Number(cut.monto || 0)
    reports.set(method, current)
  })

  return Array.from(reports.values())
}

const buildExpenseCategories = (expenses: Expense[]): ExpenseCategoryReport[] => {
  const reports = new Map<string, ExpenseCategoryReport>()

  expenses.forEach((expense) => {
    const category = expense.categoria || 'Gastos varios'
    const current = reports.get(category) ?? {
      categoria: category,
      cantidad: 0,
      total: 0
    }

    current.cantidad += 1
    current.total += Number(expense.monto || 0)
    reports.set(category, current)
  })

  return Array.from(reports.values())
}

const buildMonthReport = (cuts: Cut[]): MonthReport => {
  const now = new Date()
  const monthCuts = cuts.filter((cut) => sameMonth(getDate(cut.fecha), now))
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const cutsByDate = new Map<string, Cut[]>()

  monthCuts.forEach((cut) => {
    const key = formatDateKey(getDate(cut.fecha))
    cutsByDate.set(key, [...(cutsByDate.get(key) ?? []), cut])
  })

  const porDia = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), index + 1)
    const dayCuts = cutsByDate.get(formatDateKey(date)) ?? []

    return {
      fecha: formatDateKey(date),
      cortes: dayCuts.length,
      facturacion: sumCuts(dayCuts)
    }
  })

  return {
    mes: now.getMonth() + 1,
    anio: now.getFullYear(),
    cortes: monthCuts.length,
    facturacion: sumCuts(monthCuts),
    porDia,
    detalle: monthCuts
  }
}

const buildYearReport = (cuts: Cut[]) => {
  const now = new Date()
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ]
  const yearCuts = cuts.filter((cut) => sameYear(getDate(cut.fecha), now))

  const porMes = monthNames.map((nombreMes, index) => {
    const monthCuts = yearCuts.filter((cut) => getDate(cut.fecha).getMonth() === index)

    return {
      mes: index + 1,
      nombreMes,
      cortes: monthCuts.length,
      facturacion: sumCuts(monthCuts)
    }
  })

  return {
    anio: now.getFullYear(),
    cortes: yearCuts.length,
    facturacion: sumCuts(yearCuts),
    porMes
  }
}

const buildDashboard = (cuts: Cut[], expenses: Expense[]) => {
  const now = new Date()
  const todayCuts = cuts.filter((cut) => sameDay(getDate(cut.fecha), now))
  const monthCuts = cuts.filter((cut) => sameMonth(getDate(cut.fecha), now))
  const monthExpenses = expenses.filter((expense) => sameMonth(getDate(expense.fecha), now))
  const barberReports = new Map<number, {
    barberId: number
    nombre: string
    cortes: number
    facturacion: number
  }>()

  monthCuts.forEach((cut) => {
    const current = barberReports.get(cut.barberId) ?? {
      barberId: cut.barberId,
      nombre: cut.Barber?.nombre ?? 'Sin barbero',
      cortes: 0,
      facturacion: 0
    }

    current.cortes += 1
    current.facturacion += Number(cut.monto || 0)
    barberReports.set(cut.barberId, current)
  })

  return {
    hoy: {
      cortes: todayCuts.length,
      facturacion: sumCuts(todayCuts),
      porMetodoPago: buildPaymentReport(todayCuts),
      detalle: todayCuts.map((cut) => ({
        id: cut.id,
        barberId: cut.barberId,
        serviceId: cut.serviceId,
        nombreBarbero: cut.Barber?.nombre ?? 'Sin barbero',
        nombreServicio: cut.Service?.nombre ?? 'Sin servicio',
        monto: cut.monto,
        metodoPago: cut.metodoPago,
        fecha: cut.fecha
      }))
    },
    mes: {
      cortes: monthCuts.length,
      facturacion: sumCuts(monthCuts),
      porMetodoPago: buildPaymentReport(monthCuts),
      gananciaEstimada: sumCuts(monthCuts) - sumExpenses(monthExpenses),
      gastosPorCategoria: buildExpenseCategories(monthExpenses),
      gastos: sumExpenses(monthExpenses)
    },
    facturacionPorBarbero: Array.from(barberReports.values())
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
  const barbers = (data.barbers ?? []).map(normalizeBarber)
  const services = (data.services ?? []).map(normalizeService)
  const barbersById = new Map(barbers.map((barber) => [barber.id, barber]))
  const servicesById = new Map(services.map((service) => [service.id, service]))
  const cuts = (data.cuts ?? []).map((cut: any) => normalizeCut(cut, barbersById, servicesById))
  const expenses = (data.expenses ?? []).map(normalizeExpense)

  return {
    dashboard: buildDashboard(cuts, expenses),
    month: buildMonthReport(cuts),
    year: buildYearReport(cuts),
    cuts,
    barbers,
    services,
    expenses
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
