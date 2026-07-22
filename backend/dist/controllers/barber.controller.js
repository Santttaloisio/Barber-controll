"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBarber = exports.createBarber = exports.getBarbers = void 0;
const supabase_1 = require("../db/supabase");
const appData_service_1 = require("../services/appData.service");
const schemaError_1 = require("../utils/schemaError");
const getBarbers = async (_req, res) => {
    const { data, error } = await supabase_1.supabase
        .from('barbers')
        .select('*');
    if (error)
        return res.status(500).json({ error });
    return res.json(data);
};
exports.getBarbers = getBarbers;
const createBarber = async (req, res) => {
    const { name, nombre } = req.body;
    const { data, error } = await supabase_1.supabase
        .from('barbers')
        .insert([{ name: name ?? nombre, active: true }])
        .select();
    if (error) {
        if ((0, schemaError_1.isMissingColumnError)(error)) {
            const fallback = await supabase_1.supabase
                .from('barbers')
                .insert([{ name: name ?? nombre }])
                .select();
            if (fallback.error)
                return res.status(500).json({ error: fallback.error });
            (0, appData_service_1.invalidateAppDataCache)();
            return res.json(fallback.data?.[0]);
        }
        return res.status(500).json({ error });
    }
    (0, appData_service_1.invalidateAppDataCache)();
    return res.json(data?.[0]);
};
exports.createBarber = createBarber;
const deleteBarber = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase_1.supabase
        .from('barbers')
        .update({ active: false })
        .eq('id', id)
        .select();
    if (error) {
        if ((0, schemaError_1.isMissingColumnError)(error))
            return (0, schemaError_1.missingMigrationResponse)(res, 'barbers');
        return res.status(500).json({ error });
    }
    (0, appData_service_1.invalidateAppDataCache)();
    return res.json(data?.[0]);
};
exports.deleteBarber = deleteBarber;
