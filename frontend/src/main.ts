import './style.css'

import {
  createBarber,
  createCut,
  createExpense,
  createService,
  clearSession,
  deleteBarber,
  deleteExpense,
  getBootstrap,
  getStoredUser,
  getToken,
  login,
  updateService
} from './api/api'

import type {
  Barber,
  Cut,
  DashboardChartMode,
  DashboardReport,
  DashboardSummaryMode,
  Expense,
  MonthReport,
  Service,
  User,
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

const state = {
  user: getStoredUser() as User | null,
  view: 'dashboard' as ViewName,

  dashboard: null as DashboardReport | null,
  month: null as MonthReport | null,
  year: null as YearReport | null,

  cuts: [] as Cut[],
  barbers: [] as Barber[],
  services: [] as Service[],
  expenses: [] as Expense[],

  chartMode: 'month' as DashboardChartMode,
  summaryMode: 'payments' as DashboardSummaryMode,

  cutFilters: {
    fromDate: '',
    toDate: '',
    barberId: '',
    paymentMethod: ''
  } as CutFilters,

  expenseFilters: {
    fromDate: '',
    toDate: '',
    category: '',
    paymentMethod: ''
  } as ExpenseFilters
}

const loadAll = async () => {
  const data = await getBootstrap()

  state.dashboard = data.dashboard
  state.month = data.month
  state.year = data.year
  state.cuts = data.cuts
  state.barbers = data.barbers
  state.services = data.services
  state.expenses = data.expenses
}

const reloadAndRender = async () => {
  await loadAll()
  render()
}

const showMessage = (message: string) => {
  const target = document.querySelector<HTMLParagraphElement>('#message')
  if (!target) return

  target.textContent = message
  window.setTimeout(() => {
    target.textContent = ''
  }, 2500)
}

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason instanceof Error
    ? event.reason.message
    : 'No se pudo completar la accion'

  showMessage(message)
})

const renderLogin = () => {
  if (!app) return

  app.innerHTML = `
    <main class="login-page">
      <form id="loginForm" class="form-card login-card">
        <div>
          <p class="eyebrow">Barber Control</p>
          <h1>Iniciar sesion</h1>
        </div>

        <label for="loginEmail">Email</label>
        <input type="email" id="loginEmail" autocomplete="email" required>

        <label for="loginPassword">Password</label>
        <input type="password" id="loginPassword" autocomplete="current-password" required>

        <button type="submit">Entrar</button>

        <p id="message"></p>
      </form>
    </main>
  `

  document.querySelector<HTMLFormElement>('#loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = document.querySelector<HTMLInputElement>('#loginEmail')?.value.trim()
    const password = document.querySelector<HTMLInputElement>('#loginPassword')?.value
    if (!email || !password) return

    const session = await login(email, password)
    state.user = session.user
    await loadAll()
    render()
  })
}

const getView = () => {
  if (state.view === 'dashboard') {
    return renderDashboardView(
      state.dashboard,
      state.month,
      state.year,
      state.chartMode,
      state.summaryMode
    )
  }

  if (state.view === 'cortes') {
    return renderCutsView(
      state.cuts,
      state.barbers,
      state.services,
      state.cutFilters
    )
  }

  if (state.view === 'barberos') return renderBarbersView(state.barbers)
  if (state.view === 'servicios') return renderServicesView(state.services)
  if (state.view === 'gastos') return renderExpensesView(state.expenses, state.expenseFilters)

  return ''
}

const render = () => {
  if (!app) return

  if (!state.user) {
    renderLogin()
    return
  }

  app.innerHTML = `
    <main class="layout">
      <section class="hero hero-logo">
        <img class="brand-logo" src="/assets/west-coast-logo.jpg" />
      </section>

      <div class="topbar">
        <span>${state.user.name}</span>
        <button id="logoutButton" type="button">Salir</button>
      </div>

      ${renderTabs(state.view)}

      <section class="content">
        ${getView()}
      </section>
    </main>

    ${renderCutModal(state.barbers, state.services)}
    ${renderEditServicePriceModal()}

    <p id="message"></p>
  `

  setupEvents()
}

const setupEvents = () => {
  document.querySelector('#logoutButton')?.addEventListener('click', () => {
    clearSession()
    state.user = null
    renderLogin()
  })

  document.querySelectorAll<HTMLElement>('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view as ViewName
      render()
    })
  })

  document.querySelector<HTMLFormElement>('#barberForm')?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const name = document.querySelector<HTMLInputElement>('#barberName')?.value.trim()
    if (!name) return

    await createBarber({ nombre: name })
    await reloadAndRender()
    showMessage('Barbero guardado')
  })

  document.querySelectorAll<HTMLButtonElement>('.delete-barber-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = Number(button.dataset.id)
      if (!id) return

      await deleteBarber(id)
      await reloadAndRender()
      showMessage('Barbero eliminado')
    })
  })

  document.querySelector<HTMLFormElement>('#serviceForm')?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const name = document.querySelector<HTMLInputElement>('#serviceName')?.value.trim()
    const price = Number(document.querySelector<HTMLInputElement>('#servicePrice')?.value)
    if (!name || price <= 0) return

    await createService({ nombre: name, precioBase: price })
    await reloadAndRender()
    showMessage('Servicio guardado')
  })

  document.querySelectorAll<HTMLButtonElement>('.edit-service-price-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector<HTMLInputElement>('#editServiceId')!.value = button.dataset.id ?? ''
      document.querySelector<HTMLInputElement>('#editServiceName')!.value = button.dataset.name ?? ''
      document.querySelector<HTMLInputElement>('#editServicePrice')!.value = button.dataset.price ?? ''
      document.querySelector<HTMLDivElement>('#editServiceModal')?.classList.add('active')
    })
  })

  document.querySelector('#closeEditServiceModal')?.addEventListener('click', () => {
    document.querySelector('#editServiceModal')?.classList.remove('active')
  })

  document.querySelector<HTMLFormElement>('#editServicePriceForm')?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const id = Number(document.querySelector<HTMLInputElement>('#editServiceId')?.value)
    const name = document.querySelector<HTMLInputElement>('#editServiceName')?.value.trim()
    const price = Number(document.querySelector<HTMLInputElement>('#editServicePrice')?.value)
    if (!id || !name || price <= 0) return

    await updateService(id, { nombre: name, precioBase: price })
    await reloadAndRender()
    showMessage('Servicio actualizado')
  })

  const cutModal = document.querySelector<HTMLDivElement>('#cutModal')

  document.querySelector('#openCutModal')?.addEventListener('click', () => {
    cutModal?.classList.add('active')
  })

  document.querySelector('#closeCutModal')?.addEventListener('click', () => {
    cutModal?.classList.remove('active')
  })

  cutModal?.addEventListener('click', (event) => {
    if (event.target === cutModal) cutModal.classList.remove('active')
  })

  document.querySelector<HTMLSelectElement>('#serviceId')?.addEventListener('change', (event) => {
    const serviceId = Number((event.currentTarget as HTMLSelectElement).value)
    const service = state.services.find((item) => item.id === serviceId)
    const amountInput = document.querySelector<HTMLInputElement>('#cutAmount')

    if (service && amountInput) amountInput.value = String(service.precioBase)
  })

  document.querySelector<HTMLFormElement>('#cutForm')?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const barberId = Number(document.querySelector<HTMLSelectElement>('#barberId')?.value)
    const serviceId = Number(document.querySelector<HTMLSelectElement>('#serviceId')?.value)
    const monto = Number(document.querySelector<HTMLInputElement>('#cutAmount')?.value)
    const metodoPago = document.querySelector<HTMLSelectElement>('#paymentMethod')?.value
    const observacion = document.querySelector<HTMLTextAreaElement>('#cutObservation')?.value.trim()
    if (!barberId || !serviceId || monto <= 0 || !metodoPago) return

    await createCut({ barberId, serviceId, monto, metodoPago, observacion })
    await reloadAndRender()
    showMessage('Corte registrado')
  })

  document.querySelector<HTMLFormElement>('#expenseForm')?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const categoria = document.querySelector<HTMLSelectElement>('#expenseCategory')?.value
    const descripcion = document.querySelector<HTMLInputElement>('#expenseDescription')?.value.trim()
    const monto = Number(document.querySelector<HTMLInputElement>('#expenseAmount')?.value)
    const metodoPago = document.querySelector<HTMLSelectElement>('#expensePaymentMethod')?.value
    const fecha = document.querySelector<HTMLInputElement>('#expenseDate')?.value
    const observacion = document.querySelector<HTMLTextAreaElement>('#expenseObservation')?.value.trim()
    if (!categoria || !descripcion || monto <= 0 || !metodoPago) return

    await createExpense({ categoria, descripcion, monto, metodoPago, fecha, observacion })
    await reloadAndRender()
    showMessage('Gasto guardado')
  })

  document.querySelectorAll<HTMLButtonElement>('.delete-expense-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = Number(button.dataset.id)
      if (!id) return

      await deleteExpense(id)
      await reloadAndRender()
      showMessage('Gasto eliminado')
    })
  })

  const updateCutFilters = () => {
    state.cutFilters = {
      fromDate: document.querySelector<HTMLInputElement>('#cutFilterFrom')?.value ?? '',
      toDate: document.querySelector<HTMLInputElement>('#cutFilterTo')?.value ?? '',
      barberId: document.querySelector<HTMLSelectElement>('#cutFilterBarber')?.value ?? '',
      paymentMethod: document.querySelector<HTMLSelectElement>('#cutFilterPayment')?.value ?? ''
    }

    render()
  }

  document.querySelector('#cutFilterFrom')?.addEventListener('change', updateCutFilters)
  document.querySelector('#cutFilterTo')?.addEventListener('change', updateCutFilters)
  document.querySelector('#cutFilterBarber')?.addEventListener('change', updateCutFilters)
  document.querySelector('#cutFilterPayment')?.addEventListener('change', updateCutFilters)
  document.querySelector('#clearCutFilters')?.addEventListener('click', () => {
    const today = new Date().toISOString().slice(0, 10)

    state.cutFilters = {
      fromDate: today,
      toDate: today,
      barberId: '',
      paymentMethod: ''
    }

    render()
  })

  const updateExpenseFilters = () => {
    state.expenseFilters = {
      fromDate: document.querySelector<HTMLInputElement>('#expenseFilterFrom')?.value ?? '',
      toDate: document.querySelector<HTMLInputElement>('#expenseFilterTo')?.value ?? '',
      category: document.querySelector<HTMLSelectElement>('#expenseFilterCategory')?.value ?? '',
      paymentMethod: document.querySelector<HTMLSelectElement>('#expenseFilterPayment')?.value ?? ''
    }

    render()
  }

  document.querySelector('#expenseFilterFrom')?.addEventListener('change', updateExpenseFilters)
  document.querySelector('#expenseFilterTo')?.addEventListener('change', updateExpenseFilters)
  document.querySelector('#expenseFilterCategory')?.addEventListener('change', updateExpenseFilters)
  document.querySelector('#expenseFilterPayment')?.addEventListener('change', updateExpenseFilters)
  document.querySelector('#clearExpenseFilters')?.addEventListener('click', () => {
    state.expenseFilters = {
      fromDate: '',
      toDate: '',
      category: '',
      paymentMethod: ''
    }

    render()
  })
}

const init = async () => {
  if (!getToken()) {
    state.user = null
    renderLogin()
    return
  }

  if (app) app.innerHTML = `<h2 style="padding:20px">Cargando...</h2>`

  try {
    await loadAll()
    render()
  } catch {
    clearSession()
    state.user = null
    renderLogin()
  }
}

init()
