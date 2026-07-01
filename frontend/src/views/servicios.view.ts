import type { Service } from '../types'
import { formatMoney } from '../utils/formatters'

export const renderServicesView = (services: Service[]) => {
  return `
    <section class="admin-grid">
      <form id="serviceForm" class="form-card">
        <h2>Registrar servicio</h2>

        <label for="serviceName">Nombre del servicio</label>
        <input type="text" id="serviceName" placeholder="Ej: Corte clásico" required>

        <label for="servicePrice">Precio base</label>
        <input type="number" id="servicePrice" placeholder="Ej: 8000" required>

        <button type="submit">Guardar servicio</button>
      </form>

      <article class="panel">
        <div class="panel-header">
          <h2>Servicios</h2>
          <p>Servicios cargados en el sistema</p>
        </div>

        <div class="list">
          ${
            services.length === 0
              ? `<p class="empty">Todavía no hay servicios cargados.</p>`
              : services.map((service) => {
                  return `
                    <article class="list-item">
                      <div>
                        <h3>${service.nombre}</h3>
                        <p>Precio base</p>
                      </div>

                      <div class="list-actions">
                        <strong>${formatMoney(service.precioBase)}</strong>

                        <button 
                          type="button" 
                          class="edit-service-price-button" 
                          data-id="${service.id}"
                          data-name="${service.nombre}"
                          data-price="${service.precioBase}"
                        >
                          Editar precio
                        </button>
                      </div>
                    </article>
                  `
                }).join('')
          }
        </div>
      </article>
    </section>
  `
}