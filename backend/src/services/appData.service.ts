import { supabase } from '../db/supabase'

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

const CACHE_TTL_MS = 3000

let cache:
  | {
      expiresAt: number
      data: AppData
    }
  | null = null

type AppData = {
  dashboard: any
  month: any
  year: any
  cuts: any[]
  barbers: any[]
  services: any[]
  expenses: any[]
}

const toNumber = (value: unknown) => Number(value ?? 0)

const getDate = (item: any) => {
  return new Date(item.fecha ?? item.date ?? item.created_at ?? Date.now())
}

const formatDateKey = (date: Date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

const sameDay = (date: Date, reference: Date) => {
  return date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
    && date.getDate() === reference.getDate()
}

const sameMonth = (date: Date, reference: Date) => {
  return date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
}

const normalizeBarber = (barber: any) => ({
  ...barber,
  id: Number(barber.id),
  nombre: barber.nombre ?? barber.name ?? 'Sin nombre',
  activo: barber.activo ?? barber.active ?? true,
  createdAt: barber.createdAt ?? barber.created_at,
  updatedAt: barber.updatedAt ?? barber.updated_at
})

const normalizeService = (service: any) => ({
  ...service,
  id: Number(service.id),
  nombre: service.nombre ?? service.name ?? 'Sin nombre',
  precioBase: toNumber(service.precioBase ?? service.price ?? service.precio_base),
  createdAt: service.createdAt ?? service.created_at,
  updatedAt: service.updatedAt ?? service.updated_at
})

const normalizeExpense = (expense: any) => ({
  ...expense,
  id: Number(expense.id),
  categoria: expense.categoria ?? expense.category ?? 'Gastos varios',
  descripcion: expense.descripcion ?? expense.description ?? 'Sin descripcion',
  monto: toNumber(expense.monto ?? expense.amount),
  metodoPago: expense.metodoPago ?? expense.paymentMethod ?? expense.payment_method ?? 'Sin metodo',
  fecha: expense.fecha ?? expense.date ?? expense.created_at ?? new Date().toISOString(),
  observacion: expense.observacion ?? expense.observation ?? null,
  createdAt: expense.createdAt ?? expense.created_at,
  updatedAt: expense.updatedAt ?? expense.updated_at
})

const normalizeCut = (
  cut: any,
  barbersById: Map<number, any>,
  servicesById: Map<number, any>
) => {
  const barberId = Number(cut.barberId ?? cut.barber_id ?? 0)
  const serviceId = Number(cut.serviceId ?? cut.service_id ?? 0)
  const barber = barbersById.get(barberId)
  const service = servicesById.get(serviceId)

  return {
    ...cut,
    id: Number(cut.id),
    barberId,
    serviceId,
    monto: toNumber(cut.monto ?? cut.amount ?? cut.price),
    metodoPago: cut.metodoPago ?? cut.paymentMethod ?? cut.payment_method ?? 'Sin metodo',
    observacion: cut.observacion ?? cut.observation ?? null,
    fecha: cut.fecha ?? cut.date ?? cut.created_at ?? new Date().toISOString(),
    Barber: barber,
    Service: service,
    createdAt: cut.createdAt ?? cut.created_at,
    updatedAt: cut.updatedAt ?? cut.updated_at
  }
}

const sumCuts = (cuts: any[]) => {
  return cuts.reduce((total, cut) => total + toNumber(cut.monto), 0)
}

const sumExpenses = (expenses: any[]) => {
  return expenses.reduce((total, expense) => total + toNumber(expense.monto), 0)
}

const groupPaymentMethods = (cuts: any[]) => {
  const grouped = new Map<string, { metodoPago: string, cortes: number, facturacion: number }>()

  cuts.forEach((cut) => {
    const metodoPago = cut.metodoPago ?? 'Sin metodo'
    const current = grouped.get(metodoPago) ?? { metodoPago, cortes: 0, facturacion: 0 }

    current.cortes += 1
    current.facturacion += toNumber(cut.monto)
    grouped.set(metodoPago, current)
  })

  return Array.from(grouped.values())
}

const buildDashboard = (cuts: any[], expenses: any[], barbers: any[]) => {
  const now = new Date()
  const todayCuts = cuts.filter((cut) => sameDay(getDate(cut), now))
  const monthCuts = cuts.filter((cut) => sameMonth(getDate(cut), now))
  const monthExpenses = expenses.filter((expense) => sameMonth(getDate(expense), now))
  const barbersById = new Map(barbers.map((barber) => [barber.id, barber]))

  const barberBilling = new Map<number, {
    barberId: number
    nombre: string
    cortes: number
    facturacion: number
  }>()

  monthCuts.forEach((cut) => {
    const current = barberBilling.get(cut.barberId) ?? {
      barberId: cut.barberId,
      nombre: barbersById.get(cut.barberId)?.nombre ?? 'Sin nombre',
      cortes: 0,
      facturacion: 0
    }

    current.cortes += 1
    current.facturacion += toNumber(cut.monto)
    barberBilling.set(cut.barberId, current)
  })

  const expensesByCategory = new Map<string, {
    categoria: string
    cantidad: number
    total: number
  }>()

  monthExpenses.forEach((expense) => {
    const current = expensesByCategory.get(expense.categoria) ?? {
      categoria: expense.categoria,
      cantidad: 0,
      total: 0
    }

    current.cantidad += 1
    current.total += toNumber(expense.monto)
    expensesByCategory.set(expense.categoria, current)
  })

  const monthRevenue = sumCuts(monthCuts)
  const monthExpenseTotal = sumExpenses(monthExpenses)

  return {
    hoy: {
      cortes: todayCuts.length,
      facturacion: sumCuts(todayCuts),
      porMetodoPago: groupPaymentMethods(todayCuts),
      detalle: todayCuts.map((cut) => ({
        id: cut.id,
        barberId: cut.barberId,
        nombreBarbero: cut.Barber?.nombre ?? 'Sin nombre',
        monto: cut.monto,
        metodoPago: cut.metodoPago,
        fecha: cut.fecha
      }))
    },
    mes: {
      cortes: monthCuts.length,
      facturacion: monthRevenue,
      porMetodoPago: groupPaymentMethods(monthCuts),
      gananciaEstimada: monthRevenue - monthExpenseTotal,
      gastosPorCategoria: Array.from(expensesByCategory.values()),
      gastos: monthExpenseTotal
    },
    facturacionPorBarbero: Array.from(barberBilling.values())
  }
}

const buildMonthReport = (cuts: any[], reference = new Date()) => {
  const month = reference.getMonth() + 1
  const year = reference.getFullYear()
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthCuts = cuts.filter((cut) => sameMonth(getDate(cut), reference))

  const porDia = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const dayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayCuts = monthCuts.filter((cut) => formatDateKey(getDate(cut)) === dayKey)

    return {
      fecha: dayKey,
      cortes: dayCuts.length,
      facturacion: sumCuts(dayCuts)
    }
  })

  return {
    mes: month,
    anio: year,
    cortes: monthCuts.length,
    facturacion: sumCuts(monthCuts),
    porDia,
    detalle: monthCuts
  }
}

const buildYearReport = (cuts: any[], reference = new Date()) => {
  const year = reference.getFullYear()
  const yearCuts = cuts.filter((cut) => getDate(cut).getFullYear() === year)

  return {
    anio: year,
    cortes: yearCuts.length,
    facturacion: sumCuts(yearCuts),
    porMes: monthNames.map((nombreMes, index) => {
      const monthCuts = yearCuts.filter((cut) => getDate(cut).getMonth() === index)

      return {
        mes: index + 1,
        nombreMes,
        cortes: monthCuts.length,
        facturacion: sumCuts(monthCuts)
      }
    })
  }
}

export const invalidateAppDataCache = () => {
  cache = null
}

export const getAppData = async (): Promise<AppData> => {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data
  }

  const [barbersResult, servicesResult, cutsResult, expensesResult] = await Promise.all([
    supabase.from('barbers').select('*'),
    supabase.from('services').select('*'),
    supabase.from('cuts').select('*').order('created_at', { ascending: false }),
    supabase.from('expenses').select('*').order('created_at', { ascending: false })
  ])

  const error = barbersResult.error
    ?? servicesResult.error
    ?? cutsResult.error
    ?? expensesResult.error

  if (error) throw error

  const barbers = (barbersResult.data ?? []).map(normalizeBarber)
  const services = (servicesResult.data ?? []).map(normalizeService)
  const barbersById = new Map(barbers.map((barber) => [barber.id, barber]))
  const servicesById = new Map(services.map((service) => [service.id, service]))
  const cuts = (cutsResult.data ?? []).map((cut) => normalizeCut(cut, barbersById, servicesById))
  const expenses = (expensesResult.data ?? []).map(normalizeExpense)

  const data = {
    dashboard: buildDashboard(cuts, expenses, barbers),
    month: buildMonthReport(cuts),
    year: buildYearReport(cuts),
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
