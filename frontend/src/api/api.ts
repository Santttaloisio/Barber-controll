import { supabase, supabaseConfigError } from '../lib/supabase'
import type {
  Barber,
  BootstrapData,
  Cut,
  Expense,
  ExpenseCategoryReport,
  LoginResponse,
  MonthReport,
  Service,
  User
} from '../types'

const USER_KEY = 'barber-control-user'

const getSupabase = () => {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase no esta configurado')
  }

  return supabase
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

const mapAuthUser = (user: any): User => ({
  username: user?.email ?? '',
  name: user?.user_metadata?.name ?? user?.user_metadata?.full_name ?? user?.email ?? 'Usuario'
})

export const getToken = () => {
  const authStorage = Object.keys(localStorage).find((key) => key.startsWith('sb-') && key.endsWith('-auth-token'))
  if (!authStorage) return null

  const session = JSON.parse(localStorage.getItem(authStorage) ?? 'null')
  return session?.access_token ?? null
}

export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export const getCurrentUser = async () => {
  if (!supabase) {
    localStorage.removeItem(USER_KEY)
    return null
  }

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    localStorage.removeItem(USER_KEY)
    return null
  }

  const user = mapAuthUser(data.user)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export const clearSession = () => {
  localStorage.removeItem(USER_KEY)
  void supabase?.auth.signOut()
}

const assertSupabase = ({ error }: { error: any }) => {
  if (error) throw new Error(error.message ?? 'Error de Supabase')
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
  categoria: toText(expense.categoria ?? expense.category, 'Gastos varios') as Expense['categoria'],
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
  barbersById: Map<number, Barber> = new Map(),
  servicesById: Map<number, Service> = new Map()
): Cut => {
  const barber = cut.Barber ?? cut.barber
  const service = cut.Service ?? cut.service
  const barberId = toNumber(cut.barberId ?? cut.barber_id)
  const serviceId = toNumber(cut.serviceId ?? cut.service_id)

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

const sortByDateDesc = <T extends { fecha: string }>(items: T[]) => {
  return [...items].sort((a, b) => getDate(b.fecha).getTime() - getDate(a.fecha).getTime())
}

const sumCuts = (cuts: Cut[]) => cuts.reduce((total, cut) => total + Number(cut.monto || 0), 0)

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
  const client = getSupabase()
  const { data, error } = await client.auth.signInWithPassword({
    email: username,
    password
  })

  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? 'No se pudo iniciar sesion')
  }

  const user = mapAuthUser(data.user)
  localStorage.setItem(USER_KEY, JSON.stringify(user))

  return {
    token: data.session.access_token,
    user
  }
}

export async function signUp(email: string, password: string, name?: string): Promise<LoginResponse> {
  const client = getSupabase()
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })

  if (error || !data.user) {
    throw new Error(error?.message ?? 'No se pudo crear la cuenta')
  }

  const user = mapAuthUser(data.user)
  localStorage.setItem(USER_KEY, JSON.stringify(user))

  return {
    token: data.session?.access_token ?? '',
    user
  }
}

export async function getBootstrap(): Promise<BootstrapData> {
  const client = getSupabase()
  const [barbersRes, servicesRes, cutsRes, expensesRes] = await Promise.all([
    client.from('barbers').select('*'),
    client.from('services').select('*'),
    client.from('cuts').select('*'),
    client.from('expenses').select('*')
  ])

  const firstError = barbersRes.error ?? servicesRes.error ?? cutsRes.error ?? expensesRes.error
  if (firstError) throw new Error(firstError.message)

  const allBarbers = (barbersRes.data ?? []).map(normalizeBarber)
  const barbers = allBarbers.filter((barber) => barber.activo)
  const services = (servicesRes.data ?? []).map(normalizeService)
  const expenses = sortByDateDesc((expensesRes.data ?? []).map(normalizeExpense))
  const barbersById = new Map(allBarbers.map((barber) => [barber.id, barber]))
  const servicesById = new Map(services.map((service) => [service.id, service]))
  const cuts = sortByDateDesc(
    (cutsRes.data ?? []).map((cut) => normalizeCut(cut, barbersById, servicesById))
  )

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
  const res = await getSupabase()
    .from('barbers')
    .insert([{ name: data.nombre ?? data.name, active: true }])
    .select()
    .single()

  assertSupabase(res)
  return res.data
}

export async function deleteBarber(id: number) {
  const res = await getSupabase()
    .from('barbers')
    .update({ active: false })
    .eq('id', id)
    .select()
    .single()

  assertSupabase(res)
  return res.data
}

export async function createCut(data: any) {
  const res = await getSupabase()
    .from('cuts')
    .insert([{
      barber_id: data.barberId ?? data.barber_id,
      service_id: data.serviceId ?? data.service_id,
      price: data.monto ?? data.price,
      payment_method: data.metodoPago ?? data.payment_method,
      observation: data.observacion ?? data.observation
    }])
    .select()
    .single()

  assertSupabase(res)
  return res.data
}

export async function createService(data: any) {
  const res = await getSupabase()
    .from('services')
    .insert([{
      name: data.nombre ?? data.name,
      price: data.precioBase ?? data.price
    }])
    .select()
    .single()

  assertSupabase(res)
  return res.data
}

export async function updateService(id: number, data: any) {
  const res = await getSupabase()
    .from('services')
    .update({
      name: data.nombre ?? data.name,
      price: data.precioBase ?? data.price
    })
    .eq('id', id)
    .select()
    .single()

  assertSupabase(res)
  return res.data
}

export async function createExpense(data: any) {
  const res = await getSupabase()
    .from('expenses')
    .insert([{
      category: data.categoria ?? data.category,
      description: data.descripcion ?? data.description,
      amount: data.monto ?? data.amount,
      payment_method: data.metodoPago ?? data.paymentMethod,
      date: data.fecha ?? data.date,
      observation: data.observacion ?? data.observation
    }])
    .select()
    .single()

  assertSupabase(res)
  return res.data
}

export async function deleteExpense(id: number) {
  const res = await getSupabase()
    .from('expenses')
    .delete()
    .eq('id', id)

  assertSupabase(res)
}
