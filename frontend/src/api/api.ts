import type {
  Barber,
  CreateBarberPayload,
  CreateCutPayload,
  CreateExpensePayload,
  CreateServicePayload,
  Cut,
  DashboardReport,
  Expense,
  MonthReport,
  Service,
  YearReport
} from '../types'

const API_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api'

const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, options)

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new Error(
      errorData?.message || `Error en la petición: ${endpoint}`
    )
  }

  return response.json()
}

const jsonHeaders = {
  'Content-Type': 'application/json'
}

export const getDashboardReport = () => {
  return request<DashboardReport>('/reportes/dashboard')
}

export const getMonthReport = () => {
  return request<MonthReport>('/reportes/mes')
}

export const getCuts = () => {
  return request<Cut[]>('/cortes')
}

export const getBarbers = () => {
  return request<Barber[]>('/barberos')
}

export const getServices = () => {
  return request<Service[]>('/servicios')
}

export const getExpenses = () => {
  return request<Expense[]>('/gastos')
}

export const createBarber = (payload: CreateBarberPayload) => {
  return request('/barberos', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
}

export const createService = (payload: CreateServicePayload) => {
  return request('/servicios', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
}

export const updateServicePrice = (id: number, precioBase: number) => {
  return request(`/servicios/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({
      precioBase
    })
  })
}

export const deleteService = (id: number) => {
  return request(`/servicios/${id}`, {
    method: 'DELETE'
  })
}

export const createCut = (payload: CreateCutPayload) => {
  return request('/cortes', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
}

export const deleteBarber = (id: number) => {
  return request(`/barberos/${id}`, {
    method: 'DELETE'
  })
}

export const createExpense = (payload: CreateExpensePayload) => {
  return request('/gastos', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
}

export const deleteExpense = (id: number) => {
  return request(`/gastos/${id}`, {
    method: 'DELETE'
  })
}

export const getYearReport = () => {
  return request<YearReport>('/reportes/anio')
}