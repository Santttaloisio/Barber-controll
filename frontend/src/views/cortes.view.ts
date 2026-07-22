import type { Barber, Cut, Service } from '../types'
import { formatDate, formatMoney } from '../utils/formatters'

export type CutFilters = {
  fromDate: string
  toDate: string
  barberId: string
  paymentMethod: string
}

const defaultFilters: CutFilters = {
  fromDate: '',
  toDate: '',
  barberId: '',
  paymentMethod: ''
}

const getUniquePaymentMethods = (cuts: Cut[]) => {
  const paymentMethods = new Set<string>()

  cuts.forEach((cut) => {
    if (cut.metodoPago) {
      paymentMethods.add(cut.metodoPago)
    }
  })

  return Array.from(paymentMethods)
}

const filterCuts = (cuts: Cut[], filters: CutFilters) => {
  return cuts.filter((cut) => {
    const cutDate = new Date(cut.fecha)

    const fromDate = filters.fromDate
      ? new Date(`${filters.fromDate}T00:00:00`)
      : null

    const toDate = filters.toDate
      ? new Date(`${filters.toDate}T23:59:59`)
      : null

    const matchesFromDate = fromDate ? cutDate >= fromDate : true
    const matchesToDate = toDate ? cutDate <= toDate : true

    const matchesBarber = filters.barberId
      ? cut.barberId === Number(filters.barberId)
      : true

    const matchesPaymentMethod = filters.paymentMethod
      ? cut.metodoPago === filters.paymentMethod
      : true

    return matchesFromDate && matchesToDate && matchesBarber && matchesPaymentMethod
  })
}

export const renderCutsView = (
  cuts: Cut[],
  barbers: Barber[],
  services: Service[],
  filters: CutFilters = defaultFilters
) => {
  const filteredCuts = filterCuts(cuts, filters)
  const paymentMethods = getUniquePaymentMethods(cuts)
  const barbersById = new Map(barbers.map((barber) => [barber.id, barber]))
  const servicesById = new Map(services.map((service) => [service.id, service]))

  const totalFiltered = filteredCuts.reduce((total, cut) => {
    return total + Number(cut.monto)
  }, 0)

  return `
    <section class="panel">
      <div class="panel-header">
        <h2>Cortes registrados</h2>
        <p>Historial de cortes cargados en el sistema</p>
      </div>

      <div class="filters-card">
        <div class="filters-grid">
          <div>
            <label for="cutFilterFrom">Desde</label>
            <input 
              type="date" 
              id="cutFilterFrom" 
              value="${filters.fromDate}"
            >
          </div>

          <div>
            <label for="cutFilterTo">Hasta</label>
            <input 
              type="date" 
              id="cutFilterTo" 
              value="${filters.toDate}"
            >
          </div>

          <div>
            <label for="cutFilterBarber">Barbero</label>
            <select id="cutFilterBarber">
              <option value="">Todos</option>
              ${barbers.map((barber) => {
                return `
                  <option 
                    value="${barber.id}" 
                    ${filters.barberId === String(barber.id) ? 'selected' : ''}
                  >
                    ${barber.nombre}
                  </option>
                `
              }).join('')}
            </select>
          </div>

          <div>
            <label for="cutFilterPayment">Método de pago</label>
            <select id="cutFilterPayment">
              <option value="">Todos</option>
              ${paymentMethods.map((method) => {
                return `
                  <option 
                    value="${method}" 
                    ${filters.paymentMethod === method ? 'selected' : ''}
                  >
                    ${method}
                  </option>
                `
              }).join('')}
            </select>
          </div>
        </div>

        <div class="filters-summary">
          <div>
            <strong>${filteredCuts.length}</strong>
            <span>cortes encontrados</span>
          </div>

          <div>
            <strong>${formatMoney(totalFiltered)}</strong>
            <span>total filtrado</span>
          </div>

          <button id="clearCutFilters" type="button">
            Ver cortes de hoy
          </button>
        </div>
      </div>

      <div class="list cuts-scroll-list">
        ${
          filteredCuts.length === 0
            ? `<p class="empty">No hay cortes que coincidan con los filtros.</p>`
            : filteredCuts.map((cut) => {
                const barberName = cut.Barber?.nombre
                  ?? barbersById.get(cut.barberId)?.nombre
                  ?? 'Sin barbero'
                const serviceName = cut.Service?.nombre
                  ?? servicesById.get(cut.serviceId)?.nombre
                  ?? 'Sin servicio'
                const observation = cut.observacion?.trim()

                return `
                  <article class="list-item">
                    <div>
                      <h3>${serviceName}</h3>
                      <p>${barberName} · ${formatDate(cut.fecha)} · ${cut.metodoPago}</p>

                      ${
                        observation
                          ? `<p class="cut-observation">Obs: ${observation}</p>`
                          : ''
                      }
                    </div>

                    <strong>${formatMoney(cut.monto)}</strong>
                  </article>
                `
              }).join('')
        }
      </div>
    </section>
  `
}
