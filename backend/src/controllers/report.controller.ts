import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { Cut, Barber, Service, Expense } from '../models'

const getTodayRange = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { start, end }
}

const getCurrentMonthRange = () => {
  const now = new Date()

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return { start, end }
}

const calcularTotal = (cuts: any[]) => {
  return cuts.reduce((total, cut) => {
    return total + Number(cut.get('monto') ?? 0)
  }, 0)
}

const calcularTotalGastos = (expenses: any[]) => {
  return expenses.reduce((total, expense) => {
    return total + Number(expense.get('monto') ?? 0)
  }, 0)
}

const calcularPorMetodoPago = (cuts: any[]) => {
  const reportByPaymentMethod: Record<string, {
    metodoPago: string
    cortes: number
    facturacion: number
  }> = {}

  cuts.forEach((cut: any) => {
    const metodoPago = String(cut.get('metodoPago') ?? 'Sin especificar')
    const monto = Number(cut.get('monto') ?? 0)

    if (!reportByPaymentMethod[metodoPago]) {
      reportByPaymentMethod[metodoPago] = {
        metodoPago,
        cortes: 0,
        facturacion: 0
      }
    }

    reportByPaymentMethod[metodoPago].cortes += 1
    reportByPaymentMethod[metodoPago].facturacion += monto
  })

  return Object.values(reportByPaymentMethod)
}

const calcularGastosPorCategoria = (expenses: any[]) => {
  const reportByCategory: Record<string, {
    categoria: string
    cantidad: number
    total: number
  }> = {}

  expenses.forEach((expense: any) => {
    const categoria = String(expense.get('categoria') ?? 'Sin categoría')
    const monto = Number(expense.get('monto') ?? 0)

    if (!reportByCategory[categoria]) {
      reportByCategory[categoria] = {
        categoria,
        cantidad: 0,
        total: 0
      }
    }

    reportByCategory[categoria].cantidad += 1
    reportByCategory[categoria].total += monto
  })

  return Object.values(reportByCategory)
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getTodayReport = async (req: Request, res: Response) => {
  try {
    const { start, end } = getTodayRange()

    const cuts = await Cut.findAll({
      where: {
        fecha: {
          [Op.gte]: start,
          [Op.lt]: end
        }
      },
      include: [Barber, Service],
      order: [['fecha', 'DESC']]
    })

    const total = calcularTotal(cuts)
    const porMetodoPago = calcularPorMetodoPago(cuts)

    res.json({
      fecha: formatDateKey(start),
      cortes: cuts.length,
      facturacion: total,
      porMetodoPago,
      detalle: cuts
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el reporte del día',
      error
    })
  }
}

export const getMonthReport = async (req: Request, res: Response) => {
  try {
    const { start, end } = getCurrentMonthRange()

    const cuts = await Cut.findAll({
      where: {
        fecha: {
          [Op.gte]: start,
          [Op.lt]: end
        }
      },
      include: [Barber, Service],
      order: [['fecha', 'ASC']]
    })

    const expenses = await Expense.findAll({
      where: {
        fecha: {
          [Op.gte]: start,
          [Op.lt]: end
        }
      },
      order: [['fecha', 'DESC']]
    })

    const total = calcularTotal(cuts)
    const totalGastos = calcularTotalGastos(expenses)
    const gananciaEstimada = total - totalGastos
    const porMetodoPago = calcularPorMetodoPago(cuts)
    const gastosPorCategoria = calcularGastosPorCategoria(expenses)

    const reportByDay: Record<string, {
      fecha: string
      cortes: number
      facturacion: number
    }> = {}

    cuts.forEach((cut: any) => {
      const fecha = new Date(cut.get('fecha'))
      const key = formatDateKey(fecha)
      const monto = Number(cut.get('monto') ?? 0)

      if (!reportByDay[key]) {
        reportByDay[key] = {
          fecha: key,
          cortes: 0,
          facturacion: 0
        }
      }

      reportByDay[key].cortes += 1
      reportByDay[key].facturacion += monto
    })

    res.json({
      mes: start.getMonth() + 1,
      anio: start.getFullYear(),
      cortes: cuts.length,
      facturacion: total,
      gastos: totalGastos,
      gananciaEstimada,
      porDia: Object.values(reportByDay),
      porMetodoPago,
      gastosPorCategoria,
      detalle: cuts
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el reporte mensual',
      error
    })
  }
}

export const getBarberReport = async (req: Request, res: Response) => {
  try {
    const barberId = Number(req.params.id)

    if (!Number.isInteger(barberId) || barberId <= 0) {
      return res.status(400).json({
        message: 'El id del barbero no es válido'
      })
    }

    const barber = await Barber.findByPk(barberId)

    if (!barber) {
      return res.status(404).json({
        message: 'Barbero no encontrado'
      })
    }

    const { start, end } = getCurrentMonthRange()

    const cuts = await Cut.findAll({
      where: {
        barberId,
        fecha: {
          [Op.gte]: start,
          [Op.lt]: end
        }
      },
      include: [Service],
      order: [['fecha', 'DESC']]
    })

    const total = calcularTotal(cuts)
    const porMetodoPago = calcularPorMetodoPago(cuts)

    res.json({
      barbero: barber,
      mes: start.getMonth() + 1,
      anio: start.getFullYear(),
      cortes: cuts.length,
      facturacion: total,
      porMetodoPago,
      detalle: cuts
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el reporte del barbero',
      error
    })
  }
}

export const getDashboardReport = async (req: Request, res: Response) => {
  try {
    const todayRange = getTodayRange()
    const monthRange = getCurrentMonthRange()

    const todayCuts = await Cut.findAll({
      where: {
        fecha: {
          [Op.gte]: todayRange.start,
          [Op.lt]: todayRange.end
        }
      },
      include: [Barber, Service]
    })

    const monthCuts = await Cut.findAll({
      where: {
        fecha: {
          [Op.gte]: monthRange.start,
          [Op.lt]: monthRange.end
        }
      },
      include: [Barber, Service]
    })

    const monthExpenses = await Expense.findAll({
      where: {
        fecha: {
          [Op.gte]: monthRange.start,
          [Op.lt]: monthRange.end
        }
      },
      order: [['fecha', 'DESC']]
    })

    const todayTotal = calcularTotal(todayCuts)
    const monthTotal = calcularTotal(monthCuts)
    const monthExpensesTotal = calcularTotalGastos(monthExpenses)
    const estimatedProfit = monthTotal - monthExpensesTotal

    const reportByBarber: Record<string, {
      barberId: number
      nombre: string
      cortes: number
      facturacion: number
    }> = {}

    monthCuts.forEach((cut: any) => {
      const barberId = Number(cut.get('barberId'))
      const key = String(barberId)
      const monto = Number(cut.get('monto') ?? 0)
      const barber = cut.get('Barber') as any

      const nombreBarbero =
        barber?.get?.('nombre') ??
        barber?.nombre ??
        'Sin nombre'

      if (!reportByBarber[key]) {
        reportByBarber[key] = {
          barberId,
          nombre: nombreBarbero,
          cortes: 0,
          facturacion: 0
        }
      }

      reportByBarber[key].cortes += 1
      reportByBarber[key].facturacion += monto
    })

    const todayPaymentMethods = calcularPorMetodoPago(todayCuts)
    const monthPaymentMethods = calcularPorMetodoPago(monthCuts)
    const expensesByCategory = calcularGastosPorCategoria(monthExpenses)

    res.json({
      hoy: {
        cortes: todayCuts.length,
        facturacion: todayTotal,
        porMetodoPago: todayPaymentMethods
      },
      mes: {
        cortes: monthCuts.length,
        facturacion: monthTotal,
        gastos: monthExpensesTotal,
        gananciaEstimada: estimatedProfit,
        porMetodoPago: monthPaymentMethods,
        gastosPorCategoria: expensesByCategory
      },
      facturacionPorBarbero: Object.values(reportByBarber)
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el dashboard',
      error
    })
  }
}

export const getYearReport = async (req: Request, res: Response) => {
  try {
    const now = new Date()

    const start = new Date(now.getFullYear(), 0, 1)
    const end = new Date(now.getFullYear() + 1, 0, 1)

    const cuts = await Cut.findAll({
      where: {
        fecha: {
          [Op.gte]: start,
          [Op.lt]: end
        }
      },
      include: [Barber, Service],
      order: [['fecha', 'ASC']]
    })

    const reportByMonth: Record<string, {
      mes: number
      nombreMes: string
      cortes: number
      facturacion: number
    }> = {}

    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ]

    monthNames.forEach((monthName, index) => {
      const monthNumber = index + 1

      reportByMonth[String(monthNumber)] = {
        mes: monthNumber,
        nombreMes: monthName,
        cortes: 0,
        facturacion: 0
      }
    })

    cuts.forEach((cut: any) => {
      const fecha = new Date(cut.get('fecha'))
      const monthNumber = fecha.getMonth() + 1
      const monto = Number(cut.get('monto') ?? 0)

      reportByMonth[String(monthNumber)].cortes += 1
      reportByMonth[String(monthNumber)].facturacion += monto
    })

    res.json({
      anio: now.getFullYear(),
      cortes: cuts.length,
      facturacion: calcularTotal(cuts),
      porMes: Object.values(reportByMonth)
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el reporte anual',
      error
    })
  }
}