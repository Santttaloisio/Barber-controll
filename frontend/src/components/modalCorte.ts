import type { Barber, Service } from '../types'
import { formatMoney } from '../utils/formatters'

export const renderCutModal = (barbers: Barber[], services: Service[]) => {
  const activeBarbers = barbers.filter((barber) => barber.activo)

  return `
    <button id="openCutModal" class="floating-button">+</button>

    <div id="cutModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>Registrar corte</h2>
            <p>Cargar un nuevo corte realizado</p>
          </div>

          <button id="closeCutModal" class="close-button">×</button>
        </div>

        <form id="cutForm" class="form-card modal-form">
          <label for="barberId">Barbero</label>
          <select id="barberId" required>
            <option value="">Seleccionar barbero</option>
            ${activeBarbers.map((barber) => {
              return `<option value="${barber.id}">${barber.nombre}</option>`
            }).join('')}
          </select>

          <label for="serviceId">Servicio</label>
          <select id="serviceId" required>
            <option value="">Seleccionar servicio</option>
            ${services.map((service) => {
              return `
                <option value="${service.id}">
                  ${service.nombre} - ${formatMoney(service.precioBase)}
                </option>
              `
            }).join('')}
          </select>

          <label for="cutAmount">Monto cobrado</label>
          <input type="number" id="cutAmount" placeholder="Ej: 8000" required>

          <label for="paymentMethod">Método de pago</label>
          <select id="paymentMethod" required>
            <option value="">Seleccionar método</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Mercado Pago">Mercado Pago</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>

          <label for="cutObservation">Observación</label>
          <textarea id="cutObservation" placeholder="Opcional"></textarea>

          <button type="submit">Registrar corte</button>
        </form>
      </div>
    </div>
  `
}
