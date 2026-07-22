"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBootstrap = void 0;
const appData_service_1 = require("../services/appData.service");
const getBootstrap = async (_req, res) => {
    try {
        const data = await (0, appData_service_1.getAppData)();
        return res.json(data);
    }
    catch (error) {
        return res.status(500).json({ error });
    }
};
exports.getBootstrap = getBootstrap;
