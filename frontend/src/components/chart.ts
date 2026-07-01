import type { DayReport, MonthResume } from '../types'
import { formatMoney } from '../utils/formatters'

const getRoundedMax = (value: number) => {
  if (value <= 0) return 1

  const magnitude = 10 ** Math.floor(Math.log10(value))

  return Math.ceil(value / magnitude) * magnitude
}

const formatCompactMoney = (value: number) => {
  if (value >= 1000000) {
    return `$ ${(value / 1000000).toFixed(1)}M`
  }

  if (value >= 1000) {
    return `$ ${Math.round(value / 1000)}k`
  }

  return `$ ${value}`
}

const renderMoneyAxis = (maxValue: number) => {
  const values = [
    maxValue,
    maxValue * 0.75,
    maxValue * 0.5,
    maxValue * 0.25,
    0
  ]

  return `
    <div class="bar-chart-axis">
      ${values.map((value) => {
        return `<span>${formatCompactMoney(Math.round(value))}</span>`
      }).join('')}
    </div>
  `
}

export const renderCutsByDayChart = (days: DayReport[]) => {
  const hasData = days.some((day) => {
    return day.cortes > 0 || day.facturacion > 0
  })

  if (!hasData) {
    return `<p class="empty">Todavía no hay cortes cargados este mes.</p>`
  }

  const maxBilling = Math.max(...days.map((day) => day.facturacion), 1)
  const axisMax = getRoundedMax(maxBilling)

  return `
    <div class="bar-chart-with-axis">
      ${renderMoneyAxis(axisMax)}

      <div class="bar-chart-scroll">
        <div class="bar-chart">
          ${days.map((day) => {
            const height = day.facturacion > 0
              ? Math.max((day.facturacion / axisMax) * 100, 4)
              : 0

            return `
              <div class="bar-chart-item">
                <div class="bar-wrapper">
                  <div 
                    class="bar" 
                    style="height: ${height}%"
                    title="${day.cortes} cortes · ${formatMoney(day.facturacion)}"
                  ></div>
                </div>

                <span>${day.fecha.slice(8, 10)}</span>
              </div>
            `
          }).join('')}
        </div>
      </div>
    </div>
  `
}

export const renderCutsByMonthChart = (months: MonthResume[]) => {
  const hasData = months.some((month) => {
    return month.cortes > 0 || month.facturacion > 0
  })

  if (!hasData) {
    return `<p class="empty">Todavía no hay cortes cargados este año.</p>`
  }

  const maxBilling = Math.max(...months.map((month) => month.facturacion), 1)
  const axisMax = getRoundedMax(maxBilling)

  return `
    <div class="bar-chart-with-axis">
      ${renderMoneyAxis(axisMax)}

      <div class="bar-chart-scroll">
        <div class="bar-chart">
          ${months.map((month) => {
            const height = month.facturacion > 0
              ? Math.max((month.facturacion / axisMax) * 100, 4)
              : 0

            return `
              <div class="bar-chart-item">
                <div class="bar-wrapper">
                  <div 
                    class="bar" 
                    style="height: ${height}%"
                    title="${month.cortes} cortes · ${formatMoney(month.facturacion)}"
                  ></div>
                </div>

                <span>${month.nombreMes.slice(0, 3)}</span>
              </div>
            `
          }).join('')}
        </div>
      </div>
    </div>
  `
}