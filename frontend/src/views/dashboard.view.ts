import type {
  DashboardChartMode,
  DashboardReport,
  DashboardSummaryMode,
  ExpenseCategoryReport,
  MonthReport,
  PaymentMethodReport,
  YearReport
} from '../types'

import { formatMoney } from '../utils/formatters'
import {
  renderCutsByDayChart,
  renderCutsByMonthChart
} from '../components/chart'

const renderPaymentMethods = (paymentMethods: PaymentMethodReport[]) => {
  if (paymentMethods.length === 0) {
    return `<p class="empty">Todavía no hay pagos registrados este mes.</p>`
  }

  return paymentMethods.map((payment) => {
    return `
      <article class="barber-item">
        <div>
          <h3>${payment.metodoPago}</h3>
          <p>${payment.cortes} cortes cobrados</p>
        </div>

        <strong>${formatMoney(payment.facturacion)}</strong>
      </article>
    `
  }).join('')
}

const renderExpenseCategories = (categories: ExpenseCategoryReport[]) => {
  if (categories.length === 0) {
    return `<p class="empty">Todavía no hay gastos registrados este mes.</p>`
  }

  return categories.map((category) => {
    return `
      <article class="barber-item">
        <div>
          <h3>${category.categoria}</h3>
          <p>${category.cantidad} gastos cargados</p>
        </div>

        <strong>${formatMoney(category.total)}</strong>
      </article>
    `
  }).join('')
}

const renderBarberBilling = (dashboard: DashboardReport) => {
  if (dashboard.facturacionPorBarbero.length === 0) {
    return `<p class="empty">Todavía no hay cortes cargados.</p>`
  }

  return dashboard.facturacionPorBarbero.map((barber) => {
    return `
      <article class="barber-item">
        <div>
          <h3>${barber.nombre}</h3>
          <p>${barber.cortes} cortes realizados</p>
        </div>

        <strong>${formatMoney(barber.facturacion)}</strong>
      </article>
    `
  }).join('')
}

const getSummaryTitle = (summaryMode: DashboardSummaryMode) => {
  if (summaryMode === 'payments') {
    return 'Métodos de pago'
  }

  if (summaryMode === 'barbers') {
    return 'Facturación por barbero'
  }

  return 'Gastos por categoría'
}

const getSummaryDescription = (summaryMode: DashboardSummaryMode) => {
  if (summaryMode === 'payments') {
    return 'Resumen de cobros del mes actual'
  }

  if (summaryMode === 'barbers') {
    return 'Resumen de rendimiento por barbero'
  }

  return 'Resumen de gastos del mes actual'
}

const renderSummaryContent = (
  dashboard: DashboardReport,
  summaryMode: DashboardSummaryMode
) => {
  if (summaryMode === 'payments') {
    return renderPaymentMethods(dashboard.mes.porMetodoPago)
  }

  if (summaryMode === 'barbers') {
    return renderBarberBilling(dashboard)
  }

  return renderExpenseCategories(dashboard.mes.gastosPorCategoria)
}

export const renderDashboardView = (
  dashboard: DashboardReport,
  monthReport: MonthReport,
  yearReport: YearReport,
  chartMode: DashboardChartMode,
  summaryMode: DashboardSummaryMode
) => {
  return `
    <section class="cards">
      <article class="card">
        <span>Cortes de hoy</span>
        <strong>${dashboard.hoy.cortes}</strong>
      </article>

      <article class="card">
        <span>Facturación de hoy</span>
        <strong>${formatMoney(dashboard.hoy.facturacion)}</strong>
      </article>

      <article class="card">
        <span>Cortes del mes</span>
        <strong>${dashboard.mes.cortes}</strong>
      </article>

      <article class="card">
        <span>Facturación mensual</span>
        <strong>${formatMoney(dashboard.mes.facturacion)}</strong>
      </article>

      <article class="card">
        <span>Gastos del mes</span>
        <strong>${formatMoney(dashboard.mes.gastos)}</strong>
      </article>

      <article class="card">
        <span>Ganancia estimada</span>
        <strong>${formatMoney(dashboard.mes.gananciaEstimada)}</strong>
      </article>
    </section>

    <section class="dashboard-main-grid">
      <article class="panel chart-panel">
        <div class="panel-header chart-panel-header">
          <div>
            <h2>${chartMode === 'month' ? 'Facturación por día' : 'Facturación por mes'}</h2>
            <p>
              ${
                chartMode === 'month'
                  ? 'Resumen del mes actual'
                  : `Resumen del año ${yearReport.anio}`
              }
            </p>
          </div>

          <div class="chart-mode-actions">
            <button
              type="button"
              class="chart-mode-button ${chartMode === 'month' ? 'active' : ''}"
              data-chart-mode="month"
            >
              Mes
            </button>

            <button
              type="button"
              class="chart-mode-button ${chartMode === 'year' ? 'active' : ''}"
              data-chart-mode="year"
            >
              Año
            </button>
          </div>
        </div>

        <div class="chart chart-large">
          ${
            chartMode === 'month'
              ? renderCutsByDayChart(monthReport.porDia)
              : renderCutsByMonthChart(yearReport.porMes)
          }
        </div>
      </article>

      <article class="panel dashboard-summary-panel">
        <div class="panel-header summary-panel-header">
          <div>
            <h2>${getSummaryTitle(summaryMode)}</h2>
            <p>${getSummaryDescription(summaryMode)}</p>
          </div>

          <div class="summary-mode-actions">
            <button
              type="button"
              class="summary-mode-button ${summaryMode === 'payments' ? 'active' : ''}"
              data-summary-mode="payments"
            >
              Pagos
            </button>

            <button
              type="button"
              class="summary-mode-button ${summaryMode === 'barbers' ? 'active' : ''}"
              data-summary-mode="barbers"
            >
              Barberos
            </button>

            <button
              type="button"
              class="summary-mode-button ${summaryMode === 'expenses' ? 'active' : ''}"
              data-summary-mode="expenses"
            >
              Gastos
            </button>
          </div>
        </div>

        <div class="dashboard-summary-content">
          <div class="barber-list">
            ${renderSummaryContent(dashboard, summaryMode)}
          </div>
        </div>
      </article>
    </section>
  `
}