import type { Expense, ExpenseCategory } from '../types'
import { formatDate, formatMoney } from '../utils/formatters'

export type ExpenseFilters = {
  fromDate: string
  toDate: string
  category: string
  paymentMethod: string
}

const defaultFilters: ExpenseFilters = {
  fromDate: '',
  toDate: '',
  category: '',
  paymentMethod: ''
}

const categories: ExpenseCategory[] = [
  'Servicios',
  'Gastos barbería',
  'Gastos varios'
]

const getTotal = (expenses: Expense[]) => {
  return expenses.reduce((total, expense) => {
    return total + Number(expense.monto)
  }, 0)
}

const getTotalByCategory = (
  expenses: Expense[],
  category: ExpenseCategory
) => {
  return expenses
    .filter((expense) => {
      return expense.categoria === category
    })
    .reduce((total, expense) => {
      return total + Number(expense.monto)
    }, 0)
}

const getUniquePaymentMethods = (expenses: Expense[]) => {
  const paymentMethods = new Set<string>()

  expenses.forEach((expense) => {
    if (expense.metodoPago) {
      paymentMethods.add(expense.metodoPago)
    }
  })

  return Array.from(paymentMethods)
}

const filterExpenses = (
  expenses: Expense[],
  filters: ExpenseFilters
) => {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.fecha)

    const fromDate = filters.fromDate
      ? new Date(`${filters.fromDate}T00:00:00`)
      : null

    const toDate = filters.toDate
      ? new Date(`${filters.toDate}T23:59:59`)
      : null

    const matchesFromDate = fromDate ? expenseDate >= fromDate : true
    const matchesToDate = toDate ? expenseDate <= toDate : true

    const matchesCategory = filters.category
      ? expense.categoria === filters.category
      : true

    const matchesPaymentMethod = filters.paymentMethod
      ? expense.metodoPago === filters.paymentMethod
      : true

    return matchesFromDate && matchesToDate && matchesCategory && matchesPaymentMethod
  })
}

export const renderExpensesView = (
  expenses: Expense[],
  filters: ExpenseFilters = defaultFilters
) => {
  const filteredExpenses = filterExpenses(expenses, filters)
  const paymentMethods = getUniquePaymentMethods(expenses)

  const totalFiltered = getTotal(filteredExpenses)
  const totalServices = getTotalByCategory(filteredExpenses, 'Servicios')
  const totalBarberShop = getTotalByCategory(filteredExpenses, 'Gastos barbería')
  const totalVarious = getTotalByCategory(filteredExpenses, 'Gastos varios')

  return `
    <section class="expenses-page">
      <section class="expense-summary-cards">
        <article class="card">
          <span>Total gastado</span>
          <strong>${formatMoney(totalFiltered)}</strong>
        </article>

        <article class="card">
          <span>Servicios</span>
          <strong>${formatMoney(totalServices)}</strong>
        </article>

        <article class="card">
          <span>Gastos barbería</span>
          <strong>${formatMoney(totalBarberShop)}</strong>
        </article>

        <article class="card">
          <span>Gastos varios</span>
          <strong>${formatMoney(totalVarious)}</strong>
        </article>
      </section>

      <section class="expense-main-grid">
        <form id="expenseForm" class="form-card">
          <h2>Registrar gasto</h2>

          <label for="expenseCategory">Categoría</label>
          <select id="expenseCategory" required>
            <option value="">Seleccionar categoría</option>
            ${categories.map((category) => {
              return `<option value="${category}">${category}</option>`
            }).join('')}
          </select>

          <label for="expenseDescription">Descripción</label>
          <input 
            type="text" 
            id="expenseDescription" 
            placeholder="Ej: Luz, pomadas, limpieza" 
            required
          >

          <label for="expenseAmount">Monto</label>
          <input 
            type="number" 
            id="expenseAmount" 
            placeholder="Ej: 45000" 
            required
          >

          <label for="expensePaymentMethod">Método de pago</label>
          <select id="expensePaymentMethod" required>
            <option value="">Seleccionar método</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Mercado Pago">Mercado Pago</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>

          <label for="expenseDate">Fecha</label>
          <input type="date" id="expenseDate">

          <label for="expenseObservation">Observación</label>
          <textarea id="expenseObservation" placeholder="Opcional"></textarea>

          <button type="submit">Guardar gasto</button>
        </form>

        <article class="panel expense-history-panel">
          <div class="panel-header">
            <h2>Historial de gastos</h2>
            <p>Gastos registrados en el sistema</p>
          </div>

          <div class="filters-card">
            <div class="filters-grid">
              <div>
                <label for="expenseFilterFrom">Desde</label>
                <input 
                  type="date" 
                  id="expenseFilterFrom" 
                  value="${filters.fromDate}"
                >
              </div>

              <div>
                <label for="expenseFilterTo">Hasta</label>
                <input 
                  type="date" 
                  id="expenseFilterTo" 
                  value="${filters.toDate}"
                >
              </div>

              <div>
                <label for="expenseFilterCategory">Categoría</label>
                <select id="expenseFilterCategory">
                  <option value="">Todas</option>
                  ${categories.map((category) => {
                    return `
                      <option 
                        value="${category}" 
                        ${filters.category === category ? 'selected' : ''}
                      >
                        ${category}
                      </option>
                    `
                  }).join('')}
                </select>
              </div>

              <div>
                <label for="expenseFilterPayment">Método de pago</label>
                <select id="expenseFilterPayment">
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
                <strong>${filteredExpenses.length}</strong>
                <span>gastos encontrados</span>
              </div>

              <div>
                <strong>${formatMoney(totalFiltered)}</strong>
                <span>total filtrado</span>
              </div>

              <button id="clearExpenseFilters" type="button">
                Limpiar filtros
              </button>
            </div>
          </div>

          <div class="list expenses-scroll-list">
            ${
              filteredExpenses.length === 0
                ? `<p class="empty">No hay gastos que coincidan con los filtros.</p>`
                : filteredExpenses.map((expense) => {
                    const observation = expense.observacion?.trim()

                    return `
                      <article class="list-item">
                        <div>
                          <h3>${expense.descripcion}</h3>
                          <p>${expense.categoria} · ${formatDate(expense.fecha)} · ${expense.metodoPago}</p>

                          ${
                            observation
                              ? `<p class="cut-observation">Obs: ${observation}</p>`
                              : ''
                          }
                        </div>

                        <div class="list-actions">
                          <strong>${formatMoney(expense.monto)}</strong>

                          <button 
                            type="button" 
                            class="delete-expense-button" 
                            data-id="${expense.id}"
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
    </section>
  `
}