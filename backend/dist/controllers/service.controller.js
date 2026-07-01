"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateServicePrice = exports.createService = exports.getServices = void 0;
const models_1 = require("../models");
const getServices = async (req, res) => {
    try {
        const services = await models_1.Service.findAll({
            order: [['id', 'ASC']]
        });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al obtener los servicios',
            error
        });
    }
};
exports.getServices = getServices;
const createService = async (req, res) => {
    try {
        const { nombre, precioBase } = req.body;
        if (!nombre || !precioBase) {
            return res.status(400).json({
                message: 'El nombre y el precio base son obligatorios'
            });
        }
        const newService = await models_1.Service.create({
            nombre,
            precioBase
        });
        res.status(201).json({
            message: 'Servicio creado correctamente',
            service: newService
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al crear el servicio',
            error
        });
    }
};
exports.createService = createService;
const updateServicePrice = async (req, res) => {
    try {
        const serviceId = Number(req.params.id);
        const { precioBase } = req.body;
        if (!Number.isInteger(serviceId) || serviceId <= 0) {
            return res.status(400).json({
                message: 'El id del servicio no es válido'
            });
        }
        const priceNumber = Number(precioBase);
        if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
            return res.status(400).json({
                message: 'El precio no es válido'
            });
        }
        const service = await models_1.Service.findByPk(serviceId);
        if (!service) {
            return res.status(404).json({
                message: 'Servicio no encontrado'
            });
        }
        await service.update({
            precioBase: priceNumber
        });
        res.json({
            message: 'Precio actualizado correctamente',
            service
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el precio del servicio',
            error
        });
    }
};
exports.updateServicePrice = updateServicePrice;
const deleteService = async (req, res) => {
    try {
        const serviceId = Number(req.params.id);
        if (!Number.isInteger(serviceId) || serviceId <= 0) {
            return res.status(400).json({
                message: 'El id del servicio no es válido'
            });
        }
        const service = await models_1.Service.findByPk(serviceId);
        if (!service) {
            return res.status(404).json({
                message: 'Servicio no encontrado'
            });
        }
        const cutsCount = await models_1.Cut.count({
            where: {
                serviceId
            }
        });
        if (cutsCount > 0) {
            return res.status(400).json({
                message: 'No se puede borrar el servicio porque ya tiene cortes registrados'
            });
        }
        await service.destroy();
        res.json({
            message: 'Servicio eliminado correctamente'
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el servicio',
            error
        });
    }
};
exports.deleteService = deleteService;
