export type Barber = {
  id: number
  nombre: string
  activo: boolean
  createdAt?: string
  updatedAt?: string
}

export type Service = {
  id: number
  nombre: string
  precioBase: number
  createdAt?: string
  updatedAt?: string
}

export type Cut = {
  id: number
  barberId: number
  serviceId: number
  monto: number
  metodoPago: string
  observacion?: string | null
  fecha: string
  Barber?: Barber
  Service?: Service
  createdAt?: string
  updatedAt?: string
}

export type BarberReport = {
  barberId: number
  nombre: string
  cortes: number
  facturacion: number
}

export type PaymentMethodReport = {
  metodoPago: string
  cortes: number
  facturacion: number
}

export type DashboardReport = {
  hoy: {
    cortes: number
    facturacion: number
    porMetodoPago: PaymentMethodReport[]
  }
  mes: {
    cortes: number
    facturacion: number
    porMetodoPago: PaymentMethodReport[]
    gananciaEstimada: number
    gastosPorCategoria: ExpenseCategoryReport[]
    gastos: number
  }
  facturacionPorBarbero: BarberReport[]
}

export type DayReport = {
  fecha: string
  cortes: number
  facturacion: number
}

export type MonthReport = {
  mes: number
  anio: number
  cortes: number
  facturacion: number
  porDia: DayReport[]
  detalle: Cut[]
}

export type CreateBarberPayload = {
  nombre: string
}

export type CreateServicePayload = {
  nombre: string
  precioBase: number
}

export type CreateCutPayload = {
  barberId: number
  serviceId: number
  monto: number
  metodoPago: string
  observacion?: string
}

export type paymentMethod = {
  metodoPago: string
  cortes :number
  facturacion: number
}

export type ExpenseCategory =
  | 'Servicios'
  | 'Gastos barbería'
  | 'Gastos varios'

export type Expense = {
  id: number
  categoria: ExpenseCategory
  descripcion: string
  monto: number
  metodoPago: string
  fecha: string
  observacion?: string | null
  createdAt?: string
  updatedAt?: string
}

export type CreateExpensePayload = {
  categoria: ExpenseCategory
  descripcion: string
  monto: number
  metodoPago: string
  fecha?: string
  observacion?: string
}

export type ExpenseCategoryReport = {
  categoria: string
  cantidad: number
  total: number
}

export type MonthResume = {
  mes: number
  nombreMes: string
  cortes: number
  facturacion: number
}

export type YearReport = {
  anio: number
  cortes: number
  facturacion: number
  porMes: MonthResume[]
}

export type DashboardChartMode = 'month' | 'year'
export type DashboardSummaryMode = 'payments' | 'barbers' | 'expenses'

