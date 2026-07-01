"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const cut_routes_1 = __importDefault(require("./routes/cut.routes"));
const barber_routes_1 = __importDefault(require("./routes/barber.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/cortes', cut_routes_1.default);
app.use('/api/barberos', barber_routes_1.default);
app.use('/api/servicios', service_routes_1.default);
app.use('/api/reportes', report_routes_1.default);
app.use('/api/gastos', expense_routes_1.default);
const frontendPath = path_1.default.resolve(process.cwd(), '../frontend/dist');
app.use(express_1.default.static(frontendPath));
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
exports.default = app;
