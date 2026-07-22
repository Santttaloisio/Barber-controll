"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateService = exports.createService = exports.getServices = void 0;
const supabase_1 = require("../db/supabase");
const appData_service_1 = require("../services/appData.service");
const getServices = async (_req, res) => {
    const { data, error } = await supabase_1.supabase.from('services').select('*');
    if (error)
        return res.status(500).json({ error });
    return res.json(data);
};
exports.getServices = getServices;
const createService = async (req, res) => {
    const { name, nombre, price, precioBase } = req.body;
    const { data, error } = await supabase_1.supabase
        .from('services')
        .insert([{
            name: name ?? nombre,
            price: price ?? precioBase
        }])
        .select();
    if (error)
        return res.status(500).json({ error });
    (0, appData_service_1.invalidateAppDataCache)();
    return res.json(data?.[0]);
};
exports.createService = createService;
const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, nombre, price, precioBase } = req.body;
    const { data, error } = await supabase_1.supabase
        .from('services')
        .update({
        name: name ?? nombre,
        price: price ?? precioBase
    })
        .eq('id', id)
        .select();
    if (error)
        return res.status(500).json({ error });
    (0, appData_service_1.invalidateAppDataCache)();
    return res.json(data?.[0]);
};
exports.updateService = updateService;
