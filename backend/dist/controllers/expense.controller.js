"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.createExpense = exports.getExpenses = void 0;
const models_1 = require("../models");
const allowedCategories = [
    'Servicios',
    'Gastos barbería',
    'Gastos varios'
];
const getExpenses = async (req, res) => {
    try {
        const expenses = await models_1.Expense.findAll({
            order: [['fecha', 'DESC']]
        });
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al obtener los gastos',
            error
        });
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res) => {
    try {
        const { categoria, descripcion, monto, metodoPago, fecha, observacion } = req.body;
        const cleanCategory = String(categoria ?? '').trim();
        const cleanDescription = String(descripcion ?? '').trim();
        const cleanPaymentMethod = String(metodoPago ?? '').trim();
        const cleanObservation = String(observacion ?? '').trim();
        const amountNumber = Number(monto);
        if (!allowedCategories.includes(cleanCategory)) {
            return res.status(400).json({
                message: 'La categoría no es válida'
            });
        }
        if (!cleanDescription) {
            return res.status(400).json({
                message: 'La descripción es obligatoria'
            });
        }
        if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
            return res.status(400).json({
                message: 'El monto no es válido'
            });
        }
        if (!cleanPaymentMethod) {
            return res.status(400).json({
                message: 'El método de pago es obligatorio'
            });
        }
        const expenseDate = fecha
            ? new Date(`${fecha}T12:00:00`)
            : new Date();
        const newExpense = await models_1.Expense.create({
            categoria: cleanCategory,
            descripcion: cleanDescription,
            monto: amountNumber,
            metodoPago: cleanPaymentMethod,
            fecha: expenseDate,
            observacion: cleanObservation || null
        });
        res.status(201).json({
            message: 'Gasto registrado correctamente',
            expense: newExpense
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al registrar el gasto',
            error
        });
    }
};
exports.createExpense = createExpense;
const deleteExpense = async (req, res) => {
    try {
        const expenseId = Number(req.params.id);
        if (!Number.isInteger(expenseId) || expenseId <= 0) {
            return res.status(400).json({
                message: 'El id del gasto no es válido'
            });
        }
        const expense = await models_1.Expense.findByPk(expenseId);
        if (!expense) {
            return res.status(404).json({
                message: 'Gasto no encontrado'
            });
        }
        await expense.destroy();
        res.json({
            message: 'Gasto eliminado correctamente'
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el gasto',
            error
        });
    }
};
exports.deleteExpense = deleteExpense;
