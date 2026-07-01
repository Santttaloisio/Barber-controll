export const renderEditServicePriceModal = () => {
  return `
    <div id="editServiceModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h2>Editar precio</h2>
            <p>Actualizá el precio base del servicio</p>
          </div>

          <button id="closeEditServiceModal" class="close-button">×</button>
        </div>

        <form id="editServicePriceForm" class="form-card modal-form">
          <input type="hidden" id="editServiceId">

          <label for="editServiceName">Servicio</label>
          <input type="text" id="editServiceName" disabled>

          <label for="editServicePrice">Nuevo precio</label>
          <input type="number" id="editServicePrice" placeholder="Ej: 18000" required>

          <button type="submit">Guardar nuevo precio</button>
        </form>
      </div>
    </div>
  `
}