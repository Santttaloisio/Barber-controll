import type { Barber } from '../types'

export const renderBarbersView = (barbers: Barber[]) => {
  const activeBarbers = barbers.filter((barber) => {
    return barber.activo
  })

  return `
    <section class="admin-grid">
      <form id="barberForm" class="form-card">
        <h2>Registrar barbero</h2>

        <label for="barberName">Nombre</label>
        <input type="text" id="barberName" placeholder="Ej: Juan" required>

        <button type="submit">Guardar barbero</button>
      </form>

      <article class="panel">
        <div class="panel-header">
          <h2>Barberos</h2>
          <p>Barberos activos en el sistema</p>
        </div>

        <div class="list">
          ${
            activeBarbers.length === 0
              ? `<p class="empty">Todavía no hay barberos activos.</p>`
              : activeBarbers.map((barber) => {
                  return `
                    <article class="list-item">
                      <div>
                        <h3>${barber.nombre}</h3>
                        <p>Activo</p>
                      </div>

                      <div class="list-actions">
                        <button 
                          type="button" 
                          class="delete-barber-button" 
                          data-id="${barber.id}"
                        >
                          Eliminar
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