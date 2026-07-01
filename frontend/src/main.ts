import './style.css'

import {
  createBarber,
  createCut,
  createExpense,
  createService,
  deleteBarber,
  deleteExpense,
  getBarbers,
  getCuts,
  getDashboardReport,
  getExpenses,
  getMonthReport,
  getServices,
  getYearReport,
  updateServicePrice
} from './api/api'

import type {
  Barber,
  Cut,
  DashboardChartMode,
  DashboardReport,
  DashboardSummaryMode,
  Expense,
  ExpenseCategory,
  MonthReport,
  Service,
  YearReport
} from './types'

import { renderTabs, type ViewName } from './components/tabs'
import { renderCutModal } from './components/modalCorte'
import { renderEditServicePriceModal } from './components/modalEditarServicios'
import { renderDashboardView } from './views/dashboard.view'
import { renderCutsView, type CutFilters } from './views/cortes.view'
import { renderBarbersView } from './views/barbero.view'
import { renderServicesView } from './views/servicios.view'
import { renderExpensesView, type ExpenseFilters } from './views/gastos.view'

const app = document.querySelector<HTMLDivElement>('#app')

let currentView: ViewName = 'dashboard'

let dashboardReport: DashboardReport | null = null
let monthReport: MonthReport | null = null
let yearReport: YearReport | null = null

let cuts: Cut[] = []
let barbers: Barber[] = []
let services: Service[] = []
let expenses: Expense[] = []

let dashboardChartMode: DashboardChartMode = 'month'
let dashboardSummaryMode: DashboardSummaryMode = 'payments'

const getTodayInputDate = () => {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

let cutFilters: CutFilters = {
  fromDate: getTodayInputDate(),
  toDate: getTodayInputDate(),
  barberId: '',
  paymentMethod: ''
}

let expenseFilters: ExpenseFilters = {
  fromDate: '',
  toDate: '',
  category: '',
  paymentMethod: ''
}

const renderLoading = () => {
  if (!app) return

  app.innerHTML = `
    <main class="layout">
      <section class="panel">
        <p class="empty">Cargando aplicación...</p>
      </section>
    </main>
  `
}

const showMessage = (text: string) => {
  const message = document.querySelector<HTMLParagraphElement>('#message')

  if (!message) return

  message.textContent = text
  message.classList.add('active')

  setTimeout(() => {
    message.classList.remove('active')
    message.textContent = ''
  }, 3000)
}

const loadDashboardData = async () => {
  dashboardReport = await getDashboardReport()
  monthReport = await getMonthReport()
  yearReport = await getYearReport()
}

const loadCutsData = async () => {
  cuts = await getCuts()
}

const loadBarbersData = async () => {
  barbers = await getBarbers()
}

const loadServicesData = async () => {
  services = await getServices()
}

const loadExpensesData = async () => {
  expenses = await getExpenses()
}

const getCurrentViewHtml = () => {
  if (currentView === 'dashboard') {
    if (!dashboardReport || !monthReport || !yearReport) {
      return `<section class="panel"><p class="empty">Cargando dashboard...</p></section>`
    }

    return renderDashboardView(
      dashboardReport,
      monthReport,
      yearReport,
      dashboardChartMode,
      dashboardSummaryMode
    )
  }

  if (currentView === 'cortes') {
    return renderCutsView(cuts, cutFilters)
  }

  if (currentView === 'barberos') {
    return renderBarbersView(barbers)
  }

  if (currentView === 'servicios') {
    return renderServicesView(services)
  }

  if (currentView === 'gastos') {
    return renderExpensesView(expenses, expenseFilters)
  }

  return ''
}

const renderApp = () => {
  if (!app) return

  app.innerHTML = `
    <main class="layout">
      <section class="hero hero-logo">
        <img
          class="brand-logo"
          src="/assets/west-coast-logo.jpg"
          alt="West Coast Studio"
        >
      </section>

      ${renderTabs(currentView)}

      <section class="content">
        ${getCurrentViewHtml()}
      </section>
    </main>

    ${renderCutModal(barbers, services)}
    ${renderEditServicePriceModal()}

    <p id="message" class="message"></p>
  `

  setupEvents()
}

const setupEvents = () => {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>('.tab')

  tabButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const view = button.dataset.view as ViewName

      currentView = view

      if (view === 'dashboard') {
        await loadDashboardData()
      }

      if (view === 'cortes') {
        await loadCutsData()
      }

      if (view === 'barberos') {
        await loadBarbersData()
      }

      if (view === 'servicios') {
        await loadServicesData()
      }

      if (view === 'gastos') {
        await loadExpensesData()
      }

      renderApp()
    })
  })

  const chartModeButtons = document.querySelectorAll<HTMLButtonElement>('.chart-mode-button')

  chartModeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.chartMode as DashboardChartMode

      dashboardChartMode = mode

      renderApp()
    })
  })

  const summaryModeButtons = document.querySelectorAll<HTMLButtonElement>('.summary-mode-button')

  summaryModeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.summaryMode as DashboardSummaryMode

      dashboardSummaryMode = mode

      renderApp()
    })
  })

  const deleteBarberButtons = document.querySelectorAll<HTMLButtonElement>('.delete-barber-button')

  deleteBarberButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const barberId = Number(button.dataset.id)

      const confirmDelete = confirm(
        '¿Seguro que querés eliminar este barbero? No aparecerá más para cargar cortes nuevos.'
      )

      if (!confirmDelete) return

      try {
        await deleteBarber(barberId)

        await loadBarbersData()
        renderApp()
        showMessage('Barbero eliminado correctamente')
      } catch (error) {
        showMessage('No se pudo eliminar el barbero')
      }
    })
  })

  const editServiceModal = document.querySelector<HTMLDivElement>('#editServiceModal')
  const closeEditServiceModal = document.querySelector<HTMLButtonElement>('#closeEditServiceModal')
  const editServicePriceButtons = document.querySelectorAll<HTMLButtonElement>('.edit-service-price-button')
  const editServicePriceForm = document.querySelector<HTMLFormElement>('#editServicePriceForm')

  editServicePriceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const serviceId = button.dataset.id ?? ''
      const serviceName = button.dataset.name ?? ''
      const currentPrice = button.dataset.price ?? ''

      const serviceIdInput = document.querySelector<HTMLInputElement>('#editServiceId')
      const serviceNameInput = document.querySelector<HTMLInputElement>('#editServiceName')
      const servicePriceInput = document.querySelector<HTMLInputElement>('#editServicePrice')

      if (!serviceIdInput || !serviceNameInput || !servicePriceInput) return

      serviceIdInput.value = serviceId
      serviceNameInput.value = serviceName
      servicePriceInput.value = currentPrice

      editServiceModal?.classList.add('active')
    })
  })

  closeEditServiceModal?.addEventListener('click', () => {
    editServiceModal?.classList.remove('active')
  })

  editServiceModal?.addEventListener('click', (event) => {
    if (event.target === editServiceModal) {
      editServiceModal.classList.remove('active')
    }
  })

  editServicePriceForm?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const serviceIdInput = document.querySelector<HTMLInputElement>('#editServiceId')
    const servicePriceInput = document.querySelector<HTMLInputElement>('#editServicePrice')

    if (!serviceIdInput || !servicePriceInput) return

    const serviceId = Number(serviceIdInput.value)
    const priceNumber = Number(servicePriceInput.value)

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      showMessage('El precio ingresado no es válido')
      return
    }

    try {
      await updateServicePrice(serviceId, priceNumber)

      editServiceModal?.classList.remove('active')

      await loadServicesData()
      renderApp()
      showMessage('Precio actualizado correctamente')
    } catch (error) {
      showMessage('No se pudo actualizar el precio')
    }
  })

  const cutFilterFrom = document.querySelector<HTMLInputElement>('#cutFilterFrom')
  const cutFilterTo = document.querySelector<HTMLInputElement>('#cutFilterTo')
  const cutFilterBarber = document.querySelector<HTMLSelectElement>('#cutFilterBarber')
  const cutFilterPayment = document.querySelector<HTMLSelectElement>('#cutFilterPayment')
  const clearCutFilters = document.querySelector<HTMLButtonElement>('#clearCutFilters')

  const updateCutFilters = () => {
    cutFilters = {
      fromDate: cutFilterFrom?.value ?? '',
      toDate: cutFilterTo?.value ?? '',
      barberId: cutFilterBarber?.value ?? '',
      paymentMethod: cutFilterPayment?.value ?? ''
    }

    renderApp()
  }

  cutFilterFrom?.addEventListener('change', updateCutFilters)
  cutFilterTo?.addEventListener('change', updateCutFilters)
  cutFilterBarber?.addEventListener('change', updateCutFilters)
  cutFilterPayment?.addEventListener('change', updateCutFilters)

  clearCutFilters?.addEventListener('click', () => {
    cutFilters = {
      fromDate: getTodayInputDate(),
      toDate: getTodayInputDate(),
      barberId: '',
      paymentMethod: ''
    }

    renderApp()
  })

  const expenseFilterFrom = document.querySelector<HTMLInputElement>('#expenseFilterFrom')
  const expenseFilterTo = document.querySelector<HTMLInputElement>('#expenseFilterTo')
  const expenseFilterCategory = document.querySelector<HTMLSelectElement>('#expenseFilterCategory')
  const expenseFilterPayment = document.querySelector<HTMLSelectElement>('#expenseFilterPayment')
  const clearExpenseFilters = document.querySelector<HTMLButtonElement>('#clearExpenseFilters')

  const updateExpenseFilters = () => {
    expenseFilters = {
      fromDate: expenseFilterFrom?.value ?? '',
      toDate: expenseFilterTo?.value ?? '',
      category: expenseFilterCategory?.value ?? '',
      paymentMethod: expenseFilterPayment?.value ?? ''
    }

    renderApp()
  }

  expenseFilterFrom?.addEventListener('change', updateExpenseFilters)
  expenseFilterTo?.addEventListener('change', updateExpenseFilters)
  expenseFilterCategory?.addEventListener('change', updateExpenseFilters)
  expenseFilterPayment?.addEventListener('change', updateExpenseFilters)

  clearExpenseFilters?.addEventListener('click', () => {
    expenseFilters = {
      fromDate: '',
      toDate: '',
      category: '',
      paymentMethod: ''
    }

    renderApp()
  })

  const openCutModal = document.querySelector<HTMLButtonElement>('#openCutModal')
  const closeCutModal = document.querySelector<HTMLButtonElement>('#closeCutModal')
  const cutModal = document.querySelector<HTMLDivElement>('#cutModal')

  openCutModal?.addEventListener('click', () => {
    cutModal?.classList.add('active')
  })

  closeCutModal?.addEventListener('click', () => {
    cutModal?.classList.remove('active')
  })

  cutModal?.addEventListener('click', (event) => {
    if (event.target === cutModal) {
      cutModal.classList.remove('active')
    }
  })

  const serviceSelect = document.querySelector<HTMLSelectElement>('#serviceId')
  const amountInput = document.querySelector<HTMLInputElement>('#cutAmount')

  serviceSelect?.addEventListener('change', () => {
    const serviceId = Number(serviceSelect.value)

    const selectedService = services.find((service) => {
      return service.id === serviceId
    })

    if (selectedService && amountInput) {
      amountInput.value = String(selectedService.precioBase)
    }
  })

  const barberForm = document.querySelector<HTMLFormElement>('#barberForm')

  barberForm?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const nameInput = document.querySelector<HTMLInputElement>('#barberName')

    if (!nameInput) return

    try {
      await createBarber({
        nombre: nameInput.value
      })

      await loadBarbersData()
      renderApp()
      showMessage('Barbero guardado correctamente')
    } catch (error) {
      showMessage('Error al guardar el barbero')
    }
  })

  const serviceForm = document.querySelector<HTMLFormElement>('#serviceForm')

  serviceForm?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const nameInput = document.querySelector<HTMLInputElement>('#serviceName')
    const priceInput = document.querySelector<HTMLInputElement>('#servicePrice')

    if (!nameInput || !priceInput) return

    try {
      await createService({
        nombre: nameInput.value,
        precioBase: Number(priceInput.value)
      })

      await loadServicesData()
      renderApp()
      showMessage('Servicio guardado correctamente')
    } catch (error) {
      showMessage('Error al guardar el servicio')
    }
  })

  const expenseForm = document.querySelector<HTMLFormElement>('#expenseForm')

  expenseForm?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const categoryInput = document.querySelector<HTMLSelectElement>('#expenseCategory')
    const descriptionInput = document.querySelector<HTMLInputElement>('#expenseDescription')
    const amountInput = document.querySelector<HTMLInputElement>('#expenseAmount')
    const paymentMethodInput = document.querySelector<HTMLSelectElement>('#expensePaymentMethod')
    const dateInput = document.querySelector<HTMLInputElement>('#expenseDate')
    const observationInput = document.querySelector<HTMLTextAreaElement>('#expenseObservation')

    if (
      !categoryInput ||
      !descriptionInput ||
      !amountInput ||
      !paymentMethodInput ||
      !dateInput ||
      !observationInput
    ) {
      return
    }

    try {
      await createExpense({
        categoria: categoryInput.value as ExpenseCategory,
        descripcion: descriptionInput.value,
        monto: Number(amountInput.value),
        metodoPago: paymentMethodInput.value,
        fecha: dateInput.value,
        observacion: observationInput.value
      })

      await loadExpensesData()
      await loadDashboardData()

      renderApp()
      showMessage('Gasto guardado correctamente')
    } catch (error) {
      showMessage('Error al guardar el gasto')
    }
  })

  const deleteExpenseButtons = document.querySelectorAll<HTMLButtonElement>('.delete-expense-button')

  deleteExpenseButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const expenseId = Number(button.dataset.id)

      const confirmDelete = confirm('¿Seguro que querés eliminar este gasto?')

      if (!confirmDelete) return

      try {
        await deleteExpense(expenseId)

        await loadExpensesData()
        await loadDashboardData()

        renderApp()
        showMessage('Gasto eliminado correctamente')
      } catch (error) {
        showMessage('No se pudo eliminar el gasto')
      }
    })
  })

  const cutForm = document.querySelector<HTMLFormElement>('#cutForm')

  cutForm?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const barberSelect = document.querySelector<HTMLSelectElement>('#barberId')
    const serviceSelect = document.querySelector<HTMLSelectElement>('#serviceId')
    const amountInput = document.querySelector<HTMLInputElement>('#cutAmount')
    const paymentSelect = document.querySelector<HTMLSelectElement>('#paymentMethod')
    const observationInput = document.querySelector<HTMLTextAreaElement>('#cutObservation')

    if (!barberSelect || !serviceSelect || !amountInput || !paymentSelect || !observationInput) {
      return
    }

    try {
      await createCut({
        barberId: Number(barberSelect.value),
        serviceId: Number(serviceSelect.value),
        monto: Number(amountInput.value),
        metodoPago: paymentSelect.value,
        observacion: observationInput.value
      })

      await loadDashboardData()
      await loadCutsData()

      if (currentView === 'barberos') {
        await loadBarbersData()
      }

      if (currentView === 'servicios') {
        await loadServicesData()
      }

      if (currentView === 'gastos') {
        await loadExpensesData()
      }

      renderApp()
      showMessage('Corte registrado correctamente')
    } catch (error) {
      showMessage('Error al registrar el corte')
    }
  })
}

const initApp = async () => {
  try {
    renderLoading()

    await loadDashboardData()
    await loadBarbersData()
    await loadServicesData()
    await loadExpensesData()

    renderApp()
  } catch (error) {
    if (!app) return

    app.innerHTML = `
      <main class="layout">
        <section class="panel">
          <h1>Error al cargar la app</h1>
          <p class="empty">Revisá que el backend esté prendido en http://localhost:3000.</p>
        </section>
      </main>
    `
  }
}

initApp()