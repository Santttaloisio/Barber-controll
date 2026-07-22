export const renderEditServicePriceModal = () => {
  return `
    <div id="editServiceModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>Editar servicio</h2>
            <p>Actualiza el nombre y el precio base</p>
          </div>

          <button id="closeEditServiceModal" class="close-button">x</button>
        </div>

        <form id="editServicePriceForm" class="form-card modal-form">
          <input type="hidden" id="editServiceId">

          <label for="editServiceName">Servicio</label>
          <input type="text" id="editServiceName" required>

          <label for="editServicePrice">Precio base</label>
          <input type="number" id="editServicePrice" placeholder="Ej: 18000" required>

          <button type="submit">Guardar cambios</button>
        </form>
      </div>
    </div>
  `
}
