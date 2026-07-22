"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const barber_routes_1 = __importDefault(require("./barber.routes"));
const service_routes_1 = __importDefault(require("./service.routes"));
const cut_routes_1 = __importDefault(require("./cut.routes"));
const expense_routes_1 = __importDefault(require("./expense.routes"));
const report_routes_1 = __importDefault(require("./report.routes"));
const router = (0, express_1.Router)();
router.use('/barbers', barber_routes_1.default);
router.use('/services', service_routes_1.default);
router.use('/cuts', cut_routes_1.default);
router.use('/expenses', expense_routes_1.default);
router.use('/reports', report_routes_1.default);
exports.default = router;
