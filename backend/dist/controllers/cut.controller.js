"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCut = exports.getCuts = void 0;
const models_1 = require("../models");
const getCuts = async (req, res) => {
    try {
        const cuts = await models_1.Cut.findAll({
            include: [models_1.Barber, models_1.Service],
            order: [['fecha', 'DESC']]
        });
        res.json(cuts);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al obtener los cortes',
            error
        });
    }
};
exports.getCuts = getCuts;
const createCut = async (req, res) => {
    try {
        const { barberId, serviceId, monto, metodoPago, observacion } = req.body;
        if (!barberId || !serviceId || !monto || !metodoPago) {
            return res.status(400).json({
                message: 'Faltan datos obligatorios'
            });
        }
        const newCut = await models_1.Cut.create({
            barberId,
            serviceId,
            monto,
            metodoPago,
            observacion
        });
        res.status(201).json({
            message: 'Corte registrado correctamente',
            cut: newCut
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al registrar el corte, intente de nuevo.',
            error
        });
    }
};
exports.createCut = createCut;
