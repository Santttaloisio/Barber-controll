"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYearReport = exports.getDashboardReport = exports.getBarberReport = exports.getMonthReport = exports.getTodayReport = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
};
const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
};
const calcularTotal = (cuts) => {
    return cuts.reduce((total, cut) => {
        return total + Number(cut.get('monto') ?? 0);
    }, 0);
};
const calcularTotalGastos = (expenses) => {
    return expenses.reduce((total, expense) => {
        return total + Number(expense.get('monto') ?? 0);
    }, 0);
};
const calcularPorMetodoPago = (cuts) => {
    const reportByPaymentMethod = {};
    cuts.forEach((cut) => {
        const metodoPago = String(cut.get('metodoPago') ?? 'Sin especificar');
        const monto = Number(cut.get('monto') ?? 0);
        if (!reportByPaymentMethod[metodoPago]) {
            reportByPaymentMethod[metodoPago] = {
                metodoPago,
                cortes: 0,
                facturacion: 0
            };
        }
        reportByPaymentMethod[metodoPago].cortes += 1;
        reportByPaymentMethod[metodoPago].facturacion += monto;
    });
    return Object.values(reportByPaymentMethod);
};
const calcularGastosPorCategoria = (expenses) => {
    const reportByCategory = {};
    expenses.forEach((expense) => {
        const categoria = String(expense.get('categoria') ?? 'Sin categoría');
        const monto = Number(expense.get('monto') ?? 0);
        if (!reportByCategory[categoria]) {
            reportByCategory[categoria] = {
                categoria,
                cantidad: 0,
                total: 0
            };
        }
        reportByCategory[categoria].cantidad += 1;
        reportByCategory[categoria].total += monto;
    });
    return Object.values(reportByCategory);
};
const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const getTodayReport = async (req, res) => {
    try {
        const { start, end } = getTodayRange();
        const cuts = await models_1.Cut.findAll({
            where: {
                fecha: {
                    [sequelize_1.Op.gte]: start,
                    [sequelize_1.Op.lt]: end
                }
            },
            include: [models_1.Barber, models_1.Service],
            order: [['fecha', 'DESC']]
        });
        const total = calcularTotal(cuts);
        const porMetodoPago = calcularPorMetodoPago(cuts);
        res.json({
            fecha: formatDateKey(start),
            cortes: cuts.length,
            facturacion: total,
            porMetodoPago,
            detalle: cuts
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al obtener el reporte del día',
            error
        });
    }
};
exports.getTodayReport = getTodayReport;
const getMonthReport = async (req, res) => {
    try {
        const { start, end } = getCurrentMonthRange();
        const cuts = await models_1.Cut.findAll({
            where: {
                fecha: {
                    [sequelize_1.Op.gte]: start,
                    [sequelize_1.Op.lt]: end
                }
            },
            include: [models_1.Barber, models_1.Service],
            order: [['fecha', 'ASC']]
        });
        const expenses = await models_1.Expense.findAll({
            where: {
                fecha: {
                    [sequelize_1.Op.gte]: start,
                    [sequelize_1.Op.lt]: end
                }
            },
            order: [['fecha', 'DESC']]
        });
        const total = calcularTotal(cuts);
        const totalGastos = calcularTotalGastos(expenses);
        const gananciaEstimada = total - totalGastos;
        const porMetodoPago = calcularPorMetodoPago(cuts);
        const gastosPorCategoria = calcularGastosPorCategoria(expenses);
        const reportByDay = {};
        cuts.forEach((cut) => {
            const fecha = new Date(cut.get('fecha'));
            const key = formatDateKey(fecha);
            const monto = Number(cut.get('monto') ?? 0);
            if (!reportByDay[key]) {
                reportByDay[key] = {
                    fecha: key,
                    cortes: 0,
                    facturacion: 0
                };
            }
            reportByDay[key].cortes += 1;
            reportByDay[key].facturacion += monto;
        });
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
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al obtener el reporte mensual',
            error
        });
    }
};
exports.getMonthReport = getMonthReport;
const getBarberReport = async (req, res) => {
    try {
        const barberId = Number(req.params.id);
        if (!Number.isInteger(barberId) || barberId <= 0) {
            return res.status(400).json({
                message: 'El id del barbero no es válido'
            });
        }
        const barber = await models_1.Barber.findByPk(barberId);
        if (!barber) {
            return res.status(404).json({
                message: 'Barbero no encontrado'
            });
        }
        const { start, end } = getCurrentMonthRange();
        const cuts = await models_1.Cut.findAll({
            where: {
                barberId,
                fecha: {
                    [sequelize_1.Op.gte]: start,
                    [sequelize_1.Op.lt]: end
                }
            },
            include: [models_1.Service],
            order: [['fecha', 'DESC']]
        });
        const total = calcularTotal(cuts);
        const porMetodoPago = calcularPorMetodoPago(cuts);
        res.json({
            barbero: barber,
            mes: start.getMonth() + 1,
            anio: start.getFullYear(),
            cortes: cuts.length,
            facturacion: total,
            porMetodoPago,
            detalle: cuts
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al obtener el reporte del barbero',
            error
        });
    }
};
exports.getBarberReport = getBarberReport;
const getDashboardReport = async (req, res) => {
    try {
        const todayRange = getTodayRange();
        const monthRange = getCurrentMonthRange();
        const todayCuts = await models_1.Cut.findAll({
            where: {
                fecha: {
                    [sequelize_1.Op.gte]: todayRange.start,
                    [sequelize_1.Op.lt]: todayRange.end
                }
            },
            include: [models_1.Barber, models_1.Service]
        });
        const monthCuts = await models_1.Cut.findAll({
            where: {
                fecha: {
                    [sequelize_1.Op.gte]: monthRange.start,
                    [sequelize_1.Op.lt]: monthRange.end
                }
            },
            include: [models_1.Barber, models_1.Service]
        });
        const monthExpenses = await models_1.Expense.findAll({
            where: {
                fecha: {
                    [sequelize_1.Op.gte]: monthRange.start,
                    [sequelize_1.Op.lt]: monthRange.end
                }
            },
            order: [['fecha', 'DESC']]
        });
        const todayTotal = calcularTotal(todayCuts);
        const monthTotal = calcularTotal(monthCuts);
        const monthExpensesTotal = calcularTotalGastos(monthExpenses);
        const estimatedProfit = monthTotal - monthExpensesTotal;
        const reportByBarber = {};
        monthCuts.forEach((cut) => {
            const barberId = Number(cut.get('barberId'));
            const key = String(barberId);
            const monto = Number(cut.get('monto') ?? 0);
            const barber = cut.get('Barber');
            const nombreBarbero = barber?.get?.('nombre') ??
                barber?.nombre ??
                'Sin nombre';
            if (!reportByBarber[key]) {
                reportByBarber[key] = {
                    barberId,
                    nombre: nombreBarbero,
                    cortes: 0,
                    facturacion: 0
                };
            }
            reportByBarber[key].cortes += 1;
            reportByBarber[key].facturacion += monto;
        });
        const todayPaymentMethods = calcularPorMetodoPago(todayCuts);
        const monthPaymentMethods = calcularPorMetodoPago(monthCuts);
        const expensesByCategory = calcularGastosPorCategoria(monthExpenses);
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
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al obtener el dashboard',
            error
        });
    }
};
exports.getDashboardReport = getDashboardReport;
const getYearReport = async (req, res) => {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear() + 1, 0, 1);
        const cuts = await models_1.Cut.findAll({
            where: {
                fecha: {
                    [sequelize_1.Op.gte]: start,
                    [sequelize_1.Op.lt]: end
                }
            },
            include: [models_1.Barber, models_1.Service],
            order: [['fecha', 'ASC']]
        });
        const reportByMonth = {};
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
        ];
        monthNames.forEach((monthName, index) => {
            const monthNumber = index + 1;
            reportByMonth[String(monthNumber)] = {
                mes: monthNumber,
                nombreMes: monthName,
                cortes: 0,
                facturacion: 0
            };
        });
        cuts.forEach((cut) => {
            const fecha = new Date(cut.get('fecha'));
            const monthNumber = fecha.getMonth() + 1;
            const monto = Number(cut.get('monto') ?? 0);
            reportByMonth[String(monthNumber)].cortes += 1;
            reportByMonth[String(monthNumber)].facturacion += monto;
        });
        res.json({
            anio: now.getFullYear(),
            cortes: cuts.length,
            facturacion: calcularTotal(cuts),
            porMes: Object.values(reportByMonth)
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al obtener el reporte anual',
            error
        });
    }
};
exports.getYearReport = getYearReport;
