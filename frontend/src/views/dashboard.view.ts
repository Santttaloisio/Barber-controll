import type {
  DashboardChartMode,
  DashboardReport,
  DashboardSummaryMode,
  ExpenseCategoryReport,
  MonthReport,
  TodayCutReport,
  YearReport
} from '../types'

import { formatMoney } from '../utils/formatters'
import { renderCutsByDayChart, renderCutsByMonthChart } from '../components/chart'

const safeArray = <T,>(arr: T[] | undefined | null): T[] => {
  return Array.isArray(arr) ? arr : []
}

const renderTodayCuts = (cuts?: TodayCutReport[]) => {
  const data = safeArray(cuts)

  if (data.length === 0) {
    return `<p class="empty">Todavia no hay cortes cargados hoy.</p>`
  }

  return data.map((cut) => `
    <article class="barber-item">
      <div>
        <h3>${cut.nombreBarbero ?? 'Sin nombre'}</h3>
        <p>${cut.metodoPago ?? 'Sin metodo'}</p>
      </div>
      <strong>${formatMoney(cut.monto ?? 0)}</strong>
    </article>
  `).join('')
}

const renderExpenseCategories = (categories?: ExpenseCategoryReport[]) => {
  const data = safeArray(categories)

  if (data.length === 0) {
    return `<p class="empty">Sin gastos registrados.</p>`
  }

  return data.map((c) => `
    <article class="barber-item">
      <div>
        <h3>${c.categoria ?? 'Sin categoria'}</h3>
        <p>${c.cantidad ?? 0} gastos</p>
      </div>
      <strong>${formatMoney(c.total ?? 0)}</strong>
    </article>
  `).join('')
}

const renderBarberBilling = (dashboard?: DashboardReport) => {
  const data = safeArray(dashboard?.facturacionPorBarbero)

  if (data.length === 0) {
    return `<p class="empty">Sin cortes registrados.</p>`
  }

  return data.map((b) => `
    <article class="barber-item">
      <div>
        <h3>${b.nombre ?? 'Sin nombre'}</h3>
        <p>${b.cortes ?? 0} cortes</p>
      </div>
      <strong>${formatMoney(b.facturacion ?? 0)}</strong>
    </article>
  `).join('')
}

const getSummaryTitle = (mode: DashboardSummaryMode) => {
  if (mode === 'payments') return 'Cortes del dia'
  if (mode === 'barbers') return 'Barberos'
  return 'Gastos'
}

const getSummaryDescription = (mode: DashboardSummaryMode) => {
  if (mode === 'payments') return 'Cortes realizados hoy'
  if (mode === 'barbers') return 'Rendimiento por barbero'
  return 'Gastos del periodo'
}

export const renderDashboardView = (
  dashboard: DashboardReport | null,
  monthReport: MonthReport | null,
  yearReport: YearReport | null,
  chartMode: DashboardChartMode,
  summaryMode: DashboardSummaryMode
) => {
  if (!dashboard || !monthReport || !yearReport) {
    return `
      <section class="panel">
        <p class="empty">Cargando dashboard...</p>
      </section>
    `
  }

  return `
    <section class="cards">
      <article class="card">
        <span>Cortes hoy</span>
        <strong>${dashboard.hoy?.cortes ?? 0}</strong>
      </article>

      <article class="card">
        <span>Facturacion hoy</span>
        <strong>${formatMoney(dashboard.hoy?.facturacion ?? 0)}</strong>
      </article>

      <article class="card">
        <span>Cortes mes</span>
        <strong>${dashboard.mes?.cortes ?? 0}</strong>
      </article>

      <article class="card">
        <span>Facturacion mes</span>
        <strong>${formatMoney(dashboard.mes?.facturacion ?? 0)}</strong>
      </article>

      <article class="card">
        <span>Gastos</span>
        <strong>${formatMoney(dashboard.mes?.gastos ?? 0)}</strong>
      </article>

      <article class="card">
        <span>Ganancia</span>
        <strong>${formatMoney(dashboard.mes?.gananciaEstimada ?? 0)}</strong>
      </article>
    </section>

    <section class="dashboard-main-grid">

      <article class="panel">
        <h2>
          ${chartMode === 'month' ? 'Facturacion mensual' : 'Facturacion anual'}
        </h2>

        <div class="chart">
          ${
            chartMode === 'month'
              ? renderCutsByDayChart(monthReport?.porDia ?? [])
              : renderCutsByMonthChart(yearReport?.porMes ?? [])
          }
        </div>
      </article>

      <article class="panel">
        <h2>${getSummaryTitle(summaryMode)}</h2>
        <p>${getSummaryDescription(summaryMode)}</p>

        <div class="barber-list">
          ${
            summaryMode === 'payments'
              ? renderTodayCuts(dashboard.hoy?.detalle)
              : summaryMode === 'barbers'
                ? renderBarberBilling(dashboard)
                : renderExpenseCategories(dashboard.mes?.gastosPorCategoria)
          }
        </div>
      </article>

    </section>
  `
}
