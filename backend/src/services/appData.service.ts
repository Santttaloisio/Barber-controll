import { supabase } from '../db/supabase'

type Barber = {
  id: number
  nombre: string
  activo: boolean
  createdAt?: string
  updatedAt?: string
}

type Service = {
  id: number
  nombre: string
  precioBase: number
  createdAt?: string
  updatedAt?: string
}

type Cut = {
  id: number
  barberId: number
  serviceId: number
  monto: number
  metodoPago: string
  observacion: string | null
  fecha: string
  Barber?: Barber
  Service?: Service
  createdAt?: string
  updatedAt?: string
}

type Expense = {
  id: number
  categoria: string
  descripcion: string
  monto: number
  metodoPago: string
  fecha: string
  observacion: string | null
  createdAt?: string
  updatedAt?: string
}

type AppData = {
  dashboard: any
  month: any
  year: any
  cuts: Cut[]
  barbers: Barber[]
  services: Service[]
  expenses: Expense[]
}

const CACHE_TTL_MS = 3000

let cache: {
  expiresAt: number
  data: AppData
} | null = null

export const invalidateAppDataCache = () => {
  cache = null
}

const toNumber = (value: unknown) => {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

const toText = (value: unknown, fallback: string) => {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const normalizeDate = (...values: unknown[]) => {
  const value = values.find((item) => typeof item === 'string' && item)
  return typeof value === 'string' ? value : new Date().toISOString()
}

const getDate = (value: { fecha?: string; createdAt?: string }) => {
  const date = new Date(value.fecha ?? value.createdAt ?? Date.now())
  return Number.isNaN(date.getTime()) ? new Date() : date
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

const sortByDateDesc = <T extends { fecha: string }>(items: T[]) => {
  return [...items].sort((a, b) => getDate(b).getTime() - getDate(a).getTime())
}

const groupPaymentMethods = (cuts: Cut[]) => {
  const stats = new Map<string, { metodoPago: string; cortes: number; facturacion: number }>()

  cuts.forEach((cut) => {
    const method = cut.metodoPago || 'Sin metodo'
    const current = stats.get(method) ?? {
      metodoPago: method,
      cortes: 0,
      facturacion: 0
    }

    current.cortes += 1
    current.facturacion += cut.monto
    stats.set(method, current)
  })

  return Array.from(stats.values())
}

const normalizeBarber = (barber: any): Barber => ({
  id: toNumber(barber.id),
  nombre: toText(barber.nombre ?? barber.name, 'Sin nombre'),
  activo: barber.activo ?? barber.active ?? true,
  createdAt: barber.createdAt ?? barber.created_at,
  updatedAt: barber.updatedAt ?? barber.updated_at
})

const normalizeService = (service: any): Service => ({
  id: toNumber(service.id),
  nombre: toText(service.nombre ?? service.name, 'Sin nombre'),
  precioBase: toNumber(service.precioBase ?? service.price ?? service.precio_base),
  createdAt: service.createdAt ?? service.created_at,
  updatedAt: service.updatedAt ?? service.updated_at
})

const normalizeExpense = (expense: any): Expense => ({
  id: toNumber(expense.id),
  categoria: toText(expense.categoria ?? expense.category, 'Gastos varios'),
  descripcion: toText(expense.descripcion ?? expense.description, 'Sin descripcion'),
  monto: toNumber(expense.monto ?? expense.amount),
  metodoPago: toText(
    expense.metodoPago ?? expense.paymentMethod ?? expense.payment_method,
    'Sin metodo'
  ),
  fecha: normalizeDate(expense.fecha, expense.date, expense.created_at),
  observacion: expense.observacion ?? expense.observation ?? null,
  createdAt: expense.createdAt ?? expense.created_at,
  updatedAt: expense.updatedAt ?? expense.updated_at
})

const normalizeCut = (
  cut: any,
  barbersById: Map<number, Barber>,
  servicesById: Map<number, Service>
): Cut => {
  const barberId = toNumber(cut.barberId ?? cut.barber_id)
  const serviceId = toNumber(cut.serviceId ?? cut.service_id)
  const barber = barbersById.get(barberId)
  const service = servicesById.get(serviceId)

  return {
    id: toNumber(cut.id),
    barberId,
    serviceId,
    monto: toNumber(cut.monto ?? cut.amount ?? cut.price),
    metodoPago: toText(
      cut.metodoPago ?? cut.paymentMethod ?? cut.payment_method,
      'Sin metodo'
    ),
    observacion: cut.observacion ?? cut.observation ?? null,
    fecha: normalizeDate(cut.fecha, cut.date, cut.created_at),
    Barber: barber,
    Service: service,
    createdAt: cut.createdAt ?? cut.created_at,
    updatedAt: cut.updatedAt ?? cut.updated_at
  }
}

const sumCuts = (cuts: Cut[]) => cuts.reduce((total, cut) => total + cut.monto, 0)

const sumExpenses = (expenses: Expense[]) => {
  return expenses.reduce((total, expense) => total + expense.monto, 0)
}

const buildBarberBilling = (cuts: Cut[], barbersById: Map<number, Barber>) => {
  const stats = new Map<number, {
    barberId: number
    nombre: string
    cortes: number
    facturacion: number
  }>()

  cuts.forEach((cut) => {
    const current = stats.get(cut.barberId) ?? {
      barberId: cut.barberId,
      nombre: cut.Barber?.nombre ?? barbersById.get(cut.barberId)?.nombre ?? 'Sin barbero',
      cortes: 0,
      facturacion: 0
    }

    current.cortes += 1
    current.facturacion += cut.monto
    stats.set(cut.barberId, current)
  })

  return Array.from(stats.values())
}

const buildExpenseCategories = (expenses: Expense[]) => {
  const stats = new Map<string, { categoria: string; cantidad: number; total: number }>()

  expenses.forEach((expense) => {
    const current = stats.get(expense.categoria) ?? {
      categoria: expense.categoria,
      cantidad: 0,
      total: 0
    }

    current.cantidad += 1
    current.total += expense.monto
    stats.set(expense.categoria, current)
  })

  return Array.from(stats.values())
}

const buildDashboard = (
  cuts: Cut[],
  expenses: Expense[],
  barbersById: Map<number, Barber>
) => {
  const now = new Date()
  const todayCuts = cuts.filter((cut) => sameDay(getDate(cut), now))
  const monthCuts = cuts.filter((cut) => sameMonth(getDate(cut), now))
  const monthExpenses = expenses.filter((expense) => sameMonth(getDate(expense), now))

  return {
    hoy: {
      cortes: todayCuts.length,
      facturacion: sumCuts(todayCuts),
      porMetodoPago: groupPaymentMethods(todayCuts),
      detalle: todayCuts.map((cut) => ({
        id: cut.id,
        barberId: cut.barberId,
        nombreBarbero: cut.Barber?.nombre ?? barbersById.get(cut.barberId)?.nombre ?? 'Sin barbero',
        monto: cut.monto,
        metodoPago: cut.metodoPago,
        fecha: cut.fecha
      }))
    },
    mes: {
      cortes: monthCuts.length,
      facturacion: sumCuts(monthCuts),
      porMetodoPago: groupPaymentMethods(monthCuts),
      gananciaEstimada: sumCuts(monthCuts) - sumExpenses(monthExpenses),
      gastosPorCategoria: buildExpenseCategories(monthExpenses),
      gastos: sumExpenses(monthExpenses)
    },
    facturacionPorBarbero: buildBarberBilling(monthCuts, barbersById)
  }
}

const buildMonthReport = (cuts: Cut[]) => {
  const now = new Date()
  const currentMonthCuts = cuts.filter((cut) => sameMonth(getDate(cut), now))
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const cutsByDate = new Map<string, Cut[]>()

  currentMonthCuts.forEach((cut) => {
    const key = formatDateKey(getDate(cut))
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
    cortes: currentMonthCuts.length,
    facturacion: sumCuts(currentMonthCuts),
    porDia,
    detalle: currentMonthCuts
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

  const yearCuts = cuts.filter((cut) => sameYear(getDate(cut), now))

  const porMes = monthNames.map((nombreMes, index) => {
    const monthCuts = yearCuts.filter((cut) => getDate(cut).getMonth() === index)

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

export const getAppData = async (): Promise<AppData> => {
  if (cache && cache.expiresAt > Date.now()) return cache.data

  const [barbersRes, servicesRes, cutsRes, expensesRes] = await Promise.all([
    supabase.from('barbers').select('*'),
    supabase.from('services').select('*'),
    supabase.from('cuts').select('*'),
    supabase.from('expenses').select('*')
  ])

  const firstError = barbersRes.error ?? servicesRes.error ?? cutsRes.error ?? expensesRes.error
  if (firstError) throw firstError

  const allBarbers = (barbersRes.data ?? []).map(normalizeBarber)
  const activeBarbers = allBarbers.filter((barber) => barber.activo)
  const services = (servicesRes.data ?? []).map(normalizeService)
  const expenses = sortByDateDesc((expensesRes.data ?? []).map(normalizeExpense))

  const barbersById = new Map<number, Barber>(
    allBarbers.map((barber) => [barber.id, barber])
  )
  const servicesById = new Map<number, Service>(
    services.map((service) => [service.id, service])
  )

  const cuts = sortByDateDesc(
    (cutsRes.data ?? []).map((cut) => normalizeCut(cut, barbersById, servicesById))
  )

  const data: AppData = {
    dashboard: buildDashboard(cuts, expenses, barbersById),
    month: buildMonthReport(cuts),
    year: buildYearReport(cuts),
    cuts,
    barbers: activeBarbers,
    services,
    expenses
  }

  cache = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data
  }

  return data
}
