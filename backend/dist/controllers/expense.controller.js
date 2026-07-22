"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.createExpense = exports.getExpenses = void 0;
const supabase_1 = require("../db/supabase");
const appData_service_1 = require("../services/appData.service");
const schemaError_1 = require("../utils/schemaError");
const getExpenses = async (_req, res) => {
    const { data, error } = await supabase_1.supabase.from('expenses').select('*');
    if (error) {
        if ((0, schemaError_1.isMissingColumnError)(error))
            return (0, schemaError_1.missingMigrationResponse)(res, 'expenses');
        return res.status(500).json({ error });
    }
    return res.json(data);
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res) => {
    const { category, categoria, description, descripcion, amount, monto, paymentMethod, metodoPago, date, fecha, observation, observacion } = req.body;
    const payload = {
        category: category ?? categoria,
        description: description ?? descripcion,
        amount: amount ?? monto,
        payment_method: paymentMethod ?? metodoPago,
        date: date ?? fecha,
        observation: observation ?? observacion
    };
    const { data, error } = await supabase_1.supabase
        .from('expenses')
        .insert([payload])
        .select();
    if (error)
        return res.status(500).json({ error });
    (0, appData_service_1.invalidateAppDataCache)();
    return res.json(data?.[0]);
};
exports.createExpense = createExpense;
const deleteExpense = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase_1.supabase
        .from('expenses')
        .delete()
        .eq('id', id);
    if (error)
        return res.status(500).json({ error });
    (0, appData_service_1.invalidateAppDataCache)();
    return res.json({ message: 'Expense deleted' });
};
exports.deleteExpense = deleteExpense;
