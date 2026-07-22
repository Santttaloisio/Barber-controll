"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCuts = exports.createCut = void 0;
const supabase_1 = require("../db/supabase");
const appData_service_1 = require("../services/appData.service");
const schemaError_1 = require("../utils/schemaError");
const createCut = async (req, res) => {
    const { barber_id, barberId, service_id, serviceId, price, monto, payment_method, paymentMethod, metodoPago, observation, observacion } = req.body;
    const payload = {
        barber_id: barber_id ?? barberId,
        service_id: service_id ?? serviceId,
        price: price ?? monto,
        payment_method: payment_method ?? paymentMethod ?? metodoPago,
        observation: observation ?? observacion
    };
    const { data, error } = await supabase_1.supabase
        .from('cuts')
        .insert([payload])
        .select();
    if (error) {
        if ((0, schemaError_1.isMissingColumnError)(error))
            return (0, schemaError_1.missingMigrationResponse)(res, 'cuts');
        return res.status(500).json({ error });
    }
    (0, appData_service_1.invalidateAppDataCache)();
    return res.json(data?.[0]);
};
exports.createCut = createCut;
const getCuts = async (_req, res) => {
    try {
        const data = await (0, appData_service_1.getAppData)();
        return res.json(data.cuts);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
};
exports.getCuts = getCuts;
