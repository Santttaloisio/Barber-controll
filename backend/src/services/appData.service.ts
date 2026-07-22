import { supabase } from '../db/supabase'

/* =========================
   TYPES BASE
========================= */

type BarberType = {
  id: number
  nombre?: string
  name?: string
  active?: boolean
  activo?: boolean
}

type ServiceType = {
  id: number
  nombre?: string
  name?: string
  precioBase?: number
  price?: number
  precio_base?: number
}

type CutType = {
  id: number
  barberId: number
  serviceId: number
  monto?: number
  amount?: number
  price?: number
  fecha?: string
  date?: string
  created_at?: string
}

type ExpenseType = {
  id: number
  categoria?: string
  category?: string
  descripcion?: string
  description?: string
  monto?: number
  amount?: number
  metodoPago?: string
  paymentMethod?: string
  payment_method?: string
  fecha?: string
  date?: string
  created_at?: string
}

type AppData = {
  dashboard: any
  month: any
  year: any
  cuts: any[]
  barbers: BarberType[]
  services: ServiceType[]
  expenses: ExpenseType[]
}

/* =========================
   CACHE
========================= */

const CACHE_TTL_MS = 3000

let cache: {
  expiresAt: number
  data: AppData
} | null = null

export const invalidateAppDataCache = () => {
  cache = null
}

/* =========================
   HELPERS
========================= */

const toNumber = (value: unknown) => Number(value ?? 0)

const getDate = (item: any) =>
  new Date(item.fecha ?? item.date ?? item.created_at ?? Date.now())

const sameDay = (date: Date, reference: Date) =>
  date.getFullYear() === reference.getFullYear() &&
  date.getMonth() === reference.getMonth() &&
  date.getDate() === reference.getDate()

const sameMonth = (date: Date, reference: Date) =>
  date.getFullYear() === reference.getFullYear() &&
  date.getMonth() === reference.getMonth()

/* =========================
   NORMALIZERS
========================= */

const normalizeBarber = (barber: any): BarberType => ({
  id: Number(barber.id),
  nombre: barber.nombre ?? barber.name ?? 'Sin nombre',
  activo: barber.activo ?? barber.active ?? true
})

const normalizeService = (service: any): ServiceType => ({
  id: Number(service.id),
  nombre: service.nombre ?? service.name ?? 'Sin nombre',
  precioBase: toNumber(
    service.precioBase ?? service.price ?? service.precio_base
  )
})

const normalizeExpense = (expense: any): ExpenseType => ({
  id: Number(expense.id),
  categoria: expense.categoria ?? expense.category ?? 'Gastos',
  descripcion: expense.descripcion ?? expense.description ?? '',
  monto: toNumber(expense.monto ?? expense.amount),
  metodoPago:
    expense.metodoPago ??
    expense.paymentMethod ??
    expense.payment_method ??
    'Sin metodo',
  fecha: expense.fecha ?? expense.date ?? expense.created_at
})

const normalizeCut = (
  cut: CutType,
  barbersById: Map<number, BarberType>,
  servicesById: Map<number, ServiceType>
) => {
  const barberId = Number(cut.barberId)
  const serviceId = Number(cut.serviceId)

  return {
    id: Number(cut.id),
    barberId,
    serviceId,
    monto: toNumber(cut.monto ?? cut.amount ?? cut.price),
    metodoPago: 'Sin metodo',
    fecha: cut.fecha ?? cut.date ?? cut.created_at,
    Barber: barbersById.get(barberId),
    Service: servicesById.get(serviceId)
  }
}

/* =========================
   SUMS
========================= */

const sumCuts = (cuts: any[]) =>
  cuts.reduce((t, c) => t + toNumber(c.monto), 0)

const sumExpenses = (expenses: any[]) =>
  expenses.reduce((t, e) => t + toNumber(e.monto), 0)

/* =========================
   DASHBOARD
========================= */

const buildDashboard = (
  cuts: any[],
  expenses: ExpenseType[],
  barbers: BarberType[]
) => {
  const now = new Date()

  const todayCuts = cuts.filter((c) => sameDay(getDate(c), now))
  const monthCuts = cuts.filter((c) => sameMonth(getDate(c), now))
  const monthExpenses = expenses.filter((e) => sameMonth(getDate(e), now))

  const barbersById = new Map<number, BarberType>(
    barbers.map((b) => [b.id, b])
  )

  const servicesById = new Map<number, ServiceType>()

  const barberStats = new Map<
    number,
    { barberId: number; nombre: string; cortes: number; facturacion: number }
  >()

  monthCuts.forEach((cut) => {
    const current = barberStats.get(cut.barberId) ?? {
      barberId: cut.barberId,
      nombre: barbersById.get(cut.barberId)?.nombre ?? 'Sin nombre',
      cortes: 0,
      facturacion: 0
    }

    current.cortes++
    current.facturacion += toNumber(cut.monto)

    barberStats.set(cut.barberId, current)
  })

  return {
    hoy: {
      cortes: todayCuts.length,
      facturacion: sumCuts(todayCuts)
    },
    mes: {
      cortes: monthCuts.length,
      facturacion: sumCuts(monthCuts),
      gastos: sumExpenses(monthExpenses),
      gananciaEstimada: sumCuts(monthCuts) - sumExpenses(monthExpenses)
    },
    facturacionPorBarbero: Array.from(barberStats.values())
  }
}

/* =========================
   MAIN GET
========================= */

export const getAppData = async (): Promise<AppData> => {
  if (cache && cache.expiresAt > Date.now()) return cache.data

  const [barbersRes, servicesRes, cutsRes, expensesRes] =
    await Promise.all([
      supabase.from('barbers').select('*'),
      supabase.from('services').select('*'),
      supabase.from('cuts').select('*'),
      supabase.from('expenses').select('*')
    ])

  const barbers = (barbersRes.data ?? []).map(normalizeBarber)
  const services = (servicesRes.data ?? []).map(normalizeService)
  const expenses = (expensesRes.data ?? []).map(normalizeExpense)

  const barbersById = new Map<number, BarberType>(
    barbers.map((barber: BarberType) => [barber.id, barber])
  )
  const servicesById = new Map<number, ServiceType>(
    services.map((service: ServiceType) => [service.id, service])
  )

  const cuts = (cutsRes.data ?? []).map((cut: any) =>
    normalizeCut(cut, barbersById, servicesById)
  )

  const data: AppData = {
    dashboard: buildDashboard(cuts, expenses, barbers),
    month: {},
    year: {},
    cuts,
    barbers,
    services,
    expenses
  }

  cache = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data
  }

  return data
}
