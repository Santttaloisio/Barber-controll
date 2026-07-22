"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const barber_routes_1 = __importDefault(require("./routes/barber.routes"));
const cut_routes_1 = __importDefault(require("./routes/cut.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const bootstrap_routes_1 = __importDefault(require("./routes/bootstrap.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api', auth_middleware_1.requireAuth);
app.use('/api/barbers', barber_routes_1.default);
app.use('/api/cuts', cut_routes_1.default);
app.use('/api/services', service_routes_1.default);
app.use('/api/expenses', expense_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/bootstrap', bootstrap_routes_1.default);
const frontendDist = path_1.default.resolve(__dirname, '../../frontend/dist');
if (fs_1.default.existsSync(frontendDist)) {
    app.use(express_1.default.static(frontendDist));
    app.get(/.*/, (_req, res) => {
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
exports.default = app;
