"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYearReport = exports.getMonthReport = exports.getReport = void 0;
const appData_service_1 = require("../services/appData.service");
const getReport = async (_req, res) => {
    try {
        const data = await (0, appData_service_1.getAppData)();
        return res.json(data.dashboard);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
};
exports.getReport = getReport;
const getMonthReport = async (_req, res) => {
    try {
        const data = await (0, appData_service_1.getAppData)();
        return res.json(data.month);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
};
exports.getMonthReport = getMonthReport;
const getYearReport = async (_req, res) => {
    try {
        const data = await (0, appData_service_1.getAppData)();
        return res.json(data.year);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
};
exports.getYearReport = getYearReport;
